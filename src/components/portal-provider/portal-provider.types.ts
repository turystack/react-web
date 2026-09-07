import type { PropsWithChildren } from 'react'

/**
 * Where this library's overlays mount.
 *
 * A function is allowed because the host element often does not exist on the
 * first render — it is created by a `ref` callback in the tree the provider
 * wraps. The function is read when a portal mounts, which is late enough.
 */
export type PortalContainer = HTMLElement | null | (() => HTMLElement | null)

export type PortalProviderProps = PropsWithChildren<{
  container?: PortalContainer
}>
