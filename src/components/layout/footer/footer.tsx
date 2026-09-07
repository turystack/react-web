import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { useLayout } from '../layout.context'
import type { LayoutFooterProps } from './footer.types'

const styles = tv({
  defaultVariants: {
    padding: 'md',
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
    padding: {
      lg: {
        footer: 'px-6',
      },
      md: {
        footer: 'px-4',
      },
      none: {
        footer: 'px-0',
      },
      sm: {
        footer: 'px-2',
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
    <footer className={footer()} data-testid="layout-footer">
      {children}
    </footer>
  )
}

export { LayoutFooter }
