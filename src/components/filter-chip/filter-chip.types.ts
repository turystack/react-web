import type { ReactNode } from 'react'

/**
 * FilterChip
 *
 * One attribute of a list, offered as a filter above its table — the Stripe
 * Dashboard pattern. The chip's label is the column's header.
 *
 * Behavior:
 * - Two states, decided by `value`. Without it the chip is *suggested*: a
 *   dashed pill with a "+" and the label, inviting a filter. With it the chip is
 *   *active*: a solid pill reading "Label: value", its "+" swapped for an × that
 *   clears it
 * - Clicking the chip opens `children` — the picker — in a Popover anchored to
 *   it. Enter and Space open it from the keyboard, Escape and a click outside
 *   close it. `open`/`onOpenChange` hold the popover from outside, so a picker
 *   can close it once a value is chosen; without them the chip keeps its own
 * - A chip with no `children` has nothing to open: its body is plain text,
 *   not a control, and only the × is interactive
 * - The × is its own button at the chip's leading edge, a separate tab stop, named
 *   "Remove <label> filter". It fires `onRemove` without opening the picker,
 *   and hands focus back to the chip's body, since the × itself leaves with the
 *   value. It appears only while the chip is active and `onRemove` is given
 * - `disabled` blocks the picker and the ×; the chip stays visible and says
 *   which filter it is
 * - `disabledReason` blocks them the same way and says why: the picker and
 *   the × stay in the tab order (aria-disabled, not the attribute), using
 *   them does nothing, a tooltip shows the reason on hover and keyboard
 *   focus on each, and each is described by it (ARC-ERR-9). A chip with
 *   neither picker nor × has no control to carry it and is only dimmed
 * - Inside a FilterBar the chip reports whether it is active, which is how the
 *   bar knows when to offer Clear filters. A chip blocked by a reason reports
 *   inactive: its value is locked, so it is not something Clear filters can
 *   wipe, and the bar's `onClear` must leave it as it is. Outside a bar it
 *   stands alone
 *
 * Implementation:
 * - The picker opens through the library's Popover, never a second overlay
 * - The "+" and the × are icons, hidden from assistive technology; the names
 *   come from the label and the labels contract
 * - <FilterChip label="Status" value="Active" onRemove={clear}>
 *     <StatusPicker onChange={setStatus} />
 *   </FilterChip>
 * - <FilterChip disabledReason="Set by your workspace" label="Region" value="BR"
 *     onRemove={clear}><RegionPicker /></FilterChip>
 *
 * Dependencies: Popover component; labels provider; FilterBar context (optional)
 */

export type FilterChipProps = {
  label: string // the attribute's name — the column header
  value?: ReactNode // the chosen value; present means the chip is active
  onRemove?: () => void // clears the value; shows the × while active
  open?: boolean // controlled picker visibility
  defaultOpen?: boolean // uncontrolled initial picker visibility
  onOpenChange?: (open: boolean) => void // fires when the picker opens or closes
  disabled?: boolean // blocks the picker and the ×
  disabledReason?: string // blocks both, stay focusable, tooltip says why
}
