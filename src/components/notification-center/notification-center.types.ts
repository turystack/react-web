/**
 * NotificationCenter
 *
 * The bell in the top bar: how many notifications are waiting, the latest
 * few in a popover, and a way to all of them.
 *
 * Behavior:
 * - The trigger is an icon button with the bell and a destructive count
 *   pinned to it (above 99 it reads "99+"; none unread, no count). Its
 *   accessible name carries the count: "Notifications, 3 unread"
 * - `unreadCount` is the number the bell shows; without it, the unread items
 *   are counted. A server usually knows more unread than the page it sent
 * - The popover (aligned to the bell's end) has a heading, "Mark all as read"
 *   when `onMarkAllRead` is given and something is unread, the first `limit`
 *   notifications in a compact NotificationList, and "View all" when
 *   `viewAll` is given
 * - `viewAll={{ href }}` makes "View all" a link to the app's notifications
 *   page. `viewAll="sheet"` closes the popover and opens a side sheet with
 *   every notification grouped by day, an All / Unread filter, the infinite
 *   props and `itemActions`; closing the sheet puts focus back on the bell
 * - Activating a notification in the popover closes it and calls
 *   `onItemClick`; it never marks the notification read — the app does, in
 *   `onItemClick`
 * - `itemActions` only reaches the sheet's rows; the popover stays a list to
 *   glance at
 * - `open`/`defaultOpen`/`onOpenChange` hold the popover from outside;
 *   `sheetOpen`/`defaultSheetOpen`/`onSheetOpenChange` do the same for the
 *   sheet, so a page can open it straight away or from its own control
 * - The sheet's title is its h2 and each day of its list an h3 under it;
 *   `endReachedSection` closes the sheet's list once the last page is in
 *   (hidden while the Unread filter narrows the rows already loaded)
 * - `items` (+ `loading`) or `outcome`, never both — the same union as List
 * - `ariaLabel` replaces the bell's whole accessible name, count included
 *
 * Implementation:
 * - Popover (asChild) over Button (ghost, icon) holding Indicator around the
 *   bell; Sheet (right) holding NotificationFilter and NotificationList
 * - <NotificationCenter items={notifications} onMarkAllRead={markAll} viewAll="sheet" />
 * - <NotificationCenter outcome={outcome} unreadCount={meta.unread} viewAll={{ href: '/notifications' }} />
 *
 * Dependencies: Popover, Button, Indicator, Sheet, NotificationList,
 * NotificationFilter, LabelsProvider, @turystack/react-hooks
 */

import type { DataOutcome } from '@turystack/react-hooks'
import type { ReactNode } from 'react'

import type { NotificationItem } from '@/components/notification-list/notification-list.types'

export type NotificationCenterViewAll = { href: string } | 'sheet'

export type NotificationCenterTriggerVariant = 'ghost' | 'outline'

export type NotificationCenterTriggerSize = 'sm' | 'md'

type NotificationCenterBaseProps = {
  unreadCount?: number // what the bell shows; default counts the unread items
  limit?: number // notifications in the popover; default 5
  onItemClick?: (item: NotificationItem) => void // activates a notification; the app decides whether it marks it read
  itemActions?: (item: NotificationItem) => ReactNode // a row's own controls, in the sheet only
  onMarkAllRead?: () => void // shows "Mark all as read" while something is unread
  viewAll?: NotificationCenterViewAll // a link to the notifications page, or the built-in sheet
  hasMore?: boolean // the sheet's list: a further page exists
  loadingMore?: boolean // the sheet's list: a further page is loading
  onLoadMore?: () => void // the sheet's list: loads the next page
  endReachedSection?: ReactNode // the sheet's list: shown under the rows once nothing is left to load
  open?: boolean // controlled popover visibility
  defaultOpen?: boolean // uncontrolled initial popover visibility
  onOpenChange?: (open: boolean) => void // fires when the popover opens or closes
  sheetOpen?: boolean // controlled sheet visibility (viewAll="sheet")
  defaultSheetOpen?: boolean // uncontrolled initial sheet visibility (viewAll="sheet")
  onSheetOpenChange?: (open: boolean) => void // fires when the sheet opens or closes
  emptySection?: ReactNode // replaces the default "all caught up" empty state
  triggerVariant?: NotificationCenterTriggerVariant // the bell's button style; default ghost
  triggerSize?: NotificationCenterTriggerSize // the bell's button size; default sm
  ariaLabel?: string // the bell's whole accessible name; default names it with the unread count
}

export type NotificationCenterStaticProps = {
  items?: NotificationItem[] // the notifications, newest first
  loading?: boolean // initial loading state
  outcome?: never
}

export type NotificationCenterOutcomeProps = {
  items?: never
  loading?: never
  outcome: DataOutcome<NotificationItem[]> // the five states of a remote read
}

export type NotificationCenterProps = NotificationCenterBaseProps &
  (NotificationCenterStaticProps | NotificationCenterOutcomeProps)
