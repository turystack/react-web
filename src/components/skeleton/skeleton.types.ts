/**
 * Skeleton
 *
 * Placeholder loading animation that mimics content shape.
 * Size and shape come from the contract, not from CSS.
 *
 * Behavior:
 * - Renders a pulsing muted block
 * - Width and height are picked from a token scale; both have a default, so a
 *   Skeleton with no props is already visible
 * - Shape decides the corner treatment; circle keeps a 1:1 ratio from height
 *
 * Implementation:
 * - Single <div> with animate-pulse, bg-muted
 * - <Skeleton width="lg" />
 * - <Skeleton height="sm" shape="circle" width="xs" /> for an avatar placeholder
 * - <Skeleton height="xl" /> for a card placeholder
 *
 * Dependencies: none (pure CSS animation)
 */

export type SkeletonShape = 'rectangle' | 'circle' | 'text'

export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type SkeletonProps = {
  height?: SkeletonSize // vertical size on the token scale (default 'sm')
  shape?: SkeletonShape // corner treatment (default 'rectangle')
  width?: SkeletonSize // horizontal size on the token scale (default 'full')
}
