import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DataOutcome } from '@turystack/react-hooks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { NotificationList } from './notification-list'
import type {
  NotificationItem,
  NotificationListProps,
} from './notification-list.types'

const NOW = new Date('2026-09-26T15:00:00Z')

function minutesAgo(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60_000)
}

function makeNotification(
  overrides: Partial<NotificationItem> = {},
): NotificationItem {
  return {
    at: minutesAgo(5),
    id: 'n1',
    title: 'Booking confirmed',
    ...overrides,
  }
}

const feed: NotificationItem[] = [
  makeNotification({
    description: 'Room 204, 3 nights',
    id: 'n1',
    title: 'Booking confirmed',
  }),
  makeNotification({
    at: minutesAgo(60 * 4),
    id: 'n2',
    read: true,
    title: 'Payout sent',
  }),
  makeNotification({
    at: new Date('2026-09-25T13:30:00Z'),
    id: 'n3',
    read: true,
    title: 'Review received',
  }),
  makeNotification({
    at: new Date('2026-09-12T10:00:00Z'),
    id: 'n4',
    title: 'Password changed',
  }),
]

function renderList(props: NotificationListProps) {
  return render(
    <TuryProvider format={{ locale: 'en-US', timeZone: 'UTC' }}>
      <NotificationList {...props} />
    </TuryProvider>,
  )
}

/** Every link and button that sits inside another link or button. */
function nestedControls(container: HTMLElement): Element[] {
  return [...container.querySelectorAll('a, button')].filter(
    (control) => control.parentElement?.closest('a, button') !== null,
  )
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NotificationList rows', () => {
  it('renders one entry per notification in a list named by the labels', () => {
    renderList({ items: feed })

    const list = screen.getByRole('list', { name: 'Notifications' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument()
    expect(screen.getByText('Room 204, 3 nights')).toBeInTheDocument()
  })

  it('takes its name from ariaLabel', () => {
    renderList({ ariaLabel: 'Latest', items: feed })

    expect(screen.getByRole('list', { name: 'Latest' })).toBeInTheDocument()
  })

  it('says when each notification arrived, relative today and dated before', () => {
    renderList({ items: feed })

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument()
    expect(screen.getByText('4 hours ago')).toBeInTheDocument()
    expect(screen.getByText('Yesterday, 01:30 PM')).toBeInTheDocument()
    expect(screen.getByText('Sep 12, 10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('5 minutes ago')).toHaveAttribute(
      'datetime',
      minutesAgo(5).toISOString(),
    )
  })

  it('tells an unread notification apart for assistive technology', () => {
    renderList({ items: feed })

    const [unread, read] = screen.getAllByTestId('notification-card-root')

    expect(unread).toHaveAttribute('data-read', 'false')
    expect(
      within(unread as HTMLElement).getByText('Unread'),
    ).toBeInTheDocument()
    expect(read).toHaveAttribute('data-read', 'true')
    expect(within(read as HTMLElement).queryByText('Unread')).toBeNull()
  })

  it('takes the unread word from the provider', () => {
    render(
      <TuryProvider labels={{ notifications: { unread: 'Não lida' } }}>
        <NotificationList items={[makeNotification()]} />
      </TuryProvider>,
    )

    expect(screen.getByText('Não lida')).toBeInTheDocument()
  })

  it('renders the media beside the text', () => {
    renderList({
      items: [makeNotification({ media: <span>JD</span> })],
    })

    expect(
      within(screen.getByTestId('notification-card-media')).getByText('JD'),
    ).toBeInTheDocument()
  })
})

describe('NotificationList activation', () => {
  it('renders a row with href as a link and still reports the click', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    const item = makeNotification({ href: '#booking-1' })

    renderList({ items: [item], onItemClick })

    const link = screen.getByRole('link', { name: /Booking confirmed/ })
    expect(link).toHaveAttribute('href', '#booking-1')
    expect(link).toHaveAccessibleName(/Unread/)

    await user.click(link)
    expect(onItemClick).toHaveBeenCalledWith(item)
  })

  it('renders a row as a button when only onItemClick is given', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()

    renderList({ items: feed, onItemClick })

    await user.click(screen.getByRole('button', { name: /Payout sent/ }))
    expect(onItemClick).toHaveBeenCalledWith(feed[1])
  })

  it('activates a row from the keyboard', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()

    renderList({ items: [feed[0] as NotificationItem], onItemClick })

    await user.tab()
    await user.keyboard('{Enter}')
    expect(onItemClick).toHaveBeenCalledOnce()
  })

  it('leaves a row inert without href or onItemClick', () => {
    renderList({ items: feed })

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps a click on a row action to that action', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    const onArchive = vi.fn()

    renderList({
      itemActions: (item) => (
        <button onClick={() => onArchive(item.id)} type="button">
          Archive {item.id}
        </button>
      ),
      items: feed,
      onItemClick,
    })

    await user.click(screen.getByRole('button', { name: 'Archive n2' }))

    expect(onArchive).toHaveBeenCalledWith('n2')
    expect(onItemClick).not.toHaveBeenCalled()
  })

  it('nests no control inside another, links and actions alike', () => {
    const { container } = renderList({
      itemActions: (item) => <button type="button">More for {item.id}</button>,
      items: [
        ...feed,
        makeNotification({ href: '#linked', id: 'n5', title: 'Linked' }),
      ],
      onItemClick: vi.fn(),
    })

    expect(screen.getAllByRole('button', { name: /More for/ })).toHaveLength(5)
    expect(nestedControls(container)).toEqual([])
  })

  it('marks the notification open elsewhere as current', () => {
    renderList({ activeKey: 'n2', items: feed })

    const rows = screen.getAllByRole('listitem')
    expect(rows[1]).toHaveAttribute('aria-current', 'true')
    expect(rows[0]).not.toHaveAttribute('aria-current')
  })
})

describe('NotificationList groupBy', () => {
  it('heads the rows with Today, Yesterday and the date', () => {
    renderList({ groupBy: 'day', items: feed })

    const headings = screen.getAllByRole('heading')
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Today',
      'Yesterday',
      'Sep 12',
    ])
  })

  it('makes each day an h3 by default', () => {
    renderList({ groupBy: 'day', items: feed })

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  })

  it('places the day headings at the level headingLevel asks for', () => {
    renderList({ groupBy: 'day', headingLevel: 2, items: feed })

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Today', 'Yesterday', 'Sep 12'])
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })

  it('draws no headings by default', () => {
    renderList({ items: feed })

    expect(screen.queryAllByRole('heading')).toHaveLength(0)
  })

  it('takes the day words from the provider', () => {
    render(
      <TuryProvider
        format={{ locale: 'pt-BR', timeZone: 'UTC' }}
        labels={{ notifications: { today: 'Hoje', yesterday: 'Ontem' } }}
      >
        <NotificationList groupBy="day" items={feed.slice(0, 3)} />
      </TuryProvider>,
    )

    expect(
      screen.getAllByRole('heading').map((heading) => heading.textContent),
    ).toEqual(['Hoje', 'Ontem'])
    expect(screen.getByText('Ontem, 13:30')).toBeInTheDocument()
  })
})

describe('NotificationList states', () => {
  it('says the reader is all caught up when there is nothing', () => {
    renderList({ items: [] })

    expect(screen.getByText("You're all caught up")).toBeInTheDocument()
  })

  it('replaces the empty state with emptySection', () => {
    renderList({ emptySection: <span>Nothing new</span>, items: [] })

    expect(screen.getByText('Nothing new')).toBeInTheDocument()
    expect(screen.queryByText("You're all caught up")).toBeNull()
  })

  it('draws placeholder rows while loading', () => {
    renderList({ items: [], loading: true, loadingRows: 2 })

    const loading = screen.getByTestId('notification-list-loading')
    // Two rows, each a round media and three lines — shaped like a notification.
    expect(loading.children).toHaveLength(2)
    expect(within(loading).getAllByTestId('skeleton')).toHaveLength(8)
  })

  it('draws placeholder rows while the read is pending', () => {
    const outcome: DataOutcome<NotificationItem[]> = {
      retry: vi.fn(),
      status: 'pending',
    }

    renderList({ outcome })

    expect(
      screen.getByTestId('notification-list-loading').children,
    ).toHaveLength(3)
  })

  it('offers a retry on a failed read', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()

    renderList({
      outcome: { error: new Error('boom'), retry, status: 'error' },
    })

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('states the reason of a denied read', () => {
    renderList({
      outcome: { reason: 'Ask for access', retry: vi.fn(), status: 'denied' },
    })

    expect(screen.getByText('Ask for access')).toBeInTheDocument()
  })

  it('renders the rows of a successful read, grouped when asked', () => {
    renderList({
      groupBy: 'day',
      outcome: {
        data: feed,
        refreshing: false,
        retry: vi.fn(),
        status: 'success',
      },
    })

    expect(screen.getByText('Password changed')).toBeInTheDocument()
    expect(screen.getAllByRole('heading')).toHaveLength(3)
  })

  it('reports an empty read as all caught up', () => {
    renderList({ outcome: { retry: vi.fn(), status: 'empty' } })

    expect(screen.getByText("You're all caught up")).toBeInTheDocument()
  })
})

describe('NotificationList infinite', () => {
  it('loads the next page from the manual fallback', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()

    renderList({ hasMore: true, items: feed, onLoadMore })

    await user.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('shows endReachedSection once nothing is left', () => {
    renderList({
      endReachedSection: <span>That is everything</span>,
      hasMore: false,
      items: feed,
      onLoadMore: vi.fn(),
    })

    expect(screen.getByText('That is everything')).toBeInTheDocument()
  })

  it('offers no load-more control without the infinite props', () => {
    renderList({ items: feed })

    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()
  })
})

describe('NotificationList axes', () => {
  it('publishes its default density on every row for a theme to select', () => {
    renderList({ items: feed })

    for (const row of screen.getAllByTestId('notification-card-root')) {
      expect(row).toHaveAttribute('data-density', 'comfortable')
    }
  })

  it('publishes the density it was given on rows and day headings', () => {
    renderList({ density: 'compact', groupBy: 'day', items: feed })

    for (const row of screen.getAllByTestId('notification-card-root')) {
      expect(row).toHaveAttribute('data-density', 'compact')
    }
    for (const heading of screen.getAllByTestId('notification-list-heading')) {
      expect(heading).toHaveAttribute('data-density', 'compact')
    }
  })

  it('publishes it on the loading placeholder too', () => {
    renderList({ density: 'compact', items: [], loading: true })

    expect(screen.getByTestId('notification-list-loading')).toHaveAttribute(
      'data-density',
      'compact',
    )
  })
})

describe('NotificationList clock', () => {
  it('runs one timer for the whole feed and still keeps every row live', () => {
    vi.useFakeTimers({
      now: new Date('2026-10-07T15:00:00Z'),
    })
    try {
      const items = Array.from({ length: 5 }, (_, index) => ({
        at: new Date('2026-10-07T14:55:00Z'),
        id: `n${index}`,
        title: `Notification ${index}`,
      }))
      render(<NotificationList items={items} />)

      expect(vi.getTimerCount()).toBe(1)
      expect(screen.getAllByText(/5 minutes ago/)).toHaveLength(5)

      act(() => {
        vi.advanceTimersByTime(60_000)
      })

      expect(screen.getAllByText(/6 minutes ago/)).toHaveLength(5)
    } finally {
      vi.useRealTimers()
    }
  })
})
