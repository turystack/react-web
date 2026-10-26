/**
 * LoadingOverlay
 *
 * A centered spinner over a busy container, which fades the container's
 * content instead of covering it.
 *
 * Behavior:
 * - visible=true shows the overlay; false hides it
 * - Positioned absolute, fills parent with z-50, and takes the pointer so the
 *   content under it cannot be used while it refreshes
 * - Paints no background. While visible, every sibling it shares its parent
 *   with drops to half opacity, so the content reads as busy on any surface
 *   and in either color scheme — a painted veil is a guess at the color
 *   underneath, and in dark mode over a card it guessed black
 * - Centered Loader component
 *
 * Implementation:
 * - Parent must have position: relative for overlay to contain
 * - hidden class when visible=false
 * - The fade is one rule in the stylesheet, keyed on the overlay being a
 *   direct child that is busy: `:has(> .loading-overlay-root[aria-busy=true])`
 * - <div style={{ position: "relative" }}>
 *     <LoadingOverlay visible={loading} />
 *     {content}
 *   </div>
 *
 * Dependencies: Loader component
 */

export type LoadingOverlayProps = {
  visible?: boolean // controls overlay visibility
}
