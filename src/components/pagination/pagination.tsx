import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Select } from '@/components/select'
import { ChevronLeft, ChevronRight, MoreHorizontal } from '@/internal/icons'

import type { PaginationProps } from './pagination.types'

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100]

function toRowsOptions(values: number[]) {
  return values.map((value) => ({
    label: String(value),
    value,
  }))
}

const styles = tv({
  slots: {
    ellipsis:
      'pagination-ellipsis flex size-8 items-center justify-center text-muted-foreground',
    info: 'pagination-info mr-2 whitespace-nowrap text-muted-foreground text-sm',
    pageBtn: [
      'pagination-page-btn inline-flex size-9 items-center justify-center rounded-lg border text-sm',
      'select-none outline-none transition-colors',
      'border-transparent hover:bg-muted hover:text-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    ],
    pageBtnActive: 'pagination-page-btn-active border-border bg-muted',
    // The page-number list needs ~19rem on its own; below 28rem of pagination
    // it is hidden and prev/next (with the range text) carry the navigation.
    pages: 'pagination-pages hidden items-center gap-1 @md/pagination:flex',
    // Narrow (a phone column, a side panel): the rows-per-page picker keeps the
    // first line and the controls wrap under it, pushed to the right edge; the
    // controls wrap once more (range text above the buttons) when even they do
    // not fit. Nothing overflows.
    root: 'pagination-root @container/pagination flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2',
    controls:
      'pagination-controls ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1',
    rowsPerPage:
      'pagination-rows-per-page flex items-center gap-2 whitespace-nowrap text-muted-foreground text-sm',
  },
})

const {
  controls,
  root,
  info,
  pages,
  rowsPerPage,
  pageBtn,
  pageBtnActive,
  ellipsis,
} = styles()

function getVisiblePages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, i) => i + 1,
    )
  }

  const pages: (number | '...')[] = [1]

  if (page > 3) {
    pages.push('...')
  }

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (page < totalPages - 2) {
    pages.push('...')
  }

  pages.push(totalPages)

  return pages
}

function Pagination(props: PaginationProps) {
  const labels = useLabels()

  if (props.mode === 'offset') {
    const {
      page,
      rowsPerPage: rpp,
      rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
      total,
      onPageChange,
      onRowsPerPageChange,
    } = props
    const totalPages = Math.max(1, Math.ceil(total / rpp))
    const from = total === 0 ? 0 : (page - 1) * rpp + 1
    const to = Math.min(page * rpp, total)
    const isFirst = page <= 1
    const isLast = page >= totalPages

    return (
      <nav
        aria-label={labels.pagination.label}
        className={root()}
        data-testid="pagination-root"
      >
        <div className={rowsPerPage()}>
          <span>{labels.pagination.rowsPerPage}</span>
          <Select
            ariaLabel={labels.pagination.rowsPerPage}
            clearable={false}
            mode="single"
            onChange={(v) => {
              onRowsPerPageChange(v as number)
              onPageChange(1)
            }}
            optionLabel="label"
            options={toRowsOptions(rowsPerPageOptions)}
            optionValue="value"
            size="sm"
            value={rpp}
          />
        </div>
        <div className={controls()} data-testid="pagination-controls">
          <span className={info()} data-testid="pagination-info">
            {labels.pagination.range(from, to, total)}
          </span>
          <Button
            ariaLabel={labels.pagination.previous}
            data-testid="pagination-prev"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeft className="pagination-prev-icon size-4" />
          </Button>
          <span className={pages()} data-testid="pagination-pages">
            {getVisiblePages(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span className={ellipsis()} key={`ellipsis-${i}`}>
                  <MoreHorizontal className="pagination-ellipsis-icon size-4" />
                </span>
              ) : (
                <button
                  aria-current={p === page ? 'page' : undefined}
                  className={pageBtn({
                    className: p === page ? pageBtnActive() : undefined,
                  })}
                  data-testid="pagination-page"
                  key={p}
                  onClick={() => onPageChange(p)}
                  type="button"
                >
                  {p}
                </button>
              ),
            )}
          </span>
          <Button
            ariaLabel={labels.pagination.next}
            data-testid="pagination-next"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRight className="pagination-next-icon size-4" />
          </Button>
        </div>
      </nav>
    )
  }

  const {
    rowsPerPage: rpp,
    rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    onRowsPerPageChange,
  } = props

  return (
    <nav
      aria-label={labels.pagination.label}
      className={root()}
      data-testid="pagination-root"
    >
      {onRowsPerPageChange ? (
        <div className={rowsPerPage()}>
          <span>{labels.pagination.rowsPerPage}</span>
          <Select
            ariaLabel={labels.pagination.rowsPerPage}
            clearable={false}
            mode="single"
            onChange={(v) => onRowsPerPageChange(v as number)}
            optionLabel="label"
            options={toRowsOptions(rowsPerPageOptions)}
            optionValue="value"
            size="sm"
            value={rpp}
          />
        </div>
      ) : (
        <div />
      )}
      <div
        className={controls({
          className: 'gap-2',
        })}
        data-testid="pagination-controls"
      >
        <Button
          ariaLabel={labels.pagination.previous}
          data-testid="pagination-prev"
          disabled={!hasPreviousPage}
          onClick={() => onPreviousPage?.()}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeft className="pagination-prev-icon size-4" />
        </Button>
        <Button
          ariaLabel={labels.pagination.next}
          data-testid="pagination-next"
          disabled={!hasNextPage}
          onClick={() => onNextPage?.()}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRight className="pagination-next-icon size-4" />
        </Button>
      </div>
    </nav>
  )
}

export { Pagination }
