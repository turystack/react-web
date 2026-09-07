import { uiLabelsEn } from '@turystack/react-i18n'

import type { TuryLabels } from './labels-provider.types'

/**
 * English, and what a component renders with no provider above it.
 *
 * The words now live in `@turystack/react-i18n` alongside their translations,
 * so `pt-BR` and `es` cannot drift from the shape `en` defines. Re-exported
 * under the old name because that is what this package's consumers import.
 */
export const defaultLabels: TuryLabels = uiLabelsEn
