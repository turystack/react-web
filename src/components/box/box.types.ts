/**
 * Box
 *
 * Generic layout container with preset styling tokens for spacing,
 * background, border-radius, and positioning. The foundational building block.
 *
 * Behavior:
 * - Maps props directly to Tailwind utility classes
 * - paddingX/paddingY override uniform padding for specific axes
 * - padding scale: xs 4px, sm 8px, md 16px, lg 24px, xl 32px, 2xl 64px,
 *   3xl 96px — the two top steps are section rhythm (a landing band is
 *   paddingY="2xl" or "3xl"), the same 64/96px the showcase sections use
 * - grow enables flex-grow: 1 within flex containers
 * - hideBelow / hideAbove show or hide the box per Tailwind breakpoint
 *   (sm 640px, md 768px, lg 1024px, xl 1280px): hideBelow="md" is gone on a
 *   phone and a block again from 768px; hideAbove="md" is there on a phone
 *   and gone from 768px. The pair is how a header swaps its links for a menu
 *   button. Both together show it only between the two (hideBelow must be
 *   the smaller breakpoint, or it is never shown). Hidden is display: none,
 *   so it leaves the accessibility tree too
 * - id lands on the element, so a Box can be an in-page anchor target
 *   (AnchorNav, `#pricing` links) without a wrapper
 * - position="sticky" makes a sticky surface (a filter bar, a table
 *   toolbar, a summary rail): it stacks above the content it scrolls over
 *   (z-30) and below the app chrome (Layout.Footer z-40, Layout.Header z-50).
 *   Give it a bg so the content does not show through
 * - offset (sticky only) says where it pins: none (default) at the top of
 *   the scroll container; header just below the sticky app header — the
 *   first sticky or fixed `.layout-header`/`<header>`, measured and followed
 *   as it resizes, the same header AnchorNav clears. Before it is measured
 *   (server render) it sits at the default Layout.Header height
 * - All values use design tokens (not arbitrary values)
 *
 * Implementation:
 * - tailwind-variants (tv) mapping each prop to corresponding Tailwind classes
 * - Renders a <div> with computed className
 * - <Box bg="muted" padding="md" rounded="lg">Content</Box>
 * - <Box bg="background" offset="header" paddingY="sm" position="sticky">Filters</Box>
 * - <Box hideAbove="md"><MenuButton /></Box>
 *
 * Dependencies: none (CSS utility; offset="header" measures the sticky header)
 */

export type BoxPadding =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'

export type BoxBg = 'background' | 'muted' | 'card'

export type BoxRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type BoxWidth = 'auto' | 'full'

export type BoxMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type BoxPosition = 'static' | 'relative' | 'absolute' | 'sticky'

export type BoxOffset = 'none' | 'header'

export type BoxOverflow = 'hidden' | 'visible' | 'auto'

export type BoxBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

export type BoxTextAlign = 'left' | 'center' | 'right'

export type BoxProps = {
  bg?: BoxBg // background color using theme tokens
  grow?: boolean // flex-grow: 1
  hideAbove?: BoxBreakpoint // hidden from this breakpoint up
  hideBelow?: BoxBreakpoint // hidden below this breakpoint, a block from it on
  id?: string // DOM id, the target of an in-page anchor link
  minHeight?: BoxMinHeight // minimum height preset
  offset?: BoxOffset // where a sticky box pins: top (none, default) or below the sticky app header
  overflow?: BoxOverflow // CSS overflow behavior
  padding?: BoxPadding // uniform padding
  paddingX?: BoxPadding // horizontal padding override
  paddingY?: BoxPadding // vertical padding override
  position?: BoxPosition // CSS position property
  rounded?: BoxRounded // border-radius preset
  textAlign?: BoxTextAlign // text alignment
  width?: BoxWidth // width preset
}
