/**
 * DateInput
 *
 * Date picker input that opens a calendar popover on click.
 * Displays the selected date formatted in the input field.
 *
 * Behavior:
 * - Input is read-only — clicking opens a popover with Calendar component
 * - Calendar icon rendered in left section
 * - Selected date formatted via date-fns (default: dd/MM/yyyy)
 * - Selecting a date closes the popover and fires onChange
 * - Null value clears the input
 *
 * Implementation:
 * - Compose Input (read-only) with Radix Popover and a Calendar component
 * - date-fns format() for display, Calendar onChange for selection
 * - <DateInput value={date} onChange={setDate} />
 *
 * Dependencies: Input component, @radix-ui/react-popover, date-fns, Calendar component
 */

import type { InputProps } from '@/components/input/input.types'

export type DateInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange'
> & {
  value?: Date | null // controlled date value
  defaultValue?: Date | null // uncontrolled initial date
  onChange?: (date: Date | null) => void // fires when date is selected/cleared
}
