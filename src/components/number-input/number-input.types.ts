/**
 * NumberInput
 *
 * Numeric input with increment/decrement stepper buttons.
 * Supports single value and from/to range modes.
 *
 * Behavior:
 * - Single mode: input with minus/plus stepper buttons
 * - Range mode: opens a popover with two inputs (from/to) and confirm/cancel
 * - Step prop controls increment/decrement amount
 * - Stepper buttons render as a grouped control with divider
 * - Input type="number" with inputMode="numeric"
 *
 * Implementation:
 * - Compose with Input for base styling
 * - Stepper UI: minus button | divider | plus button in right section
 * - Radix Popover for range mode
 * - <NumberInput mode="single" step={5} value={count} onChange={setCount} />
 * - <NumberInput mode="range" value={{ from: 0, to: 100 }} onChange={setRange} />
 *
 * Dependencies: Input component, @radix-ui/react-popover, @turystack/react-icons (Minus, Plus)
 */

import type { InputSize } from '@/components/input/input.types'

export type NumberInputProps = {
  value?: number | null
  defaultValue?: number | null
  onChange?: (value: number | null) => void
  step?: number
  min?: number
  max?: number
  size?: InputSize
  disabled?: boolean
  placeholder?: string
  grouping?: boolean
}
