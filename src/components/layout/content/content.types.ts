/**
 * Layout.Content
 *
 * Scrollable inner content area with optional width constraints and padding.
 *
 * Behavior:
 * - Scrollable overflow area within Layout.Main
 * - maxWidth constrains inner content: sm (640px), md (896px), lg (1536px)
 * - padding/paddingHorizontal/paddingVertical control spacing
 *
 * Implementation:
 * - Outer div: overflow-y-auto, flex-grow
 * - Inner div: mx-auto with max-width constraint
 * - <Layout.Content maxWidth="md" padding="lg">Page content</Layout.Content>
 *
 * Dependencies: none
 */

export type LayoutContentProps = {
  padding?: 'sm' | 'md' | 'lg' // uniform padding
  paddingHorizontal?: 'sm' | 'md' | 'lg' // horizontal padding override
  paddingVertical?: 'sm' | 'md' | 'lg' // vertical padding override
  maxWidth?: 'sm' | 'md' | 'lg' // constrains inner content max-width
}
