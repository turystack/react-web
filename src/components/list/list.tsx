import { useEffect, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Pagination } from '@/components/pagination'
import { Skeleton } from '@/components/skeleton'
import { ChevronDown } from '@/internal/icons'

import type { ListItemKey, ListProps } from './list.types'

const DEFAULT_ROOT_MARGIN = '160px'
const DEFAULT_LOADING_ROWS = 3

const styles = tv({
  defaultVariants: {
    gap: 'sm',
  },
  slots: {
    content: 'flex min-w-0 list-content flex-col',
    endReached:
      'list-end-reached px-4 py-2 text-center text-muted-foreground text-sm',
    footer: 'min-w-0 list-footer',
    infiniteControl: 'flex min-w-0 list-infinite-control flex-col gap-2',
    loadingMore:
      'flex min-w-0 list-loading-more items-center justify-center gap-2 py-3 text-muted-foreground text-sm',
    root: 'relative flex w-full min-w-0 list-root flex-col gap-4',
    row: 'list-row min-w-0',
    sentinel: 'h-px w-full list-sentinel',
    state:
      'flex min-h-24 w-full min-w-0 list-state items-center justify-center p-4 text-center text-muted-foreground text-sm',
  },
  variants: {
    divided: {
      true: {
        row: 'border-border border-b last:border-b-0',
      },
    },
    gap: {
      lg: {
        content: 'gap-4',
      },
      md: {
        content: 'gap-3',
      },
      none: {
        content: 'gap-0',
      },
      sm: {
        content: 'gap-2',
      },
      xs: {
        content: 'gap-1',
      },
    },
    padded: {
      true: {
        content: 'p-4',
      },
    },
  },
})

function getItemKey<T>(
  item: T,
  index: number,
  itemKey: ListItemKey<T>,
): string {
  if (typeof itemKey === 'function') {
    return String(itemKey(item, index))
  }

  return String(item[itemKey])
}

function ListLoadingState({ rows }: { rows: number }) {
  const { content, row } = styles({
    gap: 'sm',
  })

  return (
    <div className={content()} data-testid="list-loading">
      {Array.from(
        {
          length: rows,
        },
        (_, index) => (
          <div className={row()} key={`list-loading-${index}`}>
            <Skeleton height="xl" />
          </div>
        ),
      )}
    </div>
  )
}

function List<T>({
  deniedSection,
  divided,
  emptySection,
  error,
  errorSection,
  footerSection,
  gap = 'sm',
  infinite,
  itemKey,
  items,
  loading,
  loadingRows = DEFAULT_LOADING_ROWS,
  loadingSection,
  outcome,
  padded,
  pagination,
  renderItem,
}: ListProps<T>) {
  const labels = useLabels()
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null)
  const status = outcome?.status
  const data = (outcome?.status === 'success' ? outcome.data : items) ?? []
  const isEmpty = data.length === 0
  const isPending = outcome ? status === 'pending' : Boolean(loading)
  const isFailed = outcome ? status === 'error' : Boolean(error)
  const isRefreshing =
    outcome?.status === 'success' ? outcome.refreshing : false
  const hasMore = infinite?.hasMore
  const infiniteDisabled = infinite?.disabled
  const infiniteLoadingMore = infinite?.loadingMore
  const loadMoreText = infinite?.loadMoreText
  const loadingMoreText = infinite?.loadingMoreText
  const endReachedSection = infinite?.endReachedSection
  const onLoadMore = infinite?.onLoadMore
  const rootMargin = infinite?.rootMargin ?? DEFAULT_ROOT_MARGIN
  const infiniteError = infinite?.error
  const canLoadMore = Boolean(
    hasMore &&
      onLoadMore &&
      !infiniteLoadingMore &&
      !infiniteDisabled &&
      !infiniteError,
  )

  const {
    content,
    endReached,
    footer,
    infiniteControl,
    loadingMore,
    root,
    row,
    sentinel,
    state,
  } = styles({
    divided,
    gap,
    padded,
  })

  useEffect(() => {
    if (!sentinelNode || !canLoadMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore?.()
        }
      },
      {
        rootMargin,
      },
    )

    observer.observe(sentinelNode)

    return () => observer.disconnect()
  }, [canLoadMore, onLoadMore, rootMargin, sentinelNode])

  const handleLoadMore = () => {
    if (canLoadMore) {
      onLoadMore?.()
    }
  }

  const renderState = () => {
    if (isPending && isEmpty) {
      return loadingSection ?? <ListLoadingState rows={loadingRows} />
    }

    if (outcome?.status === 'denied') {
      return (
        <div className={state()} data-testid="list-denied">
          {deniedSection ?? <EmptyState size="sm" title={outcome.reason} />}
        </div>
      )
    }

    if (isFailed && isEmpty) {
      return (
        <div className={state()} data-testid="list-error">
          {errorSection ??
            (outcome ? (
              <EmptyState
                action={
                  <Button
                    onClick={outcome.retry}
                    type="button"
                    variant="outline"
                  >
                    {labels.common.retry}
                  </Button>
                }
                size="sm"
                title={labels.list.error}
              />
            ) : (
              labels.list.error
            ))}
        </div>
      )
    }

    if (isEmpty) {
      return (
        <div className={state()} data-testid="list-empty">
          {emptySection ?? labels.list.empty}
        </div>
      )
    }

    return null
  }

  const stateContent = renderState()

  return (
    <div
      aria-busy={isRefreshing ? true : undefined}
      className={root()}
      data-testid="list-root"
    >
      {stateContent ?? (
        <ul className={content()} data-testid="list-content">
          {data.map((dataItem, index) => (
            <li
              className={row()}
              data-testid="list-item"
              key={getItemKey(dataItem, index, itemKey)}
            >
              {renderItem(dataItem, index)}
            </li>
          ))}
        </ul>
      )}

      {footerSection && (
        <div className={footer()} data-testid="list-footer">
          {footerSection}
        </div>
      )}

      {pagination && <Pagination {...pagination} />}

      <LoadingOverlay visible={isRefreshing} />

      {infinite && !isEmpty && (
        <div className={infiniteControl()} data-testid="list-infinite">
          {infiniteLoadingMore && (
            <div className={loadingMore()} data-testid="list-loading-more">
              <Loader size="sm" />
              {loadingMoreText}
            </div>
          )}

          {infinite.error && infinite.errorSection && (
            <div className={endReached()} data-testid="list-load-more-error">
              {infinite.errorSection}
            </div>
          )}

          {canLoadMore && !infinite.error && (
            <Button
              block
              onClick={handleLoadMore}
              rightSection={
                <ChevronDown className="list-load-more-icon size-4" />
              }
              type="button"
              variant="ghost"
            >
              {loadMoreText ?? labels.list.loadMore}
            </Button>
          )}

          {!hasMore && endReachedSection && (
            <div className={endReached()} data-testid="list-end-reached">
              {endReachedSection}
            </div>
          )}

          {hasMore && !infiniteError && (
            <div
              className={sentinel()}
              data-testid="list-sentinel"
              ref={setSentinelNode}
            />
          )}
        </div>
      )}
    </div>
  )
}

export { List }
