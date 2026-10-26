import type { ProtectedProps, ProtectedRenderer } from './protected.types'
import { useProtected } from './use-protected'

export function Protected({
  children,
  fallback = null,
  mode = 'all',
  permissionIds = [],
}: ProtectedProps) {
  const state = useProtected(permissionIds, mode)

  if (typeof children === 'function') {
    return <>{(children as ProtectedRenderer)(state)}</>
  }

  // While the permissions load, neither the node nor its fallback: either one
  // could be the wrong answer, and the fallback is usually "no access".
  if (state.loading) {
    return null
  }

  return <>{state.enabled ? children : fallback}</>
}
