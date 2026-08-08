/**
 * LoadingOverlay
 *
 * Semi-transparent overlay with centered spinner.
 * Covers the parent container to indicate loading state.
 *
 * Behavior:
 * - visible=true shows the overlay; false hides it
 * - Positioned absolute, fills parent with z-50
 * - Semi-transparent background (bg-background/80) with backdrop blur
 * - Centered Loader component
 *
 * Implementation:
 * - Parent must have position: relative for overlay to contain
 * - hidden class when visible=false
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
