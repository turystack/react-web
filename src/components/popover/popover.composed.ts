import type { ComponentType, PropsWithChildren } from 'react'

import { Popover } from './popover'
import type { PopoverComposition } from './popover.shared'
import type { PopoverProps } from './popover.types'

/**
 * `Popover` as the components of this package see it: the public contract plus
 * `PopoverComposition` (an extra popup class). Same component, wider type;
 * outside the barrel on purpose, so a consumer of the package can never reach
 * it.
 */
export const ComposedPopover = Popover as ComponentType<
  PropsWithChildren<PopoverProps> & PopoverComposition
>
