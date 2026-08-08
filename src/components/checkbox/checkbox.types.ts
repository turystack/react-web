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
 *
 * Implementation:
 * - Use Radix UI Checkbox primitive for accessibility (keyboard, ARIA)
 * - Peer selectors associate label styling with checkbox state
 * - Controlled (checked/onChange) and uncontrolled (defaultChecked) patterns
 * - <Checkbox label="Accept" size="md" bordered />
 * - <Checkbox.Group items={items} value={selected} variant="horizontal" onChange={setSelected} />
 *
 * Dependencies: @radix-ui/react-checkbox, @turystack/react-icons (Check icon)
 */

export type CheckboxSize = 'sm' | 'md' | 'lg'

export type CheckboxItem = {
  label: string // display text for the checkbox
  value: string // unique value identifier
  disabled?: boolean // prevents interaction
}

export type CheckboxProps = {
  label?: string // text label next to checkbox
  description?: string // helper text below label
  value?: string // value for form submission
  size?: CheckboxSize // visual size of the checkbox
  disabled?: boolean // prevents interaction
  bordered?: boolean // adds border around the checkbox wrapper
  checked?: boolean // controlled checked state
  defaultChecked?: boolean // uncontrolled initial state
  onChange?: (checked: boolean) => void // fires on check/uncheck
}

export type CheckboxGroupVariant = 'vertical' | 'horizontal'

export type CheckboxGroupProps = {
  items: CheckboxItem[] // list of checkbox options
  value?: string[] // controlled: selected values
  defaultValue?: string[] // uncontrolled: initially selected values
  disabled?: boolean // disables all checkboxes in group
  variant?: CheckboxGroupVariant // layout direction
  onChange?: (value: string[]) => void // fires when selection changes
}
