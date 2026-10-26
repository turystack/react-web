import { useMemo } from 'react'

import { PermissionsContext } from './protected-provider.context'
import type {
  ProtectedMode,
  ProtectedProviderProps,
} from './protected-provider.types'
import { canPerform, expandPermissions } from './protected-provider.utils'

export function ProtectedProvider({
  children,
  loading = false,
  permissions,
}: ProtectedProviderProps) {
  const value = useMemo(() => {
    const granted = expandPermissions(permissions)

    return {
      can: (permissionIds: string[], mode?: ProtectedMode) =>
        canPerform(granted, permissionIds, mode),
      loading,
      permissions,
    }
  }, [loading, permissions])

  return <PermissionsContext value={value}>{children}</PermissionsContext>
}
