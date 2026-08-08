import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutHeaderProps } from './header.types'

const styles = tv({
  base: 'layout-header flex min-w-0 shrink-0 items-center px-4',
  defaultVariants: {
    size: 'md',
  },
  variants: {
    bordered: {
      true: 'border-border border-b',
    },
    size: {
      lg: 'h-16',
      md: 'h-14',
      sm: 'h-10',
    },
    sticky: {
      true: 'sticky top-0 z-50 bg-background',
    },
  },
})

const sectionStyles = tv({
  base: 'flex items-center gap-2',
})

const centerStyles = tv({
  base: 'flex flex-1 items-center',
})

function LayoutHeader({
  bordered,
  children,
  leftSection,
  rightSection,
  size,
  sticky,
}: PropsWithChildren<LayoutHeaderProps>) {
  const hasSections = leftSection !== undefined || rightSection !== undefined

  if (!hasSections) {
    return (
      <header
        className={styles({
          bordered,
          size,
          sticky,
        })}
        data-testid="layout-header"
      >
        {children}
      </header>
    )
  }

  return (
    <header
      className={styles({
        bordered,
        size,
        sticky,
      })}
      data-testid="layout-header"
    >
      <div className={sectionStyles()} data-testid="layout-header-left">
        {leftSection}
      </div>
      <div className={centerStyles()}>{children}</div>
      <div className={sectionStyles()} data-testid="layout-header-right">
        {rightSection}
      </div>
    </header>
  )
}

export { LayoutHeader }
