import type { RefObject } from 'react'

/**
 * What a component of this package may hand a Sheet it composes, on top of
 * the public `SheetProps`: where focus lands once the sheet closes. A sheet
 * opened from inside a popover (NotificationCenter's "View all") has no
 * trigger of its own — the button that opened it left with the popover — so
 * without it focus would fall to the page body instead of the control the
 * reader started from. Never part of the public contract; it reaches Sheet
 * only through `ComposedSheet` (sheet.composed.ts), which the package does
 * not export.
 */
export type SheetComposition = {
  finalFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null) // internal: element focused once the sheet closes
  fillOnPhone?: boolean // internal: a side sheet takes the whole width below `sm` instead of three quarters
}
