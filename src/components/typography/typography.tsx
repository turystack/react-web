import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { axes } from '@/support/utils'

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
    /**
     * One line, nothing hidden. `truncate` also stops wrapping, but it clips —
     * the wrong trade for a short label whose every word is the information.
     */
    noWrap: {
      true: 'whitespace-nowrap',
    },
    /**
     * `inherit` sets no font size, so the text takes its container's — a
     * label inside a button or a table cell scales with it.
     */
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
      inherit: '',
      lg: 'text-lg',
      sm: 'text-sm',
      xl: 'text-xl',
      xs: 'text-xs',
    },
    truncate: {
      true: 'inline-block max-w-full truncate',
    },
    /**
     * `inherit` paints nothing, so the colour comes from the container — a
     * menu item's active and hover colour reach a label inside it instead of
     * being overridden by the label's own `text-foreground`.
     */
    variant: {
      default: 'text-foreground',
      inherit: '',
      muted: 'text-muted-foreground',
    },
    weight: {
      black: 'font-black',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      extralight: 'font-extralight',
      inherit: '',
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
  noWrap,
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
        noWrap,
        size,
        truncate,
        variant,
        weight,
      })}
      {...axes(typographyStyles, {
        size,
        variant,
      })}
      data-testid="typography"
    >
      {children}
    </Component>
  )
}

export { Typography, typographyStyles }
