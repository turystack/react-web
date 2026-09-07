import { createContext } from 'react'

import { defaultFormat } from './format-provider.data'
import type { FormatValues } from './format-provider.types'

/**
 * Defaults rather than `undefined`: a MoneyText dropped into a page with no
 * root is a reasonable thing to do, and there is no correct error to throw.
 */
export const FormatContext = createContext<FormatValues>(defaultFormat)
