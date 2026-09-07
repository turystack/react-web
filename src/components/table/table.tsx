import { type CSSProperties, Fragment, type MouseEvent, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { EmptyState } from '@/components/empty-state'
import { useLabels } from '@/components/labels-provider'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Pagination } from '@/components/pagination'
import { Skeleton } from '@/components/skeleton'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@/internal/icons'

import type { TableProps } from './table.types'
import { getTableBody, getTableLayout } from './table.utils'

const DEFAULT_LOADING_ROWS = 3

const styles = tv({
  slots: {
    body: 'table-body [&_tr:last-child]:border-0',
    cell: 'table-cell whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0',
    cellContent: 'table-cell-content min-w-0 max-w-full [&>*]:min-w-0',
    container:
      'table-container relative w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-md border',
    emptyCell: 'table-empty-cell p-8 text-center text-muted-foreground',
    head: 'table-head h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0',
    header: 'table-header bg-muted/40 [&_tr]:border-b',
    root: 'table-root flex w-full min-w-0 flex-col gap-4',
    row: 'table-row border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
    sortButton:
      'table-sort-button inline-flex cursor-pointer select-none items-center gap-1',
    table: 'table-table w-full table-fixed caption-bottom text-sm',
  },
})

const {
  body,
  cell,
  cellContent,
  container,
  emptyCell,
  head,
  header,
  root,
  row,
  sortButton,
  table,
} = styles()

const interactiveSelector = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[data-table-row-click-ignore]',
].join(',')

function Table<T>({
  columns,
  defaultSelectedKeys = [],
  deniedSection,
  emptySection,
  errorSection,
  hidePagination,
  itemKey,
  items,
  layoutWidth,
  loading,
  loadingRows = DEFAULT_LOADING_ROWS,
  onRowClick,
  outcome,
  onSelectionChange,
  onSortChange,
  pagination,
  selectedKeys: controlledSelectedKeys,
  selection = 'none',
  sort,
}: TableProps<T>) {
  const labels = useLabels()
  const [internalSelectedKeys, setInternalSelectedKeys] =
    useState<string[]>(defaultSelectedKeys)

  const isControlled = controlledSelectedKeys !== undefined
  const selectedKeys = isControlled
    ? controlledSelectedKeys
    : internalSelectedKeys

  const visibleColumns = columns.filter((col) => !col.hide)
  const hasSelection = selection === 'multiple'
  const layout = getTableLayout(visibleColumns, hasSelection, layoutWidth)
  const { hasSpacer, spacerIndex, totalColumns, totalWidth } = layout

  const tableBody = getTableBody(outcome, items, loading)
  const rows = tableBody.items
  const isBusy = tableBody.loading

  const handleSelectionChange = (next: string[]) => {
    if (!isControlled) {
      setInternalSelectedKeys(next)
    }
    onSelectionChange?.(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      handleSelectionChange(rows.map((item) => String(item[itemKey])))
    } else {
      handleSelectionChange([])
    }
  }

  const handleSelectRow = (key: string, checked: boolean) => {
    const next = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => k !== key)
    handleSelectionChange(next)
  }

  const handleSort = (columnKey: string) => {
    if (!onSortChange) {
      return
    }

    if (sort === columnKey) {
      onSortChange(`-${columnKey}`)
    } else if (sort === `-${columnKey}`) {
      onSortChange(undefined)
    } else {
      onSortChange(columnKey)
    }
  }

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, item: T) => {
    if (!onRowClick) {
      return
    }

    const target = event.target

    if (target instanceof Element && target.closest(interactiveSelector)) {
      return
    }

    onRowClick(item)
  }

  const getSortIcon = (columnKey: string) => {
    if (sort === columnKey) {
      return <ArrowUp className="table-sort-icon size-3.5" />
    }
    if (sort === `-${columnKey}`) {
      return <ArrowDown className="table-sort-icon size-3.5" />
    }
    return <ArrowUpDown className="table-sort-icon size-3.5" />
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') {
      return 'text-center'
    }
    if (align === 'right') {
      return 'text-right'
    }
    return 'text-left'
  }

  const getContentAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') {
      return 'mx-auto'
    }
    if (align === 'right') {
      return 'ml-auto'
    }
    return undefined
  }

  const getColumnStyle = (percentage: number): CSSProperties => ({
    width: `${percentage}%`,
  })

  const getColumnContentStyle = (width?: number): CSSProperties | undefined =>
    width
      ? {
          maxWidth: `min(100%, ${width}px)`,
          width: '100%',
        }
      : undefined

  const allSelected = Boolean(
    rows.length > 0 && selectedKeys.length === rows.length,
  )

  const renderStateRow = (content: React.ReactNode, testId: string) => (
    <tr>
      <td className={emptyCell()} colSpan={totalColumns} data-testid={testId}>
        {content}
      </td>
    </tr>
  )

  const renderLoadingRows = () =>
    Array.from(
      {
        length: loadingRows,
      },
      (_, index) => (
        <tr className={row()} key={`table-loading-${index}`}>
          {hasSelection && (
            <td
              className={cell({
                className: 'w-10',
              })}
            >
              <Skeleton />
            </td>
          )}
          {visibleColumns.map((col, columnIndex) => (
            <Fragment key={col.key}>
              {hasSpacer && columnIndex === spacerIndex && (
                <td aria-hidden className={cell()} />
              )}
              <td className={cell()}>
                <Skeleton />
              </td>
            </Fragment>
          ))}
        </tr>
      ),
    )

  const renderBody = () => {
    if (tableBody.kind === 'pending') {
      return renderLoadingRows()
    }

    if (tableBody.kind === 'denied') {
      return renderStateRow(
        deniedSection ?? (
          <EmptyState
            size="sm"
            title={tableBody.reason ?? labels.table.error}
          />
        ),
        'table-denied',
      )
    }

    if (tableBody.kind === 'error') {
      return renderStateRow(
        errorSection ?? (
          <EmptyState
            action={
              <Button onClick={tableBody.retry} type="button" variant="outline">
                {labels.common.retry}
              </Button>
            }
            size="sm"
            title={labels.table.error}
          />
        ),
        'table-error',
      )
    }

    if (tableBody.kind === 'empty') {
      return renderStateRow(emptySection ?? labels.table.empty, 'table-empty')
    }

    return rows.map((item, index) => {
      const key = String(item[itemKey])
      const isSelected = selectedKeys.includes(key)

      return (
        <tr
          className={row({
            className: onRowClick ? 'cursor-pointer' : undefined,
          })}
          data-state={isSelected ? 'selected' : undefined}
          key={key}
          onClick={(event) => handleRowClick(event, item)}
        >
          {hasSelection && (
            <td
              className={cell({
                className: 'w-10',
              })}
            >
              <Checkbox
                checked={isSelected}
                onChange={(checked) => handleSelectRow(key, checked)}
              />
            </td>
          )}
          {visibleColumns.map((col, columnIndex) => {
            const align = col.align

            return (
              <Fragment key={col.key}>
                {hasSpacer && columnIndex === spacerIndex && (
                  <td aria-hidden className={cell()} />
                )}
                <td
                  className={cell({
                    className: getAlignClass(align),
                  })}
                >
                  <div
                    className={cellContent({
                      className: getContentAlignClass(align),
                    })}
                    style={getColumnContentStyle(col.width)}
                  >
                    {col.selector
                      ? col.selector(item, index)
                      : (item[col.key as keyof T] as React.ReactNode)}
                  </div>
                </td>
              </Fragment>
            )
          })}
        </tr>
      )
    })
  }

  return (
    <div className={root()}>
      <div className={container()}>
        <table
          aria-busy={isBusy ? true : undefined}
          className={table()}
          style={
            layoutWidth
              ? {
                  minWidth: `${totalWidth}px`,
                }
              : undefined
          }
        >
          <colgroup>
            {hasSelection && (
              <col style={getColumnStyle(layout.selectionPercentage)} />
            )}
            {visibleColumns.map((col, index) => (
              <Fragment key={col.key}>
                {hasSpacer && index === spacerIndex && (
                  <col style={getColumnStyle(layout.spacerPercentage)} />
                )}
                <col style={getColumnStyle(layout.columns[index].percentage)} />
              </Fragment>
            ))}
          </colgroup>
          <thead className={header()}>
            <tr className={row()}>
              {hasSelection && (
                <th
                  className={head({
                    className: 'w-10',
                  })}
                >
                  <Checkbox checked={allSelected} onChange={handleSelectAll} />
                </th>
              )}
              {visibleColumns.map((col, index) => {
                const align = col.align

                return (
                  <Fragment key={col.key}>
                    {hasSpacer && index === spacerIndex && (
                      <th aria-hidden className={head()} />
                    )}
                    <th
                      className={head({
                        className: getAlignClass(align),
                      })}
                    >
                      {col.sorter ? (
                        <button
                          className={sortButton({
                            className: getContentAlignClass(align),
                          })}
                          onClick={() => handleSort(col.key)}
                          style={getColumnContentStyle(col.width)}
                          type="button"
                        >
                          {col.label}
                          {getSortIcon(col.key)}
                        </button>
                      ) : (
                        <div
                          className={cellContent({
                            className: getContentAlignClass(align),
                          })}
                          style={getColumnContentStyle(col.width)}
                        >
                          {col.label}
                        </div>
                      )}
                    </th>
                  </Fragment>
                )
              })}
            </tr>
          </thead>
          <tbody className={body()}>{renderBody()}</tbody>
        </table>
        <LoadingOverlay visible={isBusy} />
      </div>
      {pagination && !hidePagination && <Pagination {...pagination} />}
    </div>
  )
}

export { Table }
