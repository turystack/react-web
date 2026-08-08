/**
 * Layout.Footer
 *
 * Bottom bar for actions, pagination, or status info.
 *
 * Behavior:
 * - Sticky prop fixes footer at bottom with z-index
 * - Bordered adds top border
 * - Size: sm (40px), md (56px), lg (64px)
 *
 * Implementation:
 * - Renders <footer> with flex layout
 * - <Layout.Footer sticky bordered size="sm">Footer content</Layout.Footer>
 *
 * Dependencies: none
 */

export type LayoutFooterProps = {
  bordered?: boolean // adds top border
  sticky?: boolean // makes footer sticky at bottom
  size?: 'sm' | 'md' | 'lg' // controls footer height
}
