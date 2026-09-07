import { tv } from 'tailwind-variants'

import type { SkeletonProps } from './skeleton.types'

const skeleton = tv({
  base: 'skeleton animate-pulse bg-muted',
  compoundVariants: [
    {
      class: 'w-auto',
      shape: 'circle',
    },
  ],
  defaultVariants: {
    height: 'sm',
    shape: 'rectangle',
    width: 'full',
  },
  variants: {
    height: {
      full: 'h-full',
      lg: 'h-10',
      md: 'h-6',
      sm: 'h-4',
      xl: 'h-20',
      xs: 'h-2',
    },
    shape: {
      circle: 'aspect-square rounded-full',
      rectangle: 'rounded-md',
      text: 'rounded-sm',
    },
    width: {
      full: 'w-full',
      lg: 'w-48',
      md: 'w-32',
      sm: 'w-16',
      xl: 'w-64',
      xs: 'w-4',
    },
  },
})

function Skeleton({ height, shape, width }: SkeletonProps) {
  return (
    <div
      className={skeleton({
        height,
        shape,
        width,
      })}
      data-testid="skeleton"
    />
  )
}

export { Skeleton }
