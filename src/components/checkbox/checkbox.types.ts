/**
 * Checkbox
 *
 * Toggle input for boolean or multi-select choices.
 * Supports individual checkboxes and grouped checkbox lists.
 *
 * Behavior:
 * - Check icon (Lucide) appears on checked state
 * - Bordered variant wraps checkbox + label in a clickable bordered container
 * - Group renders multiple checkboxes in horizontal or vertical layout
 * - Group tracks selected values as string[] and fires onChange on any toggle
 * - Size variants: sm (12px), md (16px), lg (20px) indicator
 * - error marks the checkbox invalid: aria-invalid and a destructive border
 *   and ring. errorMessage implies error and renders under the label in the
 *   destructive colour, outside the <label> so it is not part of the name,
 *   and is announced as the checkbox's description (aria-describedby)
 * - indeterminate shows the mixed state — a dash instead of the check, exposed
 *   as aria-checked="mixed" — for a box that stands for several others (a
 *   table's select-all with some rows selected); it wins over checked
 * - ariaLabel names a box that has no visible label (a table row's checkbox)
 * - Group is a <fieldset> (role="group") named by ariaLabel. Its error / errorMessage mark
 *   the whole group invalid: aria-invalid on the group and on every box
 *   (destructive border and ring on each), and errorMessage renders once under
 *   the group, announced as the group's description (aria-describedby)
 * - disabledReason (on a Checkbox or an item) blocks it like `disabled` and
 *   says why: it stays in the tab order (aria-disabled, not the attribute),
 *   click, Space and its label change nothing, a tooltip shows the reason on
 *   hover and keyboard focus, and the box is described by it (ARC-ERR-9). A
 *   disabled Group wins over an item's reason
 *
 * Implementation:
 * - Use Radix UI Checkbox primitive for accessibility (keyboard, ARIA)
 * - Peer selectors associate label styling with checkbox state
 * - Controlled (checked/onChange) and uncontrolled (defaultChecked) patterns
 * - <Checkbox label="Accept" size="md" bordered />
 * - <Checkbox ariaLabel="Select all rows" checked={all} indeterminate={some && !all} onChange={toggleAll} />
 * - <Checkbox label="I accept the terms" errorMessage={errors.terms} />
 * - <Checkbox disabledReason="Required by your plan" label="Audit log" checked />
 * - <Checkbox.Group bordered items={items} size="lg" value={selected} onChange={setSelected} />
 * - <Checkbox.Group ariaLabel="Channels" items={items} errorMessage={errors.channels} />
 *
 * Dependencies: @radix-ui/react-checkbox, @turystack/react-icons (Check icon)
 */

export type CheckboxSize = 'sm' | 'md' | 'lg'

export type CheckboxItem = {
  label: string // display text for the checkbox
  value: string // unique value identifier
  description?: string // helper text below the label
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
}

export type CheckboxProps = {
  label?: string // text label next to checkbox
  ariaLabel?: string // accessible name when no visible label exists
  description?: string // helper text below label
  value?: string // value for form submission
  size?: CheckboxSize // visual size of the checkbox
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
  bordered?: boolean // adds border around the checkbox wrapper
  error?: boolean // marks the checkbox invalid (aria-invalid, destructive border)
  errorMessage?: React.ReactNode // why it is invalid; shown under the label, implies error
  checked?: boolean // controlled checked state
  defaultChecked?: boolean // uncontrolled initial state
  indeterminate?: boolean // mixed state (aria-checked="mixed"), e.g. select-all with some rows selected
  onChange?: (checked: boolean) => void // fires on check/uncheck
}

export type CheckboxGroupVariant = 'vertical' | 'horizontal'

export type CheckboxGroupProps = {
  ariaLabel?: string // accessible name of the group (a <fieldset>, role="group")
  items: CheckboxItem[] // list of checkbox options
  value?: string[] // controlled: selected values
  defaultValue?: string[] // uncontrolled: initially selected values
  size?: CheckboxSize // visual size of every checkbox in the group
  disabled?: boolean // disables all checkboxes in group
  bordered?: boolean // adds border around each checkbox
  variant?: CheckboxGroupVariant // layout direction
  error?: boolean // marks the group and every box invalid (aria-invalid, destructive border)
  errorMessage?: React.ReactNode // why the group is invalid; shown once under the group, implies error
  onChange?: (value: string[]) => void // fires when selection changes
}
