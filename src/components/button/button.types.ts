/**
 * Button
 *
 * Primary interactive element for actions and form submissions.
 * Supports multiple visual variants, sizes, and loading state.
 *
 * Behavior:
 * - Variants: default (primary), destructive, outline, dashed, secondary, ghost, link
 * - Sizes: sm, md, lg for text buttons; icon-sm, icon-md, icon-lg for icon-only
 * - Loading state disables interaction and shows a spinner replacing leftSection
 * - leftSection/rightSection render icons or elements beside the label
 * - Block mode makes button full-width
 * - asChild polymorphism for rendering as anchor or custom element
 * - Active state: translateY 1px for press feedback
 * - Focus: visible ring with ring-ring/50
 *
 * Implementation:
 * - Use @base-ui/react Button primitive (or Radix Slot for asChild)
 * - class-variance-authority (cva) for variant × size matrix
 * - cn() utility for className merging
 * - <Button variant="outline" size="sm" loading leftSection={<Icon />}>Save</Button>
 *
 * Dependencies: @base-ui/react/button (or @radix-ui/react-slot), class-variance-authority
 */

export type ButtonType = 'button' | 'submit' | 'reset'

export type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-md'
  | 'icon-lg'

export type ButtonVariant =
  | 'default'
  | 'dark'
  | 'destructive'
  | 'outline'
  | 'dashed'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'link-muted'

export type ButtonProps = {
  ariaLabel?: string // accessible name for icon-only buttons
  form?: string // associates button with a form by id
  type?: ButtonType // HTML button type attribute
  size?: ButtonSize // visual size variant
  variant?: ButtonVariant // visual style variant
  leftSection?: React.ReactNode // element rendered before label (e.g. icon)
  rightSection?: React.ReactNode // element rendered after label (e.g. icon)
  block?: boolean // makes button full-width
  loading?: boolean // shows loading spinner and disables interaction
  disabled?: boolean // prevents interaction
  asChild?: boolean // render as child element via Slot
  className?: string // extra classes merged onto the button
  onClick?: React.MouseEventHandler<HTMLButtonElement> // click handler
}
