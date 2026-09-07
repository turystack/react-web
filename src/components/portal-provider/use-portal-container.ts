import { type RefObject, useContext, useMemo } from 'react'

import { PortalContext } from './portal-provider.context'
import type { PortalContainer } from './portal-provider.types'

export type PortalContainerProp =
  | HTMLElement
  | null
  | RefObject<HTMLElement | null>

/**
 * The configured container, raw.
 *
 * Safe outside a provider: `undefined` means "wherever the headless primitive
 * puts it", which is the document body, so a primitive dropped into a page
 * with no provider behaves exactly as it always did.
 */
export function usePortalContainerConfig(): PortalContainer | undefined {
  return useContext(PortalContext)
}

/**
 * The configured container, shaped the way Base UI accepts it.
 *
 * Base UI takes an element, an explicit `null` (hold the portal until a
 * container resolves) or a ref object — never a function. A configured
 * function is handed over as a ref-shaped object so Base UI calls it when the
 * portal mounts, which is late enough for an element that only exists once the
 * host tree has painted.
 */
export function usePortalContainer(): PortalContainerProp | undefined {
  const container = usePortalContainerConfig()

  return useMemo(() => {
    if (typeof container !== 'function') {
      return container
    }

    return {
      get current() {
        return container()
      },
    }
  }, [container])
}

/**
 * The configured container as a real element, for `createPortal`.
 *
 * Base UI resolves a ref-shaped object itself; `createPortal` does not — it
 * needs the node. Toast is the one surface the library renders directly rather
 * than through a headless primitive, so it is the one that resolves by hand.
 */
export function useResolvedPortalContainer(): HTMLElement | null {
  const container = usePortalContainerConfig()

  if (typeof container === 'function') {
    return container()
  }

  return container ?? null
}
