/**
 * Input
 *
 * Base text input with support for left/right sections, loading state,
 * and debounced onChange. Foundation for all specialized input components.
 *
 * Behavior:
 * - leftSection/rightSection render icons or elements inside the input container
 * - Loading state shows a Loader spinner in the right section area and disables the field
 * - Debounce mode delays onChange calls (useful for search-as-you-type)
 * - Empty string converts to null in onChange for cleaner form handling
 * - Size variants: sm (36px), md (40px), lg (44px)
 * - The contract is a closed list of form-field attributes: identity (id, name,
 *   form), text (placeholder, autoComplete, inputMode, maxLength, minLength),
 *   state (required, readOnly, disabled, autoFocus), accessibility (ariaLabel,
 *   aria-invalid, aria-describedby) and focus/keyboard/click handlers. No
 *   className, style or other native attribute passes through.
 * - Inside a Form.Field the field supplies id, aria-describedby and
 *   aria-invalid when they are not given (an explicit value wins); every
 *   input built on Input inherits this
 *
 * Implementation:
 * - Wrapper div (root) with relative positioning for sections
 * - Native <input> with padded sides to accommodate sections
 * - useDebounceCallback hook for debounce behavior
 * - Controlled (value/onChange) and uncontrolled (defaultValue) patterns
 * - Components of this package that compose Input (PasswordInput, DateInput…)
 *   reach its root/field classes and its `type` through `ComposedInput`
 *   (input.composed.ts), which is not exported from the package
 * - <Input value={v} onChange={setV} leftSection={<SearchIcon />} size="md" loading />
 * - <Input id="email" name="email" aria-invalid={!!error} aria-describedby="email-error" />
 *
 * Dependencies: Loader, @turystack/react-hooks (useDebounceCallback), Form.Field context
 */

export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'default' | 'ghost'
export type InputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url'

export type InputProps = {
  id?: string // id of the native field (label htmlFor target)
  name?: string // form field name
  form?: string // associates the field with a form by id
  placeholder?: string // hint shown while the field is empty
  ariaLabel?: string // accessible name when no visible label exists
  'aria-invalid'?: boolean // marks the field invalid (form validation wiring)
  'aria-describedby'?: string // id(s) of the description/error element
  'data-testid'?: string // testing handle for the native field; defaults to "input-field"
  autoComplete?: React.HTMLInputAutoCompleteAttribute // browser autofill hint
  autoFocus?: boolean // focuses the field on mount
  inputMode?: InputMode // virtual keyboard hint
  maxLength?: number // maximum number of characters
  minLength?: number // minimum number of characters (native validation)
  required?: boolean // marks the field as required
  readOnly?: boolean // value can be selected but not edited
  disabled?: boolean // prevents interaction
  value?: string | null // controlled value (null clears)
  defaultValue?: string | null // uncontrolled initial value
  size?: InputSize // visual size variant
  variant?: InputVariant // visual style variant
  leftSection?: React.ReactNode // element rendered on the left (e.g. icon)
  leftSectionWidth?: number // left section padding in px (default 36)
  rightSection?: React.ReactNode // element rendered on the right (e.g. clear button)
  rightSectionWidth?: number // right section padding in px (default 36)
  debounce?: boolean // debounces onChange calls
  loading?: boolean // shows loader in right section and disables the field
  onChange?: (value: string | null) => void // fires on value change (null when empty)
  onBlur?: React.FocusEventHandler<HTMLInputElement> // fires when the field loses focus
  onFocus?: React.FocusEventHandler<HTMLInputElement> // fires when the field gains focus
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> // fires on key press
  onClick?: React.MouseEventHandler<HTMLInputElement> // fires on click (e.g. open a picker)
}
