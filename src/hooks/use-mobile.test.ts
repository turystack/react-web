import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIsMobile } from './use-mobile'

type Listener = () => void

/**
 * The hook asks a media query, not the window width — which is the whole point
 * of it: the breakpoint it reports is the same one CSS applies, scrollbars and
 * zoom included. So the stub answers the query rather than a number.
 */
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>()

  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        addEventListener: (_: string, listener: Listener) => {
          listeners.add(listener)
        },
        addListener: (listener: Listener) => {
          listeners.add(listener)
        },
        dispatchEvent: () => false,
        matches,
        media: query,
        onchange: null,
        removeEventListener: (_: string, listener: Listener) => {
          listeners.delete(listener)
        },
        removeListener: (listener: Listener) => {
          listeners.delete(listener)
        },
      }) as unknown as MediaQueryList,
  )

  return {
    change(next: boolean) {
      matches = next

      for (const listener of listeners) {
        listener()
      }
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('reports a desktop viewport as not mobile', () => {
    stubMatchMedia(false)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('reports a narrow viewport as mobile', () => {
    stubMatchMedia(true)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('asks for the breakpoint the design system uses', () => {
    stubMatchMedia(false)

    renderHook(() => useIsMobile())

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('follows the viewport across the breakpoint', () => {
    const media = stubMatchMedia(false)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    act(() => media.change(true))

    expect(result.current).toBe(true)
  })
})
