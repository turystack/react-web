import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { LayoutContent } from './content'
import { LayoutFooter } from './footer'
import { LayoutHeader } from './header'
import { LayoutContext } from './layout.context'
import type { LayoutProps } from './layout.types'
import { LayoutMain } from './main'
import { Sidebar } from './sidebar'
import { useOptionalSidebar } from './sidebar/sidebar.context'

/**
 * The root is the content pane, and inside a sidebar it is *the* content pane.
 *
 * These used to be two boxes: `Sidebar.Inset` and a `<Layout withSidebar>`
 * nested in it, both declaring "fill what is left, column, clip your own
 * overflow". Two elements for one job is only clutter until you notice both
 * rendered a landmark — `Sidebar.Inset` was a `<main>` and so is `Layout.Main`,
 * so every shell in the repo shipped a `<main>` inside a `<main>`. One box,
 * one landmark, and the flag nobody could forget to pass.
 */
const styles = tv({
  base: 'layout-root flex min-h-0 min-w-0 flex-col overflow-hidden',
  defaultVariants: {
    mode: 'viewport',
  },
  variants: {
    mode: {
      fill: 'h-full flex-1',
      // No height of its own on purpose. The row already stretches it, and a
      // height *and* a margin overflow the wrapper by the margin — which is
      // exactly the 16px the inset variant asks for.
      inset: [
        'relative flex-1 bg-background',
        'md:peer-data-[variant=inset]:m-2',
        'md:peer-data-[variant=inset]:overflow-hidden md:peer-data-[variant=inset]:rounded-xl',
        'md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:border-border md:peer-data-[variant=inset]:shadow-sm',
        // The margin the rail already provides is dropped on the edge facing
        // it, and restored once the rail collapses. Both are mirrored for a
        // right-hand rail: with the row reversed, an unconditional `ml-0`
        // would strip the *outer* margin and leave a double gap inside.
        // `data-side` is on the peer, so the peer selector can read it.
        'md:peer-data-[variant=inset]:peer-data-[side=left]:ml-0',
        'md:peer-data-[variant=inset]:peer-data-[side=right]:mr-0',
        'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:peer-data-[side=left]:ml-2',
        'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:peer-data-[side=right]:mr-2',
      ],
      viewport: 'h-svh',
    },
  },
})

function LayoutRoot({
  children,
  height,
  padding,
}: PropsWithChildren<LayoutProps>) {
  // Derived, never declared. The old `withSidebar` prop asked a consumer to
  // repeat something the tree already knew, which meant it could disagree with
  // the tree — and a shell that says it has no sidebar while sitting beside one
  // renders at `h-svh` inside an `h-svh` row, so the page grows a second
  // scrollbar and the footer leaves the screen.
  const withSidebar = useOptionalSidebar() !== null

  return (
    <LayoutContext.Provider
      value={{
        padding,
        withSidebar,
      }}
    >
      <div
        className={styles({
          // Beside a rail the shell *is* the content pane, and how tall it is
          // stops being the consumer's question — so `height` is not consulted.
          mode: withSidebar ? 'inset' : (height ?? 'viewport'),
        })}
        data-testid="layout-root"
        data-with-sidebar={withSidebar || undefined}
      >
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
  Sidebar,
})

export { Layout }
