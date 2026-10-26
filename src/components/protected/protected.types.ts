/**
 * Protected
 *
 * Asks whether the signed-in user holds a permission, and renders accordingly.
 *
 * Behavior:
 * - Children as a node: the node renders when the permission is held, and
 *   `fallback` renders when it is not
 * - Children as a function: it always renders and receives `enabled`, so the
 *   caller can disable a control instead of hiding it — which is often the
 *   kinder answer, because a button that vanishes teaches nobody anything.
 *   When the permission is not held it also receives `reason`
 *   (`labels.protected.denied`), made for a control's `disabledReason`, so
 *   the control is inert and says why (ARC-ERR-9). While the provider is
 *   `loading` the renderer gets `loading: true` and no reason — pass it to the
 *   control's own `loading`; a guarded node renders nothing until then
 * - `mode` decides whether every id is required or any one of them
 * - No ids means enabled: a Protected with nothing to check is a no-op, so a
 *   list can pass a permission through without a special case
 * - This is not a security boundary. It shapes the UI; the API authorises
 *
 * Implementation:
 * - Reads the ProtectedProvider through usePermissions; `useProtected` answers
 *   the same question outside JSX
 * - <Protected permissionIds={['user:delete']}><Button /></Protected>
 * - <Protected permissionIds={['booking:cancel']}>
 *     {({ reason }) => <Button disabledReason={reason}>Cancel</Button>}
 *   </Protected>
 *
 * Dependencies: ProtectedProvider, LabelsProvider
 */

import type {
  PermissionId,
  ProtectedMode,
  ProtectedState,
} from '@/components/protected-provider/protected-provider.types'

export type ProtectedRenderer = (state: ProtectedState) => React.ReactNode

export type ProtectedProps = {
  children: React.ReactNode | ProtectedRenderer // node to guard, or a renderer
  fallback?: React.ReactNode // what a guarded node is replaced with
  mode?: ProtectedMode // all ids or any of them; default all
  permissionIds?: PermissionId[] // what the user has to hold
}
