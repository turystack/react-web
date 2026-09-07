/**
 * Pure helpers for parsing, formatting and clamping time strings used by
 * TimeInput. Adapted from Mantine's TimePicker utils.
 *
 * Strings are `HH:MM` or `HH:MM:SS`, 24-hour, zero-padded. `null` represents
 * "no value". Partial entries (a single segment filled) never produce a
 * formatted string — formatTime returns `null` until all required segments
 * are present.
 */

export type TimeParts = {
  hh: number | null
  mm: number | null
  ss: number | null
}

const EMPTY: TimeParts = {
  hh: null,
  mm: null,
  ss: null,
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function parseTime(
  value: string | null | undefined,
  withSeconds: boolean,
): TimeParts {
  if (!value) {
    return EMPTY
  }
  const re = withSeconds
    ? /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/
    : /^(\d{1,2}):(\d{1,2})$/
  const m = re.exec(value.trim())
  if (!m) {
    return EMPTY
  }
  const hh = Number(m[1])
  const mm = Number(m[2])
  const ss = withSeconds ? Number(m[3]) : 0
  if (hh > 23 || mm > 59 || ss > 59) {
    return EMPTY
  }
  return {
    hh,
    mm,
    ss: withSeconds ? ss : 0,
  }
}

export function formatTime(
  parts: TimeParts,
  withSeconds: boolean,
): string | null {
  if (parts.hh === null || parts.mm === null) {
    return null
  }
  if (withSeconds && parts.ss === null) {
    return null
  }
  return withSeconds
    ? `${pad(parts.hh)}:${pad(parts.mm)}:${pad(parts.ss ?? 0)}`
    : `${pad(parts.hh)}:${pad(parts.mm)}`
}

export function clampTime(
  value: string,
  withSeconds: boolean,
  minTime?: string,
  maxTime?: string,
): string {
  const parts = parseTime(value, withSeconds)
  if (parts.hh === null || parts.mm === null) {
    return value
  }
  let total = parts.hh * 3600 + parts.mm * 60 + (parts.ss ?? 0)
  if (minTime) {
    const min = parseTime(minTime, withSeconds)
    if (min.hh !== null && min.mm !== null) {
      const minTotal = min.hh * 3600 + min.mm * 60 + (min.ss ?? 0)
      if (total < minTotal) {
        total = minTotal
      }
    }
  }
  if (maxTime) {
    const max = parseTime(maxTime, withSeconds)
    if (max.hh !== null && max.mm !== null) {
      const maxTotal = max.hh * 3600 + max.mm * 60 + (max.ss ?? 0)
      if (total > maxTotal) {
        total = maxTotal
      }
    }
  }
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  const ss = total % 60
  return (
    formatTime(
      {
        hh,
        mm,
        ss,
      },
      withSeconds,
    ) ?? value
  )
}

/**
 * Best-effort parse of a pasted payload. Accepts `H:M`, `HH:MM`, `H:M:S`,
 * `HH:MM:SS`. Out-of-range parts are clamped to segment max.
 */
export function parsePaste(
  payload: string,
  withSeconds: boolean,
): TimeParts | null {
  const re = withSeconds
    ? /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/
    : /^(\d{1,2}):(\d{1,2})$/
  const m = re.exec(payload.trim())
  if (!m) {
    return null
  }
  return {
    hh: Math.min(23, Number(m[1])),
    mm: Math.min(59, Number(m[2])),
    ss: withSeconds ? Math.min(59, Number(m[3])) : 0,
  }
}
