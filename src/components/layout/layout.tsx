import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { LayoutContent } from './content'
import { LayoutFooter } from './footer'
import { LayoutHeader } from './header'
import { LayoutContext } from './layout.context'
import type { LayoutProps } from './layout.types'
import { LayoutMain } from './main'

const styles = tv({
  base: 'layout-root flex h-svh min-w-0 flex-col overflow-hidden',
})

function LayoutRoot({
  children,
  withSidebar = false,
}: PropsWithChildren<LayoutProps>) {
  return (
    <LayoutContext.Provider
      value={{
        withSidebar,
      }}
    >
      <div className={styles()} data-testid="layout-root">
        {children}
      </div>
    </LayoutContext.Provider>
  )
}

const Layout = Object.assign(LayoutRoot, {
  Content: LayoutContent,
  Footer: LayoutFooter,
  Header: LayoutHeader,
  Main: LayoutMain,
})

export { Layout }
