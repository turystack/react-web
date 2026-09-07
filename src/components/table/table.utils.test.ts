import { describe, expect, it } from 'vitest'

import type { TableColumns } from './table.types'
import { getTableLayout } from './table.utils'

type Row = {
  email: string
  id: string
  name: string
}

const sized: TableColumns<Row> = [
  {
    key: 'name',
    width: 100,
  },
  {
    key: 'email',
    width: 300,
  },
]

const unsized: TableColumns<Row> = [
  {
    key: 'id',
  },
  {
    key: 'name',
  },
  {
    key: 'email',
  },
]

const total = (layout: ReturnType<typeof getTableLayout>) =>
  layout.selectionPercentage +
  layout.spacerPercentage +
  layout.columns.reduce((sum, column) => sum + column.percentage, 0)

describe('getTableLayout', () => {
  it('splits the table between the declared widths', () => {
    const layout = getTableLayout(sized, false)

    expect(layout.columns).toEqual([
      {
        key: 'name',
        percentage: 25,
      },
      {
        key: 'email',
        percentage: 75,
      },
    ])
    expect(layout.selectionPercentage).toBe(0)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('gives columns with no width of their own an equal share', () => {
    const layout = getTableLayout(unsized, false)

    for (const column of layout.columns) {
      expect(column.percentage).toBeCloseTo(100 / 3)
    }
    expect(total(layout)).toBeCloseTo(100)
  })

  it('leaves the checkbox column narrower than every data column', () => {
    const layout = getTableLayout(unsized, true)

    for (const column of layout.columns) {
      expect(layout.selectionPercentage).toBeLessThan(column.percentage)
    }
    expect(layout.selectionPercentage).toBeCloseTo((40 / 340) * 100)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('keeps every column readable when sized and unsized ones are mixed', () => {
    const layout = getTableLayout(
      [
        {
          key: 'name',
          width: 300,
        },
        {
          key: 'email',
        },
      ],
      false,
    )

    expect(layout.columns[1].percentage).toBeCloseTo(25)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('counts one column per data column, checkbox included', () => {
    expect(getTableLayout(unsized, false).totalColumns).toBe(3)
    expect(getTableLayout(unsized, true).totalColumns).toBe(4)
  })

  it('parks the leftover width in a spacer before the last column', () => {
    const layout = getTableLayout(sized, false, 800)

    expect(layout.hasSpacer).toBe(true)
    expect(layout.spacerIndex).toBe(1)
    expect(layout.totalWidth).toBe(800)
    expect(layout.spacerPercentage).toBeCloseTo(50)
    expect(layout.totalColumns).toBe(3)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('adds no spacer when the columns already fill the layout', () => {
    const layout = getTableLayout(sized, false, 200)

    expect(layout.hasSpacer).toBe(false)
    expect(layout.spacerPercentage).toBe(0)
    expect(layout.totalWidth).toBe(400)
  })

  it('adds no spacer to a single column, however wide the layout', () => {
    const layout = getTableLayout(
      [
        {
          key: 'name',
          width: 100,
        },
      ],
      false,
      800,
    )

    expect(layout.hasSpacer).toBe(false)
    expect(layout.spacerIndex).toBeUndefined()
    expect(layout.totalColumns).toBe(1)
  })

  it('reserves room for the checkbox column inside the layout width', () => {
    const layout = getTableLayout(sized, true, 800)

    expect(layout.totalWidth).toBe(800)
    expect(layout.selectionPercentage).toBeCloseTo(5)
    expect(total(layout)).toBeCloseTo(100)
  })
})
