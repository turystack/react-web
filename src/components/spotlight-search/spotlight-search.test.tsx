import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SpotlightSearch } from './spotlight-search'
import type { SpotlightSearchGroup } from './spotlight-search.types'

const groups: SpotlightSearchGroup[] = [
  {
    heading: 'Bookings',
    items: [
      {
        description: 'Start a reservation from scratch',
        id: 'new',
        keywords: ['create', 'reservation'],
        label: 'New booking',
        shortcut: ['B'],
      },
      {
        id: 'invoices',
        keywords: ['billing'],
        label: 'Invoices',
      },
    ],
  },
  {
    heading: 'Settings',
    items: [
      {
        id: 'team',
        label: 'Team members',
      },
      {
        disabled: true,
        id: 'billing',
        label: 'Billing plan',
      },
    ],
  },
]

describe('SpotlightSearch', () => {
  it('stays shut until it is opened', () => {
    render(<SpotlightSearch groups={groups} />)

    expect(screen.queryByTestId('spotlight-search')).not.toBeInTheDocument()
  })

  it('opens on its shortcut and closes on the same keys', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} shortcut />)

    await user.keyboard('{Meta>}k{/Meta}')

    expect(await screen.findByTestId('spotlight-search')).toBeInTheDocument()

    await user.keyboard('{Meta>}k{/Meta}')

    await waitFor(() =>
      expect(screen.queryByTestId('spotlight-search')).not.toBeInTheDocument(),
    )
  })

  it('renders in place when it is inline', () => {
    render(<SpotlightSearch groups={groups} inline />)

    expect(screen.getByTestId('spotlight-search')).toBeInTheDocument()
    expect(
      screen.queryByTestId('spotlight-search-escape'),
    ).not.toBeInTheDocument()
  })

  it('finds a row by a keyword its label never mentions', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} inline />)

    await user.type(screen.getByTestId('spotlight-search-input'), 'billing')

    const rows = screen.getAllByTestId('spotlight-search-item')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Invoices')
    expect(rows[1]).toHaveTextContent('Billing plan')
  })

  it('drops a section whose rows all failed to match', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} inline />)

    await user.type(screen.getByTestId('spotlight-search-input'), 'reservation')

    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('says so when nothing matched', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} inline />)

    await user.type(screen.getByTestId('spotlight-search-input'), 'zzzz')

    expect(screen.getByTestId('spotlight-search-empty')).toBeInTheDocument()
  })

  it('runs the active row on Enter and closes', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        defaultOpen
        groups={[
          {
            items: [
              {
                id: 'new',
                label: 'New booking',
                onSelect,
              },
            ],
          },
        ]}
      />,
    )

    await user.type(
      await screen.findByTestId('spotlight-search-input'),
      '{Enter}',
    )

    expect(onSelect).toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.queryByTestId('spotlight-search')).not.toBeInTheDocument(),
    )
  })

  it('keeps itself open for a row that says so', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        defaultOpen
        groups={[
          {
            items: [
              {
                id: 'new',
                keepOpen: true,
                label: 'Pick a date',
                onSelect,
              },
            ],
          },
        ]}
      />,
    )

    await user.type(
      await screen.findByTestId('spotlight-search-input'),
      '{Enter}',
    )

    expect(onSelect).toHaveBeenCalled()
    expect(screen.getByTestId('spotlight-search')).toBeInTheDocument()
  })

  it('walks the rows with the arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} inline />)

    const rows = () => screen.getAllByTestId('spotlight-search-item')

    expect(rows()[0]).toHaveAttribute('data-active', 'true')

    await user.type(screen.getByTestId('spotlight-search-input'), '{ArrowDown}')
    expect(rows()[1]).toHaveAttribute('data-active', 'true')

    await user.type(screen.getByTestId('spotlight-search-input'), '{ArrowUp}')
    expect(rows()[0]).toHaveAttribute('data-active', 'true')

    await user.type(screen.getByTestId('spotlight-search-input'), '{ArrowUp}')
    expect(rows()[2]).toHaveAttribute('data-active', 'true')
  })

  it('never lands on a disabled row', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} inline />)

    const input = screen.getByTestId('spotlight-search-input')

    await user.type(input, '{ArrowUp}')

    expect(
      screen.getByText('Team members').closest('[data-testid]'),
    ).toHaveAttribute('data-active', 'true')
  })

  it('refuses to run a disabled row', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        groups={[
          {
            items: [
              {
                disabled: true,
                id: 'billing',
                label: 'Billing plan',
                onSelect,
              },
            ],
          },
        ]}
        inline
      />,
    )

    await user.click(screen.getByTestId('spotlight-search-item'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('hands the query over and stops filtering when told to', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        groups={groups}
        inline
        onSearchChange={onSearchChange}
      />,
    )

    await user.type(screen.getByTestId('spotlight-search-input'), 'zzzz')

    expect(onSearchChange).toHaveBeenCalled()
    expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(4)
  })

  it('reports opening and closing to a controlled owner', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        groups={groups}
        onOpenChange={onOpenChange}
        open
        shortcut
      />,
    )

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders a row shortcut as keycaps', () => {
    render(<SpotlightSearch groups={groups} inline />)

    expect(screen.getByText('B').tagName).toBe('KBD')
  })

  it('renders a footer when it is given one', () => {
    render(
      <SpotlightSearch
        footer={<span>Enter to run</span>}
        groups={groups}
        inline
      />,
    )

    expect(screen.getByTestId('spotlight-search-footer')).toHaveTextContent(
      'Enter to run',
    )
  })
})
