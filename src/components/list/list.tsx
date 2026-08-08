import { useEffect, useRef } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Loader } from '@/components/loader'
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
    endReached:
      'list-end-reached px-4 py-2 text-center text-muted-foreground text-sm',
    footer: 'min-w-0 list-footer',
    infiniteControl: 'flex min-w-0 list-infinite-control flex-col gap-2',
    item: 'list-item min-w-0',
    list: 'flex min-w-0 list-content flex-col',
    loadingMore:
      'flex min-w-0 list-loading-more items-center justify-center gap-2 py-3 text-muted-foreground text-sm',
    root: 'flex w-full min-w-0 list-root flex-col gap-4',
    sentinel: 'h-px w-full list-sentinel',
    state:
      'flex min-h-24 w-full min-w-0 list-state items-center justify-center p-4 text-center text-muted-foreground text-sm',
  },
  variants: {
    divided: {
      true: {
        item: 'border-border border-b last:border-b-0',
      },
    },
    gap: {
      lg: {
        list: 'gap-4',
      },
      md: {
        list: 'gap-3',
      },
      none: {
        list: 'gap-0',
      },
      sm: {
        list: 'gap-2',
      },
      xs: {
        list: 'gap-1',
      },
    },
    padded: {
      true: {
        list: 'p-4',
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
  const { list, item } = styles({
    gap: 'sm',
  })

  return (
    <div className={list()} data-testid="list-loading">
      {Array.from(
        {
          length: rows,
        },
        (_, index) => (
          <div className={item()} key={`list-loading-${index}`}>
            <Skeleton className="h-20 w-full" />
          </div>
        ),
      )}
    </div>
  )
}

function List<T>({
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
  padded,
  pagination,
  renderItem,
}: ListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const data = items ?? []
  const isEmpty = data.length === 0
  const hasMore = infinite?.hasMore
  const infiniteDisabled = infinite?.disabled
  const infiniteLoadingMore = infinite?.loadingMore
  const loadMoreText = infinite?.loadMoreText
  const loadingMoreText = infinite?.loadingMoreText
  const endReachedSection = infinite?.endReachedSection
  const onLoadMore = infinite?.onLoadMore
  const rootMargin = infinite?.rootMargin ?? DEFAULT_ROOT_MARGIN
  const canLoadMore = Boolean(
    hasMore && onLoadMore && !infiniteLoadingMore && !infiniteDisabled,
  )

  const {
    endReached,
    footer,
    infiniteControl,
    item,
    list,
    loadingMore,
    root,
    sentinel,
    state,
  } = styles({
    divided,
    gap,
    padded,
  })

  useEffect(() => {
    const node = sentinelRef.current

    if (!node || !canLoadMore) {
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

    observer.observe(node)

    return () => observer.disconnect()
  }, [canLoadMore, onLoadMore, rootMargin])

  const handleLoadMore = () => {
    if (canLoadMore) {
      onLoadMore?.()
    }
  }

  const renderState = () => {
    if (loading && isEmpty) {
      return loadingSection ?? <ListLoadingState rows={loadingRows} />
    }

    if (error && isEmpty) {
      return (
        <div className={state()} data-testid="list-error">
          {errorSection ?? 'Não foi possível carregar os dados'}
        </div>
      )
    }

    if (isEmpty) {
      return (
        <div className={state()} data-testid="list-empty">
          {emptySection ?? 'Nenhum dado encontrado'}
        </div>
      )
    }

    return null
  }

  const stateContent = renderState()

  return (
    <div className={root()} data-testid="list-root">
      {stateContent ?? (
        <ul className={list()} data-testid="list-content">
          {data.map((dataItem, index) => (
            <li
              className={item()}
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

      {infinite && !isEmpty && (
        <div className={infiniteControl()} data-testid="list-infinite">
          {infiniteLoadingMore && (
            <div className={loadingMore()} data-testid="list-loading-more">
              <Loader size="sm" />
              {loadingMoreText}
            </div>
          )}

          {canLoadMore && (
            <Button
              block
              onClick={handleLoadMore}
              rightSection={<ChevronDown className="size-4" />}
              type="button"
              variant="ghost"
            >
              {loadMoreText ?? 'Carregar mais'}
            </Button>
          )}

          {!hasMore && endReachedSection && (
            <div className={endReached()} data-testid="list-end-reached">
              {endReachedSection}
            </div>
          )}

          {hasMore && (
            <div
              className={sentinel()}
              data-testid="list-sentinel"
              ref={sentinelRef}
            />
          )}
        </div>
      )}
    </div>
  )
}

export { List }
