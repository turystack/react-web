import type { PartialUiLabels, UiLabels } from '@turystack/react-i18n'
import type { PropsWithChildren } from 'react'

/**
 * The contract lives in `@turystack/react-i18n`, not here.
 *
 * The package that owns the translated words owns the type that describes
 * them, so a label and its translations change in one place and never drift
 * apart.
 *
 * The names stay. `TuryLabels` is what apps already import from this package,
 * and an alias costs nothing next to a rename across every consumer.
 */
export type TuryLabels = UiLabels

export type PartialTuryLabels = PartialUiLabels

export type LabelsProviderProps = PropsWithChildren<{
  labels?: PartialTuryLabels
}>
