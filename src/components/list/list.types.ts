/**
 * List
 *
 * Mobile-first generic list with renderItem support.
 * Designed for card/list layouts in constrained webviews.
 *
 * Behavior:
 * - Renders arbitrary items through renderItem
 * - Supports initial loading, empty and error states
 * - Supports either Pagination or infinite scroll, not both
 * - Infinite mode uses an IntersectionObserver sentinel plus a manual fallback
 * - Keeps list layout generic; item visuals belong to renderItem
 * - activeKey marks the item currently open elsewhere (a side preview in a
 *   split view): its row gets the accent background and aria-current="true".
 *   It is compared with the item's key as a string, so 7 and "7" match
 * - `outcome` is the alternative to `items` + `loading` + `error`: it carries
 *   the five states of a remote read and the list paints all of them,
 *   including the denied one, which is the empty state's shape without a
 *   retry because retrying a denial changes nothing
 * - `outcome` and `items`/`loading`/`error` are mutually exclusive: a list
 *   reads from a query or from a prop, never from both
 * - `onItemClick` makes every row act on a click: the row takes focus with
 *   Tab and Enter or Space fires it too. A click on a control inside the row
 *   (button, link, input, label, select, textarea, contenteditable, the
 *   control roles, anything marked `data-row-click-ignore`, and content
 *   portalled out of the row such as an open DropdownMenu item) belongs to
 *   that control and does not fire it, so a row's controls need no
 *   stopPropagation — the same rule Table's `onRowClick` follows. A key is the
 *   row's only when pressed on the row itself
 * - `ariaLabel` names the list itself, for a list whose purpose no visible
 *   heading states (a list inside a popover, a panel)
 * - A failed next page is not a failed read: `infinite.error` keeps the rows
 *   on screen and puts the failure in the footer, where the control that
 *   asked for the page already is
 *
 * Implementation:
 * - <List items={orders} itemKey="id" renderItem={(order) => <OrderCard order={order} />} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} pagination={pagination} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} infinite={{ hasMore, onLoadMore }} />
 * - <List outcome={outcome} itemKey="id" renderItem={renderOrder} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} activeKey={openOrderId} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} onItemClick={(order) => open(order.id)} />
 *
 * Dependencies: Pagination component, Loader component, Skeleton component,
 * EmptyState component, Button component, LoadingOverlay component,
 * @turystack/react-hooks (DataOutcome)
 */

import type { DataOutcome } from '@turystack/react-hooks'
import type { ReactNode } from 'react'

import type { PaginationProps } from '@/components/pagination'

export type ListItemKey<T> =
  | keyof T
  | ((item: T, index: number) => string | number)

export type ListGap = 'none' | 'xs' | 'sm' | 'md' | 'lg'

export type ListInfiniteProps = {
  hasMore?: boolean // whether more items can be loaded
  loadingMore?: boolean // loading state for the next page/chunk
  disabled?: boolean // prevents observer and manual load-more calls
  error?: boolean // the next page failed; the rows already on screen stay
  rootMargin?: string // IntersectionObserver preload distance; default should favor mobile webviews
  loadMoreText?: ReactNode // manual fallback button content
  loadingMoreText?: ReactNode // content shown next to the incremental loader
  endReachedSection?: ReactNode // content shown when hasMore is false after items were rendered
  errorSection?: ReactNode // content shown in the footer when error is true
  onLoadMore?: () => void // fires from observer or manual fallback
}

type ListBaseProps<T> = {
  itemKey: ListItemKey<T> // stable React key extractor
  renderItem: (item: T, index: number) => ReactNode // item renderer
  activeKey?: string | number // key of the item open in a side preview; highlighted + aria-current
  ariaLabel?: string // names the list for assistive technology
  onItemClick?: (item: T, index: number) => void // makes rows focusable and clickable; controls inside a row keep their own clicks
  loadingRows?: number // number of default skeleton rows
  deniedSection?: ReactNode // content shown when the outcome is denied
  emptySection?: ReactNode // content shown when items are empty
  errorSection?: ReactNode // content shown when the read failed and items are empty
  loadingSection?: ReactNode // content shown when loading is true and items are empty
  footerSection?: ReactNode // always rendered below the list content, before pagination/infinite controls
  gap?: ListGap // vertical spacing between items
  divided?: boolean // renders separators between items
  padded?: boolean // applies list padding
}

export type ListStaticProps<T> = {
  items?: T[] // data items
  loading?: boolean // initial loading state
  error?: boolean // initial error state
  outcome?: never
}

export type ListOutcomeProps<T> = {
  items?: never
  loading?: never
  error?: never
  outcome: DataOutcome<T[]> // the five states of a remote read
}

export type ListDataProps<T> = ListStaticProps<T> | ListOutcomeProps<T>

export type ListPaginatedProps<T> = ListBaseProps<T> & {
  pagination?: PaginationProps
  infinite?: never
}

export type ListInfiniteModeProps<T> = ListBaseProps<T> & {
  infinite?: ListInfiniteProps
  pagination?: never
}

export type ListProps<T> = (ListPaginatedProps<T> | ListInfiniteModeProps<T>) &
  ListDataProps<T>
