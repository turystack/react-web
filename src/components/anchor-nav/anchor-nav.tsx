import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import { useLabels } from '@/components/labels-provider'

import type { AnchorNavOffset, AnchorNavProps } from './anchor-nav.types'

export const styles = tv({
  slots: {
    item: 'anchor-nav-item',
    list: 'anchor-nav-list flex flex-col border-border border-l',
    root: 'anchor-nav w-full',
  },
})

const linkStyles = tv({
  base: [
    'anchor-nav-link -ml-px block rounded-r-sm border-l-2 py-1 pl-3 text-sm transition-colors motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
  ],
  defaultVariants: {
    active: false,
  },
  variants: {
    active: {
      false:
        'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
      true: 'border-primary font-medium text-foreground',
    },
  },
})

/**
 * How long the spy waits for a click's scroll to end when the browser never
 * says so (no `scrollend`, or the section was already in place). Internal:
 * it only bounds how long the clicked link wins over the observer.
 */
const SCROLL_SETTLE_MS = 1000

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The height a sticky or fixed page header takes off the top of the
 * viewport, measured rather than assumed: Layout.Header comes in three sizes
 * and an app may bring its own bar. When the sections scroll inside a pane,
 * only a header inside that pane covers them — one above the pane never
 * overlaps its content.
 */
function headerClearance(offset: AnchorNavOffset, pane: HTMLElement | null) {
  if (offset === 'none' || typeof document === 'undefined') {
    return 0
  }

  for (const header of document.querySelectorAll('.layout-header, header')) {
    if (pane && !pane.contains(header)) {
      continue
    }

    const { position } = window.getComputedStyle(header)

    if (position === 'sticky' || position === 'fixed') {
      return header.getBoundingClientRect().height
    }
  }

  return 0
}

/**
 * The element the sections actually scroll in: the nearest ancestor whose
 * computed overflow scrolls. `null` means the window — a layout column that
 * scrolls on its own is not the viewport, and an observer rooted on the
 * viewport misreads every section in it.
 */
function scrollPane(node: Element | null): HTMLElement | null {
  let element = node?.parentElement ?? null

  while (
    element &&
    element !== document.body &&
    element !== document.documentElement
  ) {
    const { overflow, overflowY } = window.getComputedStyle(element)

    if (/(auto|scroll|overlay)/.test(`${overflowY} ${overflow}`)) {
      return element
    }

    element = element.parentElement
  }

  return null
}

/**
 * Scrolled as far as it goes (within a pixel, for fractional zoom). The last
 * sections of a page are often too short to ever reach the top, so the
 * bottom of the scroll is the only moment they can be the one being read.
 */
function atScrollEnd(pane: HTMLElement | null) {
  const element = pane ?? document.scrollingElement ?? document.documentElement
  const max = element.scrollHeight - element.clientHeight

  return max > 0 && element.scrollTop >= max - 1
}

function hashId() {
  if (typeof window === 'undefined') {
    return undefined
  }

  const hash = window.location.hash.slice(1)

  return hash ? decodeURIComponent(hash) : undefined
}

export function AnchorNav({
  activeId,
  ariaLabel,
  defaultActiveId,
  items,
  offset = 'header',
  onActiveChange,
  scrollSpy = true,
}: AnchorNavProps) {
  const labels = useLabels()
  const { item: itemSlot, list, root } = styles()
  const [internalId, setInternalId] = useState<string | undefined>(() => {
    const fromHash = hashId()

    return (
      defaultActiveId ??
      (items.some((item) => item.id === fromHash) ? fromHash : undefined) ??
      items[0]?.id
    )
  })
  const current = activeId ?? internalId

  // The observer and the click handler outlive renders; they read the latest
  // values through refs instead of re-subscribing on every change.
  const currentRef = useRef(current)
  currentRef.current = current
  const onActiveChangeRef = useRef(onActiveChange)
  onActiveChangeRef.current = onActiveChange
  const lockedRef = useRef(false)
  const releaseRef = useRef<() => void>(() => undefined)

  function select(id: string) {
    if (id === currentRef.current) {
      return
    }

    currentRef.current = id
    setInternalId(id)
    onActiveChangeRef.current?.(id)
  }

  const ids = items.map((item) => item.id).join('\u0000')

  useEffect(() => {
    if (!scrollSpy || typeof IntersectionObserver === 'undefined') {
      return
    }

    const sections = ids
      .split('\u0000')
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) {
      return
    }

    const pane = scrollPane(sections[0] ?? null)
    const visible = new Map<string, boolean>()
    const clearance = headerClearance(offset, pane)

    function follow() {
      if (lockedRef.current) {
        return
      }

      const last = sections[sections.length - 1]

      if (last && atScrollEnd(pane)) {
        select(last.id)
        return
      }

      const first = sections.find((section) => visible.get(section.id))

      if (first) {
        select(first.id)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting)
        }

        follow()
      },
      {
        root: pane,
        rootMargin: `-${clearance}px 0px -50% 0px`,
      },
    )

    for (const section of sections) {
      observer.observe(section)
    }

    // The observer only speaks when a section crosses the line; reaching the
    // end of the scroll crosses nothing, so the scroll itself is heard too.
    const scroller: HTMLElement | Window = pane ?? window

    scroller.addEventListener('scroll', follow, { passive: true })

    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', follow)
    }
  }, [ids, offset, scrollSpy])

  useEffect(() => () => releaseRef.current(), [])

  /**
   * Holds the spy on the clicked link. While the click's own scroll runs, the
   * links it passes must not flash active; once it ends (`scrollend`, or the
   * fallback timer when the browser never fires one) the clicked link still
   * wins — a short section near the end cannot reach the top, and the spy
   * would otherwise hand the page to its neighbour — until the reader scrolls
   * again. A wheel or a touch drag during the glide hands control back at once.
   */
  function lockSpy() {
    releaseRef.current()
    lockedRef.current = true

    let settled = false
    const settle = () => {
      settled = true
      window.clearTimeout(timer)
    }
    const onScroll = () => {
      if (settled) {
        release()
      }
    }
    const release = () => {
      lockedRef.current = false
      window.clearTimeout(timer)
      window.removeEventListener('scrollend', settle, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('wheel', release, true)
      window.removeEventListener('touchmove', release, true)
      releaseRef.current = () => undefined
    }
    const timer = window.setTimeout(settle, SCROLL_SETTLE_MS)

    // Capture on the window hears every scroll container, and runs before
    // the spy's own listener on the pane, so the reader's scroll is followed.
    window.addEventListener('scrollend', settle, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('wheel', release, { capture: true, passive: true })
    window.addEventListener('touchmove', release, {
      capture: true,
      passive: true,
    })
    releaseRef.current = release
  }

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    // A modified click opens the link elsewhere; that is the browser's job.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    event.preventDefault()
    select(id)
    window.history.replaceState(window.history.state, '', `#${id}`)

    const section = document.getElementById(id)

    if (!section) {
      return
    }

    // The clearance rides on the section as `scroll-margin-top`, which every
    // scroll container honours — the page may scroll inside a layout column
    // rather than the window. A margin the app set itself is left alone.
    const clearance = headerClearance(offset, scrollPane(section))
    const ownMargin = window.getComputedStyle(section).scrollMarginTop

    if (clearance > 0 && (!ownMargin || ownMargin === '0px')) {
      section.style.scrollMarginTop = `${clearance}px`
    }

    lockSpy()
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label={ariaLabel ?? labels.anchorNav.label}
      className={root()}
      data-testid="anchor-nav"
    >
      <ul className={list()}>
        {items.map((item) => {
          const active = item.id === current

          return (
            <li className={itemSlot()} key={item.id}>
              <a
                aria-current={active ? 'location' : undefined}
                className={linkStyles({ active })}
                data-testid={`anchor-nav-link-${item.id}`}
                href={`#${item.id}`}
                onClick={(event) => go(event, item.id)}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
