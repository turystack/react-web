import type { ComponentType } from 'react'

import { MaskInput } from './mask-input'
import type { MaskInputProps } from './mask-input.types'

/**
 * What a component of this package may hand a MaskInput it composes, on top
 * of the public `MaskInputProps`: an extra slot class on the native field
 * (DocumentInput marks its field with `document-input-field`). Never part of
 * the public contract.
 */
export type MaskInputComposition = {
  fieldClass?: string // internal: extra slot class on the native field
}

/**
 * `MaskInput` as the components of this package see it. Same component, wider
 * type; outside the barrel on purpose, so a consumer can never reach it.
 */
export const ComposedMaskInput = MaskInput as ComponentType<
  MaskInputProps & MaskInputComposition
>
