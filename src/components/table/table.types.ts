/**
 * Table
 *
 * Data table with column configuration, row selection,
 * sorting, pagination, and loading overlay.
 *
 * Behavior:
 * - Columns define key, label, selector (custom cell renderer), width, alignment, sorter, hide
 * - Selection "multiple": renders header checkbox (select all) + row checkboxes
 * - Sort: clicking sortable column header toggles asc/desc (prefix "-" for desc)
 * - Pagination integrates Pagination component below the table
 * - Loading state renders LoadingOverlay over the table body
 * - Row click handler fires onRowClick with the row data
 * - Empty state renders emptySection when items array is empty
 *
 * Implementation:
 * - Semantic <table> with <thead>/<tbody> structure
 * - Checkbox component for selection column
 * - Sort icons change direction based on current sort state
 * - Row hover: bg-muted transition
 * - <Table columns={cols} items={data} itemKey="id" selection="multiple"
 *     pagination={{ mode: "offset", page, rowsPerPage, total, onPageChange, onRowsPerPageChange }}
 *     sort={sortKey} onSortChange={setSortKey} onRowClick={handleClick} />
 *
 * Dependencies: Checkbox component, Pagination component, LoadingOverlay component
 */

import type { PaginationProps } from '@/components/pagination/pagination.types'

export type TableSelection = 'none' | 'multiple'

export type TableColumnAlign = 'left' | 'center' | 'right'

export type TableColumns<T> = Array<{
  key: string // unique column identifier
  label?: string // column header text
  selector?: (row: T, index: number) => React.ReactNode // custom cell renderer
  align?: TableColumnAlign // cell text alignment
  width?: number // fixed column width in px
  sorter?: boolean // enables sorting on this column
  hide?: boolean // hides the column
}>

export type TableItems<T> = Array<T>

export type TableProps<T> = {
  columns: TableColumns<T> // column definitions (required)
  items?: TableItems<T> // data rows
  itemKey: keyof T // unique key field in data items (required)
  selection?: TableSelection // row selection mode
  selectedKeys?: string[] // controlled: selected row keys
  defaultSelectedKeys?: string[] // uncontrolled: initially selected
  pagination?: PaginationProps // pagination config (renders pagination below table)
  sort?: string // current sort column key (prefix '-' for desc)
  layoutWidth?: number // opt-in minimum width in px; overflows horizontally when needed
  hidePagination?: boolean // hides pagination even if configured
  loading?: boolean // shows loading overlay
  emptySection?: React.ReactNode // content shown when items is empty
  onRowClick?: (row: T) => void // fires when a row is clicked
  onSelectionChange?: (value: string[]) => void // fires when selection changes
  onSortChange?: (sort?: string) => void // fires when sort changes
}
