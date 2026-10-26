import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Image } from './image'
import type {
  ImageFit,
  ImageRatio,
  ImageRounded,
  ImageWidth,
} from './image.types'

describe('Image', () => {
  it('shows the file under its alt text', () => {
    render(<Image alt="Blue sneaker, side view" src="/sneaker.jpg" />)

    const img = screen.getByRole('img', { name: 'Blue sneaker, side view' })
    expect(img).toHaveAttribute('src', '/sneaker.jpg')
    expect(screen.getByTestId('image')).toHaveAttribute('data-state', 'image')
    expect(screen.queryByTestId('image-fallback')).not.toBeInTheDocument()
  })

  it('swaps to the fallback when the file fails, keeping the image’s name', () => {
    render(<Image alt="Blue sneaker" src="/broken.jpg" />)

    fireEvent.error(screen.getByTestId('image-img'))

    expect(screen.queryByTestId('image-img')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Blue sneaker' })).toBe(
      screen.getByTestId('image-fallback'),
    )
    expect(screen.getByTestId('icon-image')).toBeInTheDocument()
    expect(screen.getByTestId('image')).toHaveAttribute(
      'data-state',
      'fallback',
    )
  })

  it('shows the fallback straight away for an empty src', () => {
    render(<Image alt="Album cover" src="  " />)

    expect(screen.queryByTestId('image-img')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Album cover' })).toBe(
      screen.getByTestId('image-fallback'),
    )
  })

  it('tries again when a new src arrives after a failure', () => {
    const { rerender } = render(<Image alt="Cover" src="/broken.jpg" />)
    fireEvent.error(screen.getByTestId('image-img'))

    rerender(<Image alt="Cover" src="/cover.jpg" />)

    expect(screen.getByTestId('image-img')).toHaveAttribute('src', '/cover.jpg')
  })

  it('renders a custom fallback in place of the icon', () => {
    render(
      <Image
        alt="Store logo"
        fallback={<span data-testid="initials">TS</span>}
        src=""
      />,
    )

    expect(screen.getByTestId('image-fallback')).toContainElement(
      screen.getByTestId('initials'),
    )
    expect(screen.queryByTestId('icon-image')).not.toBeInTheDocument()
  })

  it('sizes the fallback by the ratio the image would have had', () => {
    render(<Image alt="Banner" ratio="21/9" src="" />)

    expect(screen.getByTestId('image-fallback').className).toContain(
      'aspect-21/9',
    )
  })

  it('refuses a missing alt at the type level', () => {
    // @ts-expect-error — `alt` is required: an image with no text is a guess.
    render(<Image src="/sneaker.jpg" />)

    expect(screen.getByTestId('image-img')).toBeInTheDocument()
  })
})

describe('Image decorative', () => {
  it('hides a decorative image (alt="") from assistive technology', () => {
    render(<Image alt="" src="/banner.jpg" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('image-img')).toHaveAttribute('alt', '')
  })

  it('keeps the fallback of a decorative image hidden too', () => {
    render(<Image alt="" src="" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('image-fallback')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})

describe('Image loading', () => {
  it('loads lazily by default', () => {
    render(<Image alt="Shot" src="/shot.jpg" />)

    expect(screen.getByTestId('image-img')).toHaveAttribute('loading', 'lazy')
    expect(screen.getByTestId('image-img')).toHaveAttribute('decoding', 'async')
  })

  it('loads eagerly when asked', () => {
    render(<Image alt="Hero" loading="eager" src="/hero.jpg" />)

    expect(screen.getByTestId('image-img')).toHaveAttribute('loading', 'eager')
  })
})

describe.each([
  ['square', 'aspect-square'],
  ['4/3', 'aspect-4/3'],
  ['16/9', 'aspect-video'],
  ['3/2', 'aspect-3/2'],
  ['21/9', 'aspect-21/9'],
] as [ImageRatio, string][])('Image ratio %s', (ratio, className) => {
  it('frames the file and its fallback in that shape', () => {
    const { rerender } = render(<Image alt="Shot" ratio={ratio} src="/a.jpg" />)

    expect(screen.getByTestId('image')).toHaveAttribute('data-ratio', ratio)
    expect(screen.getByTestId('image-img').className).toContain(className)

    rerender(<Image alt="Shot" ratio={ratio} src="" />)

    expect(screen.getByTestId('image-fallback').className).toContain(className)
  })
})

describe('Image ratio auto', () => {
  it('keeps the file’s own proportions and gives the fallback 4/3', () => {
    const { rerender } = render(<Image alt="Shot" src="/a.jpg" />)

    expect(screen.getByTestId('image')).toHaveAttribute('data-ratio', 'auto')
    expect(screen.getByTestId('image-img').className).not.toContain('aspect-')

    rerender(<Image alt="Shot" src="" />)

    expect(screen.getByTestId('image-fallback').className).toContain(
      'aspect-4/3',
    )
  })
})

describe.each([
  ['cover', 'object-cover'],
  ['contain', 'object-contain'],
] as [ImageFit, string][])('Image fit %s', (fit, className) => {
  it('meets the frame that way', () => {
    render(<Image alt="Shot" fit={fit} src="/a.jpg" />)

    expect(screen.getByTestId('image')).toHaveAttribute('data-fit', fit)
    expect(screen.getByTestId('image-img').className).toContain(className)
  })
})

describe('Image fit default', () => {
  it('covers the frame when no fit is given', () => {
    render(<Image alt="Shot" src="/a.jpg" />)

    expect(screen.getByTestId('image-img').className).toContain('object-cover')
  })
})

describe.each([
  ['none', 'rounded-none'],
  ['sm', 'rounded-sm'],
  ['md', 'rounded-md'],
  ['lg', 'rounded-lg'],
  ['xl', 'rounded-xl'],
  ['full', 'rounded-full'],
] as [ImageRounded, string][])('Image rounded %s', (rounded, className) => {
  it('rounds the frame', () => {
    render(<Image alt="Shot" rounded={rounded} src="/a.jpg" />)

    expect(screen.getByTestId('image')).toHaveAttribute('data-rounded', rounded)
    expect(screen.getByTestId('image').className).toContain(className)
  })
})

describe('Image rounded default', () => {
  it('rounds md when nothing is given', () => {
    render(<Image alt="Shot" src="/a.jpg" />)

    expect(screen.getByTestId('image').className).toContain('rounded-md')
  })
})

describe.each([
  ['full', 'w-full', 'w-full'],
  ['auto', 'max-w-full', 'w-40'],
] as [ImageWidth, string, string][])(
  'Image width %s',
  (width, imgClass, fallbackClass) => {
    it('sizes the file and the fallback', () => {
      const { rerender } = render(
        <Image alt="Shot" src="/a.jpg" width={width} />,
      )

      expect(screen.getByTestId('image')).toHaveAttribute('data-width', width)
      expect(screen.getByTestId('image-img').className).toContain(imgClass)

      rerender(<Image alt="Shot" src="" width={width} />)

      expect(screen.getByTestId('image-fallback').className).toContain(
        fallbackClass,
      )
    })
  },
)

describe('Image bordered', () => {
  it('draws a hairline when bordered', () => {
    render(<Image alt="Shot" bordered src="/a.jpg" />)

    expect(screen.getByTestId('image').className).toContain('border-border')
  })

  it('draws none by default', () => {
    render(<Image alt="Shot" src="/a.jpg" />)

    expect(screen.getByTestId('image').className).not.toContain('border')
  })
})

describe('Image fallback surface', () => {
  it('edges the stand-in with an inset hairline, so it reads on a muted card', () => {
    render(<Image alt="Cover" src="" />)

    const fallback = screen.getByTestId('image-fallback')

    expect(fallback).toHaveClass(
      'bg-muted',
      'ring-1',
      'ring-inset',
      'ring-border',
      'rounded-[inherit]',
    )
  })

  it('edges a custom fallback the same way', () => {
    render(<Image alt="Logo" fallback={<span>TS</span>} src="" />)

    expect(screen.getByTestId('image-fallback')).toHaveClass('ring-border')
  })

  it('leaves the edge to the frame when bordered', () => {
    render(<Image alt="Cover" bordered src="" />)

    expect(screen.getByTestId('image').className).toContain('border-border')
    expect(screen.getByTestId('image-fallback')).not.toHaveClass('ring-1')
  })

  it('draws nothing new around a loaded image', () => {
    render(<Image alt="Cover" src="/a.jpg" />)

    expect(screen.getByTestId('image').className).not.toMatch(/ring|border/)
    expect(screen.getByTestId('image-img').className).not.toMatch(/ring|border/)
  })
})
