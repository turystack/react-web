import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  slots: {
    main: 'layout-main flex min-h-0 min-w-0 flex-1 overflow-hidden',
  },
})

const { main: mainClass } = styles()

function LayoutMain({ children }: PropsWithChildren) {
  return (
    <main className={mainClass()} data-testid="layout-main">
      {children}
    </main>
  )
}

export { LayoutMain }
