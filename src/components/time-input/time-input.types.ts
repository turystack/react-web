/**
 * TimeInput
 *
 * Segmented time entry. Each segment (HH, MM, optional SS) is its own
 * <input>, visually wrapped to look like a single field. Adapted from
 * Mantine's TimePicker (SpinInput).
 *
 * Behavior:
 * - Focus or click a segment selects all its digits (native browser select)
 * - Typing replaces the segment; auto-advances when the value can no longer
 *   extend into a valid 2-digit number (e.g. 3 in HH advances immediately,
 *   1 in HH waits for second digit, 2 in HH waits then clamps 25 → 23)
 * - Out-of-range values clamp to segment max (typed 99 in MM → 59)
 * - Backspace clears the active segment, then moves to previous segment
 * - ArrowLeft / ArrowRight navigate between segments
 * - ArrowUp / ArrowDown spin the segment value by 1
 * - Paste accepts H:M, HH:MM, H:M:S, HH:MM:SS and clamps to bounds
 * - Min/max bounds applied when the whole group blurs and is fully filled
 * - Default leftSection renders a Clock icon (overridable, null removes)
 * - onChange fires with the formatted string when all segments are filled,
 *   `null` while partial or empty
 *
 * Implementation:
 * - Multi-input architecture (one <input role="spinbutton"> per segment)
 * - The segments sit in a <fieldset> (the native role="group", no legend)
 *   that carries ariaLabel, aria-invalid, aria-describedby and id; onKeyDown
 *   and onClick receive the group's events; text-field-only Input props are
 *   omitted from the contract
 * - Pure helpers in time-input.utils.ts (parse/format/clamp/paste)
 * - minTime/maxTime expressed in the same format as value (HH:MM or HH:MM:SS)
 * - <TimeInput value={time} onChange={setTime} minTime="08:00" maxTime="22:00" />
 *
 * Dependencies: Input (InputProps + inputShared), Loader, @turystack/react-icons (Clock)
 */

import type { InputProps } from '@/components/input/input.types'

export type TimeInputProps = Omit<
  InputProps,
  // The field is a group of segment inputs, not one native <input>: the
  // text-field attributes (placeholder, length, autofill, keyboard hint) and
  // the form-submission ones (name, form, required) have nothing to land on.
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'debounce'
  | 'placeholder'
  | 'name'
  | 'form'
  | 'autoComplete'
  | 'autoFocus'
  | 'inputMode'
  | 'maxLength'
  | 'minLength'
  | 'required'
> & {
  value?: string | null // controlled value (HH:MM or HH:MM:SS, null clears)
  defaultValue?: string | null // uncontrolled initial value
  onChange?: (value: string | null) => void // fires on change (null when partial/empty)
  withSeconds?: boolean // toggles HH:MM ↔ HH:MM:SS
  minTime?: string // lower bound, same format as value
  maxTime?: string // upper bound, same format as value
}
