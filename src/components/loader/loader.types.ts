/**
 * Loader
 *
 * Animated spinner icon for loading states.
 * Used standalone or composed into other components (Input, Button, LoadingOverlay).
 *
 * Behavior:
 * - Continuous spin animation (CSS animate-spin)
 * - Size variants: sm (16px), md (24px), lg (32px)
 *
 * Implementation:
 * - Use Lucide Loader2 icon with animate-spin class
 * - <Loader size="md" />
 *
 * Dependencies: @turystack/react-icons (Loader2)
 */

export type LoaderSize = 'sm' | 'md' | 'lg'

export type LoaderProps = {
  size?: LoaderSize // controls spinner dimensions
}
