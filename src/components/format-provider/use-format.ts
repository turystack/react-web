import { useContext } from 'react'

import { FormatContext } from './format-provider.context'
import type { FormatValues } from './format-provider.types'

export function useFormat(): FormatValues {
  return useContext(FormatContext)
}
