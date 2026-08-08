/**
 * Sheet
 *
 * Slide-out drawer panel from any edge of the viewport.
 * Same compound structure as Modal (Header, Body, Footer).
 *
 * Behavior:
 * - Side: slides in from right (default), left, top, or bottom
 * - Width: 75% on mobile, max-w-sm on desktop (for left/right sides)
 * - Overlay: fixed black/80 background
 * - Header: sticky top with optional close button and bordered bottom
 * - Body: scrollable content area, constrained within viewport for top/bottom sheets
 * - Footer: sticky bottom with optional bordered top
 * - Clicking overlay or pressing Escape closes the sheet
 *
 * Implementation:
 * - Use Radix UI Dialog primitives (same as Modal, with slide animation)
 * - Animation: slide in from side direction (500ms open, 300ms close)
 * - Sheet.Header supports nested dot notation: Sheet.Header.Title, Sheet.Header.Description
 * - <Sheet open={show} side="right" onChange={setShow}>
 *     <Sheet.Header closable bordered>
 *       <Sheet.Header.Title>Filters</Sheet.Header.Title>
 *     </Sheet.Header>
 *     <Sheet.Body>filter controls...</Sheet.Body>
 *     <Sheet.Footer bordered><Button>Apply</Button></Sheet.Footer>
 *   </Sheet>
 *
 * Dependencies: @radix-ui/react-dialog, @turystack/react-icons (X icon)
 */

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type SheetProps = {
  open?: boolean // controlled open state
  side?: SheetSide // which side the sheet slides from
  size?: SheetSize // popup max-width (only applies to side='left' | 'right'; default preserves sm:max-w-sm)
  onChange?: (open: boolean) => void // fires on open/close
}

export type SheetHeaderProps = {
  closable?: boolean // shows close button
  bordered?: boolean // adds bottom border
}

export type SheetTitleProps = {}

export type SheetDescriptionProps = {}

export type SheetBodyProps = {
  minHeight?: string | number // minimum body height
}

export type SheetFooterProps = {
  bordered?: boolean // adds top border
}
