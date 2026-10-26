/**
 * DateInput
 *
 * Date picker input that opens a calendar popover on click.
 * Displays the selected date formatted in the input field.
 *
 * Behavior:
 * - Input is read-only — clicking it opens a popover with the Calendar
 * - A calendar button sits in the left section and a clear button in the
 *   right one: two sibling <button>s beside the field, nothing interactive
 *   nested in anything else. They are named by the `dateInput.open` and
 *   `dateInput.clear` labels (@turystack/react-i18n)
 * - Keyboard: Tab reaches the calendar button, the field, then the clear
 *   button (only while there is a date to clear); Enter/Space on the calendar
 *   button opens the calendar, on the clear button empties the value
 * - leftSection replaces the calendar icon inside the calendar button;
 *   rightSection replaces the clear button
 * - Selected date formatted via date-fns (dd/MM/yyyy)
 * - Selecting a date closes the popover and fires onChange
 * - Null value clears the input
 * - The popup is anchored to the field, so it opens under it and matches its width
 *
 * Implementation:
 * - Compose Input (read-only) with Popover (asChild, the calendar button is
 *   the trigger) and a Calendar component
 * - date-fns format() for display, Calendar onChange for selection
 * - <DateInput value={date} onChange={setDate} />
 * - <DateInput id="check-in" name="check-in" value={date} onChange={setDate} />
 *
 * Dependencies: Input component, Popover component, date-fns, Calendar component,
 * @turystack/react-i18n (labels)
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
