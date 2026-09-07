import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { useLayout } from '../layout.context'
import type { LayoutContentProps } from './content.types'

const styles = tv({
  slots: {
    content: 'layout-content min-h-0 min-w-0 flex-1 overflow-auto',
    contentInner: 'layout-content-inner mx-auto min-h-full w-full min-w-0',
  },
  variants: {
    maxWidth: {
      lg: {
        contentInner: 'max-w-7xl',
      },
      md: {
        contentInner: 'max-w-4xl',
      },
      sm: {
        contentInner: 'max-w-2xl',
      },
    },
    padding: {
      lg: {
        contentInner: 'p-8',
      },
      md: {
        contentInner: 'p-6',
      },
      none: {
        contentInner: 'p-0',
      },
      sm: {
        contentInner: 'p-4',
      },
    },
    paddingHorizontal: {
      lg: {
        contentInner: 'px-8',
      },
      md: {
        contentInner: 'px-6',
      },
      none: {
        contentInner: 'px-0',
      },
      sm: {
        contentInner: 'px-4',
      },
    },
    paddingVertical: {
      lg: {
        contentInner: 'py-8',
      },
      md: {
        contentInner: 'py-6',
      },
      none: {
        contentInner: 'py-0',
      },
      sm: {
        contentInner: 'py-4',
      },
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
  // The shell's own padding is the fallback, so setting it once on <Layout>
  // lines the content up with the header and the footer around it.
  const layout = useLayout()
  const { content, contentInner } = styles({
    maxWidth,
    padding: padding ?? layout.padding,
    paddingHorizontal,
    paddingVertical,
  })

  return (
    <div className={content()} data-testid="layout-content">
      <div className={contentInner()} data-testid="layout-content-inner">
        {children}
      </div>
    </div>
  )
}

export { LayoutContent }
