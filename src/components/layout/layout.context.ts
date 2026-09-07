import { createContext, useContext } from 'react'

import type { LayoutPadding } from './layout.types'

type LayoutContextValue = {
  withSidebar: boolean
  /**
   * The shell's own padding, which every part falls back to.
   *
   * Set once on the root and the header, the content and the footer line up
   * without being told three times — the case where they disagree is almost
   * always a mistake, and it is the one a reader notices.
   */
  padding?: LayoutPadding
}

export const LayoutContext = createContext<LayoutContextValue>({
  withSidebar: false,
})

export const useLayout = () => useContext(LayoutContext)
