import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { LayoutMainProps } from './main.types'

const styles = tv({
  slots: {
    // A column below `md`, a row from it. One Content fills either way; two —
    // a split screen, a form beside a brand panel — sit side by side where
    // there is room and stack where there is not, instead of squeezing two
    // 180px halves onto a phone.
    main: 'layout-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row',
  },
})

const { main: mainClass } = styles()

function LayoutMain({ children, id }: PropsWithChildren<LayoutMainProps>) {
  return (
    <main className={mainClass()} data-testid="layout-main" id={id}>
      {children}
    </main>
  )
}

export { LayoutMain }
