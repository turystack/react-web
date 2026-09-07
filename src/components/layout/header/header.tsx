import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { useLayout } from '../layout.context'
import type { LayoutHeaderProps } from './header.types'

const styles = tv({
  defaultVariants: {
    padding: 'md',
    size: 'md',
  },
  slots: {
    header: 'layout-header flex min-w-0 shrink-0 items-center gap-3',
    // `min-w-0` is what makes the middle column give way. `flex-1` alone
    // resolves to `min-width: auto`, so a long title refuses to shrink below
    // its own text and pushes the right section off the end of the bar —
    // which is what a header full of buttons looked like before.
    headerCenter: 'layout-header-center flex min-w-0 flex-1 items-center',
    // `shrink-0`, because the sections are controls. A row of icon buttons
    // squeezed to make room for a title is a row of unreadable icon buttons.
    headerSection: 'layout-header-section flex shrink-0 items-center gap-2',
  },
  variants: {
    bordered: {
      true: {
        header: 'border-border border-b',
      },
    },
    padding: {
      lg: {
        header: 'px-6',
      },
      md: {
        header: 'px-4',
      },
      none: {
        header: 'px-0',
      },
      sm: {
        header: 'px-2',
      },
    },
    size: {
      lg: {
        header: 'h-16',
      },
      md: {
        header: 'h-14',
      },
      sm: {
        header: 'h-10',
      },
    },
    sticky: {
      true: {
        header: 'sticky top-0 z-50 bg-background',
      },
    },
  },
})

function LayoutHeader({
  bordered,
  children,
  leftSection,
  padding,
  rightSection,
  size,
  sticky,
}: PropsWithChildren<LayoutHeaderProps>) {
  // The shell's own padding is the fallback, so setting it once on <Layout>
  // lines the header up with the content and the footer below it.
  const layout = useLayout()
  const { header, headerCenter, headerSection } = styles({
    bordered,
    padding: padding ?? layout.padding,
    size,
    sticky,
  })

  const hasSections = leftSection !== undefined || rightSection !== undefined

  if (!hasSections) {
    return (
      <header className={header()} data-testid="layout-header">
        {children}
      </header>
    )
  }

  // Each section is rendered only when it is given. An always-rendered empty
  // one is not free: the bar is a `gap` flex row, so a zero-width box still
  // opens a gap, and a header with only a right section stood its title 12px
  // in from the padding while every other header started flush.
  return (
    <header className={header()} data-testid="layout-header">
      {leftSection === undefined ? null : (
        <div className={headerSection()} data-testid="layout-header-left">
          {leftSection}
        </div>
      )}
      <div className={headerCenter()}>{children}</div>
      {rightSection === undefined ? null : (
        <div className={headerSection()} data-testid="layout-header-right">
          {rightSection}
        </div>
      )}
    </header>
  )
}

export { LayoutHeader }
