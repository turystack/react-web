import { describe, expect, it } from 'vitest'

import { defaultLabels } from './labels-provider.data'
import { mergeLabels } from './labels-provider.utils'

describe('mergeLabels', () => {
  it('returns the defaults when nothing is overridden', () => {
    expect(mergeLabels(undefined)).toBe(defaultLabels)
  })

  it('keeps the siblings of an overridden string', () => {
    const labels = mergeLabels({
      common: {
        clear: 'Limpar',
      },
    })

    expect(labels.common.clear).toBe('Limpar')
    expect(labels.common.cancel).toBe(defaultLabels.common.cancel)
    expect(labels.common.apply).toBe(defaultLabels.common.apply)
  })

  it('keeps the groups the override does not mention', () => {
    const labels = mergeLabels({
      table: {
        empty: 'Nada encontrado',
      },
    })

    expect(labels.table.empty).toBe('Nada encontrado')
    expect(labels.list.empty).toBe(defaultLabels.list.empty)
    expect(labels.stepper.next).toBe(defaultLabels.stepper.next)
  })

  it('carries every group across', () => {
    const labels = mergeLabels({})

    expect(Object.keys(labels).sort()).toEqual(
      Object.keys(defaultLabels).sort(),
    )
  })

  it('overrides a label that interpolates', () => {
    const labels = mergeLabels({
      stepper: {
        step: (active, total) => `Etapa ${active} de ${total}`,
      },
    })

    expect(labels.stepper.step(2, 4)).toBe('Etapa 2 de 4')
    expect(defaultLabels.stepper.step(2, 4)).toBe('Step 2 of 4')
  })

  it('leaves the defaults untouched by a merge', () => {
    mergeLabels({
      common: {
        clear: 'Limpar',
      },
    })

    expect(defaultLabels.common.clear).toBe('Clear')
  })

  it('ships no Portuguese in the defaults', () => {
    const strings = Object.values(defaultLabels)
      .flatMap((group) => Object.values(group))
      .filter((value): value is string => typeof value === 'string')

    for (const value of strings) {
      expect(value).not.toMatch(/[ãõçáéíóúâêôà]/i)
    }
    expect(strings.length).toBeGreaterThan(20)
  })
})
