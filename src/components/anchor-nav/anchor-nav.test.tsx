import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { AnchorNav } from './anchor-nav'
import type { AnchorNavItem } from './anchor-nav.types'

const items: AnchorNavItem[] = [
  { id: 'general', label: 'General' },
  { id: 'billing', label: 'Billing' },
  { id: 'security', label: 'Security' },
]

/**
 * jsdom has no IntersectionObserver. This one records what it was asked to
 * watch and lets a test say which sections are on screen.
 */
class FakeObserver {
  static instances: FakeObserver[] = []
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit | undefined
  targets: Element[] = []

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback
    this.options = options
    FakeObserver.instances.push(this)
  }

  observe(target: Element) {
    this.targets.push(target)
  }

  disconnect() {
    this.targets = []
  }

  unobserve() {}

  takeRecords() {
    return []
  }

  show(visible: Record<string, boolean>) {
    act(() => {
      this.callback(
        Object.entries(visible).map(([id, isIntersecting]) => ({
          isIntersecting,
          target: document.getElementById(id) as Element,
        })) as IntersectionObserverEntry[],
        this as unknown as IntersectionObserver,
      )
    })
  }
}

function latestObserver() {
  return FakeObserver.instances[FakeObserver.instances.length - 1]
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      {items.map((item) => (
        <section id={item.id} key={item.id}>
          {item.id}
        </section>
      ))}
    </div>
  )
}

/** Sections inside a layout column that scrolls on its own. */
function Pane({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <div data-testid="pane" style={{ overflowY: 'auto' }}>
        <div>
          {items.map((item) => (
            <section id={item.id} key={item.id}>
              {item.id}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/** jsdom lays nothing out; this gives an element the scroll metrics a browser would. */
function scrollMetrics(
  element: Element,
  metrics: { clientHeight: number; scrollHeight: number; scrollTop: number },
) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(element, key, { configurable: true, value })
  }
}

function userScroll(target: Element | Window) {
  act(() => {
    const event = new Event('scroll')

    if (target === window) {
      document.dispatchEvent(event)
      window.dispatchEvent(new Event('scroll'))
    } else {
      target.dispatchEvent(event)
    }
  })
}

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    addEventListener: () => undefined,
    matches: reduce && query.includes('reduce'),
    media: query,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia
}

const scrollIntoView = vi.fn()
const originalMatchMedia = window.matchMedia

beforeEach(() => {
  FakeObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  Element.prototype.scrollIntoView = scrollIntoView
  scrollIntoView.mockClear()
  mockReducedMotion(false)
  window.history.replaceState(null, '', '/settings')
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.matchMedia = originalMatchMedia
  document.body.innerHTML = ''
})

describe('AnchorNav', () => {
  it('is a nav named by the labels provider, with one link per section', () => {
    render(<AnchorNav items={items} />)

    const nav = screen.getByRole('navigation', { name: 'On this page' })

    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'href',
      '#billing',
    )
  })

  it('takes a name from ariaLabel or from a provider override', () => {
    const { rerender } = render(
      <LabelsProvider labels={{ anchorNav: { label: 'Nesta página' } }}>
        <AnchorNav items={items} />
      </LabelsProvider>,
    )

    expect(
      screen.getByRole('navigation', { name: 'Nesta página' }),
    ).toBeInTheDocument()

    rerender(<AnchorNav ariaLabel="Settings sections" items={items} />)

    expect(
      screen.getByRole('navigation', { name: 'Settings sections' }),
    ).toBeInTheDocument()
  })

  it('renders nothing when there are no sections', () => {
    render(<AnchorNav items={[]} />)

    expect(screen.queryByTestId('anchor-nav')).not.toBeInTheDocument()
  })

  it('marks the first section current until it knows better', () => {
    render(<AnchorNav items={items} />)

    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    expect(screen.getByRole('link', { name: 'Billing' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('starts on the section the URL hash names, or on defaultActiveId', () => {
    window.history.replaceState(null, '', '/settings#security')
    const { unmount } = render(<AnchorNav items={items} />)

    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    unmount()
    render(<AnchorNav defaultActiveId="billing" items={items} />)

    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('follows activeId when controlled', () => {
    const { rerender } = render(<AnchorNav activeId="billing" items={items} />)

    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    rerender(<AnchorNav activeId="security" items={items} />)

    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    expect(screen.getByRole('link', { name: 'Billing' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('scrolls to the clicked section and writes it to the URL hash', () => {
    const onActiveChange = vi.fn()

    render(
      <Page>
        <AnchorNav items={items} onActiveChange={onActiveChange} />
      </Page>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Security' }))

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(
      document.getElementById('security'),
    )
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
    expect(window.location.hash).toBe('#security')
    expect(onActiveChange).toHaveBeenCalledWith('security')
    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('jumps instead of gliding under prefers-reduced-motion', () => {
    mockReducedMotion(true)
    render(
      <Page>
        <AnchorNav items={items} />
      </Page>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    })
  })

  it('reports a click but keeps showing activeId when controlled', () => {
    const onActiveChange = vi.fn()

    render(
      <Page>
        <AnchorNav
          activeId="general"
          items={items}
          onActiveChange={onActiveChange}
        />
      </Page>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(onActiveChange).toHaveBeenCalledWith('billing')
    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('clears a sticky header before the section when offset is header', () => {
    render(
      <>
        <header className="layout-header" style={{ position: 'sticky' }} />
        <Page>
          <AnchorNav items={items} />
        </Page>
      </>,
    )
    const header = document.querySelector('header') as HTMLElement

    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(document.getElementById('billing')?.style.scrollMarginTop).toBe(
      '56px',
    )
  })

  it('leaves a scroll margin the app set on the section alone', () => {
    render(
      <>
        <header className="layout-header" style={{ position: 'sticky' }} />
        <section id="own" style={{ scrollMarginTop: '2rem' }} />
        <AnchorNav items={[{ id: 'own', label: 'Own' }]} />
      </>,
    )
    const header = document.querySelector('header') as HTMLElement

    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    fireEvent.click(screen.getByRole('link', { name: 'Own' }))

    expect(document.getElementById('own')?.style.scrollMarginTop).toBe('2rem')
  })

  it('scrolls flush to the top when offset is none', () => {
    render(
      <>
        <header className="layout-header" style={{ position: 'sticky' }} />
        <Page>
          <AnchorNav items={items} offset="none" />
        </Page>
      </>,
    )
    const header = document.querySelector('header') as HTMLElement

    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(document.getElementById('billing')?.style.scrollMarginTop).toBe('')
    expect(latestObserver().options?.rootMargin).toBe('-0px 0px -50% 0px')
  })

  it('moves the current link with the scroll position', () => {
    const onActiveChange = vi.fn()

    render(
      <Page>
        <AnchorNav items={items} onActiveChange={onActiveChange} />
      </Page>,
    )
    const observer = latestObserver()

    expect(observer.targets.map((target) => target.id)).toEqual([
      'general',
      'billing',
      'security',
    ])

    observer.show({ billing: true, general: false })

    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    expect(onActiveChange).toHaveBeenLastCalledWith('billing')

    // Two sections on screen: the one higher on the page wins.
    observer.show({ security: true })

    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    observer.show({ billing: false })

    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('holds the spy still while a click scrolls, then lets it go', () => {
    vi.useFakeTimers()

    try {
      render(
        <Page>
          <AnchorNav items={items} />
        </Page>,
      )
      const observer = latestObserver()

      fireEvent.click(screen.getByRole('link', { name: 'Security' }))
      observer.show({ billing: true })

      expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      act(() => {
        window.dispatchEvent(new Event('scrollend'))
      })
      // The scroll ended, but the reader has not moved: the click still wins.
      observer.show({ billing: true })

      expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      userScroll(window)
      observer.show({ billing: true })

      expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
        'aria-current',
        'location',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('settles on its own when the browser never says the scroll ended', () => {
    vi.useFakeTimers()

    try {
      render(
        <Page>
          <AnchorNav items={items} />
        </Page>,
      )
      const observer = latestObserver()

      fireEvent.click(screen.getByRole('link', { name: 'Security' }))
      act(() => {
        vi.advanceTimersByTime(999)
      })
      userScroll(window)
      observer.show({ billing: true })

      // Still the click's own glide: a scroll before it settles is not the
      // reader's.
      expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      act(() => {
        vi.advanceTimersByTime(1)
      })
      observer.show({ billing: true })

      // Settled, but the reader has not scrolled yet: the click still wins.
      expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      userScroll(window)
      observer.show({ billing: true })

      expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
        'aria-current',
        'location',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('watches the viewport when the page scrolls in the window', () => {
    render(
      <Page>
        <AnchorNav items={items} />
      </Page>,
    )

    expect(latestObserver().options?.root).toBeNull()
  })

  it('watches the pane the sections scroll in, not the viewport', () => {
    render(
      <Pane>
        <AnchorNav items={items} />
      </Pane>,
    )

    expect(latestObserver().options?.root).toBe(screen.getByTestId('pane'))
  })

  it('counts only a header inside the pane as covering its sections', () => {
    render(
      <>
        <header className="layout-header" style={{ position: 'sticky' }} />
        <Pane>
          <AnchorNav items={items} />
        </Pane>
      </>,
    )
    const header = document.querySelector('header') as HTMLElement

    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(document.getElementById('billing')?.style.scrollMarginTop).toBe('')
    expect(latestObserver().options?.rootMargin).toBe('-0px 0px -50% 0px')
  })

  it('clears a sticky header that scrolls inside the pane with the sections', () => {
    render(
      <div style={{ overflowY: 'auto' }}>
        <header className="layout-header" style={{ position: 'sticky' }} />
        <section id="general">general</section>
        <section id="billing">billing</section>
        <AnchorNav items={items.slice(0, 2)} />
      </div>,
    )
    const header = document.querySelector('header') as HTMLElement

    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    fireEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(document.getElementById('billing')?.style.scrollMarginTop).toBe(
      '56px',
    )
  })

  it('makes the last section current once the pane is scrolled to the end', () => {
    const onActiveChange = vi.fn()

    render(
      <Pane>
        <AnchorNav items={items} onActiveChange={onActiveChange} />
      </Pane>,
    )
    const pane = screen.getByTestId('pane')
    const observer = latestObserver()

    // Mid-way: the observer decides.
    scrollMetrics(pane, {
      clientHeight: 400,
      scrollHeight: 1000,
      scrollTop: 300,
    })
    observer.show({ billing: true, general: false })
    userScroll(pane)

    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    // Within a pixel of the bottom: security is too short to reach the top,
    // yet it is what the reader is looking at.
    scrollMetrics(pane, {
      clientHeight: 400,
      scrollHeight: 1000,
      scrollTop: 599.5,
    })
    userScroll(pane)

    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    expect(onActiveChange).toHaveBeenLastCalledWith('security')

    // The observer reporting billing still on screen does not take it back.
    observer.show({ billing: true })

    expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('does not call a page that cannot scroll "at the end"', () => {
    render(
      <Pane>
        <AnchorNav items={items} />
      </Pane>,
    )
    const pane = screen.getByTestId('pane')

    scrollMetrics(pane, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 })
    latestObserver().show({ general: true })
    userScroll(pane)

    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('keeps a clicked late section current at the bottom until the reader scrolls', () => {
    vi.useFakeTimers()

    try {
      render(
        <Pane>
          <AnchorNav items={items} />
        </Pane>,
      )
      const pane = screen.getByTestId('pane')
      const observer = latestObserver()

      fireEvent.click(screen.getByRole('link', { name: 'Billing' }))
      // The glide bottoms out: billing cannot reach the top either.
      scrollMetrics(pane, {
        clientHeight: 400,
        scrollHeight: 1000,
        scrollTop: 600,
      })
      userScroll(pane)
      act(() => {
        pane.dispatchEvent(new Event('scrollend'))
      })
      observer.show({ billing: true, general: true })

      expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute(
        'aria-current',
        'location',
      )

      // The reader scrolls: the spy is theirs again, and the end rule holds.
      userScroll(pane)

      expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
        'aria-current',
        'location',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('hands the spy back at once when the reader wheels during the glide', () => {
    render(
      <Pane>
        <AnchorNav items={items} />
      </Pane>,
    )
    const pane = screen.getByTestId('pane')

    fireEvent.click(screen.getByRole('link', { name: 'Security' }))
    fireEvent.wheel(pane)
    latestObserver().show({ general: true })

    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('does not watch the page when scrollSpy is off', () => {
    render(
      <Page>
        <AnchorNav items={items} scrollSpy={false} />
      </Page>,
    )

    expect(FakeObserver.instances).toHaveLength(0)
  })

  it('stops watching once unmounted', () => {
    const { unmount } = render(
      <Page>
        <AnchorNav items={items} />
      </Page>,
    )
    const observer = latestObserver()

    unmount()

    expect(observer.targets).toHaveLength(0)
  })
})
