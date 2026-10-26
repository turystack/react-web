import type { ReactNode } from 'react'

/**
 * FilterBar
 *
 * The row of FilterChips above a table — the Stripe Dashboard filter pattern:
 * one chip per attribute, then Clear filters, then whatever else the screen
 * keeps at the end of the row.
 *
 * Behavior:
 * - `children` are the chips, in the order of the table's columns
 * - Clear filters appears at the end of the chips only while at least one chip
 *   is active and `onClear` is given. The bar does not take a count: each chip
 *   inside it reports whether it holds a value, so the link follows the chips
 *   themselves and cannot drift from a number kept by hand. A chip blocked by
 *   a disabledReason does not count: its value is locked, so `onClear` should
 *   leave it in place
 * - Clicking Clear filters fires `onClear` and moves focus to the first chip,
 *   since the link leaves the row with the last active filter
 * - `trailing` sits at the far end of the row — a date range, an Edit columns
 *   button — and stays there whether or not the link is shown
 * - The row wraps on narrow widths rather than scrolling; `trailing` wraps with
 *   it and keeps to the end of its line
 * - The row is a named group — a <fieldset> — so a screen reader announces
 *   the chips as one set of filters
 *
 * Implementation:
 * - Chips report through a context of the bar's own; a chip outside a bar
 *   reports to nothing
 * - Clear filters is the library's Button, as a link; its words and the
 *   group's name come from the labels contract
 * - <FilterBar onClear={reset} trailing={<DateRangeInput … />}>
 *     <FilterChip label="Status" value={status} onRemove={clearStatus}>…</FilterChip>
 *     <FilterChip label="Amount">…</FilterChip>
 *   </FilterBar>
 *
 * Dependencies: FilterChip (children), Button component; labels provider
 */

export type FilterBarProps = {
  onClear?: () => void // clears every filter; shows Clear filters while a chip is active
  trailing?: ReactNode // content kept at the far end of the row
  ariaLabel?: string // names the group; defaults to the labels contract
}
