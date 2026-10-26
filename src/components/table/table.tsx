import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { EmptyState } from '@/components/empty-state'
import { useLabels } from '@/components/labels-provider'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Pagination } from '@/components/pagination'
import { Skeleton } from '@/components/skeleton'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Inbox,
  Lock,
} from '@/internal/icons'
import { isRowActivation } from '@/internal/row-activation'
import { axes } from '@/support/utils'

import type { TableProps } from './table.types'
import {
  getColumnContentStyle,
  getTableBody,
  getTableLayout,
} from './table.utils'

const DEFAULT_LOADING_ROWS = 3

/**
 * A pinned cell is painted on top of the cells scrolling under it, so it needs
 * an opaque background — and then the row's translucent hover, selected and
 * active tints no longer show through. The tint is repainted on `::after`,
 * which sits in the cell's own stacking context above that background and
 * below its content; `::before` is the hairline separating it from the
 * scrolling columns, on the edge that faces them.
 */
const PINNED =
  'sticky z-10 bg-background before:pointer-events-none before:absolute before:inset-y-0 before:w-px before:bg-border after:pointer-events-none after:absolute after:inset-0 after:-z-10'

const PINNED_CELL_TINTS =
  'group-hover/row:after:bg-muted/50 group-focus-visible/row:after:bg-muted/50 group-aria-[current=true]/row:after:bg-accent group-data-[state=selected]/row:after:bg-muted'

const PINNED_HEAD_TINT = 'after:bg-muted/40'

const styles = tv({
  defaultVariants: {
    align: 'left',
    clickable: false,
    density: 'default',
  },
  slots: {
    body: 'table-body [&_tr:last-child]:border-0',
    /**
     * `overflow-x: clip` on every cell, body and header: nothing a cell holds
     * — a badge, an avatar, a long word — paints over the next column. It
     * clips at the padding box, so a focus ring inside the padding still
     * shows, and only sideways, so a ring above or below is never cut.
     */
    cell: 'table-cell overflow-x-clip whitespace-nowrap align-middle [&:has([role=checkbox])]:pr-0',
    cellContent: 'table-cell-content min-w-0 max-w-full [&>*]:min-w-0',
    /**
     * A cell whose value is plain text or a number, cut the way the header's
     * label is: a cell does not wrap, so a long value painted over the next
     * column. What a selector draws itself — a badge, a menu, lines of
     * reasons — is left as it is drawn.
     */
    cellText: 'table-cell-text block min-w-0 truncate',
    container:
      'table-container relative w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-md border',
    emptyCell: 'table-empty-cell p-8 text-center text-muted-foreground',
    head: 'table-head overflow-x-clip whitespace-nowrap px-2 align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0',
    /**
     * The header's text, cut with an ellipsis rather than painted over the
     * next column: a fixed-layout cell keeps its width whatever it holds, so
     * a label wider than its column used to run into the neighbour's ("Row"
     * and "Id" read as "RowId"). The whole label stays in `title`, the way
     * a truncated value does in a cell.
     */
    headLabel: 'table-head-label block min-w-0 truncate',
    header: 'table-header bg-muted/40 [&_tr]:border-b',
    headerRow: 'table-header-row',
    root: 'table-root flex w-full min-w-0 flex-col gap-4',
    row: 'table-row group/row border-b transition-colors hover:bg-muted/50 aria-[current=true]:bg-accent data-[state=selected]:bg-muted',
    sortButton:
      'table-sort-button inline-flex min-w-0 max-w-full cursor-pointer select-none items-center gap-1',
    table: 'table-table w-full table-fixed caption-bottom text-sm',
  },
  variants: {
    align: {
      // text-align moves text and inline content only; preflight makes svg
      // and img blocks, so an icon alone in a cell needs its own margins.
      center: {
        cell: 'text-center',
        cellContent: 'mx-auto [&>img]:mx-auto [&>svg]:mx-auto',
        head: 'text-center',
        sortButton: 'mx-auto',
      },
      left: {
        cell: 'text-left',
        head: 'text-left',
      },
      right: {
        cell: 'text-right',
        cellContent: 'ml-auto [&>img]:ml-auto [&>svg]:ml-auto',
        head: 'text-right',
        sortButton: 'ml-auto',
      },
    },
    clickable: {
      false: {},
      true: {
        row: 'cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
      },
    },
    density: {
      compact: {
        cell: 'px-2 py-1',
        head: 'h-8',
      },
      default: {
        cell: 'p-2',
        head: 'h-10',
      },
    },
    sticky: {
      left: {
        cell: `${PINNED} left-0 before:right-0 ${PINNED_CELL_TINTS}`,
        head: `${PINNED} left-0 before:right-0 ${PINNED_HEAD_TINT}`,
      },
      right: {
        cell: `${PINNED} right-0 before:left-0 ${PINNED_CELL_TINTS}`,
        head: `${PINNED} right-0 before:left-0 ${PINNED_HEAD_TINT}`,
      },
    },
  },
})

function Table<T>({
  activeKey,
  columns,
  defaultSelectedKeys = [],
  density = 'default',
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
  rowName,
  selectedKeys: controlledSelectedKeys,
  selection = 'none',
  sort,
}: TableProps<T>) {
  const labels = useLabels()
  const {
    body,
    cell,
    cellContent,
    cellText,
    container,
    emptyCell,
    head,
    headLabel,
    header,
    headerRow,
    root,
    row,
    sortButton,
    table,
  } = styles({
    density,
  })
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
    if (onRowClick && isRowActivation(event.currentTarget, event.target)) {
      onRowClick(item)
    }
  }

  // Only a key pressed on the row itself: Enter on a focused menu trigger or
  // Space on a checkbox inside a cell belongs to that control.
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    item: T,
  ) => {
    if (!onRowClick || event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(item)
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sort === columnKey) {
      return <ArrowUp className="table-sort-icon size-3.5 shrink-0" />
    }
    if (sort === `-${columnKey}`) {
      return <ArrowDown className="table-sort-icon size-3.5 shrink-0" />
    }
    return <ArrowUpDown className="table-sort-icon size-3.5 shrink-0" />
  }

  const getColumnStyle = (
    percentage: number,
    pixels?: number,
  ): CSSProperties => ({
    width: pixels === undefined ? `${percentage}%` : `${pixels}px`,
  })

  // Counted on the rows on screen: a key selected on another page neither
  // fills nor half-fills this page's select-all box.
  const selectedOnPage = rows.filter((item) =>
    selectedKeys.includes(String(item[itemKey])),
  ).length
  const allSelected = rows.length > 0 && selectedOnPage === rows.length
  const someSelected = selectedOnPage > 0 && !allSelected

  /**
   * What a row's checkbox is called after: the name the consumer gave it, or
   * else the first visible column's own text — the raw value, not what its
   * selector draws, which may be anything. A row with neither is "Select row".
   */
  const getRowName = (item: T) => {
    if (rowName) {
      return rowName(item) || undefined
    }
    const first = visibleColumns[0]
    const raw = first ? item[first.key as keyof T] : undefined
    if (typeof raw === 'string' && raw.trim() !== '') {
      return raw
    }
    if (typeof raw === 'number') {
      return String(raw)
    }
    return undefined
  }

  // Only text is cut here: a node the selector built decides its own layout.
  const renderCellValue = (value: React.ReactNode) =>
    typeof value === 'string' || typeof value === 'number' ? (
      <span className={cellText()} title={String(value) || undefined}>
        {value}
      </span>
    ) : (
      value
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
              <td
                className={cell({
                  sticky: col.sticky,
                })}
              >
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
            icon={<Lock />}
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
            description={labels.table.errorDescription}
            icon={<AlertCircle />}
            size="sm"
            title={labels.table.error}
          />
        ),
        'table-error',
      )
    }

    if (tableBody.kind === 'empty') {
      // The same card as the other states, not a bare sentence: an icon, what
      // is missing and what would fill it — so an empty table reads as a
      // finished answer rather than as something still on its way.
      return renderStateRow(
        emptySection ?? (
          <EmptyState
            description={labels.table.emptyDescription}
            icon={<Inbox />}
            size="sm"
            title={labels.table.empty}
          />
        ),
        'table-empty',
      )
    }

    return rows.map((item, index) => {
      const key = String(item[itemKey])
      const isSelected = selectedKeys.includes(key)
      const isActive = activeKey !== undefined && String(activeKey) === key

      return (
        <tr
          aria-current={isActive ? 'true' : undefined}
          className={row({
            clickable: Boolean(onRowClick),
          })}
          data-state={isSelected ? 'selected' : undefined}
          key={key}
          onClick={(event) => handleRowClick(event, item)}
          onKeyDown={(event) => handleRowKeyDown(event, item)}
          tabIndex={onRowClick ? 0 : undefined}
        >
          {hasSelection && (
            <td
              className={cell({
                className: 'w-10',
              })}
            >
              <Checkbox
                ariaLabel={labels.table.selectRow(getRowName(item))}
                checked={isSelected}
                onChange={(checked) => handleSelectRow(key, checked)}
              />
            </td>
          )}
          {visibleColumns.map((col, columnIndex) => (
            <Fragment key={col.key}>
              {hasSpacer && columnIndex === spacerIndex && (
                <td aria-hidden className={cell()} />
              )}
              <td
                className={cell({
                  align: col.align,
                  sticky: col.sticky,
                })}
              >
                <div
                  className={cellContent({
                    align: col.align,
                  })}
                  style={getColumnContentStyle(col)}
                >
                  {renderCellValue(
                    col.selector
                      ? col.selector(item, index)
                      : (item[col.key as keyof T] as React.ReactNode),
                  )}
                </div>
              </td>
            </Fragment>
          ))}
        </tr>
      )
    })
  }

  return (
    <div
      className={root()}
      {...axes(styles, {
        density,
      })}
    >
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
              <col style={getColumnStyle(0, layout.selectionPixels)} />
            )}
            {visibleColumns.map((col, index) => (
              <Fragment key={col.key}>
                {hasSpacer && index === spacerIndex && (
                  <col style={getColumnStyle(layout.spacerPercentage)} />
                )}
                <col
                  style={getColumnStyle(
                    layout.columns[index].percentage,
                    layout.columns[index].pixels,
                  )}
                />
              </Fragment>
            ))}
          </colgroup>
          <thead className={header()}>
            <tr className={headerRow()}>
              {hasSelection && (
                <th
                  className={head({
                    className: 'w-10',
                  })}
                >
                  <Checkbox
                    ariaLabel={labels.table.selectAll}
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
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
                        align,
                        sticky: col.sticky,
                      })}
                    >
                      {col.sorter ? (
                        <button
                          className={sortButton({
                            align,
                          })}
                          onClick={() => handleSort(col.key)}
                          style={getColumnContentStyle(col)}
                          type="button"
                        >
                          <span className={headLabel()} title={col.label}>
                            {col.label}
                          </span>
                          {getSortIcon(col.key)}
                        </button>
                      ) : (
                        <div
                          className={cellContent({
                            align,
                          })}
                          style={getColumnContentStyle(col)}
                        >
                          <span className={headLabel()} title={col.label}>
                            {col.label}
                          </span>
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
