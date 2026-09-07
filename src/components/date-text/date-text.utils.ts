import type { DateTextValue } from './date-text.types'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/**
 * A date-only string ('2026-08-24') is parsed by the platform as UTC midnight,
 * so it can render as the day before in a western time zone. That is the
 * platform's rule, not something to paper over here — an app that means a
 * local day should say so with a time.
 */
export function toDate(value: DateTextValue): Date | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/** The calendar day an instant falls on, as seen from a time zone. */
export function isoDay(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(date)
}

/** Whole calendar days between two instants, counted in `timeZone`. */
export function dayOffset(
  value: Date,
  reference: Date,
  timeZone?: string,
): number {
  const from = Date.parse(`${isoDay(reference, timeZone)}T00:00:00Z`)
  const to = Date.parse(`${isoDay(value, timeZone)}T00:00:00Z`)

  return Math.round((to - from) / DAY)
}

/**
 * The coarsest unit that still says something true. Thresholds follow the ones
 * date-fns settled on: 45 seconds is still "now", 22 hours is still "hours".
 */
export function relativeParts(differenceMs: number): {
  amount: number
  unit: Intl.RelativeTimeFormatUnit
} {
  const absolute = Math.abs(differenceMs)

  if (absolute < 45 * SECOND) {
    return {
      amount: Math.round(differenceMs / SECOND),
      unit: 'second',
    }
  }

  if (absolute < 45 * MINUTE) {
    return {
      amount: Math.round(differenceMs / MINUTE),
      unit: 'minute',
    }
  }

  if (absolute < 22 * HOUR) {
    return {
      amount: Math.round(differenceMs / HOUR),
      unit: 'hour',
    }
  }

  if (absolute < 26 * DAY) {
    return {
      amount: Math.round(differenceMs / DAY),
      unit: 'day',
    }
  }

  if (absolute < 11 * MONTH) {
    return {
      amount: Math.round(differenceMs / MONTH),
      unit: 'month',
    }
  }

  return {
    amount: Math.round(differenceMs / YEAR),
    unit: 'year',
  }
}
