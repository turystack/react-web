import { describe, expect, it } from 'vitest'

import {
  clampTime,
  formatTime,
  parsePaste,
  parseTime,
} from './time-input.utils'

const EMPTY = {
  hh: null,
  mm: null,
  ss: null,
}

describe('parseTime', () => {
  it('reads hours and minutes from HH:MM', () => {
    expect(parseTime('08:30', false)).toEqual({
      hh: 8,
      mm: 30,
      ss: 0,
    })
  })

  it('accepts single-digit segments', () => {
    expect(parseTime('8:5', false)).toEqual({
      hh: 8,
      mm: 5,
      ss: 0,
    })
  })

  it('ignores surrounding whitespace', () => {
    expect(parseTime('  08:30  ', false)).toEqual({
      hh: 8,
      mm: 30,
      ss: 0,
    })
  })

  it('reads seconds when they are expected', () => {
    expect(parseTime('08:30:45', true)).toEqual({
      hh: 8,
      mm: 30,
      ss: 45,
    })
  })

  it('zeroes the seconds when they are not expected', () => {
    expect(parseTime('08:30', false).ss).toBe(0)
  })

  it.each([null, undefined, ''] as const)('reads %s as no value', (value) => {
    expect(parseTime(value, false)).toEqual(EMPTY)
  })

  it('rejects a string that does not match the shape', () => {
    expect(parseTime('half past eight', false)).toEqual(EMPTY)
  })

  it('rejects HH:MM when seconds are expected', () => {
    expect(parseTime('08:30', true)).toEqual(EMPTY)
  })

  it('rejects HH:MM:SS when seconds are not expected', () => {
    expect(parseTime('08:30:45', false)).toEqual(EMPTY)
  })

  it('rejects an hour past 23', () => {
    expect(parseTime('24:00', false)).toEqual(EMPTY)
  })

  it('rejects a minute past 59', () => {
    expect(parseTime('08:60', false)).toEqual(EMPTY)
  })

  it('rejects a second past 59', () => {
    expect(parseTime('08:30:60', true)).toEqual(EMPTY)
  })
})

describe('formatTime', () => {
  it('pads both segments to two digits', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: 5,
          ss: 0,
        },
        false,
      ),
    ).toBe('08:05')
  })

  it('appends the seconds when they are expected', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: 5,
          ss: 9,
        },
        true,
      ),
    ).toBe('08:05:09')
  })

  it('drops the seconds when they are not expected', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: 5,
          ss: 9,
        },
        false,
      ),
    ).toBe('08:05')
  })

  it('refuses to format without the hours', () => {
    expect(
      formatTime(
        {
          hh: null,
          mm: 5,
          ss: 0,
        },
        false,
      ),
    ).toBeNull()
  })

  it('refuses to format without the minutes', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: null,
          ss: 0,
        },
        false,
      ),
    ).toBeNull()
  })

  it('refuses to format without the seconds when they are expected', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: 5,
          ss: null,
        },
        true,
      ),
    ).toBeNull()
  })

  it('formats without the seconds even when they are missing', () => {
    expect(
      formatTime(
        {
          hh: 8,
          mm: 5,
          ss: null,
        },
        false,
      ),
    ).toBe('08:05')
  })
})

describe('clampTime', () => {
  it('leaves a value inside the bounds alone', () => {
    expect(clampTime('12:00', false, '08:00', '22:00')).toBe('12:00')
  })

  it('lifts a value below the lower bound', () => {
    expect(clampTime('06:30', false, '08:00')).toBe('08:00')
  })

  it('drops a value above the upper bound', () => {
    expect(clampTime('23:30', false, undefined, '22:00')).toBe('22:00')
  })

  it('normalizes a value when no bounds are given', () => {
    expect(clampTime('8:5', false)).toBe('08:05')
  })

  it('keeps the seconds inside the bounds', () => {
    expect(clampTime('07:59:59', true, '08:00:00')).toBe('08:00:00')
  })

  it('returns an unparseable value untouched', () => {
    expect(clampTime('not a time', false, '08:00')).toBe('not a time')
  })

  it('ignores an unparseable lower bound', () => {
    expect(clampTime('06:30', false, 'nonsense')).toBe('06:30')
  })

  it('ignores an unparseable upper bound', () => {
    expect(clampTime('23:30', false, undefined, 'nonsense')).toBe('23:30')
  })
})

describe('parsePaste', () => {
  it('reads HH:MM', () => {
    expect(parsePaste('08:30', false)).toEqual({
      hh: 8,
      mm: 30,
      ss: 0,
    })
  })

  it('reads H:M', () => {
    expect(parsePaste('8:5', false)).toEqual({
      hh: 8,
      mm: 5,
      ss: 0,
    })
  })

  it('reads HH:MM:SS when seconds are expected', () => {
    expect(parsePaste('08:30:45', true)).toEqual({
      hh: 8,
      mm: 30,
      ss: 45,
    })
  })

  it('ignores surrounding whitespace', () => {
    expect(parsePaste(' 08:30 ', false)).toEqual({
      hh: 8,
      mm: 30,
      ss: 0,
    })
  })

  it('clamps every out-of-range segment to its maximum', () => {
    expect(parsePaste('99:99:99', true)).toEqual({
      hh: 23,
      mm: 59,
      ss: 59,
    })
  })

  it('refuses a payload that does not match the shape', () => {
    expect(parsePaste('lunchtime', false)).toBeNull()
  })

  it('refuses HH:MM when seconds are expected', () => {
    expect(parsePaste('08:30', true)).toBeNull()
  })
})
