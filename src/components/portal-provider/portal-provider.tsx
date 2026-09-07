import { PortalContext } from './portal-provider.context'
import type { PortalProviderProps } from './portal-provider.types'

export function PortalProvider({ children, container }: PortalProviderProps) {
  return <PortalContext value={container}>{children}</PortalContext>
}
