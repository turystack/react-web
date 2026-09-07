import { tv } from 'tailwind-variants'
import { useLabels } from '@/components/labels-provider'
import { Loader2 } from '@/internal/icons'

import type { LoaderProps } from './loader.types'

const loader = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    icon: 'loader-icon animate-spin text-muted-foreground',
    root: 'loader inline-flex shrink-0 items-center justify-center',
  },
  variants: {
    size: {
      lg: {
        icon: 'size-8',
        root: 'size-8',
      },
      md: {
        icon: 'size-6',
        root: 'size-6',
      },
      sm: {
        icon: 'size-4',
        root: 'size-4',
      },
    },
  },
})

function Loader({ decorative, label, size }: LoaderProps) {
  const labels = useLabels()
  const { icon, root } = loader({
    size,
  })

  if (decorative) {
    return (
      <span aria-hidden className={root()} data-testid="loader">
        <Loader2 className={icon()} />
      </span>
    )
  }

  return (
    <span className={root()} data-testid="loader" role="status">
      <Loader2 className={icon()} />
      <span className="loader-label sr-only">
        {label ?? labels.loader.loading}
      </span>
    </span>
  )
}

export { Loader }
