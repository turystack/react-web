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

  return <>{state.enabled ? children : fallback}</>
}
