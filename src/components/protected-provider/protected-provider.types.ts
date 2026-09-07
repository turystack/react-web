/**
 * ProtectedProvider
 *
 * Holds the permissions the signed-in user has, for the whole tree.
 *
 * Behavior:
 * - `permissions` is the list of ids the user holds, in the same
 *   `subject:action` form the API issues them in. That list is the whole
 *   input: an app hands it straight from its profile query
 * - An empty list means nothing is held. A `Protected` with no ids still
 *   renders, because asking for nothing is not a question
 * - `subject:manage` answers yes to any action on that subject, exactly as the
 *   API's ACL expands it. Without that, a manage grant would only match itself
 *   and the UI would hide things the API allows
 * - `organization:manage` and `workspace:manage` answer yes to everything. The
 *   UI cannot see the scope conditions the API attaches to them, so it errs
 *   towards showing; the API is what refuses
 * - This is not a security boundary. It shapes the UI; the API authorises
 *
 * Implementation:
 * - Permissions are expanded once per change and answered from a Set
 * - An app types its ids by augmenting TuryPermissionRegistry with the union
 *   its generated client publishes; without that, PermissionId is plain string
 * - <ProtectedProvider permissions={profile.permissions}>
 *
 * Dependencies: none
 */

import type { PropsWithChildren } from 'react'

/**
 * Empty on purpose — an app augments it via
 * `declare module '@turystack/react-web'` to type its own permission ids:
 *
 * ```ts
 * import type { Permission } from '@/sdk'
 *
 * declare module '@turystack/react-web' {
 *   interface TuryPermissionRegistry {
 *     permission: Permission
 *   }
 * }
 * ```
 *
 * `Permission` is the union a generated client already publishes. Registering
 * it is the whole setup: there is no second catalogue to write here, and none
 * to keep in agreement with the API.
 */
export type TuryPermissionRegistry = {}

/**
 * Every id the registered union allows, or plain `string` when nothing was
 * registered.
 */
export type PermissionId = TuryPermissionRegistry extends {
  permission: infer Permission extends string
}
  ? Permission
  : string

export type ProtectedMode = 'all' | 'any'

export type ProtectedState = {
  enabled: boolean // whether the permissions asked for are held
}

export type PermissionsContextValue = {
  /** Answers a permission question without rendering anything. */
  can: (permissionIds: PermissionId[], mode?: ProtectedMode) => boolean
  /** The ids the user holds, as they were given. */
  permissions: PermissionId[]
}

export type ProtectedProviderProps = PropsWithChildren<{
  permissions: PermissionId[] // ids the signed-in user holds
}>
