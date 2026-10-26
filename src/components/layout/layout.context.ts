import { createContext, useContext } from 'react'

import { DEFAULT_PADDING } from './layout.gutter'
import type { LayoutPadding, LayoutVariant } from './layout.types'

type LayoutContextValue = {
  withSidebar: boolean
  /**
   * The shell's own padding, which every part falls back to.
   *
   * Set once on the root and the header, the content and the footer line up
   * without being told three times — the case where they disagree is almost
   * always a mistake, and it is the one a reader notices. Always set: a part
   * rendered outside a `<Layout>` falls back to the same default as one inside.
   */
  padding: LayoutPadding
  /** How the content sits in the pane; Layout.Content reads it. */
  variant: LayoutVariant
}

export const LayoutContext = createContext<LayoutContextValue>({
  padding: DEFAULT_PADDING,
  variant: 'default',
  withSidebar: false,
})

export const useLayout = () => useContext(LayoutContext)
