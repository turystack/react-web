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
 * - card turns every item into a selectable card for options whose content is
 *   rich (a billing interval with its price and a "Save 15%" badge): the whole
 *   card is the radio — role="radio", aria-checked, the focus ring on the card,
 *   a click anywhere on it picks it — and the group keeps one tab stop with
 *   arrow keys moving the selection. The card is named by the item's label
 *   alone; its badge, description and rightSection are its description
 *   (aria-describedby), so a screen reader hears "Yearly, radio, checked"
 *   before the details. Keep them non-interactive: the card is the control
 * - badge and rightSection render only in card mode
 * - A card group laid out horizontally shares the row evenly
 * - ariaLabel names the radiogroup when no visible legend or heading does
 * - disabledReason (on a Radio or an item) blocks it like `disabled` and says
 *   why: click, label, arrow keys and Space never select it, yet the arrows
 *   still land on it, a tooltip shows the reason on hover and keyboard focus,
 *   and the radio is described by it (ARC-ERR-9). In a group it says
 *   aria-disabled only while focused: the group's arrows skip aria-disabled
 *   radios, and Base UI's RadioGroup cannot be told otherwise
 *
 * Implementation:
 * - Uses Base UI Radio and RadioGroup primitives
 * - A standalone Radio is controlled with `checked` or uncontrolled with `defaultChecked`
 * - <Radio defaultChecked label="Send me updates" />
 * - <Radio.Group items={options} value={selected} variant="vertical" onChange={setSelected} />
 * - <Radio.Group ariaLabel="Payment method" items={methods} />
 * - <Radio.Group items={[{ value: 'pix', label: 'Pix', disabledReason: 'Pix is offline' }]} />
 * - <Radio.Group card variant="horizontal" value={interval} onChange={setInterval}
 *     items={[
 *       { value: 'monthly', label: 'Monthly', rightSection: <MoneyText value={4990} /> },
 *       { value: 'yearly', label: 'Yearly', badge: <Badge variant="success">Save 15%</Badge>,
 *         description: 'Billed once a year', rightSection: <MoneyText value={50900} /> },
 *     ]} />
 *
 * Dependencies: @base-ui/react/radio, @base-ui/react/radio-group
 */

export type RadioItem = {
  label: React.ReactNode // what the option is called; names the radio
  value: string // unique value
  description?: React.ReactNode // helper content below the label
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
  badge?: React.ReactNode // card only: a tag beside the label, e.g. "Save 15%"
  rightSection?: React.ReactNode // card only: trailing content, e.g. the price
}

export type RadioProps = {
  label?: React.ReactNode // label content; names the radio
  description?: React.ReactNode // helper content below the label
  value?: string // radio value for group selection
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
  bordered?: boolean // adds border around radio wrapper
  checked?: boolean // controlled checked state (standalone only)
  defaultChecked?: boolean // uncontrolled initial state (standalone only)
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
  card?: boolean // each item is a selectable card; the whole card is the radio
  onChange?: (value: string) => void // fires when selection changes
  ariaLabel?: string // accessible name of the radiogroup when no visible legend names it
}
