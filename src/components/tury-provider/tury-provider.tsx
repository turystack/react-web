import { ColorSchemeProvider } from '@/components/color-scheme-provider'
import { FormatProvider } from '@/components/format-provider'
import { LabelsProvider } from '@/components/labels-provider'
import { PortalProvider } from '@/components/portal-provider'
import { Toast } from '@/components/toast'

import type { TuryProviderProps } from './tury-provider.types'

/**
 * Composes the library's providers and mounts the toaster.
 *
 * It owns no state of its own: each concern has its own provider, and this is
 * the one call an application makes to get all of them in the right order. An
 * app that needs finer control — a subtree in another language, overlays
 * mounted somewhere else — reaches for the individual providers instead.
 */
export function TuryProvider({
  children,
  defaultColorScheme,
  format,
  labels,
  portalContainer,
}: TuryProviderProps) {
  return (
    <PortalProvider container={portalContainer}>
      <LabelsProvider labels={labels}>
        <FormatProvider format={format}>
          <ColorSchemeProvider defaultColorScheme={defaultColorScheme}>
            {children}
            <Toast />
          </ColorSchemeProvider>
        </FormatProvider>
      </LabelsProvider>
    </PortalProvider>
  )
}
