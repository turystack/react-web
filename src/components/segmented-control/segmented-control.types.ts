/**
 * SegmentedControl
 *
 * A row of mutually exclusive options, all of them visible at once.
 *
 * Behavior:
 * - It selects a value, not a view: use Tabs when the choice reveals a panel,
 *   and this when the choice is the answer to a field
 * - Arrow keys move between segments and select as they go, because it is a
 *   radio group underneath — that is what a radio group is for
 * - Options come in as the app's own objects with label/value extractors, so
 *   nothing has to be pre-mapped into a shape this component invented
 * - `block` stretches the control to its container and shares the width
 *   equally between segments
 * - `readOnly` shows the choice and refuses to change it; `disabled` also
 *   greys it out; `loading` blocks it and spins on the selected segment
 *
 * Implementation:
 * - Base UI RadioGroup + Radio, so roles, arrow keys and focus are the
 *   platform's answers rather than ours
 * - Values travel as themselves; only the internal keys are strings
 * - <SegmentedControl options={views} optionLabel="name" optionValue="id"
 *     value={view} onChange={setView} />
 *
 * Dependencies: @base-ui/react/radio, @base-ui/react/radio-group, Loader
 */

export type SegmentedControlSize = 'sm' | 'md' | 'lg'

export type SegmentedControlOrientation = 'horizontal' | 'vertical'

export type SegmentedControlProps<T, I = string, O = I> = {
  ariaLabel?: string // names the group for assistive technology
  block?: boolean // fills the container, segments share the width
  defaultValue?: I | null // uncontrolled initial selection
  disabled?: boolean // blocks interaction and greys the control
  loading?: boolean // blocks interaction and spins on the selection
  onChange?: (value: O) => void // fires with the selected option's value
  optionDisabled?: keyof T | ((option: T) => boolean) // per-option blocking
  optionIcon?: keyof T | ((option: T) => React.ReactNode) // icon before the label
  optionLabel: keyof T | ((option: T) => React.ReactNode) // how to read the label
  optionValue: keyof T | ((option: T) => O) // how to read the value
  options: T[] // the app's own option objects
  orientation?: SegmentedControlOrientation // layout direction; default horizontal
  readOnly?: boolean // shows the choice, refuses to change it
  size?: SegmentedControlSize // visual size; default md
  value?: I | null // controlled selection
}
