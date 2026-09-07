/**
 * Loader
 *
 * Animated spinner icon for loading states.
 * Used standalone or composed into other components (Input, Button, LoadingOverlay).
 *
 * Behavior:
 * - Continuous spin animation (CSS animate-spin)
 * - Size variants: sm (16px), md (24px), lg (32px)
 * - Announced as a live status region; the spinning glyph itself is decorative
 * - Decorative mode drops the region, for a host that reports its own busy state
 *
 * Implementation:
 * - Use Lucide Loader2 icon with animate-spin class
 * - <Loader size="md" />
 * - <Loader label="Uploading photos" />
 *
 * Dependencies: @turystack/react-icons (Loader2)
 */

export type LoaderSize = 'sm' | 'md' | 'lg'

export type LoaderProps = {
  decorative?: boolean // hides it from assistive technology, for a host control that already reports its own busy state
  label?: string // what the status region announces; defaults to the provider label
  size?: LoaderSize // controls spinner dimensions
}
