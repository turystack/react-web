import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { useLabels } from '@/components/labels-provider'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Skeleton } from '@/components/skeleton'

import type { LoadedProps } from './loaded.types'

const DEFAULT_LOADING_ROWS = 3

export const styles = tv({
  slots: {
    loading: 'flex w-full min-w-0 loaded-loading flex-col gap-2',
    loadingRow: 'loaded-loading-row',
    root: 'relative w-full min-w-0 loaded',
    state: 'w-full min-w-0 loaded-state',
  },
})

export function Loaded<T>({
  children,
  deniedSection,
  emptySection,
  errorSection,
  loadingRows = DEFAULT_LOADING_ROWS,
  loadingSection,
  outcome,
  size = 'md',
}: LoadedProps<T>) {
  const labels = useLabels()
  const { loading, loadingRow, root, state } = styles()

  if (outcome.status === 'pending') {
    return (
      <div className={root()} data-testid="loaded-pending">
        {loadingSection ?? (
          <div className={loading()}>
            {Array.from(
              {
                length: loadingRows,
              },
              (_, index) => (
                <div className={loadingRow()} key={`loaded-loading-${index}`}>
                  <Skeleton height="xl" />
                </div>
              ),
            )}
          </div>
        )}
      </div>
    )
  }

  if (outcome.status === 'denied') {
    return (
      <div className={state()} data-testid="loaded-denied">
        {deniedSection ?? <EmptyState size={size} title={outcome.reason} />}
      </div>
    )
  }

  if (outcome.status === 'error') {
    return (
      <div className={state()} data-testid="loaded-error">
        {errorSection ?? (
          <EmptyState
            action={
              <Button onClick={outcome.retry} type="button" variant="outline">
                {labels.common.retry}
              </Button>
            }
            size={size}
            title={labels.list.error}
          />
        )}
      </div>
    )
  }

  if (outcome.status === 'empty') {
    return (
      <div className={state()} data-testid="loaded-empty">
        {emptySection ?? <EmptyState size={size} title={labels.list.empty} />}
      </div>
    )
  }

  return (
    <div
      aria-busy={outcome.refreshing ? true : undefined}
      className={root()}
      data-testid="loaded-content"
    >
      {children(outcome.data)}
      <LoadingOverlay visible={outcome.refreshing} />
    </div>
  )
}
