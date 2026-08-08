/**
 * Skeleton
 *
 * Placeholder loading animation that mimics content shape.
 * Dimensions and shape are controlled entirely via className.
 *
 * Behavior:
 * - Renders a pulsing muted rectangle
 * - Shape/size defined by className: h-4 w-[200px] rounded-full, etc.
 * - Block display with full width/height within its box
 *
 * Implementation:
 * - Single <div> with animate-pulse, bg-muted, rounded-md
 * - <Skeleton className="h-4 w-[250px]" />
 * - <Skeleton className="h-12 w-12 rounded-full" /> for circular avatar placeholder
 *
 * Dependencies: none (pure CSS animation)
 */

export type SkeletonProps = {
  className?: string // custom dimensions/shape via CSS classes (e.g. h-4 w-[200px] rounded-full)
  style?: React.CSSProperties
}
