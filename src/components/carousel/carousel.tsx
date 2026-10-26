import useEmblaCarousel, {
  type EmblaViewportRefType,
} from 'embla-carousel-react'
import {
  Children,
  createContext,
  type KeyboardEvent,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { ChevronLeft, ChevronRight } from '@/internal/icons'

import type {
  CarouselApi,
  CarouselOrientation,
  CarouselPerView,
  CarouselPerViewResponsive,
  CarouselProps,
  CarouselResponsiveTo,
} from './carousel.types'

export const styles = tv({
  defaultVariants: {
    dots: false,
    gap: true,
    orientation: 'horizontal',
    perView: 1,
  },
  slots: {
    // The viewport: what Embla measures and clips. Its first child is the
    // track Embla moves, so nothing may come between the two.
    content: 'carousel-content overflow-hidden',
    // Round, on the edge, in the margin: the shadcn placement. Outside the
    // slides rather than over them, so a slide is never covered.
    control:
      'carousel-control absolute touch-manipulation rounded-full shadow-sm',
    dot: 'carousel-dot group flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    dotIndicator:
      'carousel-dot-indicator size-2 rounded-full bg-border transition-all group-hover:bg-muted-foreground group-data-active:w-4 group-data-active:bg-primary',
    // In the room the root reserves under the track once dots are composed
    // (`pb-9`, see the `dots` variant): out of the flow, so the controls stay
    // centred on the slides rather than on the slides plus a row of dots, and
    // inside the root's box, so whatever follows the carousel sits below them.
    dots: 'carousel-dots absolute inset-x-0 bottom-0 flex h-6 items-center justify-center gap-1.5',
    // A <fieldset>: min-w-0 lifts its min-content floor; the rest resets its
    // border, padding and margin.
    item: 'carousel-item m-0 min-w-0 shrink-0 grow-0 border-0 p-0',
    next: 'carousel-next',
    previous: 'carousel-previous',
    root: 'carousel relative',
    track: 'carousel-track flex',
  },
  variants: {
    // Set by Carousel.Dots itself, through the context, when it is composed.
    dots: {
      false: {},
      true: {
        root: 'pb-9',
      },
    },
    gap: {
      false: {},
      true: {},
    },
    orientation: {
      horizontal: {},
      vertical: {
        content: 'h-full',
        root: 'h-full',
        track: 'h-full flex-col',
      },
    },
    // One axis per breakpoint, every class written out whole: Tailwind finds
    // classes by scanning for literal strings, so a `md:basis-1/${n}` built at
    // runtime would ship a track that ignores the breakpoint.
    perView: {
      1: { item: 'basis-full' },
      2: { item: 'basis-1/2' },
      3: { item: 'basis-1/3' },
      4: { item: 'basis-1/4' },
      6: { item: 'basis-1/6' },
    },
    perViewSm: {
      1: { item: 'sm:basis-full' },
      2: { item: 'sm:basis-1/2' },
      3: { item: 'sm:basis-1/3' },
      4: { item: 'sm:basis-1/4' },
      6: { item: 'sm:basis-1/6' },
    },
    perViewMd: {
      1: { item: 'md:basis-full' },
      2: { item: 'md:basis-1/2' },
      3: { item: 'md:basis-1/3' },
      4: { item: 'md:basis-1/4' },
      6: { item: 'md:basis-1/6' },
    },
    perViewLg: {
      1: { item: 'lg:basis-full' },
      2: { item: 'lg:basis-1/2' },
      3: { item: 'lg:basis-1/3' },
      4: { item: 'lg:basis-1/4' },
      6: { item: 'lg:basis-1/6' },
    },
    perViewXl: {
      1: { item: 'xl:basis-full' },
      2: { item: 'xl:basis-1/2' },
      3: { item: 'xl:basis-1/3' },
      4: { item: 'xl:basis-1/4' },
      6: { item: 'xl:basis-1/6' },
    },
    // The same table measured on the carousel's own width, for
    // `responsiveTo="container"`. The thresholds are the viewport
    // breakpoints' own widths (40, 48, 64, 80rem), not Tailwind's named
    // container sizes (@sm is 24rem): `{ md: 3 }` means "from 768px" whichever
    // box is measured, so moving a shelf into a sidebar shell changes what is
    // measured, never what the numbers mean.
    perViewContainerSm: {
      1: { item: '@min-[40rem]:basis-full' },
      2: { item: '@min-[40rem]:basis-1/2' },
      3: { item: '@min-[40rem]:basis-1/3' },
      4: { item: '@min-[40rem]:basis-1/4' },
      6: { item: '@min-[40rem]:basis-1/6' },
    },
    perViewContainerMd: {
      1: { item: '@min-[48rem]:basis-full' },
      2: { item: '@min-[48rem]:basis-1/2' },
      3: { item: '@min-[48rem]:basis-1/3' },
      4: { item: '@min-[48rem]:basis-1/4' },
      6: { item: '@min-[48rem]:basis-1/6' },
    },
    perViewContainerLg: {
      1: { item: '@min-[64rem]:basis-full' },
      2: { item: '@min-[64rem]:basis-1/2' },
      3: { item: '@min-[64rem]:basis-1/3' },
      4: { item: '@min-[64rem]:basis-1/4' },
      6: { item: '@min-[64rem]:basis-1/6' },
    },
    perViewContainerXl: {
      1: { item: '@min-[80rem]:basis-full' },
      2: { item: '@min-[80rem]:basis-1/2' },
      3: { item: '@min-[80rem]:basis-1/3' },
      4: { item: '@min-[80rem]:basis-1/4' },
      6: { item: '@min-[80rem]:basis-1/6' },
    },
    // The root becomes the size container the slides' queries read.
    responsiveTo: {
      container: { root: '@container' },
      viewport: {},
    },
  },
  compoundVariants: [
    // The shadcn spacing: a negative margin on the track, padding on every
    // slide, so the first slide sits flush and the gap is only between them.
    {
      class: { item: 'pl-4', track: '-ml-4' },
      gap: true,
      orientation: 'horizontal',
    },
    // Taller by the margin it loses: a slide is `basis-full` of the track,
    // and the viewport's full height must still be a slide's content.
    {
      class: { item: 'pt-4', track: '-mt-4 h-[calc(100%+1rem)]' },
      gap: true,
      orientation: 'vertical',
    },
    {
      class: {
        next: 'top-0 -right-12 bottom-0 my-auto',
        previous: 'top-0 bottom-0 -left-12 my-auto',
      },
      orientation: 'horizontal',
    },
    // Centred on the slides, not on the slides plus the dots' room.
    {
      class: {
        next: 'bottom-9',
        previous: 'bottom-9',
      },
      dots: true,
      orientation: 'horizontal',
    },
    {
      class: {
        next: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        previous: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      },
      orientation: 'vertical',
    },
  ],
})

type CarouselContextValue = {
  api?: CarouselApi
  canNext: boolean
  canPrevious: boolean
  dots: boolean
  emblaRef: EmblaViewportRefType
  gap: boolean
  registerDots: (present: boolean) => void
  orientation: CarouselOrientation
  perView: CarouselPerView
  perViewContainerLg?: CarouselPerView
  perViewContainerMd?: CarouselPerView
  perViewContainerSm?: CarouselPerView
  perViewContainerXl?: CarouselPerView
  perViewLg?: CarouselPerView
  perViewMd?: CarouselPerView
  perViewSm?: CarouselPerView
  perViewXl?: CarouselPerView
  responsiveTo: CarouselResponsiveTo
  selected: number
  snaps: number[]
}

const CarouselContext = createContext<CarouselContextValue | null>(null)
const SlideContext = createContext<{ index: number; total: number } | null>(
  null,
)

function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error('Carousel parts must be rendered inside <Carousel>.')
  }

  return context
}

function usesReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** The number form is the object form with only a base. */
function toResponsive(
  perView: CarouselProps['perView'],
): CarouselPerViewResponsive {
  if (perView === undefined) {
    return {}
  }
  return typeof perView === 'number' ? { base: perView } : perView
}

function CarouselRoot({
  align = 'start',
  ariaLabel,
  autoplay,
  children,
  defaultIndex,
  gap = true,
  loop,
  onChange,
  opts,
  orientation = 'horizontal',
  perView,
  plugins,
  responsiveTo = 'viewport',
  setApi,
  slidesToScroll,
}: PropsWithChildren<CarouselProps>) {
  const { base = 1, sm, md, lg, xl } = toResponsive(perView)
  // A fixed count moves one view per press. A count that changes with the
  // width has no single number, so Embla groups whatever fits the viewport.
  const scrollBy =
    slidesToScroll ?? (typeof perView === 'object' ? ('auto' as const) : base)

  // Only what is set. Embla spreads these over its defaults, so a key that is
  // present and `undefined` *replaces* the default: `startIndex: undefined`
  // made the index `NaN`, and a track at index NaN never moves.
  const options = useMemo(
    () => ({
      ...opts,
      align,
      axis: orientation === 'vertical' ? ('y' as const) : ('x' as const),
      slidesToScroll: scrollBy,
      ...(loop === undefined ? {} : { loop }),
      ...(defaultIndex === undefined ? {} : { startIndex: defaultIndex }),
    }),
    [align, defaultIndex, loop, opts, orientation, scrollBy],
  )
  const [emblaRef, api] = useEmblaCarousel(options, plugins)
  const [selected, setSelected] = useState(defaultIndex ?? 0)
  const [snaps, setSnaps] = useState<number[]>([])
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [paused, setPaused] = useState(false)
  const [dots, setDots] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const sync = useCallback(() => {
    if (!api) {
      return
    }

    setSelected(api.selectedScrollSnap())
    setSnaps(api.scrollSnapList())
    setCanPrevious(api.canScrollPrev())
    setCanNext(api.canScrollNext())
  }, [api])

  useEffect(() => {
    if (!api) {
      return
    }

    const embla = api

    function onSelect() {
      sync()
      onChangeRef.current?.(embla.selectedScrollSnap())
    }

    sync()
    embla.on('select', onSelect)
    embla.on('reInit', sync)

    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', sync)
    }
  }, [api, sync])

  useEffect(() => {
    if (api) {
      setApi?.(api)
    }
  }, [api, setApi])

  useEffect(() => {
    if (!api || !autoplay || paused || usesReducedMotion()) {
      return
    }

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, autoplay)

    return () => clearInterval(timer)
  }, [api, autoplay, paused])

  // Captured on the root, the shadcn way: the keys work from a control, from
  // a link inside a slide, from anywhere the reader tabbed to.
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const previous = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

    if (event.key === previous) {
      event.preventDefault()
      api?.scrollPrev()
    } else if (event.key === next) {
      event.preventDefault()
      api?.scrollNext()
    }
  }

  const { root } = styles({
    dots,
    gap,
    orientation,
    perView: base,
    responsiveTo,
  })
  // Each breakpoint lands in exactly one table: the viewport's media queries
  // or the root's container queries, never both.
  const container = responsiveTo === 'container'

  const context = useMemo(
    () => ({
      api,
      canNext,
      canPrevious,
      dots,
      emblaRef,
      gap,
      orientation,
      perView: base,
      perViewContainerLg: container ? lg : undefined,
      perViewContainerMd: container ? md : undefined,
      perViewContainerSm: container ? sm : undefined,
      perViewContainerXl: container ? xl : undefined,
      perViewLg: container ? undefined : lg,
      perViewMd: container ? undefined : md,
      perViewSm: container ? undefined : sm,
      perViewXl: container ? undefined : xl,
      registerDots: setDots,
      responsiveTo,
      selected,
      snaps,
    }),
    [
      api,
      canNext,
      canPrevious,
      dots,
      emblaRef,
      gap,
      orientation,
      base,
      sm,
      md,
      lg,
      xl,
      container,
      responsiveTo,
      selected,
      snaps,
    ],
  )

  return (
    <CarouselContext value={context}>
      <section
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={root()}
        data-testid="carousel"
        onBlur={autoplay ? () => setPaused(false) : undefined}
        onFocus={autoplay ? () => setPaused(true) : undefined}
        onKeyDownCapture={onKeyDown}
        onPointerEnter={autoplay ? () => setPaused(true) : undefined}
        onPointerLeave={autoplay ? () => setPaused(false) : undefined}
      >
        {children}
      </section>
    </CarouselContext>
  )
}

function CarouselContent({ children }: PropsWithChildren) {
  const carousel = useCarousel()
  const slides = Children.toArray(children)
  const { content, track } = styles(carousel)

  return (
    <div
      className={content()}
      data-testid="carousel-content"
      ref={carousel.emblaRef}
    >
      <div className={track()} data-testid="carousel-track">
        {slides.map((slide, index) => (
          <SlideContext key={index} value={{ index, total: slides.length }}>
            {slide}
          </SlideContext>
        ))}
      </div>
    </div>
  )
}

function CarouselItem({ children }: PropsWithChildren) {
  const labels = useLabels()
  const carousel = useCarousel()
  const slide = useContext(SlideContext)
  const { item } = styles(carousel)

  return (
    // The APG slide is a group with roledescription "slide"; <fieldset> is
    // that group natively.
    <fieldset
      aria-label={labels.carousel.slide(
        (slide?.index ?? 0) + 1,
        slide?.total ?? 1,
      )}
      aria-roledescription="slide"
      className={item()}
      data-testid="carousel-item"
    >
      {children}
    </fieldset>
  )
}

function CarouselPrevious() {
  const labels = useLabels()
  const carousel = useCarousel()
  const { control, previous } = styles(carousel)

  return (
    <Button
      ariaLabel={labels.carousel.previous}
      className={control({ class: previous() })}
      data-testid="carousel-previous"
      disabled={!carousel.canPrevious}
      onClick={() => carousel.api?.scrollPrev()}
      size="icon-sm"
      variant="outline"
    >
      <ChevronLeft />
    </Button>
  )
}

function CarouselNext() {
  const labels = useLabels()
  const carousel = useCarousel()
  const { control, next } = styles(carousel)

  return (
    <Button
      ariaLabel={labels.carousel.next}
      className={control({ class: next() })}
      data-testid="carousel-next"
      disabled={!carousel.canNext}
      onClick={() => carousel.api?.scrollNext()}
      size="icon-sm"
      variant="outline"
    >
      <ChevronRight />
    </Button>
  )
}

function CarouselDots() {
  const labels = useLabels()
  const carousel = useCarousel()
  const { dot, dotIndicator, dots } = styles(carousel)
  const { registerDots } = carousel

  // Tells the root it has dots, so it reserves their room and the controls
  // centre on the slides above that room.
  useEffect(() => {
    registerDots(true)

    return () => registerDots(false)
  }, [registerDots])

  return (
    <div className={dots()} data-testid="carousel-dots">
      {carousel.snaps.map((_snap, index) => (
        <button
          aria-label={labels.carousel.slide(index + 1, carousel.snaps.length)}
          className={dot()}
          data-active={index === carousel.selected || undefined}
          data-testid="carousel-dot"
          key={index}
          onClick={() => carousel.api?.scrollTo(index)}
          type="button"
        >
          <span className={dotIndicator()} />
        </button>
      ))}
    </div>
  )
}

const Carousel = Object.assign(CarouselRoot, {
  Content: CarouselContent,
  Dots: CarouselDots,
  Item: CarouselItem,
  Next: CarouselNext,
  Previous: CarouselPrevious,
})

export { Carousel }
