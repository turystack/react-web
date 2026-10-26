import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { NotificationItem } from '@/components/notification-list/notification-list.types'

import { NotificationCard } from './notification-card'

const NOW = new Date('2026-10-07T15:00:00Z')

const base: NotificationItem = {
  at: new Date('2026-10-07T14:55:00Z'),
  description: 'Booking #1042 was paid by pix.',
  id: 'n1',
  title: 'Payment received',
}

describe('NotificationCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the title, the description and when it arrived', () => {
    vi.useFakeTimers({
      now: NOW,
    })
    render(<NotificationCard notification={base} />)

    expect(screen.getByText('Payment received')).toBeInTheDocument()
    expect(
      screen.getByText('Booking #1042 was paid by pix.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument()
    expect(document.querySelector('time')).toHaveAttribute(
      'datetime',
      '2026-10-07T14:55:00.000Z',
    )
  })

  it('keeps the relative time live', () => {
    vi.useFakeTimers({
      now: NOW,
    })
    render(<NotificationCard notification={base} />)

    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(screen.getByText(/6 minutes ago/)).toBeInTheDocument()
  })

  it('marks an unread notification for the eye and the ear', () => {
    render(<NotificationCard notification={base} />)

    const root = screen.getByTestId('notification-card-root')
    expect(root).toHaveAttribute('data-read', 'false')
    expect(screen.getByTestId('notification-card-unread')).toBeInTheDocument()
    expect(screen.getByText('Unread')).toHaveClass('sr-only')
    expect(screen.getByText('Payment received')).toHaveClass('font-semibold')
  })

  it('drops the dot once read', () => {
    render(
      <NotificationCard
        notification={{
          ...base,
          read: true,
        }}
      />,
    )

    expect(screen.getByTestId('notification-card-root')).toHaveAttribute(
      'data-read',
      'true',
    )
    expect(
      screen.queryByTestId('notification-card-unread'),
    ).not.toBeInTheDocument()
  })

  it('is a link with an href, and still reports the click', async () => {
    const onClick = vi.fn()
    render(
      <NotificationCard
        notification={{
          ...base,
          href: '#booking-1042',
        }}
        onClick={onClick}
      />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#booking-1042')

    await userEvent.click(link)
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'n1',
      }),
    )
  })

  it('is a button with only onClick, and plain content with neither', () => {
    const { rerender } = render(
      <NotificationCard notification={base} onClick={() => {}} />,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Payment received')

    rerender(<NotificationCard notification={base} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('puts actions beside the button, never inside it', async () => {
    const onClick = vi.fn()
    const onAction = vi.fn()
    render(
      <NotificationCard
        actions={
          <button onClick={onAction} type="button">
            More
          </button>
        }
        notification={base}
        onClick={onClick}
      />,
    )

    const card = screen.getByRole('button', {
      name: /Payment received/,
    })
    const more = screen.getByRole('button', {
      name: 'More',
    })
    expect(card).not.toContainElement(more)

    await userEvent.click(more)
    expect(onAction).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows its media and publishes its density', () => {
    render(
      <NotificationCard
        density="compact"
        notification={{
          ...base,
          media: <svg data-testid="icon" />,
        }}
      />,
    )

    expect(screen.getByTestId('notification-card-media')).toContainElement(
      screen.getByTestId('icon'),
    )
    expect(screen.getByTestId('notification-card-root')).toHaveAttribute(
      'data-density',
      'compact',
    )
  })

  it('paints a slot class on every element it draws', () => {
    render(
      <NotificationCard
        actions={<button type="button">More</button>}
        notification={{
          ...base,
          media: <svg />,
        }}
        onClick={() => {}}
      />,
    )

    for (const slot of [
      'root',
      'main',
      'media',
      'body',
      'title',
      'description',
      'time',
      'unread',
      'unread-label',
      'actions',
    ]) {
      expect(
        document.querySelector(`.notification-card-${slot}`),
        slot,
      ).not.toBeNull()
    }
  })
})
