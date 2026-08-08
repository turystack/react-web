import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Select } from '@/components/select'
import { ChevronLeft, ChevronRight, MoreHorizontal } from '@/internal/icons'

import type { PaginationProps } from './pagination.types'

const ROWS_OPTIONS = [
  {
    label: '10',
    value: 10,
  },
  {
    label: '20',
    value: 20,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
]

const styles = tv({
  slots: {
    ellipsis:
      'pagination-ellipsis flex size-8 items-center justify-center text-muted-foreground',
    info: 'pagination-info whitespace-nowrap text-muted-foreground text-sm',
    pageBtn: [
      'pagination-page-btn inline-flex size-9 items-center justify-center rounded-lg border text-sm',
      'select-none outline-none transition-colors',
      'border-transparent hover:bg-muted hover:text-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    ],
    pageBtnActive: 'border-border bg-muted',
    root: 'pagination-root flex w-full items-center justify-between gap-4',
    rowsPerPage:
      'pagination-rows-per-page flex items-center gap-2 whitespace-nowrap text-muted-foreground text-sm',
  },
})

const { root, info, rowsPerPage, pageBtn, pageBtnActive, ellipsis } = styles()

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
  if (props.mode === 'offset') {
    const {
      page,
      rowsPerPage: rpp,
      total,
      onPageChange,
      onRowsPerPageChange,
    } = props
    const totalPages = Math.ceil(total / rpp)
    const from = (page - 1) * rpp + 1
    const to = Math.min(page * rpp, total)
    const isFirst = page <= 1
    const isLast = page >= totalPages

    return (
      <nav
        aria-label="pagination"
        className={root()}
        data-testid="pagination-root"
      >
        <div className={rowsPerPage()}>
          <span>Linhas por página</span>
          <Select
            clearable={false}
            mode="single"
            onChange={(v) => onRowsPerPageChange(v as number)}
            optionLabel="label"
            options={ROWS_OPTIONS}
            optionValue="value"
            size="sm"
            value={rpp}
          />
        </div>
        <div className="flex items-center gap-1">
          <span
            className={info({
              className: 'mr-2',
            })}
          >
            {from}-{to} de {total}
          </span>
          <Button
            data-testid="pagination-prev"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {getVisiblePages(page, totalPages).map((p, i) =>
            p === '...' ? (
              <span className={ellipsis()} key={`ellipsis-${i}`}>
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <button
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
          <Button
            data-testid="pagination-next"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </nav>
    )
  }

  const {
    rowsPerPage: rpp,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    onRowsPerPageChange,
  } = props

  return (
    <nav
      aria-label="pagination"
      className={root()}
      data-testid="pagination-root"
    >
      {onRowsPerPageChange ? (
        <div className={rowsPerPage()}>
          <span>Rows per page</span>
          <Select
            clearable={false}
            mode="single"
            onChange={(v) => onRowsPerPageChange(v as number)}
            optionLabel="label"
            options={ROWS_OPTIONS}
            optionValue="value"
            size="sm"
            value={rpp}
          />
        </div>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        <Button
          data-testid="pagination-prev"
          disabled={!hasPreviousPage}
          onClick={() => onPreviousPage?.()}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          data-testid="pagination-next"
          disabled={!hasNextPage}
          onClick={() => onNextPage?.()}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

export { Pagination }
