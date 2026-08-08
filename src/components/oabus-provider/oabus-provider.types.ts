import type { PropsWithChildren } from 'react'

import type { ColorScheme } from '@/components/color-scheme-provider/color-scheme-provider.types'

export type TuryProviderProps = PropsWithChildren<{
  defaultColorScheme?: ColorScheme
}>

/** @deprecated Use TuryProviderProps. */
export type OABusProviderProps = TuryProviderProps
