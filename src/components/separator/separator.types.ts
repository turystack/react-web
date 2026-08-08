/**
 * Separator
 *
 * Visual divider line between content sections.
 * Supports horizontal and vertical orientations.
 *
 * Behavior:
 * - Horizontal: full-width line (height 1px)
 * - Vertical: full-height line (width 1px)
 * - Decorative mode: aria-hidden for screen readers (purely visual)
 *
 * Implementation:
 * - Use Radix UI Separator for proper ARIA role="separator"
 * - <Separator orientation="horizontal" />
 * - <Flex><SideA /><Separator orientation="vertical" /><SideB /></Flex>
 *
 * Dependencies: @radix-ui/react-separator
 */

import type React from 'react'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export type SeparatorProps = React.ComponentProps<'div'> & {
  orientation?: SeparatorOrientation // line direction
  decorative?: boolean // if true, not announced by screen readers
}
