import type { PartialUiLabels, UiLabels } from '@turystack/react-i18n'
import type { PropsWithChildren } from 'react'

/**
 * The contract lives in `@turystack/react-i18n`, not here.
 *
 * It was moved once `react-mobile` was on the horizon: both packages render the
 * same components and therefore need the same words, and mobile depending on a
 * web package to type a label would be the wrong arrow. `react-i18n` touches no
 * DOM, so both can point at it.
 *
 * The names stay. `TuryLabels` is what apps already import from this package,
 * and an alias costs nothing next to a rename across every consumer.
 */
export type TuryLabels = UiLabels

export type PartialTuryLabels = PartialUiLabels

export type LabelsProviderProps = PropsWithChildren<{
  labels?: PartialTuryLabels
}>
