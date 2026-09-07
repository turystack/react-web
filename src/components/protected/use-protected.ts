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
  const { can } = usePermissions()

  return {
    enabled: can(permissionIds, mode),
  }
}
