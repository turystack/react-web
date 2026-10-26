import type { ComponentType, PropsWithChildren } from 'react'

import { Label } from './label'
import type { LabelInjectedProps } from './label.shared'
import type { LabelProps } from './label.types'

/**
 * `Label` as the components of this package see it: the public contract plus
 * the class a composing parent injects (Form.Field's floating label, Switch's
 * pointer cursor). Same component, wider type; outside the barrel on purpose,
 * so a consumer of the package can never reach it.
 */
export const ComposedLabel = Label as ComponentType<
  PropsWithChildren<LabelProps> & LabelInjectedProps
>
