import { tv } from 'tailwind-variants'

import type { SkeletonProps } from './skeleton.types'

const skeleton = tv({
  base: 'skeleton animate-pulse rounded-md bg-muted',
})

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={skeleton({
        className,
      })}
      data-testid="skeleton"
      {...props}
    />
  )
}

export { Skeleton }
