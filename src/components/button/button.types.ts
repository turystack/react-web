/**
 * Button
 *
 * Primary interactive element for actions and form submissions.
 * Supports multiple visual variants, sizes, and loading state.
 *
 * Behavior:
 * - Variants: default (primary), dark, destructive, outline, dashed, secondary, ghost, link, link-muted
 * - Sizes: sm, md, lg for text buttons; icon-sm, icon-md, icon-lg for icon-only
 * - Loading state disables interaction and shows a spinner replacing leftSection
 * - leftSection/rightSection render icons or elements beside the label
 * - Block mode makes button full-width
 * - asChild polymorphism for rendering as a custom element
 * - href renders a real link (<a>, role link) with the same variants and
 *   sizes — the link primitive. `external` opens it in a new tab with
 *   rel="noopener noreferrer". A disabled or loading link drops its href,
 *   keeps role link with aria-disabled="true" and leaves the tab order, so it
 *   cannot navigate. `type` and `form` do not apply to a link; with asChild
 *   the child element wins over href
 * - link and link-muted variants take the text's box (no side padding, auto
 *   height) so they sit inline with the words around them; link-muted is
 *   muted text that turns foreground on hover
 * - current marks the button or link as the current item for assistive
 *   technology (aria-current): 'page' for the link to the page on screen (a
 *   top-bar or sidebar nav), 'location' for a step in a flow, true for the
 *   current item of any other set. The ghost, link and link-muted variants
 *   also hold a subtle active look (ghost keeps its hover tint, link keeps its
 *   underline, link-muted turns foreground)
 * - disabledReason blocks the button or link like `disabled` and says why: it
 *   stays in the tab order (aria-disabled, not the attribute), a tooltip
 *   shows the reason on hover and on keyboard focus, and the button is
 *   described by it, so a screen reader hears it too (ARC-ERR-9). Clicks,
 *   Enter and Space do nothing
 * - Active state: translateY 1px for press feedback
 * - Focus: visible ring with ring-ring/50
 *
 * Implementation:
 * - Use @base-ui/react Button primitive (or Radix Slot for asChild)
 * - class-variance-authority (cva) for variant × size matrix
 * - cn() utility for className merging
 * - <Button variant="outline" size="sm" loading leftSection={<Icon />}>Save</Button>
 * - <Button href="/settings" variant="link">Settings</Button>
 * - <Button current={pathname === '/orders' && 'page'} href="/orders" variant="ghost">Orders</Button>
 * - <Button external href="https://docs.example.com" variant="link-muted">Docs</Button>
 * - <Button disabledReason="Only owners can delete" variant="destructive">Delete</Button>
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

export type ButtonCurrent = boolean | 'page' | 'location'

export type ButtonProps = {
  ariaLabel?: string // accessible name for icon-only buttons
  'data-testid'?: string // testing handle; defaults to "button"
  form?: string // associates button with a form by id
  type?: ButtonType // HTML button type attribute
  size?: ButtonSize // visual size variant
  variant?: ButtonVariant // visual style variant
  leftSection?: React.ReactNode // element rendered before label (e.g. icon)
  rightSection?: React.ReactNode // element rendered after label (e.g. icon)
  block?: boolean // makes button full-width
  loading?: boolean // shows loading spinner and disables interaction
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
  asChild?: boolean // render as child element via Slot
  href?: string // renders a link (<a>) with the same look instead of a button
  external?: boolean // with href: opens in a new tab (target _blank, rel noopener noreferrer)
  current?: ButtonCurrent // aria-current: 'page' in a nav, 'location' in a flow, true in any set
  className?: string // extra classes merged onto the button
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> // click handler (the <a> when href is set)
}
