import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { DropdownMenu } from '@/components/dropdown-menu'
import { Switch } from '@/components/switch'
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
      within(screen.getByTestId('table-empty')).getByText('No records found'),
    ).toBeInTheDocument()
  })

  it('treats a missing items array as empty', () => {
    render(<Table columns={columns} itemKey="id" />)

    expect(
      within(screen.getByTestId('table-empty')).getByText('No records found'),
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

describe('Table selection names and mixed state', () => {
  it('names the header checkbox after what it does', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    expect(within(headerRow()).getByRole('checkbox')).toHaveAccessibleName(
      'Select all rows',
    )
  })

  it("names each row checkbox after the row's first column", () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select row Ada' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Select row Grace' }),
    ).toBeInTheDocument()
  })

  it('names the row after a number in the first column', () => {
    type Order = { id: string; number: number }
    render(
      <Table
        columns={[{ key: 'number', label: 'Order' }]}
        itemKey="id"
        items={[{ id: 'o1', number: 1042 } satisfies Order]}
        selection="multiple"
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select row 1042' }),
    ).toBeInTheDocument()
  })

  it('prefers the name rowName gives the row', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        rowName={(row) => row.email}
        selection="multiple"
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select row grace@hopper.dev' }),
    ).toBeInTheDocument()
  })

  it('skips a hidden first column when naming rows', () => {
    render(
      <Table
        columns={[
          { hide: true, key: 'name', label: 'Name' },
          ...columns.slice(1),
        ]}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select row ada@lovelace.dev' }),
    ).toBeInTheDocument()
  })

  it('falls back to "Select row" when the first column holds no text', () => {
    type Tagged = { id: string; tags: string[] }
    render(
      <Table
        columns={[
          {
            key: 'tags',
            label: 'Tags',
            selector: (row: Tagged) => row.tags.join(', '),
          },
        ]}
        itemKey="id"
        items={[{ id: 't1', tags: ['a', 'b'] }]}
        selection="multiple"
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select row' }),
    ).toBeInTheDocument()
  })

  it('leaves no checkbox without a name', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toHaveAccessibleName()
    }
  })

  it('takes the names from the labels the app provides', () => {
    render(
      <TuryProvider
        labels={{
          table: {
            selectAll: 'Selecionar todas',
            selectRow: (row) => `Selecionar ${row ?? 'linha'}`,
          },
        }}
      >
        <Table
          columns={columns}
          itemKey="id"
          items={items}
          selection="multiple"
        />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Selecionar todas' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Selecionar Ada' }),
    ).toBeInTheDocument()
  })

  it('shows the header box as mixed while some rows are selected', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={['r1']}
        selection="multiple"
      />,
    )

    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
  })

  it('is plainly unchecked with nothing selected and checked with all', () => {
    const { rerender } = render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={[]}
        selection="multiple"
      />,
    )
    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false',
    )

    rerender(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={['r1', 'r2']}
        selection="multiple"
      />,
    )
    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('selects every row when the mixed header box is pressed', async () => {
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

    await userEvent.click(within(headerRow()).getByRole('checkbox'))

    expect(onSelectionChange).toHaveBeenCalledWith(['r1', 'r2'])
  })

  it('turns mixed as the user checks the first row, then full', async () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select row Ada' }),
    )
    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed',
    )

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select row Grace' }),
    )
    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('does not count keys selected on another page', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={['r9']}
        selection="multiple"
      />,
    )

    expect(within(headerRow()).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false',
    )
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
        name: 'Pagination',
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
        name: 'Pagination',
      }),
    ).not.toBeInTheDocument()
  })

  it('renders no pagination when none was configured', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(
      screen.queryByRole('navigation', {
        name: 'Pagination',
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

describe('Table header truncation', () => {
  /**
   * A fixed-layout cell keeps its width whatever it holds, so a label wider
   * than its column ran into the next one ("Row" and "Id" read as "RowId").
   * jsdom does no layout: what can be asserted is that the label is cut, not
   * painted past its cell, and that the whole of it stays reachable.
   */
  const narrowColumns: TableColumns<Row> = [
    {
      key: 'id',
      label: 'Reservation reference',
      width: 8,
    },
    {
      key: 'name',
      label: 'Guest full name',
      sorter: true,
      width: 8,
    },
  ]

  function labelOf(name: string) {
    const header = screen.getByRole('columnheader', {
      name,
    })

    return within(header).getByTitle(name)
  }

  it('cuts a plain header label with an ellipsis and keeps it whole in title', () => {
    render(<Table columns={narrowColumns} itemKey="id" items={items} />)

    const label = labelOf('Reservation reference')

    expect(label).toHaveTextContent('Reservation reference')
    expect(label).toHaveClass('table-head-label', 'min-w-0', 'truncate')
  })

  it('cuts a sortable header label and keeps its sort icon from shrinking', () => {
    render(
      <Table
        columns={narrowColumns}
        itemKey="id"
        items={items}
        onSortChange={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'Guest full name',
    })
    const label = within(button).getByTitle('Guest full name')

    expect(button).toHaveClass('min-w-0', 'max-w-full')
    expect(label).toHaveClass('table-head-label', 'min-w-0', 'truncate')
    expect(button.querySelector('.table-sort-icon')).toHaveClass('shrink-0')
  })
})

describe('Table body cell truncation', () => {
  it('cuts a plain value read off the item and keeps it whole in title', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    const value = within(rowFor('Ada')).getByTitle('ada@lovelace.dev')

    expect(value).toHaveTextContent('ada@lovelace.dev')
    expect(value).toHaveClass('table-cell-text', 'min-w-0', 'truncate')
  })

  it('cuts text and numbers a selector returns', () => {
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
            selector: (row) => `${row.name} Lovelace-Byron`,
          },
          {
            key: 'index',
            label: 'Index',
            selector: (_row, index) => index + 1000,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    const row = rowFor('Ada')

    expect(within(row).getByTitle('Ada Lovelace-Byron')).toHaveClass(
      'table-cell-text',
      'truncate',
    )
    expect(within(row).getByTitle('1000')).toHaveClass(
      'table-cell-text',
      'truncate',
    )
  })

  it('leaves a node a selector draws as it is drawn', () => {
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
            selector: (row) => <strong data-testid="drawn">{row.name}</strong>,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    const [drawn] = screen.getAllByTestId('drawn')

    expect(drawn.parentElement).toHaveClass('table-cell-content')
    expect(document.querySelector('tbody .table-cell-text')).toBeNull()
  })
})

describe('Table cells never paint over their neighbour', () => {
  it('clips every header and body cell sideways', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    for (const head of screen.getAllByRole('columnheader')) {
      expect(head).toHaveClass('overflow-x-clip')
    }
    for (const cell of within(rowFor('Ada')).getAllByRole('cell')) {
      expect(cell).toHaveClass('overflow-x-clip')
    }
  })

  it('keeps the checkbox column at 40px however narrow the table', () => {
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    const [selectionColumn] = Array.from(document.querySelectorAll('col'))

    expect(selectionColumn).toHaveStyle({
      width: '40px',
    })
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
      within(screen.getByTestId('table-empty')).getByText(
        'Nenhum registro encontrado',
      ),
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

    // Its own branch, like the component's: this helper fell through to
    // pending on 'empty' too, which is how the table's own bug went unseen.
    if (state.status === 'empty') {
      return {
        retry,
        status: 'empty',
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

  it('draws an empty read as empty, not as rows still loading', () => {
    render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          // What useDataOutcome actually hands over for a read that found
          // nothing. It fell through to pending and drew skeleton rows forever.
          outcome={outcomeOf({ status: 'empty' })}
        />
      </TuryProvider>,
    )

    const empty = screen.getByTestId('table-empty')

    expect(within(empty).getByText('No records found')).toBeInTheDocument()
    expect(
      within(empty).getByText('When there are records, they appear here.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('skeleton')).toBeNull()
  })

  it('gives each state an icon beside its words', () => {
    const { rerender } = render(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({ status: 'empty' })}
        />
      </TuryProvider>,
    )

    expect(
      within(screen.getByTestId('table-empty')).getByTestId('empty-state'),
    ).toContainElement(
      screen.getByTestId('table-empty').querySelector('.empty-state-icon svg'),
    )

    rerender(
      <TuryProvider>
        <Table<Row>
          columns={columns}
          itemKey="id"
          outcome={outcomeOf({ retry: vi.fn(), status: 'error' })}
        />
      </TuryProvider>,
    )

    expect(
      screen.getByTestId('table-error').querySelector('.empty-state-icon svg'),
    ).not.toBeNull()
    expect(
      within(screen.getByTestId('table-error')).getByText(
        'Check your connection and try again.',
      ),
    ).toBeInTheDocument()
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

describe('Table row click from cell content', () => {
  function renderWithCell(
    renderCell: (row: Row) => React.ReactNode,
    onRowClick = vi.fn(),
  ) {
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
            selector: renderCell,
          },
        ]}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    return onRowClick
  }

  it('fires for plain text inside a custom cell', async () => {
    const onRowClick = renderWithCell((row) => <span>Open {row.name}</span>)

    await userEvent.click(screen.getByText('Open Ada'))

    expect(onRowClick).toHaveBeenCalledWith(items[0])
  })

  it('stays quiet when the actions menu trigger is clicked, and opens the menu', async () => {
    const onRowClick = renderWithCell(() => (
      <DropdownMenu>
        <DropdownMenu.Trigger>Row actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Archive</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ))

    await userEvent.click(
      within(rowFor('Ada')).getByRole('button', {
        name: 'Row actions',
      }),
    )

    expect(
      await screen.findByRole('menuitem', {
        name: 'Archive',
      }),
    ).toBeInTheDocument()
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('stays quiet when an item of the portalled menu is chosen', async () => {
    const onArchive = vi.fn()
    const onRowClick = renderWithCell((row) => (
      <DropdownMenu>
        <DropdownMenu.Trigger>{`Actions for ${row.name}`}</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onArchive}>Archive</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ))

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Actions for Ada',
      }),
    )
    const archive = await screen.findByRole('menuitem', {
      name: 'Archive',
    })

    expect(rowFor('Ada')).not.toContainElement(archive)

    await userEvent.click(archive)

    expect(onArchive).toHaveBeenCalledTimes(1)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('stays quiet when a link inside the cell is clicked', async () => {
    const onRowClick = renderWithCell((row) => (
      <a
        href={`#${row.id}`}
        onClick={(event) => {
          event.preventDefault()
        }}
      >
        Profile of {row.name}
      </a>
    ))

    await userEvent.click(
      screen.getByRole('link', {
        name: 'Profile of Ada',
      }),
    )

    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('stays quiet when a checkbox inside the cell is toggled', async () => {
    const onChange = vi.fn()
    const onRowClick = renderWithCell((row) => (
      <Checkbox label={`Pin ${row.name}`} onChange={onChange} />
    ))

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Pin Ada',
      }),
    )
    await userEvent.click(screen.getByText('Pin Ada'))

    expect(onChange).toHaveBeenCalled()
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('stays quiet while an input inside the cell is clicked and typed into', async () => {
    const onRowClick = renderWithCell((row) => (
      <input aria-label={`Note for ${row.name}`} />
    ))
    const input = screen.getByRole('textbox', {
      name: 'Note for Ada',
    })

    await userEvent.click(input)
    await userEvent.type(input, 'hi{Enter} ')

    expect(input).toHaveValue('hi ')
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('stays quiet when a switch inside the cell is flipped', async () => {
    const onCheckedChange = vi.fn()
    const onRowClick = renderWithCell((row) => (
      <Switch label={`Live ${row.name}`} onCheckedChange={onCheckedChange} />
    ))

    await userEvent.click(
      screen.getByRole('switch', {
        name: 'Live Ada',
      }),
    )

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('lets any element opt out with data-table-row-click-ignore', async () => {
    const onRowClick = renderWithCell((row) => (
      <span data-table-row-click-ignore>Ignore {row.name}</span>
    ))

    await userEvent.click(screen.getByText('Ignore Ada'))

    expect(onRowClick).not.toHaveBeenCalled()
  })
})

describe('Table row keyboard', () => {
  it('makes rows focusable only when they can be clicked', () => {
    const { unmount } = render(
      <Table columns={columns} itemKey="id" items={items} />,
    )

    expect(rowFor('Ada')).not.toHaveAttribute('tabindex')
    unmount()

    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onRowClick={vi.fn()}
      />,
    )

    expect(rowFor('Ada')).toHaveAttribute('tabindex', '0')
    expect(headerRow()).not.toHaveAttribute('tabindex')
  })

  it('fires onRowClick on Enter and on Space from the focused row', async () => {
    const onRowClick = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    await userEvent.tab()
    expect(rowFor('Ada')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenLastCalledWith(items[0])

    await userEvent.tab()
    expect(rowFor('Grace')).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(onRowClick).toHaveBeenLastCalledWith(items[1])
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })

  it('ignores other keys on the focused row', async () => {
    const onRowClick = vi.fn()
    render(
      <Table
        columns={columns}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    await userEvent.tab()
    await userEvent.keyboard('a{ArrowDown}')

    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('leaves Enter and Space on a control inside the row to that control', async () => {
    const onRowClick = vi.fn()
    const onEdit = vi.fn()
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
            selector: () => <Button onClick={onEdit}>Edit</Button>,
          },
        ]}
        itemKey="id"
        items={items}
        onRowClick={onRowClick}
      />,
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(
      within(rowFor('Ada')).getByRole('button', {
        name: 'Edit',
      }),
    ).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')

    expect(onEdit).toHaveBeenCalledTimes(2)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('does nothing on Enter when no row click handler was given', async () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    rowFor('Ada').focus()
    await userEvent.keyboard('{Enter}')

    expect(rowFor('Ada')).not.toHaveFocus()
  })
})

describe('Table actions column options', () => {
  const actionColumns: TableColumns<Row> = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      align: 'right',
      fixedWidth: true,
      key: 'actions',
      label: 'Actions',
      selector: (row) => <Button>{`More for ${row.name}`}</Button>,
      sticky: 'right',
      width: 56,
    },
  ]

  function actionsCell() {
    return within(rowFor('Ada'))
      .getByRole('button', {
        name: 'More for Ada',
      })
      .closest('td') as HTMLElement
  }

  it('pins a sticky column to the right edge, header and cells alike', () => {
    render(<Table columns={actionColumns} itemKey="id" items={items} />)

    const header = screen.getByRole('columnheader', {
      name: 'Actions',
    })

    for (const element of [header, actionsCell()]) {
      expect(element).toHaveClass('sticky', 'right-0', 'bg-background')
    }
    expect(
      within(rowFor('Ada')).getByRole('cell', {
        name: 'Ada',
      }),
    ).not.toHaveClass('sticky')
  })

  it('keeps the pinned column sticky while the rows are still loading', () => {
    render(
      <Table
        columns={actionColumns}
        itemKey="id"
        outcome={{
          retry: vi.fn(),
          status: 'pending',
        }}
      />,
    )

    const skeletonRow = screen.getAllByRole('row')[1]
    const cells = within(skeletonRow).getAllByRole('cell')

    expect(cells.at(-1)).toHaveClass('sticky')
    expect(cells[0]).not.toHaveClass('sticky')
  })

  it('draws the right-pinned hairline on its left edge, facing the scroll', () => {
    render(<Table columns={actionColumns} itemKey="id" items={items} />)

    const header = screen.getByRole('columnheader', {
      name: 'Actions',
    })

    for (const element of [header, actionsCell()]) {
      expect(element).toHaveClass('before:left-0')
      expect(element).not.toHaveClass('left-0')
      expect(element).not.toHaveClass('before:right-0')
    }
  })

  it('right-aligns the header, the cell and the cell content', () => {
    render(<Table columns={actionColumns} itemKey="id" items={items} />)

    expect(
      screen.getByRole('columnheader', {
        name: 'Actions',
      }),
    ).toHaveClass('text-right')
    expect(actionsCell()).toHaveClass('text-right')
    expect(actionsCell().firstElementChild).toHaveClass('ml-auto')
    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toHaveClass('text-left')
  })

  it('centres a centre-aligned column and its sort button', () => {
    render(
      <Table
        columns={[
          {
            align: 'center',
            key: 'name',
            label: 'Name',
            sorter: true,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toHaveClass('text-center')
    expect(
      screen.getByRole('button', {
        name: 'Name',
      }),
    ).toHaveClass('mx-auto')
  })

  it('gives a fixed-width column exact pixels and the rest the remaining shares', () => {
    const { container } = render(
      <Table columns={actionColumns} itemKey="id" items={items} />,
    )

    const widths = Array.from(container.querySelectorAll('col')).map(
      (col) => col.style.width,
    )

    expect(widths).toEqual(['50%', '50%', '56px'])
  })

  it('keeps a width without fixedWidth as a share', () => {
    const { container } = render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
          },
          {
            key: 'actions',
            label: 'Actions',
            width: 100,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    const widths = Array.from(container.querySelectorAll('col')).map(
      (col) => col.style.width,
    )

    expect(widths).toEqual(['50%', '50%'])
  })

  it('never caps a share column at its width in pixels', () => {
    render(
      <Table
        columns={[
          {
            key: 'name',
            label: 'Name',
            width: 2,
          },
          {
            key: 'email',
            label: 'Email',
            sorter: true,
            width: 1,
          },
        ]}
        itemKey="id"
        items={items}
      />,
    )

    const nameContent = within(rowFor('Ada')).getByText('Ada')
    const nameHeader = screen.getByText('Name')
    const sortButton = screen.getByRole('button', {
      name: 'Email',
    })

    for (const element of [nameContent, nameHeader, sortButton]) {
      expect(element.style.maxWidth).toBe('')
    }
  })

  it('caps a fixed-width column content at its pixels', () => {
    render(<Table columns={actionColumns} itemKey="id" items={items} />)

    const content = actionsCell().firstElementChild as HTMLElement

    expect(content.style.maxWidth).toBe('min(100%, 56px)')
    expect(within(rowFor('Ada')).getByText('Ada').style.maxWidth).toBe('')
  })
})

describe('Table sticky left column', () => {
  const pinnedColumns: TableColumns<Row> = [
    {
      key: 'name',
      label: 'Name',
      sticky: 'left',
    },
    {
      key: 'email',
      label: 'Email',
    },
  ]

  function nameCell(name: string) {
    return within(rowFor(name)).getByRole('cell', {
      name,
    })
  }

  it('pins the column to the left edge, header and cells alike', () => {
    render(<Table columns={pinnedColumns} itemKey="id" items={items} />)

    const header = screen.getByRole('columnheader', {
      name: 'Name',
    })

    for (const element of [header, nameCell('Ada')]) {
      expect(element).toHaveClass('sticky', 'left-0', 'z-10', 'bg-background')
      expect(element).not.toHaveClass('right-0')
    }
    expect(
      within(rowFor('Ada')).getByRole('cell', {
        name: 'ada@lovelace.dev',
      }),
    ).not.toHaveClass('sticky')
    expect(
      screen.getByRole('columnheader', {
        name: 'Email',
      }),
    ).not.toHaveClass('sticky')
  })

  it('draws the hairline on its right edge, facing the scrolling columns', () => {
    render(<Table columns={pinnedColumns} itemKey="id" items={items} />)

    const header = screen.getByRole('columnheader', {
      name: 'Name',
    })

    for (const element of [header, nameCell('Ada')]) {
      expect(element).toHaveClass(
        'before:right-0',
        'before:w-px',
        'before:bg-border',
      )
      expect(element).not.toHaveClass('before:left-0')
    }
  })

  it('repaints the row hover, selected and active tints over its background', () => {
    render(<Table columns={pinnedColumns} itemKey="id" items={items} />)

    expect(nameCell('Ada')).toHaveClass(
      'group-hover/row:after:bg-muted/50',
      'group-aria-[current=true]/row:after:bg-accent',
      'group-data-[state=selected]/row:after:bg-muted',
    )
    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toHaveClass('after:bg-muted/40')
  })

  it('keeps the pinned column sticky while the rows are still loading', () => {
    render(
      <Table
        columns={pinnedColumns}
        itemKey="id"
        outcome={{
          retry: vi.fn(),
          status: 'pending',
        }}
      />,
    )

    const skeletonRow = screen.getAllByRole('row')[1]
    const cells = within(skeletonRow).getAllByRole('cell')

    expect(cells[0]).toHaveClass('sticky', 'left-0')
    expect(cells.at(-1)).not.toHaveClass('sticky')
  })

  it('leaves the selection checkbox column unpinned before it', () => {
    render(
      <Table
        columns={pinnedColumns}
        itemKey="id"
        items={items}
        selection="multiple"
      />,
    )

    const checkboxCell = within(rowFor('Ada'))
      .getByRole('checkbox')
      .closest('td') as HTMLElement

    expect(checkboxCell).not.toHaveClass('sticky')
    expect(nameCell('Ada')).toHaveClass('sticky', 'left-0')
  })
})

describe('Table cell alignment of a lone icon', () => {
  function iconColumns(align: 'center' | 'left' | 'right'): TableColumns<Row> {
    return [
      {
        align,
        key: 'status',
        label: 'Status',
        selector: (row) => (
          <svg aria-label={`status of ${row.name}`} role="img" />
        ),
      },
    ]
  }

  function iconWrapper() {
    return screen.getByRole('img', {
      name: 'status of Ada',
    }).parentElement as HTMLElement
  }

  it('centres a block icon in a centred cell, text alignment unchanged', () => {
    render(<Table columns={iconColumns('center')} itemKey="id" items={items} />)

    expect(iconWrapper()).toHaveClass('[&>svg]:mx-auto', '[&>img]:mx-auto')
    expect(iconWrapper().closest('td')).toHaveClass('text-center')
  })

  it('pushes a block icon to the right edge of a right-aligned cell', () => {
    render(<Table columns={iconColumns('right')} itemKey="id" items={items} />)

    expect(iconWrapper()).toHaveClass('[&>svg]:ml-auto', '[&>img]:ml-auto')
    expect(iconWrapper()).not.toHaveClass('[&>svg]:mx-auto')
    expect(iconWrapper().closest('td')).toHaveClass('text-right')
  })

  it('leaves a left-aligned icon where it is', () => {
    render(<Table columns={iconColumns('left')} itemKey="id" items={items} />)

    expect(iconWrapper()).not.toHaveClass('[&>svg]:mx-auto')
    expect(iconWrapper()).not.toHaveClass('[&>svg]:ml-auto')
  })
})

describe('Table density', () => {
  function firstCell() {
    return within(rowFor('Ada')).getByRole('cell', {
      name: 'Ada',
    })
  }

  function nameHeader() {
    return screen.getByRole('columnheader', {
      name: 'Name',
    })
  }

  it('uses the regular spacing by default', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(firstCell()).toHaveClass('p-2')
    expect(firstCell()).not.toHaveClass('py-1')
    expect(nameHeader()).toHaveClass('h-10')
  })

  it('tightens rows and header when compact', () => {
    render(
      <Table columns={columns} density="compact" itemKey="id" items={items} />,
    )

    expect(firstCell()).toHaveClass('px-2', 'py-1')
    expect(firstCell()).not.toHaveClass('p-2')
    expect(nameHeader()).toHaveClass('h-8')
    expect(nameHeader()).not.toHaveClass('h-10')
  })

  it('keeps compact spacing on aligned and pinned cells', () => {
    render(
      <Table
        columns={[
          {
            align: 'right',
            key: 'name',
            label: 'Name',
            sticky: 'right',
          },
        ]}
        density="compact"
        itemKey="id"
        items={items}
      />,
    )

    expect(firstCell()).toHaveClass('py-1', 'text-right', 'sticky')
  })
})

describe('Table activeKey', () => {
  it('marks only the row open in the preview as current', () => {
    render(
      <Table activeKey="r2" columns={columns} itemKey="id" items={items} />,
    )

    expect(rowFor('Grace')).toHaveAttribute('aria-current', 'true')
    expect(rowFor('Grace')).toHaveClass('aria-[current=true]:bg-accent')
    expect(rowFor('Ada')).not.toHaveAttribute('aria-current')
    expect(headerRow()).not.toHaveAttribute('aria-current')
  })

  it('marks nothing without an activeKey', () => {
    render(<Table columns={columns} itemKey="id" items={items} />)

    expect(rowFor('Ada')).not.toHaveAttribute('aria-current')
    expect(rowFor('Grace')).not.toHaveAttribute('aria-current')
  })

  it('matches a numeric activeKey against numeric item keys', () => {
    render(
      <Table
        activeKey={2}
        columns={[
          {
            key: 'name',
            label: 'Name',
          },
        ]}
        itemKey="id"
        items={[
          {
            id: 1,
            name: 'Ada',
          },
          {
            id: 2,
            name: 'Grace',
          },
        ]}
      />,
    )

    expect(rowFor('Grace')).toHaveAttribute('aria-current', 'true')
    expect(rowFor('Ada')).not.toHaveAttribute('aria-current')
  })

  it('keeps being current apart from being selected', () => {
    render(
      <Table
        activeKey="r1"
        columns={columns}
        itemKey="id"
        items={items}
        selectedKeys={['r2']}
        selection="multiple"
      />,
    )

    expect(rowFor('Ada')).toHaveAttribute('aria-current', 'true')
    expect(rowFor('Ada')).not.toHaveAttribute('data-state')
    expect(within(rowFor('Ada')).getByRole('checkbox')).not.toBeChecked()
    expect(rowFor('Grace')).not.toHaveAttribute('aria-current')
    expect(rowFor('Grace')).toHaveAttribute('data-state', 'selected')
  })
})

describe('Table axes', () => {
  it('publishes its default density for a theme to select', () => {
    const { container } = render(
      <Table columns={columns} itemKey="id" items={items} />,
    )

    expect(container.querySelector('.table-root')).toHaveAttribute(
      'data-density',
      'default',
    )
  })

  it('publishes the density it was given', () => {
    const { container } = render(
      <Table columns={columns} density="compact" itemKey="id" items={items} />,
    )

    expect(container.querySelector('.table-root')).toHaveAttribute(
      'data-density',
      'compact',
    )
  })
})
