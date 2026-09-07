/**
 * Carousel
 *
 * A row of slides the reader moves through.
 *
 * Behavior:
 * - The slides are a real list: a `<ul>` of `<li>`, so the structure reads as a
 *   sequence with or without CSS
 * - The track is a tab stop and the arrow keys move it, so the carousel is not
 *   swipe-only; Home and End jump to the ends
 * - The controls sit over the slides at the edges, round and small, rather than
 *   in a bar under them. A control bar reads as chrome belonging to the page;
 *   a control on the edge of the image reads as belonging to the image, which
 *   is the thing being moved. `controlsPlacement="outside"` puts them in the
 *   margin instead, for a carousel whose slides must not be covered at all
 * - Controls disable themselves at the ends unless `loop` says there are no
 *   ends
 * - `dots` renders one control per snap, each announcing the slide it goes to
 * - `autoplay` advances on a timer and stops the moment a pointer enters or
 *   focus lands inside, because a carousel that moves while it is being read is
 *   a carousel that cannot be read. It also never starts for a reader who asked
 *   for reduced motion
 * - `onChange` reports the slide in view — on a change, not on mount — so a
 *   caption or a counter outside the carousel can follow it
 * - `perView` belongs to the carousel, not to a slide: how many slides share
 *   the track is one decision, and `slidesToScroll` follows it by default
 *
 * Implementation:
 * - Embla under it, which owns the dragging, the snapping and the momentum
 * - Vertical takes its height from the box you put it in — wrap it in a sized
 *   element; there is no height prop, because that is the caller's layout
 * - <Carousel ariaLabel="Photos" dots loop>
 *     <Carousel.Item><img … /></Carousel.Item>
 *   </Carousel>
 *
 * Dependencies: embla-carousel-react
 */

export type CarouselOrientation = 'horizontal' | 'vertical'

export type CarouselAlign = 'start' | 'center' | 'end'

/** Where the previous/next controls sit relative to the slides. */
export type CarouselControlsPlacement = 'inside' | 'outside'

/** How many slides share the track at once. */
export type CarouselPerView = 1 | 2 | 3 | 4 | 6

export type CarouselProps = {
  align?: CarouselAlign // where a slide settles; default start
  ariaLabel?: string // names the carousel for assistive technology
  /** Milliseconds between automatic advances. Pauses on hover and on focus;
   * never runs under a reduced-motion preference. */
  autoplay?: number
  controls?: boolean // previous/next buttons; default true
  controlsPlacement?: CarouselControlsPlacement // over the slides, or beside them; default inside
  defaultIndex?: number // slide it opens on
  dots?: boolean // one control per snap
  gap?: boolean // space between slides; default true
  loop?: boolean // wraps around instead of stopping at the ends
  onChange?: (index: number) => void // fires with the slide in view
  orientation?: CarouselOrientation // default horizontal
  perView?: CarouselPerView // slides visible across the track; default 1
  slidesToScroll?: number // how many move per control press; default perView
}
