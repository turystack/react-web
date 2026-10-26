import type { ForwardRefExoticComponent, RefAttributes } from 'react'

import { Input } from './input'
import type { InputComposition } from './input.shared'
import type { InputProps } from './input.types'

/**
 * `Input` as the components of this package see it: the public contract plus
 * `InputComposition` (root/field slot classes and the native `type`). It is
 * the same component — only the type is wider — and it lives outside the
 * barrel on purpose, so a consumer of the package can never reach it.
 */
export const ComposedInput = Input as ForwardRefExoticComponent<
  InputProps & InputComposition & RefAttributes<HTMLInputElement>
>
