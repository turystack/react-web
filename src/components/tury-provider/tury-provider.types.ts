import type { PropsWithChildren } from 'react'

import type { ColorScheme } from '@/components/color-scheme-provider/color-scheme-provider.types'
import type { FormatDefaults } from '@/components/format-provider/format-provider.types'
import type { PartialTuryLabels } from '@/components/labels-provider/labels-provider.types'
import type { PortalContainer } from '@/components/portal-provider/portal-provider.types'

export type TuryProviderProps = PropsWithChildren<{
  defaultColorScheme?: ColorScheme
  format?: FormatDefaults
  labels?: PartialTuryLabels
  portalContainer?: PortalContainer
}>
