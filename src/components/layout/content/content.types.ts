/**
 * Layout.Content
 *
 * Scrollable inner content area with optional width constraints and padding.
 *
 * Behavior:
 * - Scrollable overflow area within Layout.Main
 * - maxWidth constrains inner content: xs (384px), sm (672px), md (896px),
 *   lg (1280px)
 * - padding/paddingHorizontal/paddingVertical control spacing
 * - Inside `<Layout variant="centered">` the inner column centres on both
 *   axes and `maxWidth` defaults to `xs` — the width of a sign-in card
 * - `bg` paints the pane, for a Content that is a surface of its own: the
 *   brand side of a split screen, a muted canvas for cards
 * - `span` is its share of the row when Layout.Main holds several Contents:
 *   `span={3}` beside `span={2}` is a 60/40 split. Stacked below `md`, where
 *   the panes are full width, it has no effect
 * - `id` sits on the scrolling pane, so a skip link can land on one pane of
 *   a split screen rather than on the whole of Layout.Main
 *
 * Implementation:
 * - Outer div: overflow-y-auto, flex-grow
 * - Inner div: mx-auto with max-width constraint
 * - <Layout.Content maxWidth="md" padding="lg">Page content</Layout.Content>
 * - <Layout.Content id="content">Page content</Layout.Content>
 *
 * Dependencies: none
 */

import type { LayoutPadding } from '../layout.types'

/** The shell's own gutter scale, not a copy of it — two unions drift. */
export type LayoutContentPadding = LayoutPadding

export type LayoutContentMaxWidth = 'xs' | 'sm' | 'md' | 'lg'

export type LayoutContentBg = 'background' | 'muted' | 'card' | 'gradient'

/** Shares of Layout.Main's row, when it holds more than one Content. */
export type LayoutContentSpan = 1 | 2 | 3 | 4

export type LayoutContentProps = {
  padding?: LayoutContentPadding // both axes; falls back to the shell's
  paddingHorizontal?: LayoutContentPadding // one axis over `padding`; off the shell's edge if it differs
  paddingVertical?: LayoutContentPadding // one axis over `padding`
  maxWidth?: LayoutContentMaxWidth // constrains inner content max-width; xs when centered
  bg?: LayoutContentBg // paints the pane: background, muted, card or a muted gradient
  span?: LayoutContentSpan // shares of Main's row beside other Contents; default 1
  id?: string // id of the scrolling pane, the target of a skip link; default none
}
