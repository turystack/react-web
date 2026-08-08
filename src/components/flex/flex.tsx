import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { FlexProps } from './flex.types'

const styles = tv({
  base: 'flex flex-root',
  defaultVariants: {
    align: 'stretch',
    direction: 'row',
    gap: 'none',
  },
  variants: {
    align: {
      baseline: 'items-baseline',
      center: 'items-center',
      end: 'items-end',
      start: 'items-start',
      stretch: 'items-stretch',
    },
    block: {
      true: 'w-full',
    },
    direction: {
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
    },
    gap: {
      lg: 'gap-6',
      md: 'gap-4',
      none: 'gap-0',
      sm: 'gap-2',
      xl: 'gap-8',
      xs: 'gap-1',
    },
    inline: {
      true: 'inline-flex',
    },
    justify: {
      around: 'justify-around',
      between: 'justify-between',
      center: 'justify-center',
      end: 'justify-end',
      evenly: 'justify-evenly',
      start: 'justify-start',
    },
    minHeight: {
      lg: 'min-h-64',
      md: 'min-h-48',
      screen: 'min-h-screen',
      sm: 'min-h-32',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
  },
})

function Flex({
  align,
  block,
  children,
  direction,
  gap,
  inline,
  justify,
  minHeight,
  wrap,
}: PropsWithChildren<FlexProps>) {
  return (
    <div
      className={styles({
        align,
        block,
        direction,
        gap,
        inline,
        justify,
        minHeight,
        wrap,
      })}
      data-testid="flex-root"
    >
      {children}
    </div>
  )
}

export { Flex }
