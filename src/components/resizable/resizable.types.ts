/**
 * Resizable
 *
 * Panels the reader can resize, with a handle between them.
 *
 * Behavior:
 * - Sizes are percentages, not pixels, so a layout keeps its proportions when
 *   the window changes rather than leaving one panel stranded
 * - The handle is keyboard operable — arrows move it — because a split view
 *   that only answers to a drag is one more thing a keyboard cannot reach
 * - Sizes are read as percentages. The library underneath reads a bare number
 *   as pixels and a bare string as a percentage, which is the kind of unit
 *   trap that ships a 30px sidebar someone meant to be 30% — so this contract
 *   takes numbers and means percent, every time
 * - Persistence is the app's: `defaultLayout` sets the starting sizes and
 *   `onChange` reports them, so whatever already stores this user's
 *   preferences stores this too. A component that quietly wrote to
 *   localStorage would be a second place state lives
 * - A collapsible panel snaps shut at its minimum instead of becoming a
 *   sliver nobody can grab again
 *
 * Implementation:
 * - react-resizable-panels underneath, which owns the element ids and mirrors
 *   them onto `data-testid`. Query these by `data-group`, `data-panel` and
 *   `data-separator` instead — those are the handles that survive
 * - <Resizable defaultLayout={saved} onChange={save}>
 *     <Resizable.Panel defaultSize={30} minSize={20}>list</Resizable.Panel>
 *     <Resizable.Handle withGrip />
 *     <Resizable.Panel>detail</Resizable.Panel>
 *   </Resizable>
 *
 * Dependencies: react-resizable-panels
 */

export type ResizableDirection = 'horizontal' | 'vertical'

/** Every panel's size, keyed by its id — what `onChange` reports back. */
export type ResizableLayout = Record<string, number>

export type ResizableProps = {
  defaultLayout?: ResizableLayout // starting sizes, usually the ones you stored
  direction?: ResizableDirection // default horizontal
  disabled?: boolean // pins every panel in the group
  onChange?: (layout: ResizableLayout) => void // fires while a panel resizes
}

export type ResizablePanelProps = {
  collapsedSize?: number // percentage it collapses to; default 0
  collapsible?: boolean // snaps shut at its minimum
  defaultSize?: number // starting percentage
  id?: string // names the panel in the layout this group reports
  maxSize?: number // percentage it cannot grow past
  minSize?: number // percentage it cannot shrink past
}

export type ResizableHandleProps = {
  disabled?: boolean // pins the panels where they are
  withGrip?: boolean // draws a grip, for a handle that is otherwise a hairline
}
