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

  it('renders in place for variant="inline"', () => {
    render(<SpotlightSearch groups={groups} variant="inline" />)

    expect(screen.getByTestId('spotlight-search')).toBeInTheDocument()
    expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(4)
    expect(
      screen.queryByTestId('spotlight-search-escape'),
    ).not.toBeInTheDocument()
  })

  it('finds a row by a keyword its label never mentions', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} variant="inline" />)

    await user.type(screen.getByTestId('spotlight-search-input'), 'billing')

    const rows = screen.getAllByTestId('spotlight-search-item')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Invoices')
    expect(rows[1]).toHaveTextContent('Billing plan')
  })

  it('drops a section whose rows all failed to match', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} variant="inline" />)

    await user.type(screen.getByTestId('spotlight-search-input'), 'reservation')

    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('says so when nothing matched', async () => {
    const user = userEvent.setup()

    render(<SpotlightSearch groups={groups} variant="inline" />)

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

    render(<SpotlightSearch groups={groups} variant="inline" />)

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

    render(<SpotlightSearch groups={groups} variant="inline" />)

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
        variant="inline"
      />,
    )

    await user.click(screen.getByTestId('spotlight-search-item'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  describe('disabledReason', () => {
    const reason = 'Only admins can export'
    const reasoned = (onSelect = vi.fn()): SpotlightSearchGroup[] => [
      {
        items: [
          {
            id: 'team',
            label: 'Team members',
          },
          {
            disabledReason: reason,
            id: 'export',
            label: 'Export CSV',
            onSelect,
          },
        ],
      },
    ]
    const row = (label: string) =>
      screen.getByText(label).closest('[role="option"]') as HTMLElement

    it('keeps a blocked row in the arrow walk and runs nothing on Enter', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(<SpotlightSearch groups={reasoned(onSelect)} variant="inline" />)

      const input = screen.getByTestId('spotlight-search-input')

      await user.type(input, '{ArrowDown}')

      expect(row('Export CSV')).toHaveAttribute('data-active', 'true')
      expect(input).toHaveAttribute(
        'aria-activedescendant',
        row('Export CSV').id,
      )
      expect(row('Export CSV')).toHaveAttribute('aria-disabled', 'true')

      await user.type(input, '{Enter}')
      await user.click(row('Export CSV'))

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('is described by its reason, and shows it beside the active row', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={reasoned()} variant="inline" />)

      expect(row('Export CSV')).toHaveAccessibleDescription(reason)
      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument()

      await user.type(
        screen.getByTestId('spotlight-search-input'),
        '{ArrowDown}',
      )

      expect(
        await screen.findByTestId('disabled-reason-popup'),
      ).toHaveTextContent(reason)

      await user.type(screen.getByTestId('spotlight-search-input'), '{Escape}')

      await waitFor(() =>
        expect(
          screen.queryByTestId('disabled-reason-popup'),
        ).not.toBeInTheDocument(),
      )
    })

    it('shows no reason when the pointer enters over a heading, away from the row', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[
            {
              heading: 'Actions',
              items: [
                {
                  disabledReason: reason,
                  id: 'export',
                  label: 'Export CSV',
                },
              ],
            },
          ]}
          variant="inline"
        />,
      )

      await user.hover(screen.getByText('Actions'))

      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument()
    })

    it('waits for focus or the pointer before showing a first-row reason inline', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[
            {
              items: [
                {
                  disabledReason: reason,
                  id: 'export',
                  label: 'Export CSV',
                },
              ],
            },
          ]}
          variant="inline"
        />,
      )

      expect(row('Export CSV')).toHaveAttribute('data-active', 'true')
      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument()

      await user.hover(row('Export CSV'))
      expect(
        await screen.findByTestId('disabled-reason-popup'),
      ).toHaveTextContent(reason)

      await user.unhover(row('Export CSV'))
      await waitFor(() =>
        expect(
          screen.queryByTestId('disabled-reason-popup'),
        ).not.toBeInTheDocument(),
      )

      await user.click(screen.getByTestId('spotlight-search-input'))
      await user.unhover(screen.getByTestId('spotlight-search-input'))
      expect(
        await screen.findByTestId('disabled-reason-popup'),
      ).toHaveTextContent(reason)
    })

    it('brings a reason Escape hid back when the pointer arrives on its row', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={reasoned()} variant="inline" />)
      const input = screen.getByTestId('spotlight-search-input')

      await user.type(input, '{ArrowDown}')
      await screen.findByTestId('disabled-reason-popup')
      await user.type(input, '{Escape}')
      await waitFor(() =>
        expect(
          screen.queryByTestId('disabled-reason-popup'),
        ).not.toBeInTheDocument(),
      )

      await user.hover(row('Export CSV'))

      expect(row('Export CSV')).toHaveAttribute('data-active', 'true')
      expect(
        await screen.findByTestId('disabled-reason-popup'),
      ).toHaveTextContent(reason)
    })

    it('leaves a row without a reason as it was', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[
            {
              items: [
                {
                  id: 'team',
                  label: 'Team members',
                  onSelect,
                },
              ],
            },
          ]}
          variant="inline"
        />,
      )

      expect(row('Team members')).not.toHaveAttribute('aria-describedby')
      expect(row('Team members')).not.toHaveAttribute('aria-disabled')

      await user.type(screen.getByTestId('spotlight-search-input'), '{Enter}')

      expect(onSelect).toHaveBeenCalled()
      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument()
    })
  })

  it('hands the query over and stops filtering when told to', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()

    render(
      <SpotlightSearch
        groups={groups}
        variant="inline"
        onSearchChange={onSearchChange}
      />,
    )

    await user.type(screen.getByTestId('spotlight-search-input'), 'zzzz')

    expect(onSearchChange).toHaveBeenCalled()
    expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(4)
  })

  describe('query value pair', () => {
    it('starts from defaultSearchValue, filtered, and keeps typing from it', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          defaultSearchValue="billing"
          groups={groups}
          variant="inline"
        />,
      )

      const input = screen.getByTestId('spotlight-search-input')

      expect(input).toHaveValue('billing')
      expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(2)

      await user.clear(input)

      expect(input).toHaveValue('')
      expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(4)
    })

    it('reports changes made from the prefill', async () => {
      const onSearchChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          defaultSearchValue="inv"
          groups={groups}
          onSearchChange={onSearchChange}
          variant="inline"
        />,
      )

      await user.type(screen.getByTestId('spotlight-search-input'), 'o')

      expect(onSearchChange).toHaveBeenLastCalledWith('invo')
    })

    it('lets searchValue win over defaultSearchValue', () => {
      render(
        <SpotlightSearch
          defaultSearchValue="billing"
          groups={groups}
          searchValue="team"
          variant="inline"
        />,
      )

      expect(screen.getByTestId('spotlight-search-input')).toHaveValue('team')
      expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(1)
    })

    it('starts empty without either', () => {
      render(<SpotlightSearch groups={groups} variant="inline" />)

      expect(screen.getByTestId('spotlight-search-input')).toHaveValue('')
    })

    it('empties the dialog field on close even after a prefill', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          defaultOpen
          defaultSearchValue="billing"
          groups={groups}
          shortcut
        />,
      )

      expect(await screen.findByTestId('spotlight-search-input')).toHaveValue(
        'billing',
      )

      await user.keyboard('{Escape}')
      await waitFor(() =>
        expect(
          screen.queryByTestId('spotlight-search'),
        ).not.toBeInTheDocument(),
      )
      await user.keyboard('{Meta>}k{/Meta}')

      expect(await screen.findByTestId('spotlight-search-input')).toHaveValue(
        '',
      )
    })
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
    render(<SpotlightSearch groups={groups} variant="inline" />)

    expect(screen.getByText('B').tagName).toBe('KBD')
  })

  it('renders a footer when it is given one', () => {
    render(
      <SpotlightSearch
        footer={<span>Enter to run</span>}
        groups={groups}
        variant="inline"
      />,
    )

    expect(screen.getByTestId('spotlight-search-footer')).toHaveTextContent(
      'Enter to run',
    )
  })

  describe('group action', () => {
    const withAction = (onAction: () => void, onSelect: () => void) => [
      {
        action: (
          <button onClick={onAction} type="button">
            View all
          </button>
        ),
        heading: 'Customers',
        items: [{ id: 'ana', label: 'Ana Souza', onSelect }],
      },
    ]

    it('renders the action in the group heading', () => {
      render(
        <SpotlightSearch
          groups={withAction(vi.fn(), vi.fn())}
          variant="inline"
        />,
      )

      const heading = screen.getByTestId('spotlight-search-group-label')

      expect(heading).toHaveTextContent('Customers')
      expect(
        screen.getByTestId('spotlight-search-group-action'),
      ).toHaveTextContent('View all')
      expect(heading).toContainElement(
        screen.getByRole('button', { name: 'View all' }),
      )
    })

    it('runs the action without selecting a row', async () => {
      const onAction = vi.fn()
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={withAction(onAction, onSelect)}
          variant="inline"
        />,
      )

      await user.click(screen.getByRole('button', { name: 'View all' }))

      expect(onAction).toHaveBeenCalledTimes(1)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('renders a heading row for an action even without a heading', () => {
      render(
        <SpotlightSearch
          groups={[
            {
              action: <a href="/search">View all</a>,
              items: [{ id: 'ana', label: 'Ana Souza' }],
            },
          ]}
          variant="inline"
        />,
      )

      expect(
        screen.getByTestId('spotlight-search-group-action'),
      ).toHaveTextContent('View all')
    })

    it('renders no action slot when the group has none', () => {
      render(<SpotlightSearch groups={groups} variant="inline" />)

      expect(
        screen.queryByTestId('spotlight-search-group-action'),
      ).not.toBeInTheDocument()
    })
  })

  describe('emptyQueryGroups', () => {
    const recents: SpotlightSearchGroup[] = [
      {
        heading: 'Recent searches',
        items: [{ id: 'recent-ana', label: 'ana souza' }],
      },
    ]

    it('shows them instead of the groups before anything is typed', () => {
      render(
        <SpotlightSearch
          emptyQueryGroups={recents}
          groups={groups}
          variant="inline"
        />,
      )

      expect(screen.getByText('Recent searches')).toBeInTheDocument()
      expect(screen.queryByText('Bookings')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('spotlight-search-item')).toHaveLength(1)
    })

    it('gives way to the matching groups once there is a query', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          emptyQueryGroups={recents}
          groups={groups}
          variant="inline"
        />,
      )

      await user.type(screen.getByTestId('spotlight-search-input'), 'inv')

      expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
      expect(screen.getByTestId('spotlight-search-item')).toHaveTextContent(
        'Invoices',
      )
    })

    it('comes back when the query is cleared', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          emptyQueryGroups={recents}
          groups={groups}
          variant="inline"
        />,
      )

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'inv')
      await user.clear(input)

      expect(screen.getByText('Recent searches')).toBeInTheDocument()
    })

    it('runs a recent row with Enter', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          emptyQueryGroups={[
            { items: [{ id: 'recent', label: 'ana', onSelect }] },
          ]}
          groups={groups}
          variant="inline"
        />,
      )

      await user.type(screen.getByTestId('spotlight-search-input'), '{Enter}')

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('shows the groups on an empty query when it is not given', () => {
      render(<SpotlightSearch groups={groups} variant="inline" />)

      expect(screen.getByText('Bookings')).toBeInTheDocument()
    })
  })

  describe('variant="popover"', () => {
    const results = () => screen.queryByTestId('spotlight-search-dropdown')

    it('renders its own field and keeps the results shut', () => {
      render(
        <SpotlightSearch
          ariaLabel="Search"
          groups={groups}
          placeholder="Search"
          variant="popover"
        />,
      )

      expect(screen.getByRole('combobox', { name: 'Search' })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
      expect(results()).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('spotlight-search-escape'),
      ).not.toBeInTheDocument()
    })

    it('opens the results under the field on typing, focus staying in the field', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} variant="popover" />)

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'inv')

      expect(
        await screen.findByTestId('spotlight-search-dropdown'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('spotlight-search-item')).toHaveTextContent(
        'Invoices',
      )
      expect(input).toHaveFocus()
      expect(input).toHaveAttribute('aria-expanded', 'true')
    })

    it('stays shut on focus when there is nothing to show yet', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} variant="popover" />)

      await user.click(screen.getByTestId('spotlight-search-input'))

      expect(results()).not.toBeInTheDocument()
    })

    it('opens on focus to show the empty-query groups', async () => {
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          emptyQueryGroups={[
            { heading: 'Recent', items: [{ id: 'r', label: 'ana' }] },
          ]}
          groups={groups}
          variant="popover"
        />,
      )

      await user.click(screen.getByTestId('spotlight-search-input'))

      expect(await screen.findByText('Recent')).toBeInTheDocument()
    })

    it('walks the rows with the arrows and points the field at the active one', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} variant="popover" />)

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'o')

      const rows = () => screen.getAllByTestId('spotlight-search-item')

      expect(rows()[0]).toHaveAttribute('data-active', 'true')

      await user.keyboard('{ArrowDown}')
      expect(rows()[1]).toHaveAttribute('data-active', 'true')
      expect(input).toHaveAttribute('aria-activedescendant', rows()[1].id)

      await user.keyboard('{ArrowUp}')
      expect(rows()[0]).toHaveAttribute('data-active', 'true')
      expect(input).toHaveFocus()
    })

    it('opens with ArrowDown after it was closed', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} variant="popover" />)

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'inv')
      await user.keyboard('{Escape}')
      await waitFor(() => expect(results()).not.toBeInTheDocument())

      await user.keyboard('{ArrowDown}')

      expect(
        await screen.findByTestId('spotlight-search-dropdown'),
      ).toBeInTheDocument()
    })

    it('runs the active row on Enter and closes, keeping the query', async () => {
      const onSelect = vi.fn()
      const onOpenChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[
            {
              items: [
                { id: 'a', label: 'Ana Souza' },
                { id: 'b', label: 'Ana Lima', onSelect },
              ],
            },
          ]}
          onOpenChange={onOpenChange}
          variant="popover"
        />,
      )

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'ana')
      await user.keyboard('{ArrowDown}{Enter}')

      expect(onSelect).toHaveBeenCalledTimes(1)
      await waitFor(() => expect(results()).not.toBeInTheDocument())
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
      expect(input).toHaveValue('ana')
      expect(input).toHaveFocus()
    })

    it('does nothing on Enter while it is closed', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[{ items: [{ id: 'a', label: 'Ana', onSelect }] }]}
          variant="popover"
        />,
      )

      await user.click(screen.getByTestId('spotlight-search-input'))
      await user.keyboard('{Enter}')

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('closes on Escape once, keeping focus and query, and clears on a second Escape', async () => {
      const onOpenChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={groups}
          onOpenChange={onOpenChange}
          variant="popover"
        />,
      )

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'inv')
      await screen.findByTestId('spotlight-search-dropdown')

      await user.keyboard('{Escape}')

      await waitFor(() => expect(results()).not.toBeInTheDocument())
      expect(input).toHaveFocus()
      expect(input).toHaveValue('inv')
      expect(
        onOpenChange.mock.calls.filter(([value]) => value === false),
      ).toHaveLength(1)

      await user.keyboard('{Escape}')

      expect(input).toHaveValue('')
    })

    it('stays open when the field is clicked again', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} variant="popover" />)

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'inv')
      await screen.findByTestId('spotlight-search-dropdown')

      await user.click(input)

      expect(results()).toBeInTheDocument()
    })

    it('closes when focus leaves the field, and says so once', async () => {
      const onOpenChange = vi.fn()
      const user = userEvent.setup()

      render(
        <>
          <SpotlightSearch
            groups={groups}
            onOpenChange={onOpenChange}
            variant="popover"
          />
          <button type="button">Elsewhere</button>
        </>,
      )

      await user.type(screen.getByTestId('spotlight-search-input'), 'inv')
      await screen.findByTestId('spotlight-search-dropdown')

      await user.click(screen.getByRole('button', { name: 'Elsewhere' }))

      await waitFor(() => expect(results()).not.toBeInTheDocument())
      expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    })

    it('runs a clicked row without moving focus out of the field', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SpotlightSearch
          groups={[{ items: [{ id: 'a', label: 'Ana', onSelect }] }]}
          variant="popover"
        />,
      )

      const input = screen.getByTestId('spotlight-search-input')
      await user.type(input, 'an')
      await user.click(await screen.findByTestId('spotlight-search-item'))

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(input).toHaveFocus()
    })

    it('moves focus into its field on the shortcut', async () => {
      const user = userEvent.setup()

      render(<SpotlightSearch groups={groups} shortcut variant="popover" />)

      await user.keyboard('{Meta>}k{/Meta}')

      expect(screen.getByTestId('spotlight-search-input')).toHaveFocus()
    })

    it('sizes its field from the width preset', () => {
      const { rerender } = render(
        <SpotlightSearch groups={groups} variant="popover" />,
      )

      expect(screen.getByTestId('spotlight-search-anchor')).toHaveClass('w-72')

      rerender(
        <SpotlightSearch groups={groups} variant="popover" width="full" />,
      )

      expect(screen.getByTestId('spotlight-search-anchor')).toHaveClass(
        'w-full',
      )
    })

    it('follows a controlled open', () => {
      render(<SpotlightSearch groups={groups} open variant="popover" />)

      expect(
        screen.getByTestId('spotlight-search-dropdown'),
      ).toBeInTheDocument()
    })
  })
})

describe('SpotlightSearch listbox name', () => {
  it.each(['dialog', 'inline'] as const)(
    'names the %s listbox after the palette',
    (variant) => {
      render(
        <SpotlightSearch
          ariaLabel="Command palette"
          defaultOpen
          groups={groups}
          placeholder="Type a command"
          variant={variant}
        />,
      )

      expect(screen.getByRole('listbox')).toHaveAccessibleName(
        'Command palette',
      )
    },
  )

  it('names the listbox after the placeholder when there is no ariaLabel', () => {
    render(
      <SpotlightSearch groups={groups} placeholder="Search" variant="inline" />,
    )

    expect(screen.getByRole('listbox')).toHaveAccessibleName('Search')
  })

  it('falls back to the results label with neither', () => {
    render(<SpotlightSearch groups={groups} variant="inline" />)

    expect(screen.getByRole('listbox')).toHaveAccessibleName('Search results')
  })

  it('names the popover listbox too', async () => {
    render(
      <SpotlightSearch
        groups={groups}
        placeholder="Search"
        variant="popover"
      />,
    )

    await userEvent.type(screen.getByRole('combobox'), 'inv')

    expect(await screen.findByRole('listbox')).toHaveAccessibleName('Search')
  })

  it('names an empty result list too', () => {
    render(
      <SpotlightSearch
        defaultSearchValue="zzz"
        groups={groups}
        variant="inline"
      />,
    )

    expect(screen.getByRole('listbox')).toHaveAccessibleName('Search results')
  })
})

describe('SpotlightSearch scrim', () => {
  it('dims the page with the shared overlay token, blurred', () => {
    render(<SpotlightSearch groups={groups} open />)

    const backdrop = screen.getByTestId('spotlight-search-backdrop')
    expect(backdrop).toHaveClass('bg-overlay', 'backdrop-blur-overlay')
    expect(backdrop.className).not.toMatch(/bg-black/)
  })
})

describe('SpotlightSearch axes', () => {
  it('publishes its default variant for a theme to select', async () => {
    render(<SpotlightSearch defaultOpen groups={groups} />)

    expect(await screen.findByTestId('spotlight-search')).toHaveAttribute(
      'data-variant',
      'dialog',
    )
  })

  it.each(['inline', 'popover'] as const)(
    'publishes the variant it was given (%s)',
    async (variant) => {
      render(<SpotlightSearch groups={groups} open variant={variant} />)

      expect(await screen.findByTestId('spotlight-search')).toHaveAttribute(
        'data-variant',
        variant,
      )
    },
  )
})
