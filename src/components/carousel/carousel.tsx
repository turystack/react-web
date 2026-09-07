import useEmblaCarousel from 'embla-carousel-react'
import {
  Children,
  createContext,
  type KeyboardEvent,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { ChevronLeft, ChevronRight } from '@/internal/icons'

import type {
  CarouselOrientation,
  CarouselPerView,
  CarouselProps,
} from './carousel.types'

export const styles = tv({
  defaultVariants: {
    controlsPlacement: 'inside',
    orientation: 'horizontal',
    perView: 1,
  },
  slots: {
    control: 'carousel-control absolute z-10 rounded-full shadow-sm',
    dot: 'carousel-dot group flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    dotIndicator:
      'carousel-dot-indicator size-2 rounded-full bg-border transition-all group-hover:bg-muted-foreground group-data-active:w-4 group-data-active:bg-primary',
    dots: 'carousel-dots flex items-center justify-center gap-1.5',
    item: 'carousel-item min-w-0 shrink-0 grow-0',
    next: 'carousel-next',
    previous: 'carousel-previous',
    root: 'carousel relative flex w-full flex-col gap-3',
    track: 'carousel-track flex list-none',
    viewport:
      'carousel-viewport overflow-hidden rounded-lg outline-none focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  },
  variants: {
    /**
     * `inside` overlays the controls on the edge of the slides, which is where
     * the reader's pointer already is. `outside` moves them into the margin for
     * a slide that must not be covered — an image with text at its edges, a
     * card whose own controls would sit underneath.
     */
    controlsPlacement: {
      inside: {},
      outside: {},
    },
    gap: {
      true: {},
    },
    orientation: {
      horizontal: {},
      vertical: {
        root: 'h-full',
        track: 'h-full flex-col',
        viewport: 'min-h-0 flex-1',
      },
    },
    perView: {
      1: {
        item: 'basis-full',
      },
      2: {
        item: 'basis-1/2',
      },
      3: {
        item: 'basis-1/3',
      },
      4: {
        item: 'basis-1/4',
      },
      6: {
        item: 'basis-1/6',
      },
    },
  },
  compoundVariants: [
    {
      class: {
        item: 'pl-3',
        track: '-ml-3',
      },
      gap: true,
      orientation: 'horizontal',
    },
    {
      class: {
        item: 'pt-3',
        track: '-mt-3',
      },
      gap: true,
      orientation: 'vertical',
    },
    {
      class: {
        next: 'top-1/2 right-2 -translate-y-1/2',
        previous: 'top-1/2 left-2 -translate-y-1/2',
      },
      controlsPlacement: 'inside',
      orientation: 'horizontal',
    },
    {
      class: {
        next: 'bottom-2 left-1/2 -translate-x-1/2 rotate-90',
        previous: 'top-2 left-1/2 -translate-x-1/2 rotate-90',
      },
      controlsPlacement: 'inside',
      orientation: 'vertical',
    },
    {
      class: {
        next: 'top-1/2 -right-11 -translate-y-1/2',
        previous: 'top-1/2 -left-11 -translate-y-1/2',
        root: 'px-11',
      },
      controlsPlacement: 'outside',
      orientation: 'horizontal',
    },
    {
      class: {
        next: '-bottom-11 left-1/2 -translate-x-1/2 rotate-90',
        previous: '-top-11 left-1/2 -translate-x-1/2 rotate-90',
        root: 'py-11',
      },
      controlsPlacement: 'outside',
      orientation: 'vertical',
    },
  ],
})

type CarouselContextValue = {
  gap: boolean
  orientation: CarouselOrientation
  perView: CarouselPerView
}

const CarouselContext = createContext<CarouselContextValue>({
  gap: true,
  orientation: 'horizontal',
  perView: 1,
})

type SlideContextValue = {
  index: number
  total: number
}

const SlideContext = createContext<SlideContextValue>({
  index: 0,
  total: 1,
})

/** Whether the reader has asked the platform for less movement. */
function usesReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function CarouselRoot({
  align = 'start',
  ariaLabel,
  autoplay,
  children,
  controls = true,
  controlsPlacement = 'inside',
  defaultIndex,
  dots,
  gap = true,
  loop,
  onChange,
  orientation = 'horizontal',
  perView = 1,
  slidesToScroll = perView,
}: PropsWithChildren<CarouselProps>) {
  const labels = useLabels()
  const [emblaRef, embla] = useEmblaCarousel({
    align,
    axis: orientation === 'vertical' ? 'y' : 'x',
    loop,
    slidesToScroll,
    startIndex: defaultIndex,
  })
  const [selected, setSelected] = useState(defaultIndex ?? 0)
  const [snaps, setSnaps] = useState<number[]>([])
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [paused, setPaused] = useState(false)

  const sync = useCallback(() => {
    if (!embla) {
      return
    }

    setSelected(embla.selectedScrollSnap())
    setCanPrevious(embla.canScrollPrev())
    setCanNext(embla.canScrollNext())
  }, [embla])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!embla) {
      return
    }

    function onSelect() {
      sync()
      onChangeRef.current?.(embla?.selectedScrollSnap() ?? 0)
    }

    setSnaps(embla.scrollSnapList())
    sync()
    embla.on('select', onSelect)
    embla.on('reInit', sync)

    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', sync)
    }
  }, [embla, sync])

  /**
   * A timer, not a plugin: the whole of autoplay is "advance, and stop while
   * someone is looking". Pausing on hover and on focus is the part that makes
   * it usable, and it is also the part a dependency would not know about.
   */
  useEffect(() => {
    if (!embla || !autoplay || paused || usesReducedMotion()) {
      return
    }

    const timer = setInterval(() => {
      if (embla.canScrollNext()) {
        embla.scrollNext()
        return
      }

      embla.scrollTo(0)
    }, autoplay)

    return () => clearInterval(timer)
  }, [autoplay, embla, paused])

  const slides = Children.toArray(children)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const previous = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

    if (event.key === previous) {
      embla?.scrollPrev()
    } else if (event.key === next) {
      embla?.scrollNext()
    } else if (event.key === 'Home') {
      embla?.scrollTo(0)
    } else if (event.key === 'End') {
      embla?.scrollTo(snaps.length - 1)
    } else {
      return
    }

    event.preventDefault()
  }

  const {
    control,
    dot,
    dotIndicator,
    dots: dotsSlot,
    next: nextSlot,
    previous: previousSlot,
    root,
    track,
    viewport,
  } = styles({
    controlsPlacement,
    gap,
    orientation,
    perView,
  })

  return (
    <CarouselContext
      value={{
        gap,
        orientation,
        perView,
      }}
    >
      <section
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={root()}
        data-testid="carousel"
        onBlur={autoplay ? () => setPaused(false) : undefined}
        onFocus={autoplay ? () => setPaused(true) : undefined}
        onPointerEnter={autoplay ? () => setPaused(true) : undefined}
        onPointerLeave={autoplay ? () => setPaused(false) : undefined}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: a fieldset cannot be Embla's scroll container */}
        <div
          aria-label={ariaLabel}
          aria-live="polite"
          className={viewport()}
          data-testid="carousel-viewport"
          onKeyDown={onKeyDown}
          ref={emblaRef}
          role="group"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the track is the tab stop the arrow keys act on, which is what keeps this from being swipe-only
          tabIndex={0}
        >
          <ul className={track()}>
            {slides.map((slide, index) => (
              <SlideContext
                key={index}
                value={{
                  index,
                  total: slides.length,
                }}
              >
                {slide}
              </SlideContext>
            ))}
          </ul>
        </div>

        {controls ? (
          <>
            <Button
              ariaLabel={labels.carousel.previous}
              className={control({
                class: previousSlot(),
              })}
              data-testid="carousel-previous"
              disabled={!canPrevious}
              onClick={() => embla?.scrollPrev()}
              size="icon-sm"
              variant="outline"
            >
              <ChevronLeft />
            </Button>
            <Button
              ariaLabel={labels.carousel.next}
              className={control({
                class: nextSlot(),
              })}
              data-testid="carousel-next"
              disabled={!canNext}
              onClick={() => embla?.scrollNext()}
              size="icon-sm"
              variant="outline"
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}

        {dots ? (
          <div className={dotsSlot()}>
            {snaps.map((_snap, index) => (
              <button
                aria-label={labels.carousel.slide(index + 1, snaps.length)}
                className={dot()}
                data-active={index === selected || undefined}
                data-testid="carousel-dot"
                key={index}
                onClick={() => embla?.scrollTo(index)}
                type="button"
              >
                <span className={dotIndicator()} />
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </CarouselContext>
  )
}

function CarouselItem({ children }: PropsWithChildren) {
  const labels = useLabels()
  const carousel = useContext(CarouselContext)
  const slide = useContext(SlideContext)
  const { item } = styles({
    gap: carousel.gap,
    orientation: carousel.orientation,
    perView: carousel.perView,
  })

  return (
    // biome-ignore lint/a11y/useSemanticElements: a slide is a labelled group inside a list, and a fieldset inside a <ul> is not
    <li
      aria-label={labels.carousel.slide(slide.index + 1, slide.total)}
      aria-roledescription="slide"
      className={item()}
      data-testid="carousel-item"
      role="group"
    >
      {children}
    </li>
  )
}

const Carousel = Object.assign(CarouselRoot, {
  Item: CarouselItem,
})

export { Carousel }
