import type { ReactNode } from 'react'

/**
 * Search
 *
 * The filter bar of a list screen: a debounced field, the filters that share
 * its row, and the ones that do not.
 *
 * Behavior:
 * - The bar is at most two rows. The first is the default one — field, inline
 *   filters, the control for whatever is not inline, then Reset. The second is
 *   the `expand` filters, opened by Show more, laid out the same way: one row,
 *   side by side, scrolling rather than stacking
 * - Each item declares where it lives. `inline` is the first row; `expand` the
 *   second; `popover` sits behind a Filters button. Both controls appear when
 *   both kinds are present
 * - On a row a field introduces itself by its own placeholder, so `label` is
 *   optional there and sits *beside* the field — for a Switch or a Checkbox,
 *   which has no placeholder to introduce itself with. In the popover a field
 *   is alone on its line, so `label` is required and sits above it
 * - Every filter is the same fixed width on both rows, so filling one cannot
 *   move the others
 * - Reset is always present once `onReset` is given, disabled while there is
 *   nothing to clear. A control that comes and goes is a control that moves the
 *   two beside it every time a filter is set
 * - `value` is read, never written: it is counted, so Reset's enabled state and
 *   the Filters badge follow the state instead of a number kept by hand
 *
 * Implementation:
 * - Only keys that have an item are counted. A route's search carries `page`,
 *   `perPage` and `sort` too, and counting every key would make a list with no
 *   filters report three of them
 * - Emptiness is `undefined`, `null`, `''`, `[]` and `false`; `0` counts,
 *   because it is a number someone chose. An item overrides it with `isActive`
 * - The field is `Input` with `debounce`, so the debouncing is the library's
 *   one implementation rather than a second one here
 * - Its own words come from the labels contract, never hardcoded
 *
 * Dependencies: Input, Button, Popover, Badge components; labels provider
 */

/** How many of the row's filters are in play, and where the rest live. */
export type SearchPlacement = 'inline' | 'popover' | 'expand'

export type SearchFilterProps = {
  value?: string | null // controlled query
  defaultValue?: string | null // uncontrolled initial query
  onChange?: (value: string | null) => void // fires debounced
  placeholder?: string // defaults to the labels contract
  loading?: boolean // shows the field's own loader
}

type RowItem<T, K extends keyof T & string> = {
  id: K // a key of `value`, so a typo is a compile error
  placement?: 'inline' | 'expand'
  field: ReactNode
  label?: ReactNode // optional, and beside the field: for a control with no placeholder
  isActive?: (value: T[K]) => boolean
}

type PopoverItem<T, K extends keyof T & string> = {
  id: K
  placement: 'popover'
  label: ReactNode // required: alone on its line, a field needs a name
  field: ReactNode
  isActive?: (value: T[K]) => boolean
}

/** The union over the keys, so each item's `isActive` sees its own field type. */
export type SearchItems<T> = {
  [K in keyof T & string]: RowItem<T, K> | PopoverItem<T, K>
}[keyof T & string]

export type SearchProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  filter?: SearchFilterProps // the query field
  items?: SearchItems<T>[] // the filters, each saying where it lives
  value?: T // the current values, keyed by item id — read to count
  onReset?: () => void // shown while `onReset` is given, enabled while something is set
}
