import { useMemo } from 'react'

import { FormatContext } from './format-provider.context'
import { defaultFormat } from './format-provider.data'
import type { FormatProviderProps } from './format-provider.types'

export function FormatProvider({ children, format }: FormatProviderProps) {
  const value = useMemo(
    () => ({
      ...defaultFormat,
      ...format,
    }),
    [format],
  )

  return <FormatContext value={value}>{children}</FormatContext>
}
