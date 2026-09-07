/**
 * EditableText
 *
 * Shows a value and turns into a field when the reader wants to change it.
 *
 * Behavior:
 * - Click (or double click, or a pencil, by `trigger`) opens the editor on the
 *   spot; Escape puts the old value back; Enter commits
 * - The editor is whatever the caller renders. Passing no children gives an
 *   Input — or a Textarea with `multiline` — and passing a function gives the
 *   editing state to any control in the library: CurrencyInput, DateInput,
 *   Select. There is no list of supported inputs here, because a list is a
 *   promise this component cannot keep for the input it has never heard of
 * - `onSave` may return a promise: the editor stays open and blocked while it
 *   runs, and a rejection keeps it open with the reason, rather than throwing
 *   the reader's typing away
 * - Validation is not this component's: `error` shows a message the app owns —
 *   the same prop name Form.Field takes, so a react-hook-form `fieldState`
 *   wires straight through — and `onSave` refuses a commit by throwing, sync or
 *   async. There is no `validate` prop, because the rules already live in the
 *   feature's schema and a second place to write them is a second place to
 *   forget them
 * - Whether it is open is a normal controlled/uncontrolled pair, so a page can
 *   open one row from outside
 * - `layout` decides what happens to the page around it. In `flow` the value is
 *   plain text and the editor is taller and wider than the text it replaces, so
 *   opening one moves what is below it. In `stable` nothing moves, ever: the
 *   value already sits in the field's own box, and anything whose height this
 *   component cannot dictate — a Textarea that grows, a caller's Select — is
 *   drawn over that box instead of inside it
 *
 * Implementation:
 * - The resting box is styled from `inputShared`, the same tailwind-variants
 *   the Input is built from, so height, padding, border and type scale cannot
 *   drift between the two states
 * - `stable` fills its container: a box whose width is the value's would still
 *   reflow when a longer value is saved, which is the same bug arriving later
 * - <EditableText onSave={saveName} value={name} />
 * - <EditableText layout="stable" onSave={savePrice} renderValue={(v) => <MoneyText value={v} />} value={price}>
 *     {({ value, onChange }) => <CurrencyInput onChange={onChange} value={value} variant="brl" />}
 *   </EditableText>
 *
 * Dependencies: Input, Textarea, Button, Loader, LabelsProvider, FormatterText
 */

import type { InputSize } from '@/components/input/input.types'
import type {
  TypographyAlign,
  TypographyComponent,
  TypographySize,
  TypographyWeight,
} from '@/components/typography/typography.types'

export type EditableTextLayout = 'flow' | 'stable'

export type EditableTextTrigger = 'click' | 'doubleClick' | 'icon'

export type EditableTextSubmitOn = 'enter' | 'blur' | 'action'

export type EditableTextEditorState<T> = {
  autoFocus: boolean // always true: the editor opened because someone asked to type
  disabled: boolean // true while a save is in flight
  error: React.ReactNode // why the last attempt was refused
  invalid: boolean // whether the current draft was refused
  onCancel: () => void // restores the previous value and closes
  onChange: (value: T) => void // updates the draft
  onCommit: () => void // validates, saves and closes
  size: InputSize // the field size the resting box reserved, in stable layout
  value: T // the draft
}

type EditableTextBaseProps<T> = {
  actions?: boolean // renders confirm/cancel buttons beside the editor
  ariaLabel?: string // names the field for assistive technology
  children?: (state: EditableTextEditorState<T | null>) => React.ReactNode // the editor
  copyable?: boolean // adds a control that copies the displayed value
  defaultEditing?: boolean // uncontrolled initial open state
  defaultValue?: T | null // uncontrolled initial value
  destructive?: boolean // renders the value in the error colour
  disabled?: boolean // refuses to open
  error?: React.ReactNode // a message the app owns, as on Form.Field
  editing?: boolean // controlled open state
  loading?: boolean // a save the page owns is in flight
  multiline?: boolean // default editor becomes a Textarea
  muted?: boolean // renders the value in the muted foreground colour
  onChange?: (value: T | null) => void // fires on commit, with the value
  onEditingChange?: (editing: boolean) => void // fires when the editor opens or closes
  onSave?: (value: T | null) => void | Promise<void> // commit, possibly async
  placeholder?: string // stands in for an empty value
  renderValue?: (value: T | null) => React.ReactNode // custom display
  submitOn?: EditableTextSubmitOn[] // what commits; default enter and blur
  tooltip?: boolean // reveals the displayed value on hover
  trigger?: EditableTextTrigger // what opens the editor; default click
  truncate?: boolean // truncates the displayed value with an ellipsis
  value?: T | null // controlled value
}

export type EditableTextFlowProps<T> = EditableTextBaseProps<T> & {
  align?: TypographyAlign // text alignment
  component?: TypographyComponent // element the value renders as
  layout?: 'flow'
  size?: TypographySize // font size preset for the displayed value
  weight?: TypographyWeight // font weight for the displayed value
}

/**
 * The stable layout drops the typography props rather than ignoring them. The
 * field carries its own type scale, and this component cannot overrule it
 * without a `className` it does not have — so a `size="2xl"` value would shrink
 * to the field's `text-sm` on the first click, which is the exact thing this
 * layout exists to prevent. The compiler refuses the combination instead.
 */
export type EditableTextStableProps<T> = EditableTextBaseProps<T> & {
  layout: 'stable'
  size?: InputSize // field size the box reserves; sm 36px, md 40px, lg 44px
}

export type EditableTextProps<T = string> =
  | EditableTextFlowProps<T>
  | EditableTextStableProps<T>
