import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

  it('keeps a panel filter off the row until the button is used', async () => {
    render(<Search items={items(SEARCH)} value={SEARCH} />)

    expect(screen.queryByLabelText('Archived')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(await screen.findByLabelText('Archived')).toBeInTheDocument()
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
})
