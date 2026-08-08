/**
 * DateRangeInput
 *
 * Date range picker showing quick period presets and a two-month calendar in a
 * popover. Displays "from ~ to" formatted in the input field.
 *
 * Behavior:
 * - Input is read-only - clicking opens a popover with quick presets and Calendar
 * - Calendar renders with numberOfMonths={2} and mode="range"
 * - Displays formatted range as "dd/MM/yyyy ~ dd/MM/yyyy"
 * - Selecting dates or presets updates a draft value
 * - Apply commits the draft and fires onChange; Cancel discards the draft
 *
 * Implementation:
 * - Compose Input (read-only) with Popover and Calendar (mode="range")
 * - <DateRangeInput value={{ from: startDate, to: endDate }} onChange={setRange} />
 *
 * Dependencies: Input component, Popover component, date-fns, Calendar component
 */

import type { InputProps } from '@/components/input/input.types'

export type DateRange = {
  from?: Date // start date
  to?: Date // end date
}

export type DateRangeInputPreset = {
  key: string
  label: string
  getValue?: () => DateRange | null
}

export type DateRangeInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange'
> & {
  value?: DateRange | null // controlled range value
  defaultValue?: DateRange | null // uncontrolled initial range
  onChange?: (range: DateRange | null) => void // fires when draft is applied
  presets?: DateRangeInputPreset[] // quick range options shown in the popover
  showPresets?: boolean // hides quick range options when false
  applyLabel?: string // apply action label
  cancelLabel?: string // cancel action label
}
