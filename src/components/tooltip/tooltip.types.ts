/**
 * Tooltip
 *
 * Lightweight hover hint that shows contextual information.
 * Appears on hover/focus after a configurable delay.
 *
 * Behavior:
 * - Appears after delayDuration (ms) on hover/focus
 * - Positions to specified side with arrow indicator
 * - Renders in a Portal for z-index isolation
 * - Disappears on mouse leave / blur
 * - Content can be text or ReactNode
 *
 * Implementation:
 * - Use Radix UI Tooltip primitives (Provider, Root, Trigger, Portal, Content)
 * - Arrow with CSS transform for directional pointing
 * - Animation: fade-in + slight slide from opposite side
 * - <Tooltip content="Save changes" side="top" delayDuration={200}>
 *     <Button>💾</Button>
 *   </Tooltip>
 *
 * Dependencies: @radix-ui/react-tooltip
 */

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

export type TooltipProps = {
  content: React.ReactNode // tooltip content (required)
  side?: TooltipSide // preferred placement side
  sideOffset?: number // distance from trigger in px
  delayDuration?: number // delay before showing in ms
}
