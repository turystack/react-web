import { useContext } from 'react'

import { PermissionsContext } from './protected-provider.context'
import type { PermissionsContextValue } from './protected-provider.types'

export function usePermissions(): PermissionsContextValue {
  return useContext(PermissionsContext)
}
