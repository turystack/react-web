/**
 * Badge
 *
 * Small inline label for status indicators, counts, or categories.
 * Supports loading state with a spinner overlay.
 *
 * Behavior:
 * - Displays as inline-flex, rounded-full pill shape
 * - Loading state: content becomes invisible, spinner overlays center
 * - Variants: default (primary bg), secondary, destructive (red), outline (border only)
 * - Block mode makes badge full-width
 * - asChild enables polymorphic rendering via Radix Slot
 *
 * Implementation:
 * - Use class-variance-authority (cva) or tailwind-variants for variant styling
 * - Radix UI Slot for asChild polymorphism
 * - Loading renders Loader component absolutely centered over invisible children
 * - <Badge variant="destructive" loading>Error</Badge>
 *
 * Dependencies: @radix-ui/react-slot, @turystack/react-icons (Loader2 for loading)
 */

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'solid'
  | 'solid-destructive'
  | 'solid-success'
  | 'solid-info'
  | 'purple'
  | 'pink'
  | 'teal'
  | 'orange'

export type BadgeAlign = 'start' | 'center' | 'end'

export type BadgeProps = {
  variant?: BadgeVariant // visual style variant
  align?: BadgeAlign // text alignment inside the badge
  block?: boolean // makes badge full-width
  loading?: boolean // shows loading state
  asChild?: boolean // render as child element via Slot
  onClick?: React.MouseEventHandler<HTMLDivElement> // click handler
}
