/**
 * Toggle
 *
 * A button that stays pressed.
 *
 * Behavior:
 * - Pressed is a state the control reports, not a colour it wears: the button
 *   carries aria-pressed, so a screen reader says "pressed" where a sighted
 *   reader sees a filled background
 * - Toggle.Group holds several and owns which are pressed. `mode` says whether
 *   that is one at a time or many — bold/italic/underline is many, and a view
 *   switcher is one
 * - This is not SegmentedControl: that one answers a form field with exactly
 *   one value and looks like a field. A toggle is a toolbar control, and a
 *   toolbar can have nothing pressed at all
 *
 * Implementation:
 * - Base UI Toggle and ToggleGroup
 * - <Toggle ariaLabel="Bold" pressed={bold} onChange={setBold}><Bold /></Toggle>
 * - <Toggle.Group mode="multiple" value={marks} onChange={setMarks}>…</Toggle.Group>
 *
 * Dependencies: @base-ui/react/toggle, @base-ui/react/toggle-group
 */

export type ToggleSize = 'sm' | 'md' | 'lg'

export type ToggleVariant = 'default' | 'outline'

export type ToggleMode = 'single' | 'multiple'

export type ToggleProps = {
  ariaLabel?: string // required in practice for an icon-only toggle
  defaultPressed?: boolean // uncontrolled initial state
  disabled?: boolean // prevents interaction
  onChange?: (pressed: boolean) => void // fires with the new state
  pressed?: boolean // controlled state
  size?: ToggleSize // visual size; default md
  value?: string // identifies it inside a group
  variant?: ToggleVariant // visual style; default default
}

export type ToggleGroupProps = {
  ariaLabel?: string // names the group for assistive technology
  defaultValue?: string[] // uncontrolled initial pressed values
  disabled?: boolean // disables every toggle in the group
  mode?: ToggleMode // one at a time, or many; default multiple
  onChange?: (value: string[]) => void // fires with every pressed value
  size?: ToggleSize // applied to every toggle in the group
  value?: string[] // controlled pressed values
  variant?: ToggleVariant // applied to every toggle in the group
}
