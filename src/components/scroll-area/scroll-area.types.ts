/**
 * ScrollArea
 *
 * A scrollable region with a scrollbar the design system owns.
 *
 * Behavior:
 * - The native scrollbar is replaced, not hidden: the region still scrolls with
 *   the wheel, the keyboard and a trackpad, and the thumb is a real control
 * - It takes the height it is given. There is no `height` prop, because a
 *   scroll region without a bounded parent is a region that never scrolls, and
 *   a number here would be layout leaking into a component's API
 * - `orientation` says which way it may scroll; both is for a wide table inside
 *   a short panel
 *
 * Implementation:
 * - Base UI ScrollArea
 * - <Box height="sm"><ScrollArea>…</ScrollArea></Box>
 *
 * Dependencies: @base-ui/react/scroll-area
 */

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

export type ScrollAreaProps = {
  orientation?: ScrollAreaOrientation // which way it scrolls; default vertical
}
