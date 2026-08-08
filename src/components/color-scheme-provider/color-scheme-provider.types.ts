import type { PropsWithChildren } from 'react'

export type ColorScheme = 'system' | 'dark' | 'light'

export type ResolvedColorScheme = 'dark' | 'light'

export type ColorSchemeProviderProps = PropsWithChildren<{
  defaultColorScheme?: ColorScheme
}>

export type ColorSchemeContextState = {
  colorScheme: ColorScheme
  changeColorScheme: (colorScheme: ColorScheme) => void
}
