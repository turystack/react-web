/**
 * NotificationCard
 *
 * One notification: what happened, when, and whether it has been seen. The
 * row NotificationList renders for each item, usable on its own — a toast
 * body, a preview, the latest notification on a dashboard.
 *
 * Behavior:
 * - Its media (an Avatar, an icon in a square, a logo), its title, an
 *   optional description clamped to two lines, and when it arrived
 * - Unread carries a dot and a semibold title, and a screen reader hears
 *   "Unread" with it
 * - When it arrived reads relative today ("5 minutes ago"), as "Yesterday,
 *   14:30" yesterday and as a short date and time before that, in the locale
 *   and time zone of the FormatProvider; it refreshes once a minute
 * - With `notification.href` the card is a link; with `onClick` (and no href)
 *   a button; with neither, plain content. `onClick` also fires on a link
 *   before it navigates. Clicking never marks it read — the app decides that
 *   in `onClick`
 * - `actions` (a "…" menu) sit beside the link or button, never inside it, so
 *   no interactive element is nested in another and a click on an action
 *   never activates the card; they are centred on the title's line
 * - `density="compact"` tightens it for a popover; `comfortable` (the
 *   default) is a page or panel
 * - The whole card lights up under the pointer; only a card that opens
 *   something gets the pointer cursor and a focus ring
 *
 * Implementation:
 * - <NotificationCard notification={n} onClick={(n) => open(n.id)} />
 * - <NotificationCard density="compact" notification={n} actions={<DropdownMenu … />} />
 *
 * Dependencies: FormatProvider, LabelsProvider, @turystack/react-hooks
 * (useInterval)
 */

import type { ReactNode } from 'react'

import type { NotificationItem } from '@/components/notification-list/notification-list.types'

export type NotificationCardDensity = 'compact' | 'comfortable'

export type NotificationCardProps = {
  notification: NotificationItem // what to show (required)
  actions?: ReactNode // its own controls, beside the link or button
  density?: NotificationCardDensity // spacing; default comfortable
  onClick?: (notification: NotificationItem) => void // activates it; the app decides about read
}
