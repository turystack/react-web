import { useEffect, useState } from 'react'
import { tv } from 'tailwind-variants'

import { useLabels } from '@/components/labels-provider'
import { axes } from '@/support/utils'

import type { LoadingBarProps } from './loading-bar.types'

/** Where the bar starts once the delay is over, so it is visible at once. */
const START = 20
/** The creep closes in on this and never passes it: the end is not known. */
const CEILING = 90
/** How often the creep takes a step, and the share of the gap each step closes. */
const CREEP_MS = 300
const CREEP_STEP = 0.1
/**
 * The run to 100% and the fade that follows. The fade is delayed by the run
 * in CSS (`delay-200`), so the bar is seen to finish before it goes — and the
 * unmount waits for both. Under reduced motion there is no fade: the full bar
 * holds for the same 500ms and is removed.
 */
const COMPLETE_MS = 200
const FADE_MS = 300

const DEFAULT_DELAY = 200

/**
 * - `idle`    — nothing is rendered
 * - `loading` — shown, creeping (or showing `value`)
 * - `done`    — at 100% and fading; idle once the fade is over
 */
type Phase = 'idle' | 'loading' | 'done'

const loadingBar = tv({
  defaultVariants: {
    position: 'fixed',
    size: 'sm',
    variant: 'default',
  },
  slots: {
    indicator:
      'loading-bar-indicator h-full transition-[width] duration-200 ease-out motion-reduce:transition-none',
    root: 'loading-bar-root pointer-events-none inset-x-0 top-0 z-50 transition-opacity duration-300 motion-reduce:transition-none',
    track: 'loading-bar-track h-full w-full',
  },
  variants: {
    done: {
      // `motion-safe` because `transition-none` would also drop the delay:
      // under reduced motion the bar would vanish the frame it hit 100%.
      true: {
        root: 'motion-safe:opacity-0 motion-safe:delay-200',
      },
    },
    position: {
      absolute: {
        root: 'absolute',
      },
      fixed: {
        root: 'fixed',
      },
    },
    size: {
      lg: {
        root: 'h-1',
      },
      md: {
        root: 'h-[3px]',
      },
      sm: {
        root: 'h-0.5',
      },
    },
    variant: {
      default: {
        indicator: 'bg-primary',
      },
      destructive: {
        indicator: 'bg-destructive',
      },
      success: {
        indicator: 'bg-success',
      },
      warning: {
        indicator: 'bg-warning',
      },
    },
  },
})

function usesReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

function LoadingBar({
  ariaLabel,
  delay = DEFAULT_DELAY,
  loading = false,
  position,
  size,
  value,
  variant,
}: LoadingBarProps) {
  const labels = useLabels()
  const [phase, setPhase] = useState<Phase>('idle')
  const [creep, setCreep] = useState(START)

  // Start: only once the delay is over, and not at all if the load ends first —
  // the cleanup is what cancels a navigation faster than the delay. A bar
  // already showing is left alone, so a `delay` changed mid-load cannot
  // restart it.
  useEffect(() => {
    if (!loading) {
      return
    }

    const timer = setTimeout(() => {
      setPhase((current) => (current === 'idle' ? 'loading' : current))
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, loading])

  // Finish, and restart. A bar that never showed has nothing to finish. A load
  // that starts while the last one is fading drops the fading bar at once: kept,
  // it would read as the new load vanishing, then run backwards from 100%.
  useEffect(() => {
    setPhase((current) => {
      if (!loading && current === 'loading') {
        return 'done'
      }

      if (loading && current === 'done') {
        return 'idle'
      }

      return current
    })
  }, [loading])

  useEffect(() => {
    if (phase !== 'done') {
      return
    }

    const timer = setTimeout(() => setPhase('idle'), COMPLETE_MS + FADE_MS)

    return () => clearTimeout(timer)
  }, [phase])

  const determinate = value !== undefined

  // The creep starts over only where nobody can see it: once the bar is gone.
  useEffect(() => {
    if (phase === 'idle') {
      setCreep(START)
    }
  }, [phase])

  // While a value is given the creep follows it, so a load that stops
  // reporting progress creeps on from where it was instead of jumping back.
  useEffect(() => {
    if (phase === 'loading' && value !== undefined) {
      setCreep(clamp(value))
    }
  }, [phase, value])

  useEffect(() => {
    if (phase !== 'loading' || determinate || usesReducedMotion()) {
      return
    }

    const timer = setInterval(() => {
      setCreep((current) =>
        current >= CEILING
          ? current
          : current + (CEILING - current) * CREEP_STEP,
      )
    }, CREEP_MS)

    return () => clearInterval(timer)
  }, [determinate, phase])

  if (phase === 'idle') {
    return null
  }

  const done = phase === 'done'
  const width = done ? 100 : determinate ? clamp(value) : creep
  const { indicator, root, track } = loadingBar({
    done,
    position,
    size,
    variant,
  })

  return (
    <div
      // No aria-busy: on the bar it asks a screen reader to wait — to ignore
      // the one element that says something is loading. A finished bar is
      // only a fading picture, so it leaves the tree before it leaves the DOM.
      aria-hidden={done || undefined}
      aria-label={ariaLabel ?? labels.loadingBar.loading}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={
        determinate && !done ? Math.round(clamp(value)) : undefined
      }
      className={root()}
      {...axes(loadingBar, {
        position,
        size,
        variant,
      })}
      data-state={phase}
      data-testid="loading-bar-root"
      role="progressbar"
    >
      <div className={track()} data-testid="loading-bar-track">
        <div
          className={indicator()}
          data-testid="loading-bar-indicator"
          style={{
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  )
}

export { LoadingBar }
