import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ContainerProps } from './container.types'

const styles = tv({
  base: 'container-root w-full',
  defaultVariants: {
    centered: true,
    paddingX: 'none',
  },
  variants: {
    centered: {
      true: 'mx-auto',
    },
    maxWidth: {
      '2xl': 'max-w-(--breakpoint-2xl)',
      full: 'max-w-full',
      lg: 'max-w-6xl',
      md: 'max-w-3xl',
      sm: 'max-w-sm',
      xl: 'max-w-7xl',
      xs: 'max-w-xs',
    },
    // The same steps as the shell's gutter (Layout's sm/md/lg = 16/24/32px),
    // so a Container inside a Layout.Content with padding="none" lines its
    // text up with the header above it at the same setting.
    paddingX: {
      lg: 'px-8',
      md: 'px-6',
      none: 'px-0',
      sm: 'px-4',
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
  id,
  maxWidth,
  paddingX,
  textAlign,
}: PropsWithChildren<ContainerProps>) {
  return (
    <div
      className={styles({
        centered,
        maxWidth,
        paddingX,
        textAlign,
      })}
      data-testid="container-root"
      id={id}
    >
      {children}
    </div>
  )
}

export { Container }
