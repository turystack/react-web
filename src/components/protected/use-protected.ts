import { useLabels } from '@/components/labels-provider'
import type {
  PermissionId,
  ProtectedMode,
  ProtectedState,
} from '@/components/protected-provider/protected-provider.types'
import { usePermissions } from '@/components/protected-provider/use-permissions'

export function useProtected(
  permissionIds: PermissionId[] = [],
  mode: ProtectedMode = 'all',
): ProtectedState {
  const { can, loading } = usePermissions()
  const labels = useLabels()
  const enabled = can(permissionIds, mode)

  // Unknown is not denied: no reason until the permissions have arrived.
  // Asking for nothing needs no answer, so it never waits.
  if (loading && permissionIds.length > 0) {
    return {
      enabled: false,
      loading: true,
    }
  }

  return enabled
    ? {
        enabled,
        loading: false,
      }
    : {
        enabled,
        loading: false,
        reason: labels.protected.denied,
      }
}
