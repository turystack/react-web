import { useMemo } from 'react'
import { tv } from 'tailwind-variants'

import { encodeQr, type QrMatrix } from './qr-code.encoder'
import type { QrCodeProps } from './qr-code.types'

/** Light modules the standard asks for around the symbol, on every side. */
const QUIET_ZONE = 4

const styles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    // Fixed black on white in every scheme, on purpose: a Pix code has to scan
    // in any bank app, and some readers still reject light-on-dark symbols.
    background: 'qr-code-background fill-white',
    logo: [
      'qr-code-logo absolute top-1/2 left-1/2 flex size-1/5 -translate-x-1/2 -translate-y-1/2',
      'items-center justify-center overflow-hidden rounded-md bg-white p-1',
      '[&_img]:size-full [&_img]:object-contain [&_svg]:size-full',
    ],
    modules: 'qr-code-modules fill-black',
    root: 'qr-code-root relative inline-block shrink-0 overflow-hidden rounded-md text-foreground',
    svg: 'qr-code-svg block size-full',
  },
  variants: {
    size: {
      lg: {
        root: 'size-64',
      },
      md: {
        root: 'size-48',
      },
      sm: {
        root: 'size-32',
      },
    },
  },
})

/** Every horizontal run of dark modules as one rectangle of the path. */
function modulesPath({ modules }: QrMatrix): string {
  const segments: string[] = []

  modules.forEach((row, y) => {
    let x = 0

    while (x < row.length) {
      if (!row[x]) {
        x++
        continue
      }

      const start = x

      while (x < row.length && row[x]) {
        x++
      }

      const run = x - start
      segments.push(
        `M${start + QUIET_ZONE} ${y + QUIET_ZONE}h${run}v1h-${run}z`,
      )
    }
  })

  return segments.join('')
}

function QrCode({ label, level = 'M', logo, size = 'md', value }: QrCodeProps) {
  const hasLogo = logo !== undefined && logo !== null && logo !== false
  const effectiveLevel = hasLogo ? 'H' : level

  const matrix = useMemo(
    () => encodeQr(value, { level: effectiveLevel }),
    [value, effectiveLevel],
  )
  const path = useMemo(() => modulesPath(matrix), [matrix])
  const extent = matrix.size + QUIET_ZONE * 2

  const { background, logo: logoSlot, modules, root, svg } = styles({ size })

  return (
    <div
      aria-label={label}
      className={root()}
      data-level={effectiveLevel}
      data-size={size}
      data-testid="qr-code"
      data-version={matrix.version}
      role="img"
    >
      <svg
        aria-hidden="true"
        className={svg()}
        data-testid="qr-code-svg"
        shapeRendering="crispEdges"
        viewBox={`0 0 ${extent} ${extent}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          className={background()}
          data-testid="qr-code-background"
          height={extent}
          width={extent}
        />
        <path className={modules()} d={path} data-testid="qr-code-modules" />
      </svg>
      {hasLogo ? (
        <span className={logoSlot()} data-testid="qr-code-logo">
          {logo}
        </span>
      ) : null}
    </div>
  )
}

export { QrCode }
