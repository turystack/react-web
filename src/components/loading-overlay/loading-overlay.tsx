import { tv } from 'tailwind-variants'

import { Loader } from '@/components/loader'

import type { LoadingOverlayProps } from './loading-overlay.types'

const loadingOverlay = tv({
  slots: {
    // Transparent, always. It holds the spinner and takes the pointer; the
    // fading is done to the host's content by opacity (see `index.css`). A
    // painted veil was `bg-background/80`, a guess at the colour underneath —
    // over a card in dark mode that is a near-black sheet, edge to edge, on a
    // lighter surface.
    root: 'loading-overlay-root absolute inset-0 z-50 flex items-center justify-center rounded-[inherit]',
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
