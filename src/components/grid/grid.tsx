import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { GridItemProps, GridProps } from './grid.types'

const rootStyles = tv({
  base: 'grid-root grid w-full',
  defaultVariants: {
    cols: 1,
    gap: 'none',
  },
  variants: {
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

const itemStyles = tv({
  slots: {
    item: 'grid-item',
  },
  variants: {
    span: {
      1: {
        item: 'col-span-1',
      },
      2: {
        item: 'col-span-2',
      },
      3: {
        item: 'col-span-3',
      },
      4: {
        item: 'col-span-4',
      },
      5: {
        item: 'col-span-5',
      },
      6: {
        item: 'col-span-6',
      },
      7: {
        item: 'col-span-7',
      },
      8: {
        item: 'col-span-8',
      },
      9: {
        item: 'col-span-9',
      },
      10: {
        item: 'col-span-10',
      },
      11: {
        item: 'col-span-11',
      },
      12: {
        item: 'col-span-12',
      },
      full: {
        item: 'col-span-full',
      },
    },
  },
})

function GridRoot({ children, cols, gap }: PropsWithChildren<GridProps>) {
  return (
    <div
      className={rootStyles({
        cols,
        gap,
      })}
      data-testid="grid-root"
    >
      {children}
    </div>
  )
}

function GridItem({ children, span }: PropsWithChildren<GridItemProps>) {
  const { item } = itemStyles({
    span,
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
