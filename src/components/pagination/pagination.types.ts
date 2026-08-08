/**
 * Pagination
 *
 * Page navigation control with rows-per-page selector.
 * Supports offset (page-based) and cursor (prev/next) modes.
 *
 * Behavior:
 * - Offset mode: shows "X-Y of Z" with page prev/next buttons
 * - Cursor mode: shows prev/next buttons based on hasPreviousPage/hasNextPage
 * - Rows-per-page: dropdown selector with options [10, 20, 50, 100]
 * - Buttons disabled when at first/last page
 *
 * Implementation:
 * - Offset: calculate displayed range, total pages from total/rowsPerPage
 * - Cursor: simple prev/next with boolean enablement
 * - <Pagination mode="offset" page={1} rowsPerPage={20} total={100}
 *     onPageChange={setPage} onRowsPerPageChange={setRpp} />
 * - <Pagination mode="cursor" rowsPerPage={20} hasNextPage onNextPage={loadMore} />
 *
 * Dependencies: @turystack/react-icons (ChevronLeft, ChevronRight)
 */

type OffsetPaginationProps = {
  mode: 'offset' // traditional page-based pagination
  page: number // current page number (required)
  rowsPerPage: number // items per page (required)
  total: number // total item count (required)
  onPageChange: (page: number) => void // fires on page navigation
  onRowsPerPageChange: (rowsPerPage: number) => void // fires on rows-per-page change
}

type CursorPaginationProps = {
  mode: 'cursor' // cursor-based pagination (for infinite/API-driven)
  rowsPerPage: number // items per page
  hasPreviousPage?: boolean // enables previous button
  hasNextPage?: boolean // enables next button
  onPreviousPage?: () => void // fires on previous navigation
  onNextPage?: () => void // fires on next navigation
  onRowsPerPageChange?: (rowsPerPage: number) => void // fires on rows-per-page change
}

export type PaginationProps = OffsetPaginationProps | CursorPaginationProps
