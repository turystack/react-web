/**
 * Box
 *
 * Generic layout container with preset styling tokens for spacing,
 * background, border-radius, and positioning. The foundational building block.
 *
 * Behavior:
 * - Maps props directly to Tailwind utility classes
 * - paddingX/paddingY override uniform padding for specific axes
 * - grow enables flex-grow: 1 within flex containers
 * - All values use design tokens (not arbitrary values)
 *
 * Implementation:
 * - tailwind-variants (tv) mapping each prop to corresponding Tailwind classes
 * - Renders a <div> with computed className
 * - <Box bg="muted" padding="md" rounded="lg">Content</Box>
 *
 * Dependencies: none (pure CSS utility)
 */

export type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type BoxBg = 'background' | 'muted' | 'card'

export type BoxRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type BoxWidth = 'auto' | 'full'

export type BoxMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type BoxPosition = 'static' | 'relative' | 'absolute'

export type BoxOverflow = 'hidden' | 'visible' | 'auto'

export type BoxTextAlign = 'left' | 'center' | 'right'

export type BoxProps = {
  bg?: BoxBg // background color using theme tokens
  grow?: boolean // flex-grow: 1
  minHeight?: BoxMinHeight // minimum height preset
  overflow?: BoxOverflow // CSS overflow behavior
  padding?: BoxPadding // uniform padding
  paddingX?: BoxPadding // horizontal padding override
  paddingY?: BoxPadding // vertical padding override
  position?: BoxPosition // CSS position property
  rounded?: BoxRounded // border-radius preset
  textAlign?: BoxTextAlign // text alignment
  width?: BoxWidth // width preset
}
