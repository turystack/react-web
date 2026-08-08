import { createContext } from 'react'

import type { ColorSchemeContextState } from './color-scheme-provider.types'

export const ColorSchemeContext = createContext<
  ColorSchemeContextState | undefined
>(undefined)
