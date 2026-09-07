import { describe, expect, it } from 'vitest'

import { scaleBytes } from './file-size-text.utils'

describe('scaleBytes', () => {
  it('stays in bytes below the first step', () => {
    expect(scaleBytes(512, 'decimal')).toEqual({
      amount: 512,
      unit: 'B',
    })
  })

  it('climbs by thousands for the decimal system', () => {
    expect(scaleBytes(1_500_000, 'decimal')).toEqual({
      amount: 1.5,
      unit: 'MB',
    })
  })

  it('climbs by 1024 for the binary system', () => {
    expect(scaleBytes(1024 * 1024, 'binary')).toEqual({
      amount: 1,
      unit: 'MiB',
    })
  })

  it('stops at the largest unit it knows', () => {
    expect(scaleBytes(10 ** 21, 'decimal').unit).toBe('PB')
  })

  it('keeps a negative size negative', () => {
    expect(scaleBytes(-2000, 'decimal')).toEqual({
      amount: -2,
      unit: 'kB',
    })
  })
})
