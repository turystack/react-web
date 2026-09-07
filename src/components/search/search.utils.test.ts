import { describe, expect, it } from 'vitest'

import { isFilled } from './search.utils'

describe('isFilled', () => {
  it.each([[undefined], [null], [''], [[]], [false]])(
    'reads %s as nothing set',
    (value) => {
      expect(isFilled(value)).toBe(false)
    },
  )

  it.each([['paid'], [0], [42], [true], [['a']], [{ from: 1 }]])(
    'reads %s as set',
    (value) => {
      expect(isFilled(value)).toBe(true)
    },
  )

  it('counts zero, because it is a number someone chose', () => {
    // The pair that decides the rule: a switch resting off is the default and
    // must not read as a filter, while a minimum of zero is a real bound.
    expect(isFilled(0)).toBe(true)
    expect(isFilled(false)).toBe(false)
  })
})
