import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LoadingBar } from './loading-bar'

const bar = () => screen.queryByTestId('loading-bar-root')
const width = () => screen.getByTestId('loading-bar-indicator').style.width

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('LoadingBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders nothing while idle', () => {
    render(<LoadingBar />)

    expect(bar()).toBeNull()
  })

  it('waits for the delay before it shows', () => {
    render(<LoadingBar loading />)

    advance(199)
    expect(bar()).toBeNull()

    advance(1)
    expect(bar()).toHaveAttribute('data-state', 'loading')
    expect(width()).toBe('20%')
  })

  it('shows nothing when the load ends inside the delay', () => {
    const { rerender } = render(<LoadingBar loading />)

    advance(150)
    rerender(<LoadingBar loading={false} />)
    advance(1000)

    expect(bar()).toBeNull()
  })

  it('honours a custom delay', () => {
    render(<LoadingBar delay={0} loading />)

    advance(0)
    expect(bar()).not.toBeNull()
  })

  it('creeps towards 90% and never past it', () => {
    render(<LoadingBar loading />)
    advance(200)

    advance(300)
    const first = Number.parseFloat(width())
    expect(first).toBeGreaterThan(20)

    advance(60_000)
    const late = Number.parseFloat(width())
    expect(late).toBeGreaterThan(first)
    expect(late).toBeLessThan(90)
  })

  it('runs to 100%, fades, then unmounts when the load ends', () => {
    const { rerender } = render(<LoadingBar loading />)
    advance(200)

    rerender(<LoadingBar loading={false} />)

    expect(bar()).toHaveAttribute('data-state', 'done')
    expect(bar()).toHaveAttribute('aria-hidden', 'true')
    expect(bar()).toHaveClass('motion-safe:opacity-0', 'motion-safe:delay-200')
    expect(width()).toBe('100%')

    advance(499)
    expect(bar()).not.toBeNull()

    advance(1)
    expect(bar()).toBeNull()
  })

  it('starts again from the beginning on the next load', () => {
    const { rerender } = render(<LoadingBar loading />)
    advance(200)
    advance(3000)
    rerender(<LoadingBar loading={false} />)
    advance(500)

    rerender(<LoadingBar loading />)
    advance(200)

    expect(bar()).toHaveAttribute('data-state', 'loading')
    expect(width()).toBe('20%')
  })

  it('shows a real value instead of creeping, and reports it', () => {
    const { rerender } = render(<LoadingBar loading value={42.4} />)
    advance(200)

    expect(width()).toBe('42.4%')
    expect(bar()).toHaveAttribute('aria-valuenow', '42')

    advance(3000)
    expect(width()).toBe('42.4%')

    rerender(<LoadingBar loading value={140} />)
    expect(width()).toBe('100%')
  })

  it('reports no number while creeping', () => {
    render(<LoadingBar loading />)
    advance(200)

    expect(bar()).not.toHaveAttribute('aria-valuenow')
    expect(bar()).not.toHaveAttribute('aria-busy')
    expect(bar()).not.toHaveAttribute('aria-hidden')
  })

  it('does not creep under reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          addEventListener: () => {},
          matches: query === '(prefers-reduced-motion: reduce)',
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
    render(<LoadingBar loading />)
    advance(200)
    advance(3000)

    expect(width()).toBe('20%')
  })

  it('holds the full bar under reduced motion instead of fading it', () => {
    // jsdom applies no CSS, so the proof is that every fade class is gated
    // on motion-safe — under reduced motion none of them matches.
    const { rerender } = render(<LoadingBar loading />)
    advance(200)
    rerender(<LoadingBar loading={false} />)

    const fade = [...(bar()?.classList ?? [])].filter((name) =>
      /(^|:)(opacity-\d|delay-)/.test(name),
    )

    expect(fade.length).toBeGreaterThan(0)
    expect(fade.every((name) => name.startsWith('motion-safe:'))).toBe(true)
    expect(width()).toBe('100%')
  })

  it('drops a fading bar when a new load starts, and shows a fresh one', () => {
    const { rerender } = render(<LoadingBar loading />)
    advance(200)
    advance(3000)
    rerender(<LoadingBar loading={false} />)
    advance(100)
    const fading = bar()

    rerender(<LoadingBar loading />)
    expect(bar()).toBeNull()

    advance(200)
    expect(bar()).toHaveAttribute('data-state', 'loading')
    expect(bar()).not.toBe(fading)
    expect(width()).toBe('20%')
  })

  it('keeps creeping from where it was when delay changes mid-load', () => {
    const { rerender } = render(<LoadingBar loading />)
    advance(200)
    advance(3000)
    const before = Number.parseFloat(width())

    rerender(<LoadingBar delay={50} loading />)
    advance(50)

    expect(Number.parseFloat(width())).toBeGreaterThanOrEqual(before)
  })

  it('creeps on from the last value when value goes away mid-load', () => {
    const { rerender } = render(<LoadingBar loading value={80} />)
    advance(200)
    rerender(<LoadingBar loading />)

    expect(width()).toBe('80%')

    advance(300)
    const next = Number.parseFloat(width())
    expect(next).toBeGreaterThan(80)
    expect(next).toBeLessThan(90)
  })

  it('never creeps backwards from a value past the ceiling', () => {
    const { rerender } = render(<LoadingBar loading value={95} />)
    advance(200)
    rerender(<LoadingBar loading />)
    advance(3000)

    expect(width()).toBe('95%')
  })

  it('leaves no timer behind when unmounted mid-load or mid-fade', () => {
    const first = render(<LoadingBar loading />)
    advance(200)
    first.unmount()
    expect(vi.getTimerCount()).toBe(0)

    const second = render(<LoadingBar loading />)
    advance(200)
    second.rerender(<LoadingBar loading={false} />)
    second.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('is a named progressbar', () => {
    render(<LoadingBar loading />)
    advance(200)

    expect(
      screen.getByRole('progressbar', {
        name: 'Loading page',
      }),
    ).toBeInTheDocument()
  })

  it('takes its name from ariaLabel when given', () => {
    render(<LoadingBar ariaLabel="Uploading" loading />)
    advance(200)

    expect(
      screen.getByRole('progressbar', {
        name: 'Uploading',
      }),
    ).toBeInTheDocument()
  })

  it('publishes its axes with the resolved defaults', () => {
    render(<LoadingBar loading />)
    advance(200)

    expect(bar()).toHaveAttribute('data-position', 'fixed')
    expect(bar()).toHaveAttribute('data-size', 'sm')
    expect(bar()).toHaveAttribute('data-variant', 'default')
    expect(bar()).toHaveClass('loading-bar-root', 'fixed', 'top-0', 'h-0.5')
    expect(screen.getByTestId('loading-bar-track')).toHaveClass(
      'loading-bar-track',
    )
    expect(screen.getByTestId('loading-bar-indicator')).toHaveClass(
      'loading-bar-indicator',
      'bg-primary',
    )
  })

  it('applies position, size and variant', () => {
    render(
      <LoadingBar
        loading
        position="absolute"
        size="lg"
        variant="destructive"
      />,
    )
    advance(200)

    expect(bar()).toHaveClass('absolute', 'h-1')
    expect(bar()).not.toHaveClass('fixed')
    expect(bar()).toHaveAttribute('data-variant', 'destructive')
    expect(screen.getByTestId('loading-bar-indicator')).toHaveClass(
      'bg-destructive',
    )
  })

  it('never takes the pointer', () => {
    render(<LoadingBar loading />)
    advance(200)

    expect(bar()).toHaveClass('pointer-events-none')
  })
})
