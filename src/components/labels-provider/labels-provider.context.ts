import { createContext } from 'react'

import { defaultLabels } from './labels-provider.data'
import type { TuryLabels } from './labels-provider.types'

/**
 * Defaults rather than `undefined`, so a primitive used outside any provider
 * still renders words instead of blanks. There is no correct error to throw
 * here: a Button dropped into a page with no root is a reasonable thing to do.
 */
export const LabelsContext = createContext<TuryLabels>(defaultLabels)
