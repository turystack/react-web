import { describe, expect, it } from 'vitest'

import { dayOffset, relativeParts, toDate } from './date-text.utils'

const INSTANT = '2026-08-24T15:30:00.000Z'

describe('date-text utils', () => {
  it('refuses what cannot be read as a date', () => {
    expect(toDate(null)).toBeNull()
    expect(toDate(undefined)).toBeNull()
    expect(toDate('')).toBeNull()
    expect(toDate('nope')).toBeNull()
    expect(toDate(new Date('nope'))).toBeNull()
  })

  it('reads dates, strings and epochs alike', () => {
    const date = new Date(INSTANT)

    expect(toDate(date)).toBe(date)
    expect(toDate(INSTANT)?.getTime()).toBe(date.getTime())
    expect(toDate(date.getTime())?.getTime()).toBe(date.getTime())
  })

  it('counts calendar days in the given zone', () => {
    const reference = new Date('2026-08-24T23:00:00.000Z')

    expect(
      dayOffset(new Date('2026-08-25T01:00:00.000Z'), reference, 'UTC'),
    ).toBe(1)
    expect(
      dayOffset(
        new Date('2026-08-25T01:00:00.000Z'),
        reference,
        'America/Sao_Paulo',
      ),
    ).toBe(0)
  })

  it('picks the coarsest unit that is still true', () => {
    expect(relativeParts(30 * 1000).unit).toBe('second')
    expect(relativeParts(10 * 60 * 1000).unit).toBe('minute')
    expect(relativeParts(-5 * 60 * 60 * 1000)).toEqual({
      amount: -5,
      unit: 'hour',
    })
    expect(relativeParts(5 * 24 * 60 * 60 * 1000).unit).toBe('day')
    expect(relativeParts(60 * 24 * 60 * 60 * 1000).unit).toBe('month')
    expect(relativeParts(400 * 24 * 60 * 60 * 1000).unit).toBe('year')
  })
})
