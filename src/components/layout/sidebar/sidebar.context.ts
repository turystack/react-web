import { createContext, useContext } from 'react'

import type { SidebarContextValue } from './sidebar.types'

export const SidebarContext = createContext<SidebarContextValue | null>(null)

/**
 * The state of the nearest sidebar. Throws outside one, because every caller
 * of this hook is asking a question — "am I collapsed?" — that has no honest
 * answer where there is no sidebar.
 */
export function useSidebar(): SidebarContextValue {
  const value = useContext(SidebarContext)

  if (!value) {
    throw new Error('useSidebar must be used within a Layout.Sidebar.Provider')
  }

  return value
}

/**
 * The same state, or `null` where there is no sidebar.
 *
 * `Layout` asks this rather than `useSidebar()` because the answer decides
 * what the shell *is*: inside a provider the layout root is the content pane
 * beside the rail, and outside one it is the whole viewport. Both are ordinary,
 * so the absence is a value here rather than an error.
 */
export function useOptionalSidebar(): SidebarContextValue | null {
  return useContext(SidebarContext)
}
