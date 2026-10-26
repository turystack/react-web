import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { LoadingBar } from '@/components/loading-bar'

import { LayoutContent } from './content'
import { LayoutFooter } from './footer'
import { LayoutHeader } from './header'
import { LayoutContext } from './layout.context'
import { DEFAULT_PADDING } from './layout.gutter'
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
      // `relative` is the loading bar's: off the viewport it is absolute, and
      // the shell is the box it pins itself to. `inset` is relative already.
      fill: 'relative h-full flex-1',
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

/**
 * The banner strip. `shrink-0` is the whole job: the root is an
 * overflow-hidden column of fixed height, so a strip that could shrink would be
 * squeezed by a tall page — and one that does not leaves the header, main and
 * footer to share what remains, which is exactly "shell minus banner".
 */
const bannerStyles = tv({
  base: 'layout-banner w-full shrink-0',
})

/**
 * Skip links: hidden until one is reached by keyboard, then pinned over the
 * top corner of the viewport so it does not push the shell down the moment it
 * appears. Fixed rather than absolute: the root is `overflow-hidden`, and a
 * fixed box is not clipped by it — nor by the corner of a framed shell, which
 * is positioned for the loading bar.
 * The padding is a focus-visible utility too: `not-sr-only` resets padding to
 * 0 and is emitted after every plain utility, so a plain `px-3` would lose.
 */
const skipLinkStyles = tv({
  slots: {
    skipLink:
      'layout-skip-link sr-only rounded-md bg-background font-medium text-foreground text-sm shadow-md outline-none focus-visible:not-sr-only focus-visible:fixed focus-visible:px-3 focus-visible:py-2 focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:ring-3 focus-visible:ring-ring/50',
    skipLinks: 'layout-skip-links',
  },
})

function LayoutRoot({
  banner,
  children,
  height,
  loadingBar,
  padding = DEFAULT_PADDING,
  skipLinks,
  variant = 'default',
}: PropsWithChildren<LayoutProps>) {
  const skip = skipLinkStyles()
  // Derived, never declared. The old `withSidebar` prop asked a consumer to
  // repeat something the tree already knew, which meant it could disagree with
  // the tree — and a shell that says it has no sidebar while sitting beside one
  // renders at `h-svh` inside an `h-svh` row, so the page grows a second
  // scrollbar and the footer leaves the screen.
  const withSidebar = useOptionalSidebar() !== null
  const mode = withSidebar ? 'inset' : (height ?? 'viewport')

  return (
    <LayoutContext.Provider
      value={{
        padding,
        variant,
        withSidebar,
      }}
    >
      <div
        className={styles({
          // Beside a rail the shell *is* the content pane, and how tall it is
          // stops being the consumer's question — so `height` is not consulted.
          mode,
        })}
        data-testid="layout-root"
        data-variant={variant}
        data-with-sidebar={withSidebar || undefined}
      >
        {skipLinks && skipLinks.length > 0 ? (
          <div className={skip.skipLinks()} data-testid="layout-skip-links">
            {skipLinks.map((link) => (
              <a
                className={skip.skipLink()}
                href={link.href}
                key={`${link.href} ${link.label}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        {loadingBar ? (
          // Derived like `withSidebar`: the bar belongs to the shell's top
          // edge. A shell that is the viewport pins it to the viewport; any
          // other shell — embedded, or the pane beside a rail — to itself, so
          // it never runs over a box the shell does not own.
          <LoadingBar
            {...loadingBar}
            position={mode === 'viewport' ? 'fixed' : 'absolute'}
          />
        ) : null}
        {banner ? (
          <div className={bannerStyles()} data-testid="layout-banner">
            {banner}
          </div>
        ) : null}
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
