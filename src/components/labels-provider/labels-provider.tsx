import { useMemo } from 'react'

import { LabelsContext } from './labels-provider.context'
import type { LabelsProviderProps } from './labels-provider.types'
import { mergeLabels } from './labels-provider.utils'

export function LabelsProvider({ children, labels }: LabelsProviderProps) {
  const value = useMemo(() => mergeLabels(labels), [labels])

  return <LabelsContext value={value}>{children}</LabelsContext>
}
