/**
 * Textarea
 *
 * Multi-line text input with auto-expanding height and character counter.
 *
 * Behavior:
 * - Auto-expands height based on content using scrollHeight measurement
 * - maxLength shows a character counter (e.g. "45/200") in bottom-right
 * - leftSection/rightSection for icons or actions
 * - resize is disabled — height adjusts automatically
 * - Empty string converts to null in onChange
 * - Size variants match Input component for visual consistency
 * - The contract is a closed list of form-field attributes: identity (id, name,
 *   form), text (placeholder, autoComplete, rows, maxLength, minLength), state
 *   (required, readOnly, disabled, autoFocus), accessibility (ariaLabel,
 *   aria-invalid, aria-describedby) and focus/keyboard handlers. No className,
 *   style or other native attribute passes through.
 *
 * Implementation:
 * - Native <textarea> with resize-none, overflow-hidden
 * - useEffect adjusts height: reset to 0 then set to scrollHeight
 * - Counter renders as absolute-positioned text
 * - <Textarea value={v} onChange={setV} maxLength={500} size="md" />
 * - <Textarea id="notes" name="notes" rows={4} aria-invalid={!!error} />
 *
 * Dependencies: Input component (InputSize type)
 */

import type { InputSize } from '@/components/input/input.types'

export type TextareaProps = {
  id?: string // id of the native field (label htmlFor target)
  name?: string // form field name
  form?: string // associates the field with a form by id
  placeholder?: string // hint shown while the field is empty
  ariaLabel?: string // accessible name when no visible label exists
  'aria-invalid'?: boolean // marks the field invalid (form validation wiring)
  'aria-describedby'?: string // id(s) of the description/error element
  'data-testid'?: string // testing handle for the native field; defaults to "textarea-field"
  autoComplete?: React.HTMLInputAutoCompleteAttribute // browser autofill hint
  autoFocus?: boolean // focuses the field on mount
  rows?: number // minimum visible text lines
  maxLength?: number // max character count (renders counter UI)
  minLength?: number // minimum number of characters (native validation)
  required?: boolean // marks the field as required
  readOnly?: boolean // value can be selected but not edited
  disabled?: boolean // prevents interaction
  value?: string | null // controlled value
  defaultValue?: string | null // uncontrolled initial value
  size?: InputSize // visual size (matches Input sizes)
  leftSection?: React.ReactNode // element on the left
  rightSection?: React.ReactNode // element on the right
  onChange?: (value: string | null) => void // fires on value change
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement> // fires when the field loses focus
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement> // fires when the field gains focus
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement> // fires on key press
}
