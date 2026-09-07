import { describe, expect, it } from 'vitest'

import { defaultLabels } from './labels-provider.data'

describe('the labels that interpolate', () => {
  it('reads a lower bound', () => {
    expect(defaultLabels.common.from('R$ 10,00')).toBe('From R$ 10,00')
  })

  it('reads an upper bound', () => {
    expect(defaultLabels.common.upTo('R$ 50,00')).toBe('Up to R$ 50,00')
  })

  it('reads a page range', () => {
    expect(defaultLabels.pagination.range(21, 40, 100)).toBe('21-40 of 100')
  })

  it('reads a step position', () => {
    expect(defaultLabels.stepper.step(2, 4)).toBe('Step 2 of 4')
  })
})

describe('the defaults', () => {
  it('ships no Portuguese', () => {
    const strings = Object.values(defaultLabels)
      .flatMap((group) => Object.values(group))
      .filter((value): value is string => typeof value === 'string')

    for (const value of strings) {
      expect(value).not.toMatch(/[ãõçáéíóúâêôà]/i)
    }
    expect(strings.length).toBeGreaterThan(20)
  })

  it('names every group the contract declares', () => {
    expect(Object.keys(defaultLabels).length).toBeGreaterThanOrEqual(12)
  })
})
