/**
 * Select
 *
 * Dropdown selection component supporting single and multiple modes,
 * searchable filtering, option grouping, and infinite scroll.
 *
 * Behavior:
 * - Single mode: click opens popover, selecting an item shows checkmark and closes
 * - Multiple mode: click opens popover, items have checkboxes, selected shown as badges (max 2 visible + "+N")
 * - Searchable: renders a filter input inside the popover (case-insensitive)
 * - Debounce mode delays onSearchChange calls (useful for remote search)
 * - Option grouping: groups options under section headers
 * - Creatable: `creatable` offers the query as a new option when nothing matches
 *   it, and implies `searchable`. It replaces the old Combobox — a field you
 *   type into that also keeps what did not match is a Select with one more row
 * - Infinite scroll: triggers onLoadMore when scrolling near bottom
 * - renderOption/renderValue allow custom rendering of items and selected display
 * - Empty state: shows emptySection content when no options match
 * - `outcome` is the alternative to `options`: it carries the five states of
 *   a remote read and the field paints them inside its own popup, because a
 *   select is a field and a form must survive its options failing to load
 * - A failed read never disables the trigger: a disabled control fires no
 *   pointer events, so disabling it would put the reason out of reach
 *
 * Implementation:
 * - Non-searchable single mode renders the Base UI Select listbox
 * - Searchable single and multiple modes render a Base UI Popover holding a
 *   search input plus a roving-focus listbox (arrows move, Enter/Space picks)
 * - Generic types: T (option type), I (input value), O (output value)
 * - optionLabel/optionValue can be key of T or extractor function
 * - Every trigger is role="combobox" with aria-expanded and aria-controls
 * - <Select mode="single" options={items} optionLabel="name" optionValue="id" value={v} onChange={setV} />
 * - <Select mode="multiple" options={items} optionLabel="name" optionValue="id" searchable />
 * - <Select mode="single" creatable creatableOptions={{ onCreate: addTag }} options={tags} … />
 *
 * Dependencies: @base-ui/react (Select, Popover), Badge component, Loader component,
 * EmptyState component, Button component, @turystack/react-hooks (DataOutcome)
 */

import type { DataOutcome } from '@turystack/react-hooks'

export type SelectMode = 'single' | 'multiple'

export type SelectInfiniteProps = {
  loadingMoreText?: string // text shown while loading more
  hasMore?: boolean // whether more items can be loaded
  loadingMore?: boolean // loading state for infinite scroll
  error?: boolean // the next page failed; the options already loaded stay
  errorSection?: React.ReactNode // content shown at the end of the list when error is true
  onLoadMore?: () => void // fires when scroll hits bottom
}

/** Where the create row sits relative to the options that did match. */
export type SelectCreatablePosition = 'top' | 'bottom'

export type SelectCreatableOptions = {
  /** Offers the row even when an option already carries that label. */
  allowDuplicates?: boolean
  /** Wording of the create row; default `Create "<query>"`. */
  label?: (query: string) => string
  /** Shortest query that may be created; default 1. */
  minLength?: number
  /** Makes an option out of the query. May return a promise: the row spins
   * until it settles, and the search clears only once it resolves. */
  onCreate?: (query: string) => void | Promise<void>
  /** Where the row sits in the list; default top. */
  position?: SelectCreatablePosition
}

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectVariant = 'default' | 'ghost'

export type SelectStaticProps<T> = {
  options: T[] // array of option objects
  outcome?: never
}

export type SelectOutcomeProps<T> = {
  options?: never
  outcome: DataOutcome<T[]> // the five states of a remote read
}

export type SelectDataProps<T> = SelectStaticProps<T> | SelectOutcomeProps<T>

export type BaseSelectProps<T, O> = {
  optionLabel: keyof T | ((option: T) => string) // how to extract display label
  optionValue: keyof T | ((option: T) => O) // how to extract option value
  optionGroup?: keyof T | ((option: T) => string) // optional grouping key
  renderOption?: (option: T) => React.ReactNode // custom option renderer
  renderValue?: (option: T) => React.ReactNode // custom selected value renderer
  placeholder?: string // placeholder text when nothing selected
  searchable?: boolean // enables search/filter input
  creatable?: boolean // offers the query as a new option; implies searchable
  creatableOptions?: SelectCreatableOptions // wording, placement and the handler
  searchPlaceholder?: string // placeholder for search input
  searchValue?: string // controlled search input value
  deniedSection?: React.ReactNode // content shown when the outcome is denied
  emptySection?: React.ReactNode // content shown when no options match
  errorSection?: React.ReactNode // content shown when the outcome failed
  leftSection?: React.ReactNode // element on the left of trigger
  rightSection?: React.ReactNode // element on the right of trigger
  onSearchChange?: (query: string) => void // fires when search input changes
  debounce?: boolean // debounces onSearchChange calls
  infinite?: SelectInfiniteProps // infinite scroll configuration
  disabled?: boolean // prevents interaction
  loading?: boolean // shows loading state
  size?: SelectSize // visual size
  variant?: SelectVariant // visual style variant
  clearable?: boolean // shows an X button to clear the value when one is selected (default: true)
}

export type SelectSingleProps<T, I = string, O = I> = BaseSelectProps<T, O> &
  SelectDataProps<T> & {
    mode: 'single' // single selection mode
    value?: I | null // controlled selected value
    defaultValue?: I | null // uncontrolled initial value
    onChange?: (value: O | null) => void // fires on selection change
  }

export type SelectMultipleProps<T, I = string, O = I> = BaseSelectProps<T, O> &
  SelectDataProps<T> & {
    mode: 'multiple' // multiple selection mode
    value?: I[] // controlled selected values
    defaultValue?: I[] // uncontrolled initial values
    onChange?: (value: O[]) => void // fires on selection change
  }

export type SelectProps<
  T,
  I = string,
  O = I,
  K extends SelectMode = SelectMode,
> = K extends 'single'
  ? SelectSingleProps<T, I, O>
  : K extends 'multiple'
    ? SelectMultipleProps<T, I, O>
    : never
