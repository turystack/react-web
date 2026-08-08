import { useContext } from 'react'

import { ColorSchemeContext } from './color-scheme-provider.context'

export function useColorScheme() {
  const context = useContext(ColorSchemeContext)

  if (context === undefined) {
    throw new Error('useColorScheme must be used within a TuryProvider')
  }

  return context
}
