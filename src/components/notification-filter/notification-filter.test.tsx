import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { NotificationFilter } from './notification-filter'
import type { NotificationFilterCategory } from './notification-filter.types'

const categories: NotificationFilterCategory[] = [
  { label: 'Billing', value: 'billing' },
  { label: 'Bookings', value: 'bookings' },
]

describe('NotificationFilter status', () => {
  it('offers All and Unread in a named group, with the current one checked', () => {
    render(<NotificationFilter onStatusChange={vi.fn()} status="unread" />)

    const group = screen.getByRole('radiogroup', { name: 'Show' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Unread' })).toBeChecked()
  })

  it('reports the status the reader picks', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()

    render(<NotificationFilter onStatusChange={onStatusChange} status="all" />)

    await user.click(screen.getByRole('radio', { name: 'Unread' }))
    expect(onStatusChange).toHaveBeenCalledWith('unread')
  })

  it('reads each count beside its option', () => {
    render(
      <NotificationFilter
        counts={{ all: 12, unread: 3 }}
        onStatusChange={vi.fn()}
        status="all"
      />,
    )

    expect(screen.getByRole('radio', { name: 'All · 12' })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Unread · 3' }),
    ).toBeInTheDocument()
  })

  it('takes its words from the provider', () => {
    render(
      <TuryProvider
        labels={{
          notifications: {
            status: 'Mostrar',
            statusAll: 'Todas',
            statusUnread: 'Não lidas',
          },
        }}
      >
        <NotificationFilter
          counts={{ unread: 3 }}
          onStatusChange={vi.fn()}
          status="all"
        />
      </TuryProvider>,
    )

    expect(screen.getByRole('radiogroup', { name: 'Mostrar' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Não lidas · 3' })).toBeTruthy()
  })
})

describe('NotificationFilter search', () => {
  it('adds no field without search', () => {
    render(<NotificationFilter onStatusChange={vi.fn()} status="all" />)

    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('names the field by the labels and reports the typed query', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <NotificationFilter
        onStatusChange={vi.fn()}
        search={{ onChange, value: '' }}
        status="all"
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: 'Search notifications' }),
      'pay',
    )

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('pay'))
  })

  it('takes a placeholder of its own', () => {
    render(
      <NotificationFilter
        onStatusChange={vi.fn()}
        search={{ onChange: vi.fn(), placeholder: 'Find', value: '' }}
        status="all"
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Find' })).toBeInTheDocument()
  })
})

describe('NotificationFilter category', () => {
  it('adds no chip without categories', () => {
    render(
      <NotificationFilter
        categories={[]}
        onStatusChange={vi.fn()}
        status="all"
      />,
    )

    expect(screen.queryByRole('button', { name: /Categories/ })).toBeNull()
  })

  it('picks a category from the chip and closes the picker', async () => {
    const user = userEvent.setup()
    const onCategoryChange = vi.fn()

    render(
      <NotificationFilter
        categories={categories}
        onCategoryChange={onCategoryChange}
        onStatusChange={vi.fn()}
        status="all"
      />,
    )

    await user.click(screen.getByRole('button', { name: /Categories/ }))
    await user.click(await screen.findByRole('radio', { name: 'Bookings' }))

    expect(onCategoryChange).toHaveBeenCalledWith('bookings')
    await waitFor(() =>
      expect(screen.queryByRole('radio', { name: 'Bookings' })).toBeNull(),
    )
  })

  it('reads the chosen category and clears it', async () => {
    const user = userEvent.setup()
    const onCategoryChange = vi.fn()

    render(
      <NotificationFilter
        categories={categories}
        category="billing"
        onCategoryChange={onCategoryChange}
        onStatusChange={vi.fn()}
        status="all"
      />,
    )

    expect(
      screen.getByRole('button', { name: /Categories.*Billing/ }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remove Categories filter' }),
    )
    expect(onCategoryChange).toHaveBeenCalledWith()
  })
})
