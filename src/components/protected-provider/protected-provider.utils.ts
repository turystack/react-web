import type { ProtectedMode } from './protected-provider.types'

/** Stands for "everything", which is what an org or workspace manager holds. */
export const EVERYTHING = '*'

const MANAGE = 'manage'
const GLOBAL_SUBJECTS = ['organization', 'workspace']

/**
 * Turns granted ids into every id they answer for that can be named up front.
 *
 * Only the global grants can be: `organization:manage` and `workspace:manage`
 * mean everything, so they collapse to one entry. A `subject:manage` cannot be
 * enumerated without a list of that subject's actions, and asking an app to
 * maintain one was asking it to keep a second copy of the API's ACL in
 * agreement with the first. It is answered at question time instead.
 */
export function expandPermissions(granted: readonly string[]): Set<string> {
  const expanded = new Set<string>(granted)

  for (const permission of granted) {
    const [subject, action] = permission.split(':')

    if (action === MANAGE && subject && GLOBAL_SUBJECTS.includes(subject)) {
      expanded.add(EVERYTHING)
    }
  }

  return expanded
}

/** Whether an id is held outright, or covered by a manage grant on its subject. */
function holds(granted: Set<string>, permissionId: string): boolean {
  if (granted.has(permissionId)) {
    return true
  }

  const [subject] = permissionId.split(':')

  return subject ? granted.has(`${subject}:${MANAGE}`) : false
}

export function canPerform(
  granted: Set<string>,
  permissionIds: readonly string[],
  mode: ProtectedMode = 'all',
): boolean {
  if (permissionIds.length === 0) {
    return true
  }

  if (granted.has(EVERYTHING)) {
    return true
  }

  return mode === 'any'
    ? permissionIds.some((permission) => holds(granted, permission))
    : permissionIds.every((permission) => holds(granted, permission))
}
