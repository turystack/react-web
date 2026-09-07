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
 * - `outcome` is the alternative to `items` + `loading`: it carries the five
 *   states of a remote read, and the table paints all of them itself —
 *   skeleton rows while pending, an overlay while refreshing, the reason
 *   while denied, a retry while failed. Header, columns and pagination stay
 *   in place in every one of them, which is why a failed read belongs inside
 *   the table rather than in place of it
 * - `outcome` and `items`/`loading` are mutually exclusive: a table reads
 *   from a query or from a prop, never from both
 *
 * Implementation:
 * - Semantic <table> with <thead>/<tbody> structure
 * - Checkbox component for selection column
 * - Sort icons change direction based on current sort state
 * - Row hover: bg-muted transition
 * - <Table columns={cols} items={data} itemKey="id" selection="multiple"
 *     pagination={{ mode: "offset", page, rowsPerPage, total, onPageChange, onRowsPerPageChange }}
 *     sort={sortKey} onSortChange={setSortKey} onRowClick={handleClick} />
 * - <Table columns={cols} itemKey="id" outcome={outcome} />
 *
 * Dependencies: Checkbox component, Pagination component, LoadingOverlay component,
 * EmptyState component, Skeleton component, @turystack/react-hooks (DataOutcome)
 */

import type { DataOutcome } from '@turystack/react-hooks'

import type { PaginationProps } from '@/components/pagination/pagination.types'

export type TableSelection = 'none' | 'multiple'

export type TableColumnAlign = 'left' | 'center' | 'right'

export type TableColumns<T> = Array<{
  key: string // unique column identifier
  label?: string // column header text
  selector?: (row: T, index: number) => React.ReactNode // custom cell renderer
  align?: TableColumnAlign // cell text alignment
  width?: number // column width, applied as a share of every column width
  sorter?: boolean // enables sorting on this column
  hide?: boolean // hides the column
}>

export type TableItems<T> = Array<T>

export type TableBaseProps<T> = {
  columns: TableColumns<T> // column definitions (required)
  itemKey: keyof T // unique key field in data items (required)
  selection?: TableSelection // row selection mode
  selectedKeys?: string[] // controlled: selected row keys
  defaultSelectedKeys?: string[] // uncontrolled: initially selected
  pagination?: PaginationProps // pagination config (renders pagination below table)
  sort?: string // current sort column key (prefix '-' for desc)
  layoutWidth?: number // opt-in minimum width in px; overflows horizontally when needed
  hidePagination?: boolean // hides pagination even if configured
  loadingRows?: number // skeleton rows drawn while an outcome is pending
  deniedSection?: React.ReactNode // content shown when the outcome is denied
  emptySection?: React.ReactNode // content shown when items is empty
  errorSection?: React.ReactNode // content shown when the outcome failed
  onRowClick?: (row: T) => void // fires when a row is clicked
  onSelectionChange?: (value: string[]) => void // fires when selection changes
  onSortChange?: (sort?: string) => void // fires when sort changes
}

export type TableStaticProps<T> = {
  items?: TableItems<T> // data rows
  loading?: boolean // shows loading overlay
  outcome?: never
}

export type TableOutcomeProps<T> = {
  items?: never
  loading?: never
  outcome: DataOutcome<TableItems<T>> // the five states of a remote read
}

export type TableProps<T> = TableBaseProps<T> &
  (TableStaticProps<T> | TableOutcomeProps<T>)
