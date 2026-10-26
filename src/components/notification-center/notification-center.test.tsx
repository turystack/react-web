import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { NotificationItem } from '@/components/notification-list/notification-list.types'
import { TuryProvider } from '@/components/tury-provider'

import { NotificationCenter } from './notification-center'
import type { NotificationCenterProps } from './notification-center.types'

const NOW = new Date('2026-09-26T15:00:00Z')

function makeNotification(
  index: number,
  overrides: Partial<NotificationItem> = {},
): NotificationItem {
  return {
    at: new Date(NOW.getTime() - index * 3_600_000),
    id: `n${index}`,
    title: `Notification ${index}`,
    ...overrides,
  }
}

// Two unread among seven; the last two arrived yesterday.
const feed: NotificationItem[] = Array.from({ length: 7 }, (_, index) =>
  makeNotification(index + 1, {
    at: new Date(
      NOW.getTime() - (index < 5 ? index + 1 : 24 + index) * 3_600_000,
    ),
    read: index >= 2,
  }),
)

function renderCenter(props: NotificationCenterProps) {
  return render(
    <TuryProvider format={{ locale: 'en-US', timeZone: 'UTC' }}>
      <NotificationCenter {...props} />
    </TuryProvider>,
  )
}

function bell(name: string | RegExp = /^Notifications/) {
  return screen.getByRole('button', { name })
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NotificationCenter trigger', () => {
  it('names the bell with the unread count it counted', () => {
    renderCenter({ items: feed })

    expect(bell('Notifications, 2 unread')).toBeInTheDocument()
    expect(screen.getByTestId('indicator-badge')).toHaveTextContent('2')
  })

  it('shows the count the server sent over the one it can count', () => {
    renderCenter({ items: feed, unreadCount: 40 })

    expect(bell('Notifications, 40 unread')).toBeInTheDocument()
  })

  it('caps the badge at 99+ and keeps the real number in the name', () => {
    renderCenter({ items: feed, unreadCount: 120 })

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent('99+')
    expect(bell('Notifications, 120 unread')).toBeInTheDocument()
  })

  it('shows no badge and a plain name when nothing is unread', () => {
    renderCenter({ items: feed, unreadCount: 0 })

    expect(bell('Notifications')).toBeInTheDocument()
    expect(screen.queryByTestId('indicator-badge')).toBeNull()
  })

  it('takes a whole name from ariaLabel', () => {
    renderCenter({ ariaLabel: 'Inbox, 2 new', items: feed })

    expect(bell('Inbox, 2 new')).toBeInTheDocument()
  })

  it('takes the name from the provider', () => {
    render(
      <TuryProvider
        labels={{
          notifications: {
            trigger: (unread) => `Notificações, ${unread} não lidas`,
          },
        }}
      >
        <NotificationCenter items={feed} />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Notificações, 2 não lidas' }),
    ).toBeInTheDocument()
  })
})

describe('NotificationCenter popover', () => {
  it('opens on the bell with a heading and the first `limit` notifications', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed, limit: 3 })

    await user.click(bell())

    expect(bell()).toHaveAttribute('aria-expanded', 'true')
    expect(
      await screen.findByRole('heading', { name: 'Notifications' }),
    ).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Notifications' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows five notifications by default', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed })
    await user.click(bell())

    const list = await screen.findByRole('list', { name: 'Notifications' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  })

  it('offers Mark all as read only when it can act and something is unread', async () => {
    const user = userEvent.setup()
    const onMarkAllRead = vi.fn()

    const { unmount } = renderCenter({ items: feed, onMarkAllRead })
    await user.click(bell())
    await user.click(
      await screen.findByRole('button', { name: 'Mark all as read' }),
    )
    expect(onMarkAllRead).toHaveBeenCalledOnce()
    unmount()

    renderCenter({ items: feed, onMarkAllRead, unreadCount: 0 })
    await user.click(bell())
    await screen.findByRole('list', { name: 'Notifications' })
    expect(
      screen.queryByRole('button', { name: 'Mark all as read' }),
    ).toBeNull()
  })

  it('offers no Mark all as read without onMarkAllRead', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed })
    await user.click(bell())

    await screen.findByRole('list', { name: 'Notifications' })
    expect(
      screen.queryByRole('button', { name: 'Mark all as read' }),
    ).toBeNull()
  })

  it('closes and reports the notification that was activated', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()

    renderCenter({ items: feed, onItemClick })
    await user.click(bell())
    await user.click(
      await screen.findByRole('button', { name: /Notification 1/ }),
    )

    expect(onItemClick).toHaveBeenCalledWith(feed[0])
    await waitFor(() =>
      expect(bell()).toHaveAttribute('aria-expanded', 'false'),
    )
  })

  it('keeps the row actions out of the popover', async () => {
    const user = userEvent.setup()

    renderCenter({
      itemActions: (item) => <button type="button">Archive {item.id}</button>,
      items: feed,
      viewAll: 'sheet',
    })
    await user.click(bell())

    await screen.findByRole('list', { name: 'Notifications' })
    expect(screen.queryByRole('button', { name: /Archive/ })).toBeNull()
  })

  it('says all caught up when there is nothing', async () => {
    const user = userEvent.setup()

    renderCenter({ items: [] })
    await user.click(bell('Notifications'))

    expect(await screen.findByText("You're all caught up")).toBeInTheDocument()
  })

  it('draws placeholder rows while the read is pending', async () => {
    const user = userEvent.setup()

    renderCenter({ outcome: { retry: vi.fn(), status: 'pending' } })
    await user.click(bell('Notifications'))

    const loading = await screen.findByTestId('notification-list-loading')
    expect(loading.children).toHaveLength(3)
  })

  it('counts the unread rows of a successful read', () => {
    renderCenter({
      outcome: {
        data: feed,
        refreshing: false,
        retry: vi.fn(),
        status: 'success',
      },
    })

    expect(bell('Notifications, 2 unread')).toBeInTheDocument()
  })

  it('follows a controlled open state', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderCenter({ items: feed, onOpenChange, open: true })

    expect(
      await screen.findByRole('list', { name: 'Notifications' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('starts open with defaultOpen', async () => {
    renderCenter({ defaultOpen: true, items: feed })

    expect(
      await screen.findByRole('list', { name: 'Notifications' }),
    ).toBeInTheDocument()
  })
})

describe('NotificationCenter view all', () => {
  it('links to the notifications page', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed, viewAll: { href: '/notifications' } })
    await user.click(bell())

    expect(
      await screen.findByRole('link', { name: 'View all' }),
    ).toHaveAttribute('href', '/notifications')
  })

  it('offers no View all without viewAll', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed })
    await user.click(bell())

    await screen.findByRole('list', { name: 'Notifications' })
    expect(screen.queryByText('View all')).toBeNull()
  })

  it('opens every notification in a sheet, grouped by day, with the row actions', async () => {
    const user = userEvent.setup()

    renderCenter({
      itemActions: (item) => <button type="button">Archive {item.id}</button>,
      items: feed,
      viewAll: 'sheet',
    })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    // The modal sheet hides the page behind it, the bell included.
    await waitFor(() =>
      expect(
        screen.getByRole('button', { hidden: true, name: /^Notifications/ }),
      ).toHaveAttribute('aria-expanded', 'false'),
    )
    expect(within(sheet).getAllByRole('heading', { level: 3 })).toHaveLength(2)
    expect(
      within(sheet).getAllByRole('button', { name: /Archive/ }),
    ).toHaveLength(7)
    expect(
      within(sheet).getByRole('radio', { name: 'Unread · 2' }),
    ).toBeInTheDocument()
  })

  it('stops paging while the sheet shows only unread notifications', async () => {
    const user = userEvent.setup()

    renderCenter({
      hasMore: true,
      items: feed,
      onLoadMore: vi.fn(),
      viewAll: 'sheet',
    })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    expect(within(sheet).getByTestId('list-infinite')).toBeInTheDocument()

    // A short filtered list keeps the sentinel in view; paging under it
    // would pull every older page looking for unread rows.
    await user.click(within(sheet).getByRole('radio', { name: /Unread/ }))
    expect(within(sheet).queryByTestId('list-infinite')).toBeNull()

    await user.click(within(sheet).getByRole('radio', { name: 'All' }))
    expect(within(sheet).getByTestId('list-infinite')).toBeInTheDocument()
  })

  it('narrows the sheet to the unread notifications', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed, viewAll: 'sheet' })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    await user.click(within(sheet).getByRole('radio', { name: /Unread/ }))

    expect(within(sheet).getByText('Notification 1')).toBeInTheDocument()
    expect(within(sheet).getByText('Notification 2')).toBeInTheDocument()
    expect(within(sheet).queryByText('Notification 3')).toBeNull()
  })

  it('loads more from the sheet', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()

    renderCenter({ hasMore: true, items: feed, onLoadMore, viewAll: 'sheet' })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    await user.click(within(sheet).getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('offers Mark all as read in the sheet too', async () => {
    const user = userEvent.setup()
    const onMarkAllRead = vi.fn()

    renderCenter({ items: feed, onMarkAllRead, viewAll: 'sheet' })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    await user.click(
      within(sheet).getByRole('button', { name: 'Mark all as read' }),
    )
    expect(onMarkAllRead).toHaveBeenCalledOnce()
  })

  it('heads the sheet with an h2 and each of its days with an h3', async () => {
    renderCenter({ defaultSheetOpen: true, items: feed, viewAll: 'sheet' })

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    const outline = within(sheet)
      .getAllByRole('heading')
      .map((heading) => `${heading.tagName}:${heading.textContent}`)
    expect(outline).toEqual(['H2:Notifications', 'H3:Today', 'H3:Yesterday'])
  })

  it('starts with the sheet open under defaultSheetOpen', async () => {
    renderCenter({ defaultSheetOpen: true, items: feed, viewAll: 'sheet' })

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    expect(within(sheet).getByText('Notification 7')).toBeInTheDocument()
  })

  it('follows a controlled sheet and reports what it asks for', async () => {
    const user = userEvent.setup()
    const onSheetOpenChange = vi.fn()

    const { rerender } = renderCenter({
      items: feed,
      onSheetOpenChange,
      sheetOpen: false,
      viewAll: 'sheet',
    })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))
    expect(onSheetOpenChange).toHaveBeenLastCalledWith(true)
    // The parent has not said yes: no sheet.
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).toBeNull()

    rerender(
      <TuryProvider format={{ locale: 'en-US', timeZone: 'UTC' }}>
        <NotificationCenter
          items={feed}
          onSheetOpenChange={onSheetOpenChange}
          sheetOpen
          viewAll="sheet"
        />
      </TuryProvider>,
    )
    await screen.findByRole('dialog', { name: 'Notifications' })

    await user.keyboard('{Escape}')
    expect(onSheetOpenChange).toHaveBeenLastCalledWith(false)
    // Still held open until the parent lets go.
    expect(
      screen.getByRole('dialog', { name: 'Notifications' }),
    ).toBeInTheDocument()
  })

  it('closes the sheet list with endReachedSection once nothing is left', async () => {
    renderCenter({
      defaultSheetOpen: true,
      endReachedSection: 'That is everything from the last 90 days',
      hasMore: false,
      items: feed,
      onLoadMore: vi.fn(),
      viewAll: 'sheet',
    })

    const sheet = await screen.findByRole('dialog', { name: 'Notifications' })
    expect(
      within(sheet).getByText('That is everything from the last 90 days'),
    ).toBeInTheDocument()
  })

  it('puts focus back on the bell once the sheet closes', async () => {
    const user = userEvent.setup()

    renderCenter({ items: feed, viewAll: 'sheet' })
    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: 'View all' }))
    await screen.findByRole('dialog', { name: 'Notifications' })

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(bell()).toHaveFocus())
  })
})
