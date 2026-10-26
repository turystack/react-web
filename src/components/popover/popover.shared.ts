import type { RefObject } from 'react'

/**
 * What a component of this package may hand a Popover it composes, on top of
 * the public `PopoverProps`: an extra class for the popup, which the mode
 * fields (DateInput, DateRangeInput, DateTimeInput, CurrencyInput range) use
 * to drop the padding around a calendar or a range form that paints its own;
 * and an anchor, for a composer whose trigger is a small button inside a
 * larger field (DateInput's calendar button) and whose popup must still sit
 * under — and, with `width="trigger"`, match — the whole field.
 * Never part of the public contract — a consumer sizes the popup with `width`,
 * and writing `popupClassName` on a Popover is a type error. It reaches
 * Popover only through `ComposedPopover` (popover.composed.ts), which the
 * package does not export.
 */
export type PopoverComposition = {
  popupClassName?: string // internal: extra slot class on the popup
  anchor?: RefObject<Element | null> // internal: element the popup is positioned against (default: the trigger)
}
