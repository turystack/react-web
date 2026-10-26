import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QrCode } from './qr-code'
import { encodeQr } from './qr-code.encoder'
import type { QrCodeLevel, QrCodeSize } from './qr-code.types'

const PIX =
  '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D'

/** Rebuilds the module grid the SVG path paints, quiet zone included. */
function paintedModules(d: string, extent: number): boolean[][] {
  const grid = Array.from({ length: extent }, () =>
    new Array<boolean>(extent).fill(false),
  )

  for (const match of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)) {
    const [, x, y, run, back] = match.map(Number)
    expect(run).toBe(back)

    for (let offset = 0; offset < (run ?? 0); offset++) {
      const row = grid[y ?? 0]
      if (row) {
        row[(x ?? 0) + offset] = true
      }
    }
  }

  return grid
}

describe('QrCode', () => {
  it('is one image named by its label, with the drawing hidden from assistive technology', () => {
    render(<QrCode label="Pix QR code for R$ 42,00" value={PIX} />)

    expect(screen.getByRole('img', { name: 'Pix QR code for R$ 42,00' })).toBe(
      screen.getByTestId('qr-code'),
    )
    expect(screen.getByTestId('qr-code-svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('paints exactly the encoder’s dark modules, inside a 4-module quiet zone', () => {
    render(<QrCode label="Pix" value={PIX} />)

    const symbol = encodeQr(PIX)
    const extent = symbol.size + 8
    expect(screen.getByTestId('qr-code-svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${extent} ${extent}`,
    )

    const painted = paintedModules(
      screen.getByTestId('qr-code-modules').getAttribute('d') ?? '',
      extent,
    )

    for (let row = 0; row < extent; row++) {
      for (let column = 0; column < extent; column++) {
        const inside =
          row >= 4 && row < extent - 4 && column >= 4 && column < extent - 4
        const expected = inside
          ? (symbol.modules[row - 4]?.[column - 4] ?? false)
          : false

        expect(painted[row]?.[column]).toBe(expected)
      }
    }
  })

  it('fills the whole square, quiet zone included, with the background', () => {
    render(<QrCode label="Pix" value="turystack" />)

    const extent = encodeQr('turystack').size + 8
    const background = screen.getByTestId('qr-code-background')

    expect(background).toHaveAttribute('width', String(extent))
    expect(background).toHaveAttribute('height', String(extent))
    expect(background.getAttribute('class')).toContain('fill-white')
    expect(
      screen.getByTestId('qr-code-modules').getAttribute('class'),
    ).toContain('fill-black')
  })

  it('picks the smallest version for the payload at level M by default', () => {
    render(<QrCode label="Pix" value={PIX} />)

    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-level', 'M')
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-version', '8')
  })

  it('redraws when the value changes', () => {
    const { rerender } = render(<QrCode label="Pix" value="a" />)
    const before = screen.getByTestId('qr-code-modules').getAttribute('d')

    rerender(<QrCode label="Pix" value={PIX} />)

    expect(screen.getByTestId('qr-code-modules').getAttribute('d')).not.toBe(
      before,
    )
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-version', '8')
  })

  it('still draws a symbol for an empty value', () => {
    render(<QrCode label="Empty" value="" />)

    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-version', '1')
    expect(screen.getByTestId('qr-code-modules').getAttribute('d')).not.toBe('')
  })
})

describe.each([
  ['L', '7'],
  ['M', '8'],
  ['Q', '10'],
  ['H', '11'],
] as [QrCodeLevel, string][])('QrCode level %s', (level, version) => {
  it('encodes at that level, growing the symbol with the redundancy', () => {
    render(<QrCode label="Pix" level={level} value={PIX} />)

    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-level', level)
    expect(screen.getByTestId('qr-code')).toHaveAttribute(
      'data-version',
      version,
    )
  })
})

describe('QrCode logo', () => {
  it('overlays the logo in the centre and forces level H', () => {
    render(
      <QrCode
        label="Pair your phone"
        level="L"
        logo={<svg data-testid="brand" />}
        value={PIX}
      />,
    )

    expect(screen.getByTestId('qr-code-logo')).toContainElement(
      screen.getByTestId('brand'),
    )
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-level', 'H')
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-version', '11')
  })

  it('keeps the requested level and draws no overlay without a logo', () => {
    render(<QrCode label="Pix" level="L" logo={null} value={PIX} />)

    expect(screen.queryByTestId('qr-code-logo')).not.toBeInTheDocument()
    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-level', 'L')
  })
})

describe.each([
  ['sm', 'size-32'],
  ['md', 'size-48'],
  ['lg', 'size-64'],
] as [QrCodeSize, string][])('QrCode size %s', (size, className) => {
  it('renders the square at that size', () => {
    render(<QrCode label="Pix" size={size} value="turystack" />)

    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-size', size)
    expect(screen.getByTestId('qr-code').className).toContain(className)
  })
})

describe('QrCode size default', () => {
  it('renders md when no size is given', () => {
    render(<QrCode label="Pix" value="turystack" />)

    expect(screen.getByTestId('qr-code')).toHaveAttribute('data-size', 'md')
    expect(screen.getByTestId('qr-code').className).toContain('size-48')
  })
})
