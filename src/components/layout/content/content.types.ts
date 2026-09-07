/**
 * Layout.Content
 *
 * Scrollable inner content area with optional width constraints and padding.
 *
 * Behavior:
 * - Scrollable overflow area within Layout.Main
 * - maxWidth constrains inner content: sm (672px), md (896px), lg (1280px)
 * - padding/paddingHorizontal/paddingVertical control spacing
 *
 * Implementation:
 * - Outer div: overflow-y-auto, flex-grow
 * - Inner div: mx-auto with max-width constraint
 * - <Layout.Content maxWidth="md" padding="lg">Page content</Layout.Content>
 *
 * Dependencies: none
 */

export type LayoutContentPadding = 'none' | 'sm' | 'md' | 'lg'

export type LayoutContentMaxWidth = 'sm' | 'md' | 'lg'

export type LayoutContentProps = {
  padding?: LayoutContentPadding // uniform padding
  paddingHorizontal?: LayoutContentPadding // horizontal padding override
  paddingVertical?: LayoutContentPadding // vertical padding override
  maxWidth?: LayoutContentMaxWidth // constrains inner content max-width
}
