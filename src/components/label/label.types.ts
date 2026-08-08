/**
 * Label
 *
 * Form field label with required/optional indicators and tooltip support.
 * Also exports WithLabelProps<T> generic for composing label into other components.
 *
 * Behavior:
 * - Required shows asterisk (*) indicator
 * - Optional shows "(optional)" text
 * - Tooltip renders an info icon that shows tooltip on hover
 * - htmlFor associates label with input for accessibility
 * - Disabled applies muted styling
 *
 * Implementation:
 * - Use Radix UI Label primitive for semantic <label>
 * - Tooltip integration with Info icon from @turystack/react-icons
 * - WithLabelProps<T> allows any component to accept label as string or LabelProps config
 * - <Label htmlFor="email" required tooltip="We will not share it">Email</Label>
 *
 * Dependencies: @radix-ui/react-label, @turystack/react-icons (Info icon), Tooltip component
 */

export type LabelProps = {
  htmlFor?: string // associates label with an input by id
  required?: boolean // shows required indicator (e.g. asterisk)
  optional?: boolean // shows optional indicator text
  disabled?: boolean // applies disabled styling
  tooltip?: React.ReactNode // tooltip content shown next to label
  className?: string // extra classes merged onto the label root
}

export type WithLabelProps<T> = T & {
  label?:
    | string
    | (LabelProps & {
        content?: string
      })
}
