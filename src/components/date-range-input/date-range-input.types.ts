/**
 * DateRangeInput
 *
 * Date range picker showing quick period presets and a two-month calendar in a
 * popover. Displays "from ~ to" formatted in the input field.
 *
 * Behavior:
 * - Input is read-only - clicking opens a popover with quick presets and Calendar
 * - A calendar button (named by the `dateInput.open` label) sits left of the
 *   field and a clear button right of it: sibling <button>s, nothing
 *   interactive nested in another. The popup anchors to the whole field
 * - Those two buttons are the field's sections, so the contract has no
 *   `leftSection`/`rightSection` (TypeScript refuses them rather than the
 *   field dropping them in silence). `leftSectionWidth`/`rightSectionWidth`
 *   still size the two button slots
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
  'value' | 'defaultValue' | 'onChange' | 'leftSection' | 'rightSection'
> & {
  value?: DateRange | null // controlled range value
  defaultValue?: DateRange | null // uncontrolled initial range
  onChange?: (range: DateRange | null) => void // fires when draft is applied
  presets?: DateRangeInputPreset[] // quick range options shown in the popover
  showPresets?: boolean // hides quick range options when false
  applyLabel?: string // apply action label
  cancelLabel?: string // cancel action label
}
