import { render, renderHook, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import { describe, expect, it } from 'vitest'

import { PortalProvider } from './portal-provider'
import type { PortalContainer } from './portal-provider.types'
import {
  usePortalContainer,
  usePortalContainerConfig,
  useResolvedPortalContainer,
} from './use-portal-container'

function wrapper(container?: PortalContainer) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <PortalProvider container={container}>{children}</PortalProvider>
  }
}

describe('usePortalContainerConfig', () => {
  it('reads back the element it was given', () => {
    const element = document.createElement('div')
    const { result } = renderHook(() => usePortalContainerConfig(), {
      wrapper: wrapper(element),
    })

    expect(result.current).toBe(element)
  })

  it('comes back undefined with no provider, so the primitive keeps its default', () => {
    const { result } = renderHook(() => usePortalContainerConfig())

    expect(result.current).toBeUndefined()
  })

  it('carries an explicit null through, which holds a portal until a host exists', () => {
    const { result } = renderHook(() => usePortalContainerConfig(), {
      wrapper: wrapper(null),
    })

    expect(result.current).toBeNull()
  })
})

describe('usePortalContainer', () => {
  it('passes an element straight through', () => {
    const element = document.createElement('div')
    const { result } = renderHook(() => usePortalContainer(), {
      wrapper: wrapper(element),
    })

    expect(result.current).toBe(element)
  })

  it('wraps a function so it is read when the portal mounts, not when it renders', () => {
    let host: HTMLElement | null = null
    const { result } = renderHook(() => usePortalContainer(), {
      wrapper: wrapper(() => host),
    })

    const ref = result.current as { current: HTMLElement | null }
    expect(ref.current).toBeNull()

    host = document.createElement('div')
    expect(ref.current).toBe(host)
  })

  it('keeps the same object across renders, so a portal does not remount', () => {
    const container = () => null
    const { rerender, result } = renderHook(() => usePortalContainer(), {
      wrapper: wrapper(container),
    })

    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})

describe('useResolvedPortalContainer', () => {
  it('resolves a function to the element', () => {
    const element = document.createElement('div')
    const { result } = renderHook(() => useResolvedPortalContainer(), {
      wrapper: wrapper(() => element),
    })

    expect(result.current).toBe(element)
  })

  it('turns an absent container into null, which createPortal cannot take', () => {
    const { result } = renderHook(() => useResolvedPortalContainer())

    expect(result.current).toBeNull()
  })

  it('puts a portalled node inside the named host', () => {
    const host = document.createElement('div')
    document.body.append(host)

    function Portalled() {
      const container = useResolvedPortalContainer()
      return container ? createPortal(<p>inside</p>, container) : null
    }

    render(
      <PortalProvider container={host}>
        <Portalled />
      </PortalProvider>,
    )

    expect(host).toContainElement(screen.getByText('inside'))

    host.remove()
  })
})
