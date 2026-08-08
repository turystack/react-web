import { createContext, useContext } from 'react'

type LayoutContextValue = {
  withSidebar: boolean
}

export const LayoutContext = createContext<LayoutContextValue>({
  withSidebar: false,
})

export const useLayout = () => useContext(LayoutContext)
