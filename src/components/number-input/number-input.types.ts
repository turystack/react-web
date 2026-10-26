/**
 * NumberInput
 *
 * Numeric field with decrement/increment stepper buttons around it.
 *
 * Behavior:
 * - Typing commits a number on blur; text that is not a number is discarded
 * - The steppers move the value by `step` and stop at `min`/`max`
 * - Emptying the field reports null
 * - Thousands are grouped by default; `grouping={false}` drops the separator
 * - Size variants: sm (36px), md (40px), lg (44px)
 * - Form wiring follows Input's closed list of field attributes: identity (id,
 *   name, form), state (required, readOnly, disabled) and accessibility
 *   (ariaLabel, aria-invalid, aria-describedby). `id` lands on the text field,
 *   so a <label htmlFor> names it; inside a Form.Field the field supplies the
 *   id, aria-describedby and aria-invalid when they are not given
 * - The field + steppers wrapper is a named `role="group"`: named by
 *   `ariaLabel`, else by the Form.Field's label (aria-labelledby). With no
 *   name available it renders no group role at all
 *
 * Implementation:
 * - Base UI NumberField (Root, Group, Input, Decrement, Increment)
 * - The field comes first in the DOM, the Decrease button is drawn before it
 *   with `order-first`, so a wrapping <label> reaches the field
 * - <NumberInput step={5} value={count} onChange={setCount} />
 * - <Form.Field label="Guests"><NumberInput name="guests" /></Form.Field>
 *
 * Dependencies: @base-ui/react (NumberField), internal icons (Minus, Plus)
 */

import type { InputProps, InputSize } from '@/components/input/input.types'

export type NumberInputProps = Pick<
  InputProps,
  | 'id'
  | 'name'
  | 'form'
  | 'ariaLabel'
  | 'aria-invalid'
  | 'aria-describedby'
  | 'required'
  | 'readOnly'
> & {
  value?: number | null // controlled value (null reads as empty)
  defaultValue?: number | null // uncontrolled initial value
  onChange?: (value: number | null) => void // fires with the next number (null when emptied)
  step?: number // amount each stepper press moves the value (default 1)
  min?: number // lower bound for the steppers
  max?: number // upper bound for the steppers
  size?: InputSize // visual size variant
  disabled?: boolean // prevents typing and stepping
  placeholder?: string // hint shown while the field is empty
  grouping?: boolean // groups thousands (default true)
}
