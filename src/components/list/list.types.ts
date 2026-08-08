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
 *
 * Implementation:
 * - <List items={orders} itemKey="id" renderItem={(order) => <OrderCard order={order} />} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} pagination={pagination} />
 * - <List items={orders} itemKey="id" renderItem={renderOrder} infinite={{ hasMore, onLoadMore }} />
 *
 * Dependencies: Pagination component, Loader component, Skeleton component
 */

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
  rootMargin?: string // IntersectionObserver preload distance; default should favor mobile webviews
  loadMoreText?: ReactNode // manual fallback button content
  loadingMoreText?: ReactNode // content shown next to the incremental loader
  endReachedSection?: ReactNode // content shown when hasMore is false after items were rendered
  onLoadMore?: () => void // fires from observer or manual fallback
}

type ListBaseProps<T> = {
  items?: T[] // data items
  itemKey: ListItemKey<T> // stable React key extractor
  renderItem: (item: T, index: number) => ReactNode // item renderer
  loading?: boolean // initial loading state
  error?: boolean // initial error state
  loadingRows?: number // number of default skeleton rows
  emptySection?: ReactNode // content shown when items are empty
  errorSection?: ReactNode // content shown when error is true and items are empty
  loadingSection?: ReactNode // content shown when loading is true and items are empty
  footerSection?: ReactNode // always rendered below the list content, before pagination/infinite controls
  gap?: ListGap // vertical spacing between items
  divided?: boolean // renders separators between items
  padded?: boolean // applies list padding
}

export type ListPaginatedProps<T> = ListBaseProps<T> & {
  pagination?: PaginationProps
  infinite?: never
}

export type ListInfiniteModeProps<T> = ListBaseProps<T> & {
  infinite?: ListInfiniteProps
  pagination?: never
}

export type ListProps<T> = ListPaginatedProps<T> | ListInfiniteModeProps<T>
