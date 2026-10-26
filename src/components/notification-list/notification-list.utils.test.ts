import { describe, expect, it } from 'vitest'

import {
  formatNotificationDay,
  formatNotificationTime,
  groupNotificationsByDay,
  type NotificationClock,
} from './notification-list.utils'

const now = new Date('2026-09-26T15:00:00Z')

const clock: NotificationClock = {
  locale: 'en-US',
  now,
  timeZone: 'UTC',
  today: 'Today',
  yesterday: 'Yesterday',
}

describe('formatNotificationTime', () => {
  it('reads an instant from today relative to now', () => {
    expect(
      formatNotificationTime(new Date('2026-09-26T14:55:00Z'), clock),
    ).toBe('5 minutes ago')
  })

  it('reads yesterday as the word and the time', () => {
    expect(
      formatNotificationTime(new Date('2026-09-25T14:30:00Z'), clock),
    ).toBe('Yesterday, 02:30 PM')
  })

  it('reads an older day of this year as a short date and time', () => {
    expect(
      formatNotificationTime(new Date('2026-09-12T14:30:00Z'), clock),
    ).toBe('Sep 12, 02:30 PM')
  })

  it('adds the year once the date is not this year', () => {
    expect(
      formatNotificationTime(new Date('2025-12-31T09:00:00Z'), clock),
    ).toBe('Dec 31, 2025, 09:00 AM')
  })

  it('counts the day in the clock time zone, not the runtime one', () => {
    // 02:00 UTC on the 26th is still the 25th in São Paulo.
    expect(
      formatNotificationTime(new Date('2026-09-26T02:00:00Z'), {
        ...clock,
        locale: 'pt-BR',
        timeZone: 'America/Sao_Paulo',
        yesterday: 'Ontem',
      }),
    ).toBe('Ontem, 23:00')
  })

  it('renders nothing for an unreadable instant', () => {
    expect(formatNotificationTime(new Date('nope'), clock)).toBe('')
  })
})

describe('formatNotificationDay', () => {
  it('names today and yesterday by the words it was given', () => {
    expect(formatNotificationDay(new Date('2026-09-26T01:00:00Z'), clock)).toBe(
      'Today',
    )
    expect(formatNotificationDay(new Date('2026-09-25T23:00:00Z'), clock)).toBe(
      'Yesterday',
    )
  })

  it('names an older day by its short date, with the year only when it differs', () => {
    expect(formatNotificationDay(new Date('2026-09-12T10:00:00Z'), clock)).toBe(
      'Sep 12',
    )
    expect(formatNotificationDay(new Date('2025-09-12T10:00:00Z'), clock)).toBe(
      'Sep 12, 2025',
    )
  })

  it('renders nothing for an unreadable instant', () => {
    expect(formatNotificationDay(new Date('nope'), clock)).toBe('')
  })
})

describe('groupNotificationsByDay', () => {
  it('splits the items by calendar day, keeping their order', () => {
    const items = [
      { at: new Date('2026-09-26T14:00:00Z'), id: 'a' },
      { at: new Date('2026-09-26T09:00:00Z'), id: 'b' },
      { at: new Date('2026-09-25T20:00:00Z'), id: 'c' },
      { at: new Date('nope'), id: 'd' },
    ]

    const days = groupNotificationsByDay(items, 'UTC')

    expect(days.map((day) => day.key)).toEqual([
      '2026-09-26',
      '2026-09-25',
      'unknown',
    ])
    expect(days[0]?.items.map((item) => item.id)).toEqual(['a', 'b'])
    expect(days[1]?.items.map((item) => item.id)).toEqual(['c'])
  })
})
