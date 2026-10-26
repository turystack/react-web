import { describe, expect, it } from 'vitest'

import type { TableColumns } from './table.types'
import { getColumnContentStyle, getTableLayout } from './table.utils'

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
    expect(layout.selectionPixels).toBe(0)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('gives columns with no width of their own an equal share', () => {
    const layout = getTableLayout(unsized, false)

    for (const column of layout.columns) {
      expect(column.percentage).toBeCloseTo(100 / 3)
    }
    expect(total(layout)).toBeCloseTo(100)
  })

  it('keeps the checkbox column at exact pixels, out of the shares', () => {
    // As a share it shrank with the table, and squeezed the box painted over
    // the first column's label.
    const layout = getTableLayout(unsized, true)

    expect(layout.selectionPixels).toBe(40)
    for (const column of layout.columns) {
      expect(column.percentage).toBeCloseTo(100 / 3)
    }
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

    // 800 − 40 checkbox = 760 to share: 100 + 300 columns, 360 spacer.
    expect(layout.totalWidth).toBe(800)
    expect(layout.selectionPixels).toBe(40)
    expect(layout.spacerPercentage).toBeCloseTo((360 / 760) * 100)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('keeps a fixed column in pixels, out of the shares', () => {
    const layout = getTableLayout(
      [
        ...sized,
        {
          fixedWidth: true,
          key: 'actions',
          width: 56,
        },
      ],
      false,
    )

    expect(layout.columns[2]).toEqual({
      key: 'actions',
      percentage: 0,
      pixels: 56,
    })
    expect(layout.columns[0].percentage).toBeCloseTo(25)
    expect(layout.columns[1].percentage).toBeCloseTo(75)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('shares what the fixed and checkbox columns leave between columns and spacer', () => {
    const layout = getTableLayout(
      [
        ...sized,
        {
          fixedWidth: true,
          key: 'actions',
          width: 60,
        },
      ],
      true,
      860,
    )

    // 860 − 60 fixed − 40 checkbox = 760 to share: 100 + 300 columns, 360 spacer.
    expect(layout.totalWidth).toBe(860)
    expect(layout.hasSpacer).toBe(true)
    expect(layout.spacerIndex).toBe(2)
    expect(layout.selectionPixels).toBe(40)
    expect(layout.spacerPercentage).toBeCloseTo((360 / 760) * 100)
    expect(total(layout)).toBeCloseTo(100)
  })

  it('treats fixedWidth without a width as an ordinary column', () => {
    const layout = getTableLayout(
      [
        {
          fixedWidth: true,
          key: 'name',
        },
        {
          key: 'email',
        },
      ],
      false,
    )

    expect(layout.columns[0].pixels).toBeUndefined()
    expect(layout.columns[0].percentage).toBeCloseTo(50)
  })

  it('shares nothing when every column is fixed', () => {
    const layout = getTableLayout(
      [
        {
          fixedWidth: true,
          key: 'name',
          width: 80,
        },
      ],
      false,
    )

    expect(layout.columns[0]).toEqual({
      key: 'name',
      percentage: 0,
      pixels: 80,
    })
    expect(layout.spacerPercentage).toBe(0)
  })
})

describe('getColumnContentStyle', () => {
  it('never caps a share column in pixels, however small its width', () => {
    expect(
      getColumnContentStyle<Row>({
        key: 'name',
        width: 2,
      }),
    ).toBeUndefined()
    expect(
      getColumnContentStyle<Row>({
        key: 'name',
      }),
    ).toBeUndefined()
  })

  it('caps a fixed-width column at its pixels', () => {
    expect(
      getColumnContentStyle<Row>({
        fixedWidth: true,
        key: 'actions',
        width: 56,
      }),
    ).toEqual({
      maxWidth: 'min(100%, 56px)',
      width: '100%',
    })
  })

  it('does not cap fixedWidth without a width', () => {
    expect(
      getColumnContentStyle<Row>({
        fixedWidth: true,
        key: 'actions',
      }),
    ).toBeUndefined()
  })
})
