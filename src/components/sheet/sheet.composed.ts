import type { ComponentType, PropsWithChildren } from 'react'

import { Sheet } from './sheet'
import type { SheetComposition } from './sheet.shared'
import type { SheetProps } from './sheet.types'

/**
 * `Sheet` as the components of this package see it: the public contract plus
 * `SheetComposition` (where focus returns on close). Same component, wider
 * type; outside the barrel on purpose, so a consumer of the package can never
 * reach it.
 */
export const ComposedSheet = Object.assign(
  Sheet as ComponentType<PropsWithChildren<SheetProps> & SheetComposition>,
  {
    Body: Sheet.Body,
    Footer: Sheet.Footer,
    Header: Sheet.Header,
  },
)
