/**
 * Input
 *
 * Base text input with support for left/right sections, loading state,
 * and debounced onChange. Foundation for all specialized input components.
 *
 * Behavior:
 * - leftSection/rightSection render icons or elements inside the input container
 * - Loading state shows a Loader spinner in the right section area
 * - Debounce mode delays onChange calls (useful for search-as-you-type)
 * - Empty string converts to null in onChange for cleaner form handling
 * - Size variants: sm (36px), md (40px), lg (44px)
 *
 * Implementation:
 * - Wrapper div (root) with relative positioning for sections
 * - Native <input> with padded sides to accommodate sections
 * - useDebounceFn hook for debounce behavior
 * - Controlled (value/onChange) and uncontrolled (defaultValue) patterns
 * - type prop is internal-only (used by PasswordInput)
 * - <Input value={v} onChange={setV} leftSection={<SearchIcon />} size="md" loading />
 *
 * Dependencies: none (base component)
 */

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'default' | 'ghost'

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size' | 'value' | 'defaultValue' | 'type'
> & {
  /** @internal Use only for internal composition (e.g. PasswordInput). */
  type?: 'text' | 'password' // internal: controls input type attribute
  value?: string | null // controlled value (null clears)
  defaultValue?: string | null // uncontrolled initial value
  size?: InputSize // visual size variant
  variant?: InputVariant // visual style variant
  rootClassName?: string // className for the root wrapper div
  leftSection?: React.ReactNode // element rendered on the left (e.g. icon)
  leftSectionWidth?: number // left section padding in px (default 36)
  rightSection?: React.ReactNode // element rendered on the right (e.g. clear button)
  rightSectionWidth?: number // right section padding in px (default 36)
  debounce?: boolean // debounces onChange calls
  loading?: boolean // shows loader in right section
  onChange?: (value: string | null) => void // fires on value change (null when empty)
}
