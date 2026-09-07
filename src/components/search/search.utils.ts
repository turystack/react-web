/**
 * Whether a filter value is set.
 *
 * `false` is out because a switch resting off is the default, not a filter, and
 * counting it would make every list report a filter nobody applied. `0` is in
 * because it is a number someone chose — a minimum of zero is a real bound. The
 * two disagree often enough that an item can override this with `isActive`.
 */
export function isFilled(value: unknown): boolean {
  if (value === undefined || value === null || value === false) {
    return false
  }

  if (typeof value === 'string') {
    return value.length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return true
}
