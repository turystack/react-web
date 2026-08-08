/**
 * Radio
 *
 * Single-select option input. Used individually or as a group
 * where only one option can be selected at a time.
 *
 * Behavior:
 * - Circle fill indicator appears on selected state
 * - Bordered variant wraps radio + label in a clickable bordered container
 * - Group renders items in horizontal or vertical layout
 * - Group enforces single selection — selecting one deselects others
 * - Items support description text below the label
 *
 * Implementation:
 * - Uses Base UI Radio and RadioGroup primitives
 * - Individual Radio must be used inside a Radio.Group
 * - <Radio.Group items={options} value={selected} variant="vertical" onChange={setSelected} />
 *
 * Dependencies: @base-ui/react/radio, @base-ui/react/radio-group
 */

export type RadioItem = {
  label: string // display text
  value: string // unique value
  description?: string // helper text below label
  disabled?: boolean // prevents interaction
}

export type RadioProps = {
  label?: string // text label
  description?: string // helper text
  value?: string // radio value for group selection
  disabled?: boolean // prevents interaction
  bordered?: boolean // adds border around radio wrapper
  checked?: boolean // controlled checked state (standalone only)
  onChange?: (checked: boolean) => void // fires on toggle (standalone only)
}

export type RadioGroupVariant = 'vertical' | 'horizontal'

export type RadioGroupProps = {
  items: RadioItem[] // list of radio options
  variant?: RadioGroupVariant // layout direction
  value?: string // controlled: selected value
  defaultValue?: string // uncontrolled: initially selected
  disabled?: boolean // disables all radios
  bordered?: boolean // adds border around each radio
  onChange?: (value: string) => void // fires when selection changes
}
