import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ContainerProps } from './container.types'

const styles = tv({
  base: 'container-root w-full',
  defaultVariants: {
    centered: true,
  },
  variants: {
    centered: {
      true: 'mx-auto',
    },
    maxWidth: {
      '2xl': 'max-w-[1536px]',
      full: 'max-w-full',
      lg: 'max-w-6xl',
      md: 'max-w-3xl',
      sm: 'max-w-sm',
      xl: 'max-w-7xl',
      xs: 'max-w-xs',
    },
    textAlign: {
      center: 'text-center',
      left: 'text-left',
      right: 'text-right',
    },
  },
})

function Container({
  centered,
  children,
  maxWidth,
  textAlign,
}: PropsWithChildren<ContainerProps>) {
  return (
    <div
      className={styles({
        centered,
        maxWidth,
        textAlign,
      })}
      data-testid="container-root"
    >
      {children}
    </div>
  )
}

export { Container }
