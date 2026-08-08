/**
 * DateTimeInput
 *
 * Date + time picker input modeled on Mantine's DateTimePicker. Opens a
 * popover containing a Calendar above a segmented TimeInput plus a submit
 * (check) button.
 *
 * Behavior:
 * - Read-only trigger Input shows the committed value formatted via date-fns
 * - Picking a date does NOT close the popover; focus moves to the hours
 *   segment of TimeInput so the user can keep typing
 * - Live-commit: every valid TimeInput emission merges with the current date
 *   and fires onChange. Partial time emissions (null) are absorbed
 *   internally and never null the public value
 * - Default time is applied when the user picks a date with no time set
 * - Trigger "X" clear button mirrors DateInput; in-popover clear is not
 *   provided
 * - Close triggers: submit (check) button, Enter inside TimeInput, outside
 *   click, Escape. None of them mutate the value (commits already happened
 *   live)
 *
 * Implementation:
 * - Compose Calendar + Popover + Input + TimeInput. Sibling of DateInput,
 *   does not extend it
 * - date-fns `format` direct at call site (no formatter helpers)
 * - <DateTimeInput value={dt} onChange={setDt} withSeconds />
 *
 * Dependencies: Calendar, Popover, Input, TimeInput, date-fns,
 *   @base-ui/react/button, @turystack/react-icons
 */

import type { InputProps } from '@/components/input/input.types'

export type DateTimeInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'debounce'
> & {
  value?: Date | null // controlled date-time value
  defaultValue?: Date | null // uncontrolled initial value
  onChange?: (value: Date | null) => void // fires on every live commit
  defaultTime?: string // 'HH:mm' or 'HH:mm:ss'; default '00:00' (or '00:00:00')
  withSeconds?: boolean // toggles seconds in display + TimeInput
  valueFormat?: string // date-fns format token for trigger display
  minDate?: Date
  maxDate?: Date
  minTime?: string // forwarded to TimeInput
  maxTime?: string // forwarded to TimeInput
}
