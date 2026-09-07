import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { TuryProvider } from '@/components/tury-provider'

import { Table } from './table'
import type { TableColumns, TableItems, TableOutcomeProps } from './table.types'

type Row = {
  email: string
  id: string
  name: string
}

const items: TableItems<Row> = [
  {
    email: 'ada@lovelace.dev',
    id: 'r1',
    name: 'Ada',
  },
  {
    email: 'grace@hopper.dev',
    id: 'r2',
    name: 'Grace',
  },
]

const columns: TableColumns<Row> = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'email',
    label: 'Email',
  },
]

function headerRow() {
  return screen.getByRole('row', {
    name: 'Name Email',
  })
}

function rowFor(name: string) {
  return screen.getByRole('row', {
    name: new RegExp(name),
  })
}

describe('Table', () => {
  it('renders one column header per visible column', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', {
        name: 'Email',
      }),
    ).toBeInTheDocument()
  })

  it('reads each cell straight off the item when a column has no selector', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(
      within(rowFor('Ada')).getByRole('cell', {
        name: 'ada@lovelace.dev',
      }),
    ).toBeInTheDocument()
  })

  it('renders the selector output and hands it the row and its index', () => {
    const selector = vi.fn((row: Row, index: number) => `${index}:${row.name}`)
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
            selector,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    expect(
      screen.getByRole('cell', {
        name: '0:Ada',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('cell', {
        name: '1:Grace',
      }),
    ).toBeInTheDocument()
  })

  it('leaves a hidden column out of the table', () => {
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
          },
          {
            hide: true,
            key: 'email',
            label: 'Email',
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    expect(
      screen.queryByRole('columnheader', {
        name: 'Email',
      }),
    ).not.toBeInTheDocument()
  })

  it('falls back to a default empty message with no items', () => {
    render(<Table columns={columns} itemKey="id" items={[]} />)

    expect(
      screen.getByRole('cell', {
        name: 'No records found',
      }),
    ).toBeInTheDocument()
  })

  it('treats a missing items array as empty', () => {
    render(<Table columns={columns} itemKey="id" />)

    expect(
      screen.getByRole('cell', {
        name: 'No records found',
      }),
    ).toBeInTheDocument()
  })

  it('shows the given empty section instead of the default message', () => {
    render(
      <Table
        columns={columns}
        emptySection={<span>Nothing here yet</span>}
        itemKey="id"
        items={[]}
      />,
    )

    expect(
      screen.getByRole('cell', {
        name: 'Nothing here yet',
      }),
    ).toBeInTheDocument()
  })

  // The overlay blocks interaction by covering the table, and jsdom has no
  // layout engine, so the block itself cannot be observed here — only the
  // busy state and the overlay that produces it can.
  it('marks the table busy and shows the overlay while loading', () => {
    render(<Table columns={columns} itemKey="id" items={items} loading />)

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('loading-overlay-root')).toBeInTheDocument()
  })

  it('leaves the table not busy when it is not loading', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy')
  })
})

describe('Table row click', () => {
  it('delivers the clicked row', async () => {
    const onRowClick = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    await userEvent.click(
      within(rowFor('Grace')).getByRole('cell', {
        name: 'Grace',
      }),
    )

    expect(onRowClick).toHaveBeenCalledWith(items[1])
  })

  it('stays quiet when a control inside the row is clicked', async () => {
    const onRowClick = vi.fn()
    const onAction = vi.fn()
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
          },
          {
            key: 'actions',
            label: 'Actions',
            selector: () => <Button onClick={onAction}>Edit</Button>,
          },
        ]}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    await userEvent.click(
      within(rowFor('Ada')).getByRole('button', {
        name: 'Edit',
      }),
    )

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('does nothing when no row click handler was given', async () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    await userEvent.click(
      within(rowFor('Ada')).getByRole('cell', {
        name: 'Ada',
      }),
    )

    expect(
      screen.getByRole('cell', {
        name: 'Ada',
      }),
    ).toBeInTheDocument()
  })
})

describe('Table selection', () => {
  it('renders no checkbox when selection is off', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('delivers every row key when the header checkbox is checked', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onSelectionChange={onSelectionChange}
        selection="multiple"
      />,
    )

    await userEvent.click(within(headerRow()).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith(['r1', 'r2'])
  })

  it('delivers an empty selection when the header checkbox is unchecked', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        defaultSelectedKeys={['r1', 'r2']}
        itemKey="id"
        items={items}
        onSelectionChange={onSelectionChange}
        selection="multiple"
      />,
    )

    await userEvent.click(within(headerRow()).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith([])
  })

  it('delivers an empty selection when there is nothing to select', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        onSelectionChange={onSelectionChange}
        selection="multiple"
      />,
    )

    await userEvent.click(within(headerRow()).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith([])
  })

  it('delivers the key of the row that was checked', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onSelectionChange={onSelectionChange}
        selection="multiple"
      />,
    )

    await userEvent.click(within(rowFor('Grace')).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith(['r2'])
  })

  it('drops the key of the row that was unchecked', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        defaultSelectedKeys={['r1', 'r2']}
        itemKey="id"
        items={items}
        onSelectionChange={onSelectionChange}
        selection="multiple"
      />,
    )

    await userEvent.click(within(rowFor('Ada')).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith(['r2'])
  })

  it('changes its own selection when uncontrolled', async () => {
    render(
      <Table
        columns={columns}
        defaultSelectedKeys={['r1']}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    expect(within(rowFor('Ada')).getByRole('checkbox')).toBeChecked()

    await userEvent.click(within(rowFor('Grace')).getByRole('checkbox'))

    expect(within(rowFor('Grace')).getByRole('checkbox')).toBeChecked()
  })

  it('keeps the selection it was given when controlled', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onSelectionChange={onSelectionChange}
        selectedKeys={['r1']}
        selection="multiple"
      />,
    )

    await userEvent.click(within(rowFor('Grace')).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith(['r1', 'r2'])
    expect(within(rowFor('Grace')).getByRole('checkbox')).not.toBeChecked()
  })

  it('checks the header box once every row is selected', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={['r1', 'r2']}
        selection="multiple"
      />,
    )

    expect(within(headerRow()).getByRole('checkbox')).toBeChecked()
  })
})

describe('Table sorting', () => {
  const sortableColumns: TableColumns<Row> = [
    {
      key: 'name',
      label: 'Name',
      sorter: true,
    },
    {
      key: 'email',
      label: 'Email',
    },
  ]

  it('delivers the ascending key on the first click', async () => {
    const onSortChange = vi.fn()
    render(
      <Table
        columns={sortableColumns}
        itemKey="id"
        items={items}
        onSortChange={onSortChange}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Name',
      }),
    )

    expect(onSortChange).toHaveBeenCalledWith('name')
  })

  it('delivers the descending key while sorted ascending', async () => {
    const onSortChange = vi.fn()
    render(
      <Table
        columns={sortableColumns}
        itemKey="id"
        items={items}
        onSortChange={onSortChange}
        sort="name"
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Name',
      }),
    )

    expect(onSortChange).toHaveBeenCalledWith('-name')
  })

  it('clears the sort while sorted descending', async () => {
    const onSortChange = vi.fn()
    render(
      <Table
        columns={sortableColumns}
        itemKey="id"
        items={items}
        onSortChange={onSortChange}
        sort="-name"
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Name',
      }),
    )

    expect(onSortChange).toHaveBeenCalledWith(undefined)
  })

  it('leaves a sortable header inert without a sort handler', async () => {
    render(<Table columns={sortableColumns} itemKey="id" items={items} />)

    const header = screen.getByRole('button', {
      name: 'Name',
    })
    await userEvent.click(header)

    expect(header).toBeInTheDocument()
  })

  it('offers no sort control on a column that is not sortable', () => {
    render(<Table columns={sortableColumns} itemKey="id" items={items} />)

    expect(
      screen.queryByRole('button', {
        name: 'Email',
      }),
    ).not.toBeInTheDocument()
  })
})

describe('Table pagination', () => {
  const pagination = {
    mode: 'offset',
    onPageChange: () => {},
    onRowsPerPageChange: () => {},
    page: 1,
    rowsPerPage: 10,
    total: 40,
  } as const

  it('renders the pagination it was configured with', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        pagination={pagination}
      />,
    )

    expect(
      screen.getByRole('navigation', {
        name: 'pagination',
      }),
    ).toBeInTheDocument()
  })

  it('hides the pagination when asked to', () => {
    render(
      <Table
        columns={columns}
        hidePagination
        itemKey="id"
        items={items}
        pagination={pagination}
      />,
    )

    expect(
      screen.queryByRole('navigation', {
        name: 'pagination',
      }),
    ).not.toBeInTheDocument()
  })

  it('renders no pagination when none was configured', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(
      screen.queryByRole('navigation', {
        name: 'pagination',
      }),
    ).not.toBeInTheDocument()
  })
})

describe('Table layout', () => {
  const widthColumns: TableColumns<Row> = [
    {
      key: 'name',
      label: 'Name',
      width: 100,
    },
    {
      key: 'email',
      label: 'Email',
      width: 100,
    },
  ]

  it('keeps the announced columns when it pads out to a wider layout', () => {
    render(
      <Table
        columns={widthColumns}
        itemKey="id"
        items={items}
        layoutWidth={600}
      />,
    )

    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(within(rowFor('Ada')).getAllByRole('cell')).toHaveLength(2)
  })

  it('pads nothing when a single column already fills the layout', () => {
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
            width: 100,
          },
        ]}
        itemKey="id"
        items={items}
        layoutWidth={600}
      />,
    )

    expect(screen.getAllByRole('columnheader')).toHaveLength(1)
  })

  it('keeps every cell reachable whatever the column alignment', () => {
    render(
      <Table
        columns={[
          {
            align: 'left',
            key: 'id',
            label: 'Id',
          },
          {
            align: 'center',
            key: 'name',
            label: 'Name',
          },
          {
            align: 'right',
            key: 'email',
            label: 'Email',
            sorter: true,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    expect(within(rowFor('Ada')).getAllByRole('cell')).toHaveLength(3)
    expect(
      screen.getByRole('columnheader', {
        name: 'Id',
      }),
    ).toBeInTheDocument()
  })
})

describe('Table labels', () => {
  it('takes the empty message from the provider', () => {
    render(
      <TuryProvider
        labels={{
          table: {
            empty: 'Nenhum registro encontrado',
          },
        }}
      >
        <Table columns={columns} itemKey="id" items={[]} />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('cell', {
        name: 'Nenhum registro encontrado',
      }),
    ).toBeInTheDocument()
  })

  it('keeps emptySection ahead of the provider', () => {
    render(
      <TuryProvider
        labels={{
          table: {
            empty: 'Nenhum registro encontrado',
          },
        }}
      >
        <Table
          columns={columns}
          emptySection="Nothing here yet"
          itemKey="id"
          items={[]}
        />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('cell', {
        name: 'Nothing here yet',
      }),
    ).toBeInTheDocument()
  })
})

describe('Table outcome', () => {
  const outcomeOf = (
    state: Parameters<typeof makeOutcome>[0],
  ): TableOutcomeProps<Row>['outcome'] => makeOutcome(state)

  function makeOutcome(state: {
    data?: TableItems<Row>
    error?: unknown
    reason?: string
    refreshing?: boolean
    retry?: () => void
    status: 'denied' | 'empty' | 'error' | 'pending' | 'success'
  }) {
    const retry = state.retry ?? vi.fn()

    if (state.status === 'success') {
      return {
        data: state.data ?? [],
        refreshing: state.refreshing ?? false,
        retry,
        status: 'success',
      } as const
    }

    if (state.status === 'denied') {
      return {
        reason: state.reason ?? 'Not for you',
        retry,
        status: 'denied',
      } as const
    }

    if (state.status === 'error') {
      return {
        error: state.error ?? new Error('boom'),
        retry,
        status: 'error',
      } as const
    }

    return {
      retry,
      status: 'pending',
    } as const
  }

  it('keeps the header while the read is pending, and draws skeleton rows', () => {
    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          loadingRows={2}
          outcome={outcomeOf({ status: 'pending' })}
        />
      </TuryProvider>,
    )

    expect(headerRow()).toBeTruthy()
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
  })

  it('keeps the header on a failed read and offers a retry', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()

    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({ retry, status: 'error' })}
        />
      </TuryProvider>,
    )

    expect(headerRow()).toBeTruthy()
    expect(screen.getByTestId('table-error')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('states the reason on a denied read and offers no retry', () => {
    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({
            reason: 'Usage reports start on the Business contract',
            status: 'denied',
          })}
        />
      </TuryProvider>,
    )

    expect(
      within(screen.getByTestId('table-denied')).getByText(
        'Usage reports start on the Business contract',
      ),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })

  it('tells an empty read apart from a failed one', () => {
    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({ data: [], status: 'success' })}
        />
      </TuryProvider>,
    )

    expect(screen.getByTestId('table-empty')).toBeTruthy()
    expect(screen.queryByTestId('table-error')).toBeNull()
  })

  it('renders the rows, and overlays them while refreshing', () => {
    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({
            data: items,
            refreshing: true,
            status: 'success',
          })}
        />
      </TuryProvider>,
    )

    expect(screen.getByText('Ada')).toBeTruthy()
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true')
  })
})
