import { useContext } from 'react'

import { LabelsContext } from './labels-provider.context'
import type { TuryLabels } from './labels-provider.types'

export function useLabels(): TuryLabels {
  return useContext(LabelsContext)
}
