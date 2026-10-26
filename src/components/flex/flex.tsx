import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { FlexProps } from './flex.types'

const styles = tv({
  base: 'flex-root flex',
  // An inline Flex that hideBelow shows again comes back inline-flex, not
  // flex: the breakpoint restores the display the component already had.
  compoundVariants: [
    {
      class: 'sm:inline-flex',
      hideBelow: 'sm',
      inline: true,
    },
    {
      class: 'md:inline-flex',
      hideBelow: 'md',
      inline: true,
    },
    {
      class: 'lg:inline-flex',
      hideBelow: 'lg',
      inline: true,
    },
    {
      class: 'xl:inline-flex',
      hideBelow: 'xl',
      inline: true,
    },
  ],
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
    // Responsive show/hide, every class a literal so Tailwind generates it.
    // Declared after `inline`, so `hidden` is the display tailwind-merge
    // keeps below the breakpoint; from it on the row is a flex row again.
    hideAbove: {
      lg: 'lg:hidden',
      md: 'md:hidden',
      sm: 'sm:hidden',
      xl: 'xl:hidden',
    },
    hideBelow: {
      lg: 'hidden lg:flex',
      md: 'hidden md:flex',
      sm: 'hidden sm:flex',
      xl: 'hidden xl:flex',
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
  hideAbove,
  hideBelow,
  id,
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
        hideAbove,
        hideBelow,
        inline,
        justify,
        minHeight,
        wrap,
      })}
      data-testid="flex-root"
      id={id}
    >
      {children}
    </div>
  )
}

export { Flex }
