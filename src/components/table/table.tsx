import { type CSSProperties, Fragment, type MouseEvent, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Checkbox } from '@/components/checkbox'
import { LoadingOverlay } from '@/components/loading-overlay'
import { Pagination } from '@/components/pagination'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@/internal/icons'

import type { TableProps } from './table.types'

const styles = tv({
  slots: {
    body: '[&_tr:last-child]:border-0',
    cell: 'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0',
    cellContent: 'min-w-0 max-w-full [&>*]:min-w-0',
    container:
      'relative w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-md border',
    emptyCell: 'p-8 text-center text-muted-foreground',
    head: 'h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0',
    header: 'bg-muted/40 [&_tr]:border-b',
    root: 'table-root flex w-full min-w-0 flex-col gap-4',
    row: 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
    sortButton: 'inline-flex cursor-pointer select-none items-center gap-1',
    table: 'w-full table-fixed caption-bottom text-sm',
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
  emptySection,
  hidePagination,
  itemKey,
  items,
  layoutWidth,
  loading,
  onRowClick,
  onSelectionChange,
  onSortChange,
  pagination,
  selectedKeys: controlledSelectedKeys,
  selection = 'none',
  sort,
}: TableProps<T>) {
  const [internalSelectedKeys, setInternalSelectedKeys] =
    useState<string[]>(defaultSelectedKeys)

  const isControlled = controlledSelectedKeys !== undefined
  const selectedKeys = isControlled
    ? controlledSelectedKeys
    : internalSelectedKeys

  const visibleColumns = columns.filter((col) => !col.hide)
  const selectionColumnWidth = selection === 'multiple' ? 40 : 0
  const columnWidth = visibleColumns.reduce(
    (acc, col) => acc + (col.width ?? 1),
    selectionColumnWidth,
  )
  const totalWidth = Math.max(columnWidth, layoutWidth ?? columnWidth)
  const spacerWidth = totalWidth - columnWidth
  const spacerIndex =
    visibleColumns.length > 1 ? visibleColumns.length - 1 : undefined
  const hasSpacer = spacerWidth > 0 && spacerIndex !== undefined
  const totalColumns =
    visibleColumns.length +
    (selection === 'multiple' ? 1 : 0) +
    (hasSpacer ? 1 : 0)

  const isEmpty = !items || items.length === 0

  const handleSelectionChange = (next: string[]) => {
    if (!isControlled) {
      setInternalSelectedKeys(next)
    }
    onSelectionChange?.(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && items) {
      const allKeys = items.map((item) => String(item[itemKey]))
      handleSelectionChange(allKeys)
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
      return <ArrowUp className="size-3.5" />
    }
    if (sort === `-${columnKey}`) {
      return <ArrowDown className="size-3.5" />
    }
    return <ArrowUpDown className="size-3.5" />
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

  const getColumnStyle = (width?: number): CSSProperties | undefined =>
    width
      ? {
          width: `${(width / totalWidth) * 100}%`,
        }
      : undefined

  const getSpacerStyle = (): CSSProperties | undefined =>
    hasSpacer
      ? {
          width: `${(spacerWidth / totalWidth) * 100}%`,
        }
      : undefined

  const getColumnContentStyle = (width?: number): CSSProperties | undefined =>
    width
      ? {
          maxWidth: `min(100%, ${width}px)`,
          width: '100%',
        }
      : undefined

  const allSelected = Boolean(
    items && items.length > 0 && selectedKeys.length === items.length,
  )

  return (
    <div className={root()}>
      <div className={container()}>
        <table
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
            {selection === 'multiple' && (
              <col
                style={{
                  width: `${(selectionColumnWidth / totalWidth) * 100}%`,
                }}
              />
            )}
            {visibleColumns.map((col, index) => (
              <Fragment key={col.key}>
                {hasSpacer && index === spacerIndex && (
                  <col style={getSpacerStyle()} />
                )}
                <col style={getColumnStyle(col.width)} />
              </Fragment>
            ))}
          </colgroup>
          <thead className={header()}>
            <tr className={row()}>
              {selection === 'multiple' && (
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
          <tbody className={body()}>
            {isEmpty ? (
              <tr>
                <td className={emptyCell()} colSpan={totalColumns}>
                  {emptySection ?? 'Nenhum registro encontrado'}
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
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
                    {selection === 'multiple' && (
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
            )}
          </tbody>
        </table>
        <LoadingOverlay visible={loading} />
      </div>
      {pagination && !hidePagination && <Pagination {...pagination} />}
    </div>
  )
}

export { Table }
