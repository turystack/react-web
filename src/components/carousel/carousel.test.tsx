import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Carousel } from './carousel'

function Photos(props: Parameters<typeof Carousel>[0] = {}) {
  return (
    <Carousel ariaLabel="Photos" {...props}>
      <Carousel.Item>one</Carousel.Item>
      <Carousel.Item>two</Carousel.Item>
      <Carousel.Item>three</Carousel.Item>
    </Carousel>
  )
}

describe('Carousel', () => {
  it('announces itself as a carousel with slides inside', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel')).toHaveAttribute(
      'aria-roledescription',
      'carousel',
    )
    expect(screen.getAllByTestId('carousel-item')).toHaveLength(3)
    expect(screen.getAllByTestId('carousel-item')[0]).toHaveAttribute(
      'aria-roledescription',
      'slide',
    )
  })

  /**
   * A slide is a list item, and a list item outside a list is a bullet the
   * browser draws next to every slide. The track being a `<ul>` is the fix and
   * the reason this assertion is about tag names rather than looks.
   */
  it('puts the slides in a real list', () => {
    render(<Photos />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide?.tagName).toBe('LI')
    expect(slide?.parentElement?.tagName).toBe('UL')
  })

  it('names each slide by its position', () => {
    render(<Photos />)

    expect(screen.getAllByTestId('carousel-item')[1]).toHaveAttribute(
      'aria-label',
      'Slide 2 of 3',
    )
  })

  it('offers real buttons, not only a swipe', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel-previous')).toBeInTheDocument()
    expect(screen.getByTestId('carousel-next')).toBeInTheDocument()
  })

  it('names the controls as slides rather than steps', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel-previous')).toHaveAttribute(
      'aria-label',
      'Previous slide',
    )
  })

  it('leaves the controls out when asked', () => {
    render(<Photos controls={false} />)

    expect(screen.queryByTestId('carousel-previous')).not.toBeInTheDocument()
  })

  /**
   * The arrow keys are a claim the types make, and a claim nothing implements
   * is worse than no claim: the reader stops looking for a keyboard path.
   */
  it('lets the keyboard reach the track', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel-viewport')).toHaveAttribute(
      'tabindex',
      '0',
    )
  })

  it('reports a change, not the slide it opened on', () => {
    const onChange = vi.fn()

    render(<Photos defaultIndex={1} onChange={onChange} />)

    expect(onChange).not.toHaveBeenCalled()
  })

  /**
   * Whether the controls disable themselves at the ends is Embla's answer, and
   * Embla measures — which jsdom does not do. Asserting it here would test the
   * absence of layout, so the contract this covers is the spacing it owns.
   */
  it('owns the spacing between slides', () => {
    const { rerender } = render(<Photos />)

    expect(screen.getAllByTestId('carousel-item')[0]?.className).toContain(
      'pl-3',
    )

    rerender(<Photos gap={false} />)

    expect(screen.getAllByTestId('carousel-item')[0]?.className).not.toContain(
      'pl-3',
    )
  })

  it('spaces vertical slides along the axis they travel', () => {
    render(<Photos orientation="vertical" />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide?.className).toContain('pt-3')
    expect(slide?.className).not.toContain('pl-3')
  })

  it('shares the track between slides when the carousel asks for it', () => {
    render(<Photos perView={3} />)

    expect(screen.getAllByTestId('carousel-item')[0]?.className).toContain(
      'basis-1/3',
    )
  })

  it('lays the controls over the slides by default', () => {
    render(
      <Carousel>
        <Carousel.Item>One</Carousel.Item>
        <Carousel.Item>Two</Carousel.Item>
      </Carousel>,
    )

    expect(screen.getByTestId('carousel-previous')).toHaveClass(
      'absolute',
      'rounded-full',
    )
    expect(screen.getByTestId('carousel-next')).toHaveClass('absolute')
  })

  it('moves them into the margin when asked', () => {
    render(
      <Carousel controlsPlacement="outside">
        <Carousel.Item>One</Carousel.Item>
        <Carousel.Item>Two</Carousel.Item>
      </Carousel>,
    )

    expect(screen.getByTestId('carousel-previous')).toHaveClass('-left-11')
    expect(screen.getByTestId('carousel')).toHaveClass('px-11')
  })

  it('leaves the controls out entirely when they are not wanted', () => {
    render(
      <Carousel controls={false} dots>
        <Carousel.Item>One</Carousel.Item>
        <Carousel.Item>Two</Carousel.Item>
      </Carousel>,
    )

    expect(screen.queryByTestId('carousel-previous')).not.toBeInTheDocument()
    expect(screen.queryByTestId('carousel-next')).not.toBeInTheDocument()
  })
})
