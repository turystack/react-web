import { tv } from 'tailwind-variants'

import { Loader } from '@/components/loader'

import type { LoadingOverlayProps } from './loading-overlay.types'

const loadingOverlay = tv({
  slots: {
    root: 'loading-overlay-root absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity',
  },
  variants: {
    visible: {
      false: {
        root: 'hidden',
      },
    },
  },
})

function LoadingOverlay({ visible = false }: LoadingOverlayProps) {
  const { root } = loadingOverlay({
    visible,
  })

  return (
    <div className={root()} data-testid="loading-overlay-root">
      <Loader size="md" />
    </div>
  )
}

export { LoadingOverlay }
