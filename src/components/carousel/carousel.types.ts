/**
 * Carousel
 *
 * A row of slides the reader moves through — the shadcn carousel, on Embla.
 *
 * Behavior:
 * - Composed, never configured: `Carousel.Content` holds `Carousel.Item`s, and
 *   `Carousel.Previous`, `Carousel.Next` and `Carousel.Dots` are added only
 *   where the experience needs them
 * - The controls sit in the margin *outside* the slides, centred on the
 *   track: 48px to the left and right, or above and below when vertical. The
 *   box around the carousel leaves that room, the way it leaves room for any
 *   other control — a slide is never covered
 * - Controls disable themselves at the ends unless `loop` says there are no
 *   ends
 * - The arrow keys move the track from anywhere inside the carousel — a
 *   control, a link in a slide — along the axis it travels
 * - `Dots` renders one control per snap, each announcing the slide it goes to,
 *   in the margin under the track
 * - `autoplay` advances on a timer and stops the moment a pointer enters or
 *   focus lands inside, because a carousel that moves while it is being read
 *   is a carousel that cannot be read. It never starts for a reader who asked
 *   for reduced motion
 * - `onChange` reports the slide in view — on a change, not on mount — so a
 *   caption or a counter outside the carousel can follow it
 * - `perView` belongs to the carousel, not to a slide: how many slides share
 *   the track is one decision, and `slidesToScroll` follows it by default
 * - `perView` is a number (one count at every width) or an object, mobile-first
 *   per Tailwind breakpoint — { base: 1, md: 2, lg: 4 } is one slide on a
 *   phone, two from 768px, four from 1024px. A breakpoint left out inherits
 *   the one below it; a missing base is 1. With the object form
 *   `slidesToScroll` defaults to whatever fits the viewport (Embla's `auto`)
 * - `responsiveTo` says whose width those breakpoints measure: the viewport
 *   (default, media queries) or the carousel itself (`container`, container
 *   queries on the root). Container is for a carousel whose box is narrower
 *   than the screen — a shelf beside a sidebar — and keeps the same
 *   thresholds (640, 768, 1024, 1280px), measured on the carousel. The root
 *   then takes its width from its parent, not from its slides
 *
 * Implementation:
 * - Embla owns the dragging, the snapping and the momentum. The options it
 *   receives never carry an `undefined`: Embla spreads them over its defaults,
 *   so `startIndex: undefined` is not "the default" but an index of `NaN` — a
 *   track that never moves. Every optional prop is added only when it is set
 * - Vertical takes its height from the box you put it in — wrap it in a sized
 *   element; there is no height prop, because that is the caller's layout
 * - <Carousel ariaLabel="Photos" loop>
 *     <Carousel.Content>
 *       <Carousel.Item><img … /></Carousel.Item>
 *     </Carousel.Content>
 *     <Carousel.Previous />
 *     <Carousel.Next />
 *   </Carousel>
 * - <Carousel ariaLabel="Products" perView={{ base: 1, md: 2, lg: 4 }}>…</Carousel>
 * - <Carousel ariaLabel="Shelf" perView={{ base: 2, md: 4 }} responsiveTo="container">…</Carousel>
 *
 * Dependencies: embla-carousel-react, Button component, labels provider
 */

import type useEmblaCarousel from 'embla-carousel-react'
import type { UseEmblaCarouselType } from 'embla-carousel-react'

/** The Embla instance, handed to `setApi` for what the parts do not cover. */
export type CarouselApi = NonNullable<UseEmblaCarouselType[1]>

export type CarouselOrientation = 'horizontal' | 'vertical'

export type CarouselAlign = 'start' | 'center' | 'end'

/** How many slides share the track at once. */
export type CarouselPerView = 1 | 2 | 3 | 4 | 6

/** Whose width the `perView` breakpoints measure. */
export type CarouselResponsiveTo = 'viewport' | 'container'

/** Slides per view per Tailwind breakpoint, mobile-first. */
export type CarouselPerViewResponsive = {
  base?: CarouselPerView // below 640px, and every width no breakpoint overrides; default 1
  sm?: CarouselPerView // from 640px
  md?: CarouselPerView // from 768px
  lg?: CarouselPerView // from 1024px
  xl?: CarouselPerView // from 1280px
}

export type CarouselProps = {
  align?: CarouselAlign // where a slide settles; default start
  ariaLabel?: string // names the carousel for assistive technology
  /** Milliseconds between automatic advances. Pauses on hover and focus, and
   * never runs under a reduced-motion preference. */
  autoplay?: number
  defaultIndex?: number // slide it opens on; default the first
  gap?: boolean // space between slides; default true
  loop?: boolean // wraps around instead of stopping at the ends
  onChange?: (index: number) => void // fires with the slide in view, on a change
  orientation?: CarouselOrientation // default horizontal
  opts?: Parameters<typeof useEmblaCarousel>[0] // further Embla options; the props above win
  perView?: CarouselPerView | CarouselPerViewResponsive // slides visible across the track, or one count per breakpoint; default 1
  plugins?: Parameters<typeof useEmblaCarousel>[1] // Embla plugins, such as Auto Height
  responsiveTo?: CarouselResponsiveTo // whose width the perView breakpoints measure; default viewport
  setApi?: (api: CarouselApi) => void // receives the Embla instance once it exists
  slidesToScroll?: number // how many move per control press; default perView (what fits, for the object form)
}
