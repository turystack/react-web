import {
  dayOffset,
  isoDay,
  relativeParts,
  toDate,
} from '@/components/date-text/date-text.utils'

/** What reading an instant needs: where "now" is, and in which words. */
export type NotificationClock = {
  locale: string
  now: Date
  timeZone?: string
  today: string
  yesterday: string
}

export type NotificationDay<T> = {
  at: Date // the first instant of the group, which names it
  items: T[]
  key: string // the calendar day, yyyy-mm-dd, in the clock's time zone
}

function sameYear(a: Date, b: Date, timeZone?: string): boolean {
  return isoDay(a, timeZone).slice(0, 4) === isoDay(b, timeZone).slice(0, 4)
}

/**
 * When a notification arrived, the way a feed says it: relative today
 * ("5 minutes ago"), "Yesterday, 14:30" the day before, and a short date with
 * the time before that — the year only once it is not this year's.
 */
export function formatNotificationTime(
  value: Date,
  clock: NotificationClock,
): string {
  const at = toDate(value)

  if (!at) {
    return ''
  }

  const { locale, now, timeZone } = clock
  const offset = dayOffset(at, now, timeZone)

  if (offset >= 0) {
    const { amount, unit } = relativeParts(at.getTime() - now.getTime())

    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
      amount,
      unit,
    )
  }

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(at)

  if (offset === -1) {
    return `${clock.yesterday}, ${time}`
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    timeZone,
    year: sameYear(at, now, timeZone) ? undefined : 'numeric',
  }).format(at)
}

/** The heading of a day's group: Today, Yesterday, or the date itself. */
export function formatNotificationDay(
  value: Date,
  clock: NotificationClock,
): string {
  const at = toDate(value)

  if (!at) {
    return ''
  }

  const { locale, now, timeZone } = clock
  const offset = dayOffset(at, now, timeZone)

  if (offset === 0) {
    return clock.today
  }

  if (offset === -1) {
    return clock.yesterday
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone,
    year: sameYear(at, now, timeZone) ? undefined : 'numeric',
  }).format(at)
}

/**
 * The notifications split by the calendar day they arrived on, in the order
 * the days first appear — a feed arrives newest first, so the groups do too.
 * An unreadable instant falls into one trailing group with no date.
 */
export function groupNotificationsByDay<T extends { at: Date }>(
  items: T[],
  timeZone?: string,
): NotificationDay<T>[] {
  const days = new Map<string, NotificationDay<T>>()

  for (const item of items) {
    const at = toDate(item.at)
    const key = at ? isoDay(at, timeZone) : 'unknown'
    const day = days.get(key)

    if (day) {
      day.items.push(item)
    } else {
      days.set(key, { at: item.at, items: [item], key })
    }
  }

  return [...days.values()]
}
