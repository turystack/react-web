import {
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { cn } from '@/support/utils'

import { useLayout } from '../layout.context'
import { GUTTER_X } from '../layout.gutter'
import type { LayoutHeaderProps } from './header.types'

/**
 * How far the page has to move before the bar condenses. Small on purpose:
 * the point is "the page is no longer at its top", and a few pixels of
 * rubber-band or a focus scroll should not flip it back and forth.
 */
const CONDENSE_THRESHOLD = 8

const styles = tv({
  compoundVariants: [
    // One step down in height once the page has scrolled.
    {
      class: {
        header: 'h-12',
      },
      condensed: true,
      size: 'lg',
    },
    {
      class: {
        header: 'h-10',
      },
      condensed: true,
      size: 'md',
    },
    {
      class: {
        header: 'h-8',
      },
      condensed: true,
      size: 'sm',
    },
    // The border is always there, transparent, so it appearing never moves
    // the bar's content by a pixel. A `bordered` header keeps its own.
    {
      bordered: false,
      class: {
        header: 'border-transparent',
      },
      condensed: false,
      condenseOnScroll: true,
    },
  ],
  defaultVariants: {
    size: 'md',
  },
  slots: {
    header: 'layout-header min-w-0 shrink-0',
    // The bar's own row: its layout, gap and gutter. Without a maxWidth it is
    // the <header> itself; with one it is an inner box, centred and capped at
    // the Container scale, so the gutter sits inside the cap the way a
    // Container's paddingX does and the two line up on a wide screen.
    headerInner: 'layout-header-inner mx-auto h-full w-full',
    headerRow: 'layout-header-row min-w-0 items-center gap-3',
    // `min-w-0` is what makes the middle column give way. `flex-1` alone
    // resolves to `min-width: auto`, so a long title refuses to shrink below
    // its own text and pushes the right section off the end of the bar —
    // which is what a header full of buttons looked like before.
    headerCenter: 'layout-header-center flex min-w-0 flex-1 items-center',
    // The three cells of a header with a `centerSection`. The side cells take
    // equal shares (`minmax(0, 1fr)`, so neither can grow past its half to
    // fit its content), which is what puts the middle one on the bar's true
    // centre however uneven the two sides are.
    headerEnd:
      'layout-header-end flex min-w-0 items-center justify-end gap-2 justify-self-stretch',
    headerMiddle:
      'layout-header-middle flex min-w-0 items-center justify-center',
    // `shrink-0`, because the sections are controls. A row of icon buttons
    // squeezed to make room for a title is a row of unreadable icon buttons.
    headerSection: 'layout-header-section flex shrink-0 items-center gap-2',
    headerStart:
      'layout-header-start flex min-w-0 items-center gap-3 justify-self-stretch',
  },
  variants: {
    bordered: {
      false: {},
      true: {
        header: 'border-border border-b',
      },
    },
    condensed: {
      false: {},
      true: {},
    },
    condenseOnScroll: {
      false: {},
      true: {
        header:
          'border-border border-b transition-[height,border-color] duration-200 ease-out motion-reduce:transition-none',
      },
    },
    layout: {
      // Three columns, `1fr auto 1fr`, for a truly centred middle slot.
      centered: {
        headerRow: 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
      },
      row: {
        headerRow: 'flex',
      },
    },
    // Container's maxWidth scale, step for step, so <Layout.Header
    // maxWidth="lg"> and <Container maxWidth="lg"> share one edge.
    maxWidth: {
      '2xl': {
        headerInner: 'max-w-(--breakpoint-2xl)',
      },
      full: {},
      lg: {
        headerInner: 'max-w-6xl',
      },
      md: {
        headerInner: 'max-w-3xl',
      },
      sm: {
        headerInner: 'max-w-sm',
      },
      xl: {
        headerInner: 'max-w-7xl',
      },
    },
    // The shell's gutter, not a scale of its own: see `layout.gutter.ts`.
    padding: {
      lg: {
        headerRow: GUTTER_X.lg,
      },
      md: {
        headerRow: GUTTER_X.md,
      },
      none: {
        headerRow: GUTTER_X.none,
      },
      sm: {
        headerRow: GUTTER_X.sm,
      },
    },
    size: {
      lg: {
        header: 'h-16',
      },
      md: {
        header: 'h-14',
      },
      sm: {
        header: 'h-10',
      },
    },
    sticky: {
      true: {
        header: 'sticky top-0 z-50 bg-background',
      },
    },
  },
})

/**
 * Whether the page under the header has left its top.
 *
 * The pane that scrolls is the shell's, not the header's: `Layout.Content`
 * is the one overflow box in the column. The header has no ref to it and
 * does not need one — scroll events do not bubble, but a *capturing*
 * listener on the shell root sees every one of them, so the header listens
 * on its own `.layout-root` and keeps the scrolls whose target is one of
 * that shell's Content panes (a table scrolling sideways inside the page is
 * not the page scrolling). Outside a Layout it falls back to the window.
 *
 * Passive, and read once per frame: a scroll event can fire many times a
 * frame, and each read of `scrollTop` is a layout query.
 */
function useCondensed(
  enabled: boolean,
  headerRef: RefObject<HTMLElement | null>,
) {
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const header = headerRef.current

    if (!enabled || header === null) {
      setCondensed(false)
      return
    }

    const root = header.closest<HTMLElement>('.layout-root')
    let frame = 0
    let pane: HTMLElement | null = null

    const read = () => {
      frame = 0
      const top = pane === null ? window.scrollY : pane.scrollTop
      setCondensed(top > CONDENSE_THRESHOLD)
    }

    const onScroll = (event: Event) => {
      const target = event.target

      if (root === null) {
        if (target !== document) {
          return
        }
      } else if (
        !(target instanceof HTMLElement) ||
        !target.classList.contains('layout-content') ||
        target.closest('.layout-root') !== root
      ) {
        return
      }

      pane = root === null ? null : (target as HTMLElement)

      if (frame === 0) {
        frame = window.requestAnimationFrame(read)
      }
    }

    const source: HTMLElement | Window = root ?? window
    source.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    })

    return () => {
      source.removeEventListener('scroll', onScroll, {
        capture: true,
      })
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [enabled, headerRef])

  return condensed
}

function LayoutHeader({
  bordered = false,
  centerSection,
  children,
  condenseOnScroll = false,
  leftSection,
  maxWidth = 'full',
  padding,
  rightSection,
  size = 'md',
  sticky,
}: PropsWithChildren<LayoutHeaderProps>) {
  // The shell's own padding is the fallback, so setting it once on <Layout>
  // lines the header up with the content and the footer below it.
  const layout = useLayout()
  const headerRef = useRef<HTMLElement>(null)
  const condensed = useCondensed(condenseOnScroll, headerRef)
  const hasCenter = centerSection !== undefined

  const {
    header,
    headerCenter,
    headerEnd,
    headerInner,
    headerMiddle,
    headerRow,
    headerSection,
    headerStart,
  } = styles({
    bordered,
    condensed,
    condenseOnScroll,
    layout: hasCenter ? 'centered' : 'row',
    maxWidth,
    padding: padding ?? layout.padding,
    size,
    sticky,
  })

  const condensedAttribute = condenseOnScroll ? String(condensed) : undefined
  const constrained = maxWidth !== 'full'

  // One frame for every arrangement: the bar is the row, or holds the capped
  // row. Height, border and stickiness stay on the <header> either way, so a
  // capped header still spans the screen with its border and background.
  const frame = (cells: ReactNode) => (
    <header
      className={constrained ? header() : cn(header(), headerRow())}
      data-condensed={condensedAttribute}
      data-size={size}
      data-testid="layout-header"
      ref={headerRef}
    >
      {constrained ? (
        <div
          className={cn(headerInner(), headerRow())}
          data-testid="layout-header-inner"
        >
          {cells}
        </div>
      ) : (
        cells
      )}
    </header>
  )

  if (hasCenter) {
    // Every cell is rendered, even empty: the grid places by position, so a
    // missing start cell would slide the middle one into the first column.
    // The title (children) sits in the start cell after the left section.
    return frame(
      <>
        <div className={headerStart()} data-testid="layout-header-start">
          {leftSection === undefined ? null : (
            <div className={headerSection()} data-testid="layout-header-left">
              {leftSection}
            </div>
          )}
          {children === undefined || children === null ? null : (
            <div className={headerCenter()}>{children}</div>
          )}
        </div>
        <div className={headerMiddle()} data-testid="layout-header-middle">
          {centerSection}
        </div>
        <div className={headerEnd()} data-testid="layout-header-end">
          {rightSection === undefined ? null : (
            <div className={headerSection()} data-testid="layout-header-right">
              {rightSection}
            </div>
          )}
        </div>
      </>,
    )
  }

  const hasSections = leftSection !== undefined || rightSection !== undefined

  if (!hasSections) {
    return frame(children)
  }

  // Each section is rendered only when it is given. An always-rendered empty
  // one is not free: the bar is a `gap` flex row, so a zero-width box still
  // opens a gap, and a header with only a right section stood its title 12px
  // in from the padding while every other header started flush.
  return frame(
    <>
      {leftSection === undefined ? null : (
        <div className={headerSection()} data-testid="layout-header-left">
          {leftSection}
        </div>
      )}
      <div className={headerCenter()}>{children}</div>
      {rightSection === undefined ? null : (
        <div className={headerSection()} data-testid="layout-header-right">
          {rightSection}
        </div>
      )}
    </>,
  )
}

export { LayoutHeader }
