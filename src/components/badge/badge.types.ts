/**
 * Badge
 *
 * Small inline label for status indicators, counts, or categories.
 * Supports loading state with a spinner overlay.
 *
 * Behavior:
 * - Displays as inline-flex, rounded-full pill shape
 * - Loading state: content becomes invisible, spinner overlays center, clicks blocked
 * - Variants: default (primary bg), secondary, destructive (red), outline (border only)
 * - Sizes: sm, md (default), lg — height, padding, type scale and icon/spinner size
 * - Block mode makes badge full-width
 * - onClick turns the badge into a button, so it is reachable by keyboard
 * - asChild renders the badge onto its single child element instead of a span
 *
 * Implementation:
 * - tailwind-variants for variant styling
 * - asChild clones the child and puts the badge content inside it
 * - Loading renders Loader component absolutely centered over invisible children
 * - <Badge variant="destructive" loading>Error</Badge>
 *
 * Dependencies: @turystack/react-icons (Loader2 for loading)
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

export type BadgeSize = 'sm' | 'md' | 'lg'

export type BadgeProps = {
  variant?: BadgeVariant // visual style variant
  align?: BadgeAlign // text alignment inside the badge
  size?: BadgeSize // visual size variant; default md
  block?: boolean // makes badge full-width
  loading?: boolean // shows loading state
  asChild?: boolean // renders the badge onto its single child element
  onClick?: React.MouseEventHandler<HTMLElement> // click handler
}
