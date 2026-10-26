import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Carousel } from './carousel'
import type { CarouselApi } from './carousel.types'

/**
 * jsdom lays nothing out, so every slide is 0px wide and Embla's default
 * `containScroll` trims every snap but the first. Off, a snap per slide
 * survives, and the index moves the way it does in a browser.
 */
const UNCONTAINED = { containScroll: false as const }

function Photos(props: Parameters<typeof Carousel>[0] = {}) {
  return (
    <Carousel ariaLabel="Photos" opts={UNCONTAINED} {...props}>
      <Carousel.Content>
        <Carousel.Item>one</Carousel.Item>
        <Carousel.Item>two</Carousel.Item>
        <Carousel.Item>three</Carousel.Item>
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel>
  )
}

/** Renders, and hands back the Embla instance once it exists. */
async function mount(props: Parameters<typeof Carousel>[0] = {}) {
  let api: CarouselApi | undefined
  const setApi = (instance: CarouselApi) => {
    api = instance
  }

  render(<Photos setApi={setApi} {...props} />)
  await act(async () => {})

  if (!api) {
    throw new Error('Embla did not initialise')
  }

  return api
}

describe('Carousel', () => {
  it('announces itself as a carousel with slides inside', () => {
    render(<Photos />)

    const region = screen.getByTestId('carousel')

    expect(region.tagName).toBe('SECTION')
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    expect(region).toHaveAttribute('aria-label', 'Photos')
    expect(screen.getAllByTestId('carousel-item')).toHaveLength(3)
    expect(screen.getAllByTestId('carousel-item')[0]).toHaveAttribute(
      'aria-roledescription',
      'slide',
    )
    expect(screen.getAllByTestId('carousel-item')[1]).toHaveAttribute(
      'aria-label',
      'Slide 2 of 3',
    )
  })

  it('makes each slide a native group named by its place', () => {
    render(<Photos />)

    const slide = screen.getByRole('group', { name: 'Slide 1 of 3' })
    expect(slide.tagName).toBe('FIELDSET')
    expect(slide).not.toHaveAttribute('role')
    expect(slide).toBe(screen.getAllByTestId('carousel-item')[0])
  })

  it('gives Embla the viewport with the track as its first child', () => {
    render(<Photos />)

    const content = screen.getByTestId('carousel-content')
    const track = screen.getByTestId('carousel-track')

    expect(content).toHaveClass('overflow-hidden')
    expect(content.firstElementChild).toBe(track)
    expect(track).toHaveClass('flex')
    expect(track.children).toHaveLength(3)
  })

  it('opens on the first slide, with a real index, when told nothing', async () => {
    // Embla spreads its options over its defaults, so a `startIndex` key that
    // is present and undefined is not "the default" — it is an index of NaN,
    // and a track at index NaN never moved.
    const api = await mount()

    expect(api.selectedScrollSnap()).toBe(0)
    expect(api.canScrollPrev()).toBe(false)
    expect(api.canScrollNext()).toBe(true)
    expect(screen.getByTestId('carousel-previous')).toBeDisabled()
    expect(screen.getByTestId('carousel-next')).toBeEnabled()
  })

  it('opens on the slide it was given', async () => {
    const api = await mount({ defaultIndex: 2 })

    expect(api.selectedScrollSnap()).toBe(2)
    expect(screen.getByTestId('carousel-next')).toBeDisabled()
  })

  it('moves one snap per control press, and disables the end it reaches', async () => {
    const api = await mount()

    await userEvent.click(screen.getByTestId('carousel-next'))
    expect(api.selectedScrollSnap()).toBe(1)

    await userEvent.click(screen.getByTestId('carousel-next'))
    expect(api.selectedScrollSnap()).toBe(2)
    expect(screen.getByTestId('carousel-next')).toBeDisabled()

    await userEvent.click(screen.getByTestId('carousel-previous'))
    expect(api.selectedScrollSnap()).toBe(1)
  })

  it('never reaches an end when it loops', async () => {
    await mount({ loop: true })

    expect(screen.getByTestId('carousel-previous')).toBeEnabled()
    expect(screen.getByTestId('carousel-next')).toBeEnabled()
  })

  it('takes the arrow keys from anywhere inside it', async () => {
    const api = await mount()

    screen.getByTestId('carousel-next').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(api.selectedScrollSnap()).toBe(1)

    await userEvent.keyboard('{ArrowLeft}')
    expect(api.selectedScrollSnap()).toBe(0)
  })

  it('follows the axis with the keys when vertical', async () => {
    const api = await mount({ orientation: 'vertical' })

    screen.getByTestId('carousel-next').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(api.selectedScrollSnap()).toBe(0)

    await userEvent.keyboard('{ArrowDown}')
    expect(api.selectedScrollSnap()).toBe(1)
  })

  it('reports a change, not the slide it opened on', async () => {
    const onChange = vi.fn()

    await mount({ defaultIndex: 1, onChange })
    expect(onChange).not.toHaveBeenCalled()

    await userEvent.click(screen.getByTestId('carousel-next'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('renders only the controls composed by the caller', () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>One</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )

    expect(screen.queryByTestId('carousel-previous')).not.toBeInTheDocument()
    expect(screen.queryByTestId('carousel-next')).not.toBeInTheDocument()
  })

  it('names the controls as slides rather than steps', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel-previous')).toHaveAttribute(
      'aria-label',
      'Previous slide',
    )
    expect(screen.getByTestId('carousel-next')).toHaveAttribute(
      'aria-label',
      'Next slide',
    )
  })

  it('puts the controls in the margin beside the track, centred on it', () => {
    render(<Photos />)

    expect(screen.getByTestId('carousel-previous')).toHaveClass(
      'absolute',
      'rounded-full',
      '-left-12',
      'top-0',
      'bottom-0',
      'my-auto',
    )
    expect(screen.getByTestId('carousel-next')).toHaveClass('-right-12')
  })

  it('turns the controls to the axis when vertical', () => {
    render(<Photos orientation="vertical" />)

    expect(screen.getByTestId('carousel-previous')).toHaveClass(
      '-top-12',
      'rotate-90',
    )
    expect(screen.getByTestId('carousel-next')).toHaveClass('-bottom-12')
  })

  it('owns the spacing between slides', () => {
    const { rerender } = render(<Photos />)

    expect(screen.getAllByTestId('carousel-item')[0]).toHaveClass('pl-4')
    expect(screen.getByTestId('carousel-track')).toHaveClass('-ml-4')

    rerender(<Photos gap={false} />)
    expect(screen.getAllByTestId('carousel-item')[0]).not.toHaveClass('pl-4')
    expect(screen.getByTestId('carousel-track')).not.toHaveClass('-ml-4')
  })

  it('spaces vertical slides along the axis they travel', () => {
    render(<Photos orientation="vertical" />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide).toHaveClass('pt-4')
    expect(slide).not.toHaveClass('pl-4')
    expect(screen.getByTestId('carousel-track')).toHaveClass('flex-col')
  })

  it('shares the track between slides when the carousel asks for it', () => {
    render(<Photos perView={3} />)

    expect(screen.getAllByTestId('carousel-item')[0]).toHaveClass('basis-1/3')
  })

  it('changes how many slides share the track at each breakpoint', () => {
    render(<Photos perView={{ base: 1, lg: 4, md: 2 }} />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide).toHaveClass('basis-full', 'md:basis-1/2', 'lg:basis-1/4')
    expect(slide.className).not.toMatch(/(^|\s)(sm|xl):basis-/)
  })

  it('falls back to one slide per view when the object has no base', () => {
    render(<Photos perView={{ sm: 2, xl: 6 }} />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide).toHaveClass('basis-full', 'sm:basis-1/2', 'xl:basis-1/6')
  })

  it('measures the breakpoints on the viewport by default', () => {
    render(<Photos perView={{ base: 1, md: 3 }} />)

    expect(screen.getByTestId('carousel')).not.toHaveClass('@container')
    expect(screen.getAllByTestId('carousel-item')[0]).toHaveClass(
      'basis-full',
      'md:basis-1/3',
    )
    expect(screen.getAllByTestId('carousel-item')[0]?.className).not.toMatch(
      /@min-/,
    )
  })

  it('measures the breakpoints on its own width when responsiveTo is container', () => {
    render(
      <Photos
        perView={{ base: 2, lg: 4, md: 3, sm: 6, xl: 1 }}
        responsiveTo="container"
      />,
    )

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(screen.getByTestId('carousel')).toHaveClass('carousel', '@container')
    expect(slide).toHaveClass(
      'basis-1/2',
      '@min-[40rem]:basis-1/6',
      '@min-[48rem]:basis-1/3',
      '@min-[64rem]:basis-1/4',
      '@min-[80rem]:basis-full',
    )
    // Never both tables: a viewport query would fight the container one.
    expect(slide?.className).not.toMatch(/(^|\s)(sm|md|lg|xl):basis-/)
  })

  it.each(
    (['sm', 'md', 'lg', 'xl'] as const).flatMap((breakpoint) =>
      ([1, 2, 3, 4, 6] as const).map((count) => [breakpoint, count] as const),
    ),
  )('writes the container class for %s at %i per view', (breakpoint, count) => {
    const width = { lg: '64rem', md: '48rem', sm: '40rem', xl: '80rem' }
    const basis = count === 1 ? 'basis-full' : `basis-1/${count}`

    render(
      <Photos perView={{ [breakpoint]: count }} responsiveTo="container" />,
    )

    expect(screen.getAllByTestId('carousel-item')[0]).toHaveClass(
      `@min-[${width[breakpoint]}]:${basis}`,
    )
  })

  it('keeps a fixed count fixed under responsiveTo container', () => {
    render(<Photos perView={3} responsiveTo="container" />)

    const slide = screen.getAllByTestId('carousel-item')[0]

    expect(slide).toHaveClass('basis-1/3')
    expect(slide?.className).not.toMatch(/@min-/)
  })

  it('scrolls one view per press for a fixed count, and what fits for a responsive one', async () => {
    const fixed = await mount({ perView: 2 })
    expect(fixed.internalEngine().options.slidesToScroll).toBe(2)

    const responsive = await mount({ perView: { base: 1, md: 3 } })
    expect(responsive.internalEngine().options.slidesToScroll).toBe('auto')

    const pinned = await mount({
      perView: { base: 1, md: 3 },
      slidesToScroll: 1,
    })
    expect(pinned.internalEngine().options.slidesToScroll).toBe(1)
  })

  it('reserves room under the track for the dots, and centres the controls above it', async () => {
    render(
      <Carousel opts={UNCONTAINED}>
        <Carousel.Content>
          <Carousel.Item>one</Carousel.Item>
          <Carousel.Item>two</Carousel.Item>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Dots />
      </Carousel>,
    )
    await act(async () => {})

    // Inside the root's box, so a caption after the carousel sits below them
    // — an out-of-flow row under the root painted over the caption instead.
    expect(screen.getByTestId('carousel')).toHaveClass('pb-9')
    expect(screen.getByTestId('carousel-dots')).toHaveClass(
      'absolute',
      'bottom-0',
    )
    expect(screen.getByTestId('carousel-previous')).toHaveClass('bottom-9')
    expect(screen.getByTestId('carousel-previous')).not.toHaveClass('bottom-0')
  })

  it('draws one dot per snap and marks the one in view', async () => {
    let api: CarouselApi | undefined

    render(
      <Carousel
        opts={UNCONTAINED}
        setApi={(instance) => {
          api = instance
        }}
      >
        <Carousel.Content>
          <Carousel.Item>one</Carousel.Item>
          <Carousel.Item>two</Carousel.Item>
          <Carousel.Item>three</Carousel.Item>
        </Carousel.Content>
        <Carousel.Dots />
      </Carousel>,
    )
    await act(async () => {})

    const dots = screen.getAllByTestId('carousel-dot')

    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute('data-active')
    expect(dots[2]).toHaveAttribute('aria-label', 'Slide 3 of 3')

    await userEvent.click(dots[2] as HTMLElement)

    expect(api?.selectedScrollSnap()).toBe(2)
    expect(dots[2]).toHaveAttribute('data-active')
    expect(dots[0]).not.toHaveAttribute('data-active')
  })
})
