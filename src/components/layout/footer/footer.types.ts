import type { LayoutPadding } from '../layout.types'

/**
 * Layout.Footer
 *
 * Bottom bar for actions, pagination, or status info.
 *
 * Behavior:
 * - Sticky prop fixes footer at bottom with z-index and its own background
 * - Bordered adds top border
 * - Size: sm (40px), md (56px), lg (64px)
 *
 * Implementation:
 * - Renders <footer> with flex layout
 * - <Layout.Footer sticky bordered size="sm">Footer content</Layout.Footer>
 *
 * Dependencies: none
 */

export type LayoutFooterSize = 'sm' | 'md' | 'lg'

export type LayoutFooterProps = {
  bordered?: boolean // adds top border
  padding?: LayoutPadding // horizontal padding; falls back to the shell's
  sticky?: boolean // makes footer sticky at bottom, over its own background
  size?: LayoutFooterSize // controls footer height
}
