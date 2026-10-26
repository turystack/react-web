import type { ComponentType } from 'react'

import { TimeInput } from './time-input'
import type { TimeInputProps } from './time-input.types'

/**
 * What a component of this package may hand a TimeInput it composes, on top
 * of the public `TimeInputProps`: an extra slot class for the segment group
 * (DateTimeInput marks its time field with `date-time-input-time-field`).
 * Never part of the public contract.
 */
export type TimeInputComposition = {
  fieldClass?: string // internal: extra slot class on the segment group
}

/**
 * `TimeInput` as the components of this package see it. Same component, wider
 * type; outside the barrel on purpose, so a consumer can never reach it.
 */
export const ComposedTimeInput = TimeInput as ComponentType<
  TimeInputProps & TimeInputComposition
>
