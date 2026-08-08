import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutContentProps } from './content.types'

const outerStyles = tv({
  base: 'layout-content min-h-0 min-w-0 flex-1 overflow-auto',
})

const innerStyles = tv({
  base: 'layout-content-inner mx-auto min-h-full w-full min-w-0',
  variants: {
    maxWidth: {
      lg: 'max-w-7xl',
      md: 'max-w-4xl',
      sm: 'max-w-2xl',
    },
    padding: {
      lg: 'p-8',
      md: 'p-6',
      sm: 'p-4',
    },
    paddingHorizontal: {
      lg: 'px-8',
      md: 'px-6',
      sm: 'px-4',
    },
    paddingVertical: {
      lg: 'py-8',
      md: 'py-6',
      sm: 'py-4',
    },
  },
})

function LayoutContent({
  children,
  maxWidth,
  padding,
  paddingHorizontal,
  paddingVertical,
}: PropsWithChildren<LayoutContentProps>) {
  return (
    <div className={outerStyles()} data-testid="layout-content">
      <div
        className={innerStyles({
          maxWidth,
          padding,
          paddingHorizontal,
          paddingVertical,
        })}
        data-testid="layout-content-inner"
      >
        {children}
      </div>
    </div>
  )
}

export { LayoutContent }
