/**
 * Separator
 *
 * Visual divider line between content sections.
 * Supports horizontal and vertical orientations.
 *
 * Behavior:
 * - Horizontal: full-width line (height 1px)
 * - Vertical: full-height line (width 1px)
 * - Spacing reserves room around the line, on the axis it divides
 * - Decorative mode: aria-hidden for screen readers (purely visual)
 *
 * Implementation:
 * - Use Base UI Separator for proper ARIA role="separator"
 * - <Separator orientation="horizontal" spacing="md" />
 * - <Flex><SideA /><Separator orientation="vertical" /><SideB /></Flex>
 *
 * Dependencies: @base-ui/react/separator
 */

export type SeparatorOrientation = 'horizontal' | 'vertical'

export type SeparatorSpacing = 'none' | 'sm' | 'md' | 'lg'

export type SeparatorProps = {
  decorative?: boolean // if true, drawn but not announced by screen readers
  orientation?: SeparatorOrientation // line direction
  spacing?: SeparatorSpacing // room reserved around the line
}
