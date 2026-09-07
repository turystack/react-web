import { createContext } from 'react'

import type { PortalContainer } from './portal-provider.types'

export const PortalContext = createContext<PortalContainer | undefined>(
  undefined,
)
