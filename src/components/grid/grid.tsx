import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { GridItemProps, GridProps, GridResponsive } from './grid.types'

/**
 * One axis per breakpoint, every class written out whole. Tailwind finds
 * classes by scanning the source for literal strings, so `\`md:grid-cols-${n}\``
 * would ship a grid that is one column at every width. `cols` is the base
 * (mobile-first) axis and keeps the name the number form always had.
 */
const rootStyles = tv({
  base: 'grid-root grid w-full',
  defaultVariants: {
    align: 'stretch',
    cols: 1,
    gap: 'none',
  },
  variants: {
    align: {
      center: 'items-center',
      end: 'items-end',
      start: 'items-start',
      stretch: 'items-stretch',
    },
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    },
    colsSm: {
      1: 'sm:grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
      5: 'sm:grid-cols-5',
      6: 'sm:grid-cols-6',
      7: 'sm:grid-cols-7',
      8: 'sm:grid-cols-8',
      9: 'sm:grid-cols-9',
      10: 'sm:grid-cols-10',
      11: 'sm:grid-cols-11',
      12: 'sm:grid-cols-12',
    },
    colsMd: {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
      7: 'md:grid-cols-7',
      8: 'md:grid-cols-8',
      9: 'md:grid-cols-9',
      10: 'md:grid-cols-10',
      11: 'md:grid-cols-11',
      12: 'md:grid-cols-12',
    },
    colsLg: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
      7: 'lg:grid-cols-7',
      8: 'lg:grid-cols-8',
      9: 'lg:grid-cols-9',
      10: 'lg:grid-cols-10',
      11: 'lg:grid-cols-11',
      12: 'lg:grid-cols-12',
    },
    colsXl: {
      1: 'xl:grid-cols-1',
      2: 'xl:grid-cols-2',
      3: 'xl:grid-cols-3',
      4: 'xl:grid-cols-4',
      5: 'xl:grid-cols-5',
      6: 'xl:grid-cols-6',
      7: 'xl:grid-cols-7',
      8: 'xl:grid-cols-8',
      9: 'xl:grid-cols-9',
      10: 'xl:grid-cols-10',
      11: 'xl:grid-cols-11',
      12: 'xl:grid-cols-12',
    },
    gap: {
      lg: 'gap-6',
      md: 'gap-4',
      none: 'gap-0',
      sm: 'gap-2',
      xl: 'gap-8',
      xs: 'gap-1',
    },
  },
})

/**
 * The same one-axis-per-breakpoint table for a cell: `order`, `span` and
 * `rowSpan` take the single value or the per-breakpoint object, and every
 * class is a literal here for the same reason as `cols`.
 */
const itemStyles = tv({
  slots: {
    item: 'grid-item',
  },
  variants: {
    order: {
      1: { item: 'order-1' },
      2: { item: 'order-2' },
      3: { item: 'order-3' },
      4: { item: 'order-4' },
      5: { item: 'order-5' },
      6: { item: 'order-6' },
      7: { item: 'order-7' },
      8: { item: 'order-8' },
      9: { item: 'order-9' },
      10: { item: 'order-10' },
      11: { item: 'order-11' },
      12: { item: 'order-12' },
      first: { item: 'order-first' },
      last: { item: 'order-last' },
      none: { item: 'order-none' },
    },
    orderSm: {
      1: { item: 'sm:order-1' },
      2: { item: 'sm:order-2' },
      3: { item: 'sm:order-3' },
      4: { item: 'sm:order-4' },
      5: { item: 'sm:order-5' },
      6: { item: 'sm:order-6' },
      7: { item: 'sm:order-7' },
      8: { item: 'sm:order-8' },
      9: { item: 'sm:order-9' },
      10: { item: 'sm:order-10' },
      11: { item: 'sm:order-11' },
      12: { item: 'sm:order-12' },
      first: { item: 'sm:order-first' },
      last: { item: 'sm:order-last' },
      none: { item: 'sm:order-none' },
    },
    orderMd: {
      1: { item: 'md:order-1' },
      2: { item: 'md:order-2' },
      3: { item: 'md:order-3' },
      4: { item: 'md:order-4' },
      5: { item: 'md:order-5' },
      6: { item: 'md:order-6' },
      7: { item: 'md:order-7' },
      8: { item: 'md:order-8' },
      9: { item: 'md:order-9' },
      10: { item: 'md:order-10' },
      11: { item: 'md:order-11' },
      12: { item: 'md:order-12' },
      first: { item: 'md:order-first' },
      last: { item: 'md:order-last' },
      none: { item: 'md:order-none' },
    },
    orderLg: {
      1: { item: 'lg:order-1' },
      2: { item: 'lg:order-2' },
      3: { item: 'lg:order-3' },
      4: { item: 'lg:order-4' },
      5: { item: 'lg:order-5' },
      6: { item: 'lg:order-6' },
      7: { item: 'lg:order-7' },
      8: { item: 'lg:order-8' },
      9: { item: 'lg:order-9' },
      10: { item: 'lg:order-10' },
      11: { item: 'lg:order-11' },
      12: { item: 'lg:order-12' },
      first: { item: 'lg:order-first' },
      last: { item: 'lg:order-last' },
      none: { item: 'lg:order-none' },
    },
    orderXl: {
      1: { item: 'xl:order-1' },
      2: { item: 'xl:order-2' },
      3: { item: 'xl:order-3' },
      4: { item: 'xl:order-4' },
      5: { item: 'xl:order-5' },
      6: { item: 'xl:order-6' },
      7: { item: 'xl:order-7' },
      8: { item: 'xl:order-8' },
      9: { item: 'xl:order-9' },
      10: { item: 'xl:order-10' },
      11: { item: 'xl:order-11' },
      12: { item: 'xl:order-12' },
      first: { item: 'xl:order-first' },
      last: { item: 'xl:order-last' },
      none: { item: 'xl:order-none' },
    },
    rowSpan: {
      1: { item: 'row-span-1' },
      2: { item: 'row-span-2' },
      3: { item: 'row-span-3' },
      4: { item: 'row-span-4' },
      5: { item: 'row-span-5' },
      6: { item: 'row-span-6' },
    },
    rowSpanSm: {
      1: { item: 'sm:row-span-1' },
      2: { item: 'sm:row-span-2' },
      3: { item: 'sm:row-span-3' },
      4: { item: 'sm:row-span-4' },
      5: { item: 'sm:row-span-5' },
      6: { item: 'sm:row-span-6' },
    },
    rowSpanMd: {
      1: { item: 'md:row-span-1' },
      2: { item: 'md:row-span-2' },
      3: { item: 'md:row-span-3' },
      4: { item: 'md:row-span-4' },
      5: { item: 'md:row-span-5' },
      6: { item: 'md:row-span-6' },
    },
    rowSpanLg: {
      1: { item: 'lg:row-span-1' },
      2: { item: 'lg:row-span-2' },
      3: { item: 'lg:row-span-3' },
      4: { item: 'lg:row-span-4' },
      5: { item: 'lg:row-span-5' },
      6: { item: 'lg:row-span-6' },
    },
    rowSpanXl: {
      1: { item: 'xl:row-span-1' },
      2: { item: 'xl:row-span-2' },
      3: { item: 'xl:row-span-3' },
      4: { item: 'xl:row-span-4' },
      5: { item: 'xl:row-span-5' },
      6: { item: 'xl:row-span-6' },
    },
    span: {
      1: { item: 'col-span-1' },
      2: { item: 'col-span-2' },
      3: { item: 'col-span-3' },
      4: { item: 'col-span-4' },
      5: { item: 'col-span-5' },
      6: { item: 'col-span-6' },
      7: { item: 'col-span-7' },
      8: { item: 'col-span-8' },
      9: { item: 'col-span-9' },
      10: { item: 'col-span-10' },
      11: { item: 'col-span-11' },
      12: { item: 'col-span-12' },
      full: { item: 'col-span-full' },
    },
    spanSm: {
      1: { item: 'sm:col-span-1' },
      2: { item: 'sm:col-span-2' },
      3: { item: 'sm:col-span-3' },
      4: { item: 'sm:col-span-4' },
      5: { item: 'sm:col-span-5' },
      6: { item: 'sm:col-span-6' },
      7: { item: 'sm:col-span-7' },
      8: { item: 'sm:col-span-8' },
      9: { item: 'sm:col-span-9' },
      10: { item: 'sm:col-span-10' },
      11: { item: 'sm:col-span-11' },
      12: { item: 'sm:col-span-12' },
      full: { item: 'sm:col-span-full' },
    },
    spanMd: {
      1: { item: 'md:col-span-1' },
      2: { item: 'md:col-span-2' },
      3: { item: 'md:col-span-3' },
      4: { item: 'md:col-span-4' },
      5: { item: 'md:col-span-5' },
      6: { item: 'md:col-span-6' },
      7: { item: 'md:col-span-7' },
      8: { item: 'md:col-span-8' },
      9: { item: 'md:col-span-9' },
      10: { item: 'md:col-span-10' },
      11: { item: 'md:col-span-11' },
      12: { item: 'md:col-span-12' },
      full: { item: 'md:col-span-full' },
    },
    spanLg: {
      1: { item: 'lg:col-span-1' },
      2: { item: 'lg:col-span-2' },
      3: { item: 'lg:col-span-3' },
      4: { item: 'lg:col-span-4' },
      5: { item: 'lg:col-span-5' },
      6: { item: 'lg:col-span-6' },
      7: { item: 'lg:col-span-7' },
      8: { item: 'lg:col-span-8' },
      9: { item: 'lg:col-span-9' },
      10: { item: 'lg:col-span-10' },
      11: { item: 'lg:col-span-11' },
      12: { item: 'lg:col-span-12' },
      full: { item: 'lg:col-span-full' },
    },
    spanXl: {
      1: { item: 'xl:col-span-1' },
      2: { item: 'xl:col-span-2' },
      3: { item: 'xl:col-span-3' },
      4: { item: 'xl:col-span-4' },
      5: { item: 'xl:col-span-5' },
      6: { item: 'xl:col-span-6' },
      7: { item: 'xl:col-span-7' },
      8: { item: 'xl:col-span-8' },
      9: { item: 'xl:col-span-9' },
      10: { item: 'xl:col-span-10' },
      11: { item: 'xl:col-span-11' },
      12: { item: 'xl:col-span-12' },
      full: { item: 'xl:col-span-full' },
    },
  },
})

/**
 * The single-value form is the object form with only a base. A string value
 * (span "full") is a single value too, so the test is for an object.
 */
function toResponsive<T extends string | number>(
  value: T | GridResponsive<T> | undefined,
): GridResponsive<T> {
  if (value === undefined) {
    return {}
  }
  return typeof value === 'object' ? value : { base: value }
}

function GridRoot({
  align,
  children,
  cols,
  gap,
}: PropsWithChildren<GridProps>) {
  const { base, sm, md, lg, xl } = toResponsive(cols)

  return (
    <div
      className={rootStyles({
        align,
        cols: base,
        colsLg: lg,
        colsMd: md,
        colsSm: sm,
        colsXl: xl,
        gap,
      })}
      data-testid="grid-root"
    >
      {children}
    </div>
  )
}

function GridItem({
  children,
  order,
  rowSpan,
  span,
}: PropsWithChildren<GridItemProps>) {
  const orders = toResponsive(order)
  const rows = toResponsive(rowSpan)
  const columns = toResponsive(span)
  const { item } = itemStyles({
    order: orders.base,
    orderLg: orders.lg,
    orderMd: orders.md,
    orderSm: orders.sm,
    orderXl: orders.xl,
    rowSpan: rows.base,
    rowSpanLg: rows.lg,
    rowSpanMd: rows.md,
    rowSpanSm: rows.sm,
    rowSpanXl: rows.xl,
    span: columns.base,
    spanLg: columns.lg,
    spanMd: columns.md,
    spanSm: columns.sm,
    spanXl: columns.xl,
  })

  return (
    <div className={item()} data-testid="grid-item">
      {children}
    </div>
  )
}

const Grid = Object.assign(GridRoot, {
  Item: GridItem,
})

export { Grid }
