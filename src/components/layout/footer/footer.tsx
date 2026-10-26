import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { axes } from '@/support/utils'

import { useLayout } from '../layout.context'
import { GUTTER_X } from '../layout.gutter'
import type { LayoutFooterProps } from './footer.types'

const styles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    footer: 'layout-footer flex min-w-0 shrink-0 items-center gap-3',
  },
  variants: {
    bordered: {
      true: {
        footer: 'border-border border-t',
      },
    },
    // The shell's gutter, not a scale of its own: see `layout.gutter.ts`.
    padding: {
      lg: {
        footer: GUTTER_X.lg,
      },
      md: {
        footer: GUTTER_X.md,
      },
      none: {
        footer: GUTTER_X.none,
      },
      sm: {
        footer: GUTTER_X.sm,
      },
    },
    size: {
      lg: {
        footer: 'h-16',
      },
      md: {
        footer: 'h-14',
      },
      sm: {
        footer: 'h-10',
      },
    },
    sticky: {
      true: {
        footer: 'sticky bottom-0 z-40 bg-background',
      },
    },
  },
})

function LayoutFooter({
  bordered,
  children,
  padding,
  size,
  sticky,
}: PropsWithChildren<LayoutFooterProps>) {
  const layout = useLayout()
  const { footer } = styles({
    bordered,
    padding: padding ?? layout.padding,
    size,
    sticky,
  })

  return (
    <footer
      className={footer()}
      {...axes(styles, {
        size,
      })}
      data-testid="layout-footer"
    >
      {children}
    </footer>
  )
}

export { LayoutFooter }
