import { createContext } from 'react'

import type { PermissionsContextValue } from './protected-provider.types'

/**
 * With no provider above it nothing is held — so a `Protected` with no ids
 * still renders, and one with ids does not. A tree that forgot the provider
 * fails closed rather than showing everything.
 */
export const PermissionsContext = createContext<PermissionsContextValue>({
  can: (permissionIds) => permissionIds.length === 0,
  permissions: [],
})
