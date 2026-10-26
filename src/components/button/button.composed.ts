import type { ComponentType, PropsWithChildren } from 'react'

import { Button } from './button'
import type { ButtonInjectedProps } from './button.shared'
import type { ButtonProps } from './button.types'

/**
 * `Button` as the components of this package see it: the public contract plus
 * whatever a composing parent injected into them at runtime, which they pass
 * on (Sidebar.Trigger handed to `DropdownMenu.Trigger asChild`). Same
 * component, wider type; outside the barrel on purpose, so a consumer of the
 * package can never reach it.
 */
export const ComposedButton = Button as ComponentType<
  PropsWithChildren<ButtonProps> & ButtonInjectedProps
>
