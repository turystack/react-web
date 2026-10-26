/**
 * Indicator
 *
 * A small badge pinned to the corner of another element: the unread dot on a
 * notifications bell, the count on an avatar.
 *
 * Behavior:
 * - `count` renders the number; above `max` (default 99) it reads "99+"
 * - `dot` renders a small dot with no number; with a `count` too, the count
 *   still decides whether the dot shows (a dot for "any unread")
 * - A count of 0 (or below) hides the indicator unless `showZero`
 * - With neither `count` nor `dot` nothing is pinned — the children render alone
 * - `variant` is the colour: default (primary) or destructive
 * - `position` picks the corner; default top-right
 * - `label` is what a screen reader hears ("3 unread notifications"); when it
 *   is given the visual number is hidden from assistive technology, so the
 *   count is not announced twice
 * - The label describes the control it is pinned to: a single element child
 *   gets `aria-describedby` pointing at it, kept alongside any description
 *   the child already had
 *
 * Implementation:
 * - An inline wrapper around the children; the badge is absolutely positioned
 *   on the chosen corner and ringed with the background colour so it reads on
 *   any surface
 * - <Indicator count={3} label="3 unread notifications"><Button … /></Indicator>
 * - <Indicator dot count={unread} variant="destructive"><Avatar … /></Indicator>
 *
 * Dependencies: none
 */

export type IndicatorVariant = 'default' | 'destructive'

export type IndicatorPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

export type IndicatorProps = {
  children: React.ReactNode // the element the indicator is pinned to (required)
  count?: number // the number shown; 0 or below hides it unless showZero
  max?: number // counts above it read "max+"; default 99
  dot?: boolean // a small dot instead of the number
  showZero?: boolean // keep the indicator when count is 0; default false
  variant?: IndicatorVariant // colour of the indicator; default 'default'
  position?: IndicatorPosition // corner it is pinned to; default 'top-right'
  label?: string // what a screen reader hears; hides the visual number from it
}
