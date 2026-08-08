import { tv } from 'tailwind-variants'
import { Loader2 } from '@/internal/icons'

import type { LoaderProps } from './loader.types'

const loader = tv({
  base: 'loader animate-spin text-muted-foreground',
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      lg: 'size-8',
      md: 'size-6',
      sm: 'size-4',
    },
  },
})

function Loader({ size }: LoaderProps) {
  return (
    <Loader2
      className={loader({
        size,
      })}
      data-testid="loader"
    />
  )
}

export { Loader }
