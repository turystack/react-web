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
 * - Width: auto (default) fits the content, sm/md/lg are fixed presets (the
 *   same scale as Select and SpotlightSearch, capped by the room on screen),
 *   trigger matches the anchor's width
 * - Clicking outside closes the popover
 * - asChild: the single element child (a Button) IS the trigger — one control,
 *   one accessible name. Without it (or with non-element children) the
 *   children are wrapped in a span role="button" that toggles the popup. The
 *   picker fields (DateInput, DateRangeInput, DateTimeInput, CurrencyInput
 *   range) no longer use that wrapper: each opens from a real button beside
 *   its field and anchors the popup to the whole field
 * - ariaLabel names that wrapper trigger, which otherwise takes its name from
 *   whatever it wraps (nothing, when it wraps an empty field); with asChild
 *   the consumer's own control carries its name and ariaLabel is not used
 *
 * Implementation:
 * - Use Base UI Popover primitives (Root, Trigger, Portal, Positioner, Popup)
 * - Animation: zoom from 95%, fade in
 * - Content prop pattern (not render-prop): content is a ReactNode
 * - <Popover asChild content={<div>Popover content</div>} side="bottom" align="start" width="md">
 *     <Button>Open</Button>
 *   </Popover>
 *
 * Dependencies: @base-ui/react/popover
 */

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

export type PopoverAlign = 'start' | 'center' | 'end'

export type PopoverWidth = 'auto' | 'sm' | 'md' | 'lg' | 'trigger'

export type PopoverProps = {
  content: React.ReactNode // popover content (required)
  asChild?: boolean // the single element child becomes the trigger itself instead of being wrapped
  ariaLabel?: string // accessible name of the wrapper trigger (unused with asChild)
  // open/onOpenChange exposed for internal use by components with draft state (e.g. CurrencyInput range mode)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverSide // preferred side for placement
  sideOffset?: number // distance from trigger in px
  align?: PopoverAlign // alignment relative to trigger
  width?: PopoverWidth // popup width: auto (default) fits content, sm/md/lg presets, trigger matches the anchor
}
