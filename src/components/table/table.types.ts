/**
 * Table
 *
 * Data table with column configuration, row selection,
 * sorting, pagination, and loading overlay.
 *
 * Behavior:
 * - Columns define key, label, selector (custom cell renderer), width, fixedWidth, alignment, sticky, sorter, hide
 * - Nothing wraps: a header label, and a cell whose value (read off the item or
 *   returned by the selector) is a string or a number, is cut to one line with
 *   an ellipsis and keeps the whole text in `title`. A node the selector draws
 *   is left as drawn and truncates itself, but every cell clips sideways at
 *   its padding box, so nothing it holds paints over the next column
 * - Row actions are not a table prop: an actions column is an ordinary column
 *   whose selector returns the controls (a DropdownMenu "…" trigger, inline
 *   buttons, a link), usually with `align: 'center'` (a lone "…" sits in the middle of its
 *   column), `width` + `fixedWidth`
 *   and `sticky: 'right'`
 * - `width` is in pixels of the design width (an unsized column counts as 100;
 *   the checkbox column is always exactly 40px). Without `layoutWidth` the widths are only
 *   compared with each other, so they split the row as a ratio. With
 *   `layoutWidth`, whatever the widths leave of it goes to a spacer before the
 *   last column — so ratio-sized widths (2, 3, 4) next to `layoutWidth={640}`
 *   leave the columns a sliver each. `fixedWidth` makes a width exact pixels,
 *   and the other columns share what is left
 * - `sticky: 'right'` pins the column to the right edge while the table scrolls
 *   horizontally (meant for the last column, e.g. actions); `sticky: 'left'`
 *   pins it to the left edge (meant for the first column, e.g. a name the
 *   other columns scroll under — a selection checkbox column before it is not
 *   pinned and scrolls away). Header, body and skeleton cells are pinned
 *   alike, with a hairline on the edge facing the scrolling columns, and the
 *   pinned cell keeps the row's hover, selected and active backgrounds
 * - Selection "multiple": renders header checkbox (select all) + row checkboxes.
 *   The header box is named by `table.selectAll` and turns indeterminate
 *   (aria-checked="mixed") while some but not all rows on the page are
 *   selected; pressing it then selects them all. Each row box is named by
 *   `table.selectRow` with the row's name — `rowName(row)`, or else the first
 *   visible column's own text (string or number value), or plain "Select row"
 * - Sort: clicking sortable column header toggles asc/desc (prefix "-" for desc)
 * - Pagination integrates Pagination component below the table
 * - Loading state renders LoadingOverlay over the table body
 * - Row click handler fires onRowClick with the row data. A click that lands
 *   on interactive content inside a cell — a button, a link with href, an
 *   input/select/textarea/label, anything with role button, link, checkbox,
 *   switch, menuitem(checkbox|radio), option, tab or combobox, or content
 *   portalled out of the row such as an open menu — does not fire it, so a
 *   cell's controls never need stopPropagation. `data-table-row-click-ignore`
 *   opts any other element out
 * - With onRowClick, rows are focusable (Tab) and Enter or Space on the focused
 *   row fires it; a key pressed on a control inside the row is left to that
 *   control
 * - density "compact" tightens row and header padding (dense, Stripe-like
 *   lists); "default" is the regular spacing
 * - activeKey marks the row currently open elsewhere (a side preview in a
 *   split view): highlighted and exposed as aria-current="true". It is not
 *   selection — the checkboxes stay independent
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
 * - <Table columns={[...cols, { key: "actions", align: "center", width: 56, fixedWidth: true,
 *     sticky: "right", selector: (row) => <DropdownMenu>...</DropdownMenu> }]}
 *     items={data} itemKey="id" onRowClick={open} activeKey={openId} density="compact" />
 * - <Table columns={[{ key: "feature", label: "Feature", sticky: "left" }, ...planCols]}
 *     items={features} itemKey="feature" layoutWidth={640} />
 * - <Table columns={cols} itemKey="id" outcome={outcome} />
 *
 * Dependencies: Checkbox component, Pagination component, LoadingOverlay component,
 * EmptyState component, Skeleton component, @turystack/react-hooks (DataOutcome)
 */

import type { DataOutcome } from '@turystack/react-hooks'

import type { PaginationProps } from '@/components/pagination/pagination.types'

export type TableSelection = 'none' | 'multiple'

export type TableColumnAlign = 'left' | 'center' | 'right'

export type TableColumnSticky = 'left' | 'right'

export type TableDensity = 'compact' | 'default'

export type TableColumns<T> = Array<{
  key: string // unique column identifier
  label?: string // column header text
  selector?: (row: T, index: number) => React.ReactNode // custom cell renderer
  align?: TableColumnAlign // cell text alignment
  width?: number // design width in px; splits the row as a ratio, and with layoutWidth the leftover goes to a spacer
  fixedWidth?: boolean // width is exact pixels instead of a share (e.g. an actions column)
  sticky?: TableColumnSticky // pins the column to the left or right edge while scrolling horizontally
  sorter?: boolean // enables sorting on this column
  hide?: boolean // hides the column
}>

export type TableItems<T> = Array<T>

export type TableBaseProps<T> = {
  columns: TableColumns<T> // column definitions (required)
  itemKey: keyof T // unique key field in data items (required)
  selection?: TableSelection // row selection mode
  rowName?: (row: T) => string // names the row's checkbox for assistive technology; defaults to the first column's text
  selectedKeys?: string[] // controlled: selected row keys
  defaultSelectedKeys?: string[] // uncontrolled: initially selected
  pagination?: PaginationProps // pagination config (renders pagination below table)
  sort?: string // current sort column key (prefix '-' for desc)
  layoutWidth?: number // opt-in minimum width in px; overflows horizontally when needed
  hidePagination?: boolean // hides pagination even if configured
  density?: TableDensity // row spacing; compact = dense rows
  activeKey?: string | number // key of the row open in a side preview; highlighted + aria-current
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
