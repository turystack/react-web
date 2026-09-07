import { describe, expect, it } from 'vitest'

import { clockOf, splitDuration, toSeconds } from './duration-text.utils'

describe('toSeconds', () => {
  it('reads every unit it accepts', () => {
    expect(toSeconds(90, 'seconds')).toBe(90)
    expect(toSeconds(90, 'minutes')).toBe(5400)
    expect(toSeconds(1500, 'milliseconds')).toBe(1.5)
  })
})

describe('splitDuration', () => {
  it('breaks a span into days, hours, minutes and seconds', () => {
    expect(splitDuration(93784)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    })
  })

  it('measures a negative span by its length', () => {
    expect(splitDuration(-3661)).toEqual({
      days: 0,
      hours: 1,
      minutes: 1,
      seconds: 1,
    })
  })
})

describe('clockOf', () => {
  it('shows hours only when there are hours', () => {
    expect(clockOf(8100)).toBe('02:15:00')
    expect(clockOf(900)).toBe('15:00')
  })

  it('counts days into the hours', () => {
    expect(clockOf(93600)).toBe('26:00:00')
  })

  it('keeps the sign of a negative span', () => {
    expect(clockOf(-900)).toBe('-15:00')
  })
})
