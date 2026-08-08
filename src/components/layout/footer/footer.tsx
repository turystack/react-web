import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutFooterProps } from './footer.types'

const styles = tv({
  base: 'layout-footer flex shrink-0 items-center px-4',
  defaultVariants: {
    size: 'md',
  },
  variants: {
    bordered: {
      true: 'border-border border-t',
    },
    size: {
      lg: 'h-16',
      md: 'h-14',
      sm: 'h-10',
    },
    sticky: {
      true: 'sticky bottom-0 z-40',
    },
  },
})

function LayoutFooter({
  bordered,
  children,
  size,
  sticky,
}: PropsWithChildren<LayoutFooterProps>) {
  return (
    <footer
      className={styles({
        bordered,
        size,
        sticky,
      })}
      data-testid="layout-footer"
    >
      {children}
    </footer>
  )
}

export { LayoutFooter }
