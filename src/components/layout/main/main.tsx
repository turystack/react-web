import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

const styles = tv({
  base: 'layout-main flex min-h-0 min-w-0 flex-1 overflow-hidden',
})

function LayoutMain({ children }: PropsWithChildren) {
  return (
    <main className={styles()} data-testid="layout-main">
      {children}
    </main>
  )
}

export { LayoutMain }
