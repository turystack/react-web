import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { NumberInput } from '@/components/number-input'

import { Search } from './search'

type OrderFilters = {
  archived: boolean
  channelId: string | null
  page: number
  perPage: number
  search?: string
  status?: string
}

const SEARCH: OrderFilters = {
  archived: false,
  channelId: null,
  page: 1,
  perPage: 20,
}

function items(value: OrderFilters) {
  return [
    {
      field: <input aria-label="Status" defaultValue={value.status} />,
      id: 'status' as const,
    },
    {
      field: <input aria-label="Channel" />,
      id: 'channelId' as const,
    },
    {
      field: <input aria-label="Archived" />,
      id: 'archived' as const,
      label: 'Archived',
      placement: 'popover' as const,
    },
  ]
}

describe('Search', () => {
  it('renders the field and the inline filters on one row', () => {
    render(
      <Search
        filter={{ placeholder: 'Search orders' }}
        items={items(SEARCH)}
        value={SEARCH}
      />,
    )

    const row = screen.getByTestId('search-row')

    expect(
      within(row).getByPlaceholderText('Search orders'),
    ).toBeInTheDocument()
    expect(within(row).getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByTestId('search-inline-channelId')).toBeInTheDocument()
  })

  it('names the query field by its placeholder words', () => {
    render(<Search filter={{ placeholder: 'Search orders' }} />)

    const field = screen.getByRole('textbox', { name: 'Search orders' })
    expect(field).toHaveAttribute('aria-label', 'Search orders')
  })

  it('names the query field by the default placeholder label', () => {
    render(<Search filter={{}} />)

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute(
      'placeholder',
      'Search',
    )
  })

  it('lets ariaLabel name the query field', () => {
    render(
      <Search
        filter={{ ariaLabel: 'Search orders by code', placeholder: 'Code' }}
      />,
    )

    expect(
      screen.getByRole('textbox', { name: 'Search orders by code' }),
    ).toHaveAttribute('placeholder', 'Code')
  })

  it('keeps the name once text replaces the placeholder', async () => {
    render(<Search filter={{ placeholder: 'Search orders' }} />)

    await userEvent.type(screen.getByRole('textbox'), 'abc')

    expect(screen.getByRole('textbox', { name: 'Search orders' })).toHaveValue(
      'abc',
    )
  })

  it('keeps a panel filter off the row until the button is used', async () => {
    render(<Search items={items(SEARCH)} value={SEARCH} />)

    expect(screen.queryByLabelText('Archived')).not.toBeInTheDocument()

    const filters = screen.getByRole('button', { name: /Filters/ })
    expect(screen.getAllByRole('button', { name: /Filters/ })).toHaveLength(1)
    expect(filters).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(filters)

    expect(await screen.findByLabelText('Archived')).toBeInTheDocument()
    expect(filters).toHaveAttribute('aria-expanded', 'true')
  })

  it('counts only the keys that have an item', () => {
    // The whole point of `value={search}`: a route's search carries page,
    // perPage and sort as well. Counting every key would report three filters
    // to someone who set none.
    render(<Search items={items(SEARCH)} onReset={vi.fn()} value={SEARCH} />)

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('keeps Reset in place while there is nothing to clear', () => {
    // Present and disabled, never absent: a control that comes and goes moves
    // the two beside it every time a filter is set.
    render(<Search items={items(SEARCH)} onReset={vi.fn()} value={SEARCH} />)

    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('offers Reset once one of its own items is set', () => {
    render(
      <Search
        items={items({ ...SEARCH, status: 'paid' })}
        onReset={vi.fn()}
        value={{ ...SEARCH, status: 'paid' }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('offers Reset while only the query is set', () => {
    // Reset clears the query too, so a term with no filter is still something
    // to clear.
    render(
      <Search
        filter={{ value: 'acme' }}
        items={items(SEARCH)}
        onReset={vi.fn()}
        value={SEARCH}
      />,
    )

    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('runs the reset it is handed', async () => {
    const onReset = vi.fn()
    render(
      <Search
        items={items({ ...SEARCH, status: 'paid' })}
        onReset={onReset}
        value={{ ...SEARCH, status: 'paid' }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onReset).toHaveBeenCalledOnce()
  })

  it('badges the Filters button with what is set behind it, not the total', () => {
    const value = { ...SEARCH, archived: true, status: 'paid' }
    render(<Search items={items(value)} value={value} />)

    // Two are set; one of them is inline. The badge is about the panel.
    // Scoped to the trigger's own slot: Popover wraps whatever it is given in
    // a `role="button"` span, so the role alone matches twice.
    expect(document.querySelector('.search-filters')).toHaveTextContent('1')
  })

  it('lets an item overrule the emptiness rule', () => {
    const value: { minTotal: number } = { minTotal: 0 }

    render(
      <Search
        items={[
          {
            field: <input aria-label="Minimum" />,
            id: 'minTotal',
            isActive: (current) => current > 0,
          },
        ]}
        onReset={vi.fn()}
        value={value}
      />,
    )

    // `0` counts by the general rule; here it is not a filter.
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('opens a second row for the items that ask to expand', async () => {
    render(
      <Search
        items={[
          {
            field: <input aria-label="Priority" />,
            id: 'status' as const,
            placement: 'expand' as const,
          },
        ]}
        value={SEARCH}
      />,
    )

    expect(screen.queryByLabelText('Priority')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }))

    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show less' })).toBeEnabled()
  })

  it('keeps the expanded filters on a single row', async () => {
    render(
      <Search
        items={[
          {
            field: <input aria-label="Priority" />,
            id: 'status' as const,
            placement: 'expand' as const,
          },
          {
            field: <input aria-label="Channel" />,
            id: 'channelId' as const,
            placement: 'expand' as const,
          },
        ]}
        value={SEARCH}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }))

    // Both filters are children of the one second row — the bar is two rows,
    // not a row per filter.
    const second = screen.getByTestId('search-expand-row')

    expect(within(second).getByLabelText('Priority')).toBeInTheDocument()
    expect(within(second).getByLabelText('Channel')).toBeInTheDocument()
  })

  it('names a row filter that has no placeholder to introduce itself', () => {
    // A Switch has nothing to say for itself, so a row filter may carry a
    // label — beside the field, so the row stays a row.
    render(
      <Search
        items={[
          {
            field: <input aria-label="Archived" type="checkbox" />,
            id: 'archived' as const,
            label: 'Archived only',
          },
        ]}
        value={SEARCH}
      />,
    )

    expect(screen.getByTestId('search-inline-archived')).toHaveTextContent(
      'Archived only',
    )
  })

  it('marks the Filters button with an icon of its own', () => {
    render(<Search items={items(SEARCH)} value={SEARCH} />)

    expect(document.querySelector('.search-filters svg')).toBeInTheDocument()
  })

  it('turns the Show more chevron over when the second row opens', async () => {
    render(
      <Search
        items={[
          {
            field: <input aria-label="Priority" />,
            id: 'status' as const,
            placement: 'expand' as const,
          },
        ]}
        value={SEARCH}
      />,
    )

    const closed = document.querySelector('.search-more svg')?.outerHTML

    await userEvent.click(screen.getByRole('button', { name: /Show more/ }))

    const open = document.querySelector('.search-more svg')?.outerHTML

    expect(closed).toBeTruthy()
    expect(open).not.toBe(closed)
  })

  it('lets a switch filter hug its cell instead of reserving the full box', () => {
    // The fixed box stops a Select from moving the row as it fills. A Switch
    // cannot change width, so reserving 208px around it only opens a hole.
    render(
      <Search
        items={[
          {
            field: (
              <input aria-checked="false" aria-label="Archived" role="switch" />
            ),
            id: 'archived' as const,
            label: 'Archived',
          },
        ]}
        value={SEARCH}
      />,
    )

    expect(screen.getByTestId('search-inline-archived')).toHaveClass(
      'has-[[role=switch]]:w-auto',
    )
  })

  it('shows no overflow control when every item is inline', () => {
    render(
      <Search
        items={[
          {
            field: <input aria-label="Status" />,
            id: 'status' as const,
          },
        ]}
        value={SEARCH}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /Filters/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument()
  })

  it('draws the bar unless asked for the grid', () => {
    render(<Search items={items(SEARCH)} value={SEARCH} />)

    expect(screen.getByTestId('search-root')).not.toHaveAttribute(
      'data-variant',
    )
    expect(screen.getByTestId('search-row')).toBeInTheDocument()
    expect(screen.queryByTestId('search-grid-cells')).not.toBeInTheDocument()
  })
})

describe('Search grid', () => {
  function everywhere() {
    return [
      {
        field: <input aria-label="Status" />,
        id: 'status' as const,
        label: 'Status',
      },
      {
        field: <input aria-label="Channel" />,
        id: 'channelId' as const,
        label: 'Channel',
        placement: 'expand' as const,
      },
      {
        field: <input aria-label="Archived" />,
        id: 'archived' as const,
        label: 'Archived',
        placement: 'popover' as const,
      },
    ]
  }

  it('says it is the grid, and draws no row', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    expect(screen.getByTestId('search-root')).toHaveAttribute(
      'data-variant',
      'grid',
    )
    expect(screen.queryByTestId('search-row')).not.toBeInTheDocument()
  })

  it('makes every item a cell, wherever it asked to live on the bar', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    const cells = screen.getByTestId('search-grid-cells')

    // A grid has no second row and no panel to hide things in, so the expand
    // and popover items are on screen from the start, beside the inline one.
    expect(within(cells).getByTestId('search-cell-status')).toContainElement(
      screen.getByRole('textbox', {
        name: 'Status',
      }),
    )
    expect(within(cells).getByTestId('search-cell-channelId')).toContainElement(
      screen.getByRole('textbox', {
        name: 'Channel',
      }),
    )
    expect(within(cells).getByTestId('search-cell-archived')).toContainElement(
      screen.getByRole('textbox', {
        name: 'Archived',
      }),
    )
    expect(cells.children).toHaveLength(3)
  })

  it('puts each label above its field, as a form does', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    const cell = screen.getByTestId('search-cell-status')

    expect(cell).toHaveClass('flex-col')
    expect(cell.firstElementChild).toHaveTextContent('Status')
    expect(cell.firstElementChild).toHaveClass('search-filter-label')
    expect(cell.lastElementChild).toBe(
      screen.getByRole('textbox', {
        name: 'Status',
      }),
    )
  })

  it('names the field it holds, and hands the caption its click, NumberInput too', async () => {
    render(
      <Search
        items={[
          {
            field: <NumberInput onChange={() => undefined} value={null} />,
            id: 'status' as const,
            label: 'Minimum nights',
          },
        ]}
        value={SEARCH}
        variant="grid"
      />,
    )

    // NumberInput is built from three controls. The label reaches the field,
    // not the Decrease button drawn before it — so the field has a name, and
    // clicking the caption puts the caret in it.
    const field = screen.getByRole('textbox', {
      name: 'Minimum nights',
    })

    await userEvent.click(screen.getByText('Minimum nights'))

    expect(field).toHaveFocus()
    expect(
      screen.getByRole('button', {
        name: 'Decrease',
      }),
    ).not.toHaveFocus()
  })

  it('leaves the field alone in its cell when it has no label', () => {
    render(
      <Search
        items={[
          {
            field: <input aria-label="Status" />,
            id: 'status' as const,
          },
        ]}
        value={SEARCH}
        variant="grid"
      />,
    )

    const cell = screen.getByTestId('search-cell-status')

    expect(cell.children).toHaveLength(1)
    expect(cell.firstElementChild).toBe(screen.getByLabelText('Status'))
  })

  it('offers neither the Filters button nor Show more', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    expect(screen.queryByTestId('popover-trigger')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Filters/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument()
  })

  it('puts the query field above the cells, across the whole grid', () => {
    render(
      <Search
        filter={{ placeholder: 'Search orders' }}
        items={everywhere()}
        value={SEARCH}
        variant="grid"
      />,
    )

    const field = screen.getByPlaceholderText('Search orders')
    const cells = screen.getByTestId('search-grid-cells')

    expect(cells).not.toContainElement(field)
    expect(field.closest('.search-grid-field')).toHaveClass('w-full')
    expect(
      field.compareDocumentPosition(cells) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('draws no query field unless one is asked for', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    expect(screen.queryByRole('textbox', { name: /Search/ })).toBeNull()
    expect(document.querySelector('.search-grid-field')).toBeNull()
  })

  it('sets Reset apart under the cells, disabled while nothing is set', () => {
    render(
      <Search
        items={everywhere()}
        onReset={vi.fn()}
        value={SEARCH}
        variant="grid"
      />,
    )

    const reset = screen.getByRole('button', { name: 'Reset' })

    expect(reset.closest('.search-grid-footer')).toBeInTheDocument()
    expect(reset).toBeDisabled()
  })

  it('offers Reset once an item is set, whatever its placement', async () => {
    const onReset = vi.fn()
    const value = { ...SEARCH, archived: true }

    render(
      <Search
        items={everywhere()}
        onReset={onReset}
        value={value}
        variant="grid"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onReset).toHaveBeenCalledOnce()
  })

  it('draws no footer when there is no Reset to put in it', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    expect(document.querySelector('.search-grid-footer')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument()
  })

  it('answers to its own width, not the viewport', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    expect(screen.getByTestId('search-root')).toHaveClass(
      '@container/search-grid',
    )
  })

  it('fits two cells a row by default, once there is room', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    const cells = screen.getByTestId('search-grid-cells')

    expect(cells).toHaveClass('grid-cols-1', '@sm/search-grid:grid-cols-2')
  })

  it('takes the number of columns it is given', () => {
    const { rerender } = render(
      <Search columns={1} items={everywhere()} value={SEARCH} variant="grid" />,
    )

    const cells = () => screen.getByTestId('search-grid-cells')

    expect(cells()).toHaveClass('grid-cols-1')
    expect(cells()).not.toHaveClass('@sm/search-grid:grid-cols-2')

    rerender(
      <Search columns={3} items={everywhere()} value={SEARCH} variant="grid" />,
    )

    expect(cells()).toHaveClass(
      '@sm/search-grid:grid-cols-2',
      '@2xl/search-grid:grid-cols-3',
    )

    rerender(
      <Search columns={4} items={everywhere()} value={SEARCH} variant="grid" />,
    )

    expect(cells()).toHaveClass(
      '@sm/search-grid:grid-cols-2',
      '@3xl/search-grid:grid-cols-4',
    )
  })

  it('lets a cell shrink below what its field would like', () => {
    render(<Search items={everywhere()} value={SEARCH} variant="grid" />)

    // A Select holding chips reports a wider intrinsic size; without this its
    // column would outgrow the others.
    expect(screen.getByTestId('search-cell-status')).toHaveClass('min-w-0')
  })
})
