/**
 * Popover
 *
 * Floating content panel anchored to a trigger element.
 * Used for menus, tooltips with interactive content, or inline forms.
 *
 * Behavior:
 * - Trigger click toggles popover visibility
 * - Content renders in a Portal for proper z-index stacking
 * - Side positioning: top, right, bottom, left (with sideOffset in px)
 * - Align: start, center, end relative to trigger
 * - Clicking outside closes the popover
 *
 * Implementation:
 * - Use Radix UI Popover primitives (Root, Trigger, Portal, Content)
 * - Animation: zoom from 95%, fade in
 * - Content prop pattern (not render-prop): content is a ReactNode
 * - <Popover content={<div>Popover content</div>} side="bottom" align="start">
 *     <Button>Open</Button>
 *   </Popover>
 *
 * Dependencies: @radix-ui/react-popover
 */

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

export type PopoverAlign = 'start' | 'center' | 'end'

export type PopoverProps = {
  content: React.ReactNode // popover content (required)
  // open/onOpenChange exposed for internal use by components with draft state (e.g. CurrencyInput range mode)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverSide // preferred side for placement
  sideOffset?: number // distance from trigger in px
  align?: PopoverAlign // alignment relative to trigger
  popupClassName?: string // className for the popover popup
}
