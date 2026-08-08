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
 * - Infinite scroll: triggers onLoadMore when scrolling near bottom
 * - renderOption/renderValue allow custom rendering of items and selected display
 * - Empty state: shows emptySection content when no options match
 *
 * Implementation:
 * - Use Radix Popover with Command (cmdk) pattern for search + list
 * - Generic types: T (option type), I (input value), O (output value)
 * - optionLabel/optionValue can be key of T or extractor function
 * - aria-expanded, role="combobox" for accessibility
 * - <Select mode="single" options={items} optionLabel="name" optionValue="id" value={v} onChange={setV} />
 * - <Select mode="multiple" options={items} optionLabel="name" optionValue="id" searchable />
 *
 * Dependencies: @radix-ui/react-popover, cmdk (command menu), Badge component
 */

export type SelectMode = 'single' | 'multiple'

export type SelectInfiniteProps = {
  loadingMoreText?: string // text shown while loading more
  hasMore?: boolean // whether more items can be loaded
  loadingMore?: boolean // loading state for infinite scroll
  onLoadMore?: () => void // fires when scroll hits bottom
}

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectVariant = 'default' | 'ghost'

export type BaseSelectProps<T, O> = {
  options: T[] // array of option objects
  optionLabel: keyof T | ((option: T) => string) // how to extract display label
  optionValue: keyof T | ((option: T) => O) // how to extract option value
  optionGroup?: keyof T | ((option: T) => string) // optional grouping key
  renderOption?: (option: T) => React.ReactNode // custom option renderer
  renderValue?: (option: T) => React.ReactNode // custom selected value renderer
  placeholder?: string // placeholder text when nothing selected
  searchable?: boolean // enables search/filter input
  searchPlaceholder?: string // placeholder for search input
  searchValue?: string // controlled search input value
  emptySection?: React.ReactNode // content shown when no options match
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

export type SelectSingleProps<T, I = string, O = I> = BaseSelectProps<T, O> & {
  mode: 'single' // single selection mode
  value?: I | null // controlled selected value
  defaultValue?: I | null // uncontrolled initial value
  onChange?: (value: O | null) => void // fires on selection change
}

export type SelectMultipleProps<T, I = string, O = I> = BaseSelectProps<
  T,
  O
> & {
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
