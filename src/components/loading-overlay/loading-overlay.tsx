import { tv } from 'tailwind-variants'

import { Loader } from '@/components/loader'

import type { LoadingOverlayProps } from './loading-overlay.types'

const loadingOverlay = tv({
  slots: {
    // `rounded-[inherit]`, because the veil is a rectangle and its host is not.
    // `inset-0` stops at the padding box, so the border itself is never covered
    // — except at the corners, where a square sheet paints over the arc the
    // radius draws. The edges stayed crisp and the four corners washed out,
    // which reads as the whole border going transparent.
    root: 'loading-overlay-root absolute inset-0 z-50 flex items-center justify-center rounded-[inherit] bg-background/80 transition-opacity',
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
    <div
      aria-busy={visible}
      aria-hidden={!visible}
      className={root()}
      data-testid="loading-overlay-root"
    >
      <Loader size="md" />
    </div>
  )
}

export { LoadingOverlay }
