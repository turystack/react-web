import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { TypographyProps } from './typography.types'

/**
 * The error colour is declared as a compound variant because tailwind-merge
 * keeps the last colour it sees: emitted from `variants`, `text-destructive`
 * lands before `variant`'s own colour and is dropped in every combination.
 */
const typographyStyles = tv({
  base: 'typography',
  compoundVariants: [
    {
      class: 'text-destructive',
      destructive: true,
    },
  ],
  defaultVariants: {
    size: 'base',
    variant: 'default',
    weight: 'normal',
  },
  variants: {
    align: {
      center: 'text-center',
      left: 'text-left',
      right: 'text-right',
    },
    centered: {
      true: 'mx-auto',
    },
    destructive: {
      true: '',
    },
    maxWidth: {
      lg: 'max-w-lg',
      md: 'max-w-md',
      sm: 'max-w-sm',
      xs: 'max-w-xs',
    },
    size: {
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
      '8xl': 'text-8xl',
      '9xl': 'text-9xl',
      base: 'typography text-base',
      lg: 'text-lg',
      sm: 'text-sm',
      xl: 'text-xl',
      xs: 'text-xs',
    },
    truncate: {
      true: 'inline-block max-w-full truncate',
    },
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    },
    weight: {
      black: 'font-black',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      extralight: 'font-extralight',
      light: 'font-light',
      medium: 'font-medium',
      normal: 'font-normal',
      semibold: 'font-semibold',
      thin: 'font-thin',
    },
  },
})

function Typography({
  align,
  centered,
  component: Component = 'span',
  maxWidth,
  size,
  variant,
  weight,
  truncate,
  destructive,
  children,
}: PropsWithChildren<TypographyProps>) {
  return (
    <Component
      className={typographyStyles({
        align,
        centered,
        destructive,
        maxWidth,
        size,
        truncate,
        variant,
        weight,
      })}
      data-testid="typography"
    >
      {children}
    </Component>
  )
}

export { Typography, typographyStyles }
