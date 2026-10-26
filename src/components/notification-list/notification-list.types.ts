/**
 * NotificationList
 *
 * The notifications a product sent the reader, newest first: what happened,
 * when, and whether it has been seen.
 *
 * Behavior:
 * - Built on List, so it paints the same states a list does: skeleton rows
 *   while the read is pending, the error state with a retry, the denied state,
 *   and an empty state that says "you're all caught up" rather than "no data"
 * - Data arrives as `items` (+ `loading`/`error`) or as one `outcome`, never
 *   both — the same exclusive union List and Table take
 * - Each row is a NotificationCard — media, title, a two-line description,
 *   when it arrived, the unread dot — so a card shown on its own and a row in
 *   the list are the same thing. `onItemClick` is each card's `onClick`
 *   (a link card fires it before it navigates; clicking never marks it read)
 *   and `itemActions` each card's `actions`, beside its link or button
 * - `groupBy="day"` heads the rows with Today, Yesterday or the date they
 *   arrived on, in arrival order. Each label is a real heading, h3 unless
 *   `headingLevel` (h2–h6) places it under a different outline — h2 right
 *   under the page's h1, h3 under a panel's h2 title
 * - `density="compact"` tightens the rows for a popover; `comfortable` (the
 *   default) is the full page or panel
 * - `activeKey` marks the notification open elsewhere (a side preview)
 * - `hasMore`/`loadingMore`/`onLoadMore`/`endReachedSection` turn on List's
 *   infinite mode: a sentinel that loads as the end nears, with a manual
 *   fallback button
 *
 * Implementation:
 * - <NotificationList items={notifications} onItemClick={(n) => open(n.id)} />
 * - <NotificationList outcome={outcome} groupBy="day" hasMore={hasMore} onLoadMore={onLoadMore} />
 * - <NotificationList density="compact" items={latest} itemActions={(n) => <DropdownMenu … />} />
 *
 * Dependencies: List, NotificationCard, EmptyState, FormatProvider, LabelsProvider,
 * @turystack/react-hooks (DataOutcome, useInterval)
 */

import type { DataOutcome } from '@turystack/react-hooks'
import type { ReactNode } from 'react'

/** One notification, as every notification component reads it. */
export type NotificationItem = {
  id: string // stable identity; also the key activeKey is compared with
  title: ReactNode // what happened
  description?: ReactNode // one or two lines of detail; clamped
  at: Date // when it arrived; read relative to now
  read?: boolean // seen already; unread rows carry a dot and a semibold title
  media?: ReactNode // an Avatar, an icon in a square, a logo
  href?: string // makes the row a link
}

export type NotificationListDensity = 'compact' | 'comfortable'

export type NotificationListGroupBy = 'none' | 'day'

export type NotificationListHeadingLevel = 2 | 3 | 4 | 5 | 6

type NotificationListBaseProps = {
  density?: NotificationListDensity // row spacing; default comfortable
  groupBy?: NotificationListGroupBy // day heads the rows with Today / Yesterday / a date; default none
  headingLevel?: NotificationListHeadingLevel // the heading each day's label is (h2–h6); default 3
  onItemClick?: (item: NotificationItem) => void // activates a row; the app decides whether it marks it read
  itemActions?: (item: NotificationItem) => ReactNode // a row's own controls, beside the row's link or button
  activeKey?: string // id of the notification open elsewhere; highlighted + aria-current
  emptySection?: ReactNode // replaces the default "all caught up" empty state
  loadingRows?: number // skeleton rows while pending; default 3
  hasMore?: boolean // a further page exists
  loadingMore?: boolean // a further page is loading
  onLoadMore?: () => void // loads the next page, from the sentinel or the manual button
  endReachedSection?: ReactNode // shown under the rows once nothing is left to load
  ariaLabel?: string // names the list; default from the labels contract
}

export type NotificationListStaticProps = {
  items?: NotificationItem[] // the notifications, newest first
  loading?: boolean // initial loading state
  error?: boolean // initial error state
  outcome?: never
}

export type NotificationListOutcomeProps = {
  items?: never
  loading?: never
  error?: never
  outcome: DataOutcome<NotificationItem[]> // the five states of a remote read
}

export type NotificationListProps = NotificationListBaseProps &
  (NotificationListStaticProps | NotificationListOutcomeProps)
