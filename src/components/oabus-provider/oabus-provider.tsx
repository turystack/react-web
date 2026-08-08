import { ColorSchemeProvider } from '@/components/color-scheme-provider'
import { Toast } from '@/components/toast'

import type { TuryProviderProps } from './oabus-provider.types'

export function TuryProvider({
  children,
  defaultColorScheme,
}: TuryProviderProps) {
  return (
    <ColorSchemeProvider defaultColorScheme={defaultColorScheme}>
      {children}
      <Toast />
    </ColorSchemeProvider>
  )
}

/** @deprecated Use TuryProvider. */
export const OABusProvider = TuryProvider
