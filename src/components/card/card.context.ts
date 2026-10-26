import { createContext, useContext } from 'react'

import type { CardSize } from './card.types'

/**
 * The root's size, which every part reads.
 *
 * Padding lives on the parts — the header, content and footer each carry their
 * own gutter — so a compact card is only compact if all of them agree. Set once
 * on the root, they cannot disagree.
 */
export const CardContext = createContext<CardSize>('default')

export const useCardSize = () => useContext(CardContext)

/**
 * The link a titled card hands to its title.
 *
 * A card with `href` is named by its title, so the title's own text becomes
 * the link — a screen reader hears "Pro plan, link" rather than every word in
 * the card, and no link is ever empty. Undefined when the card has no `href`,
 * or when an `ariaLabel` names it (the root then renders the link itself).
 */
export type CardLink = {
  href: string
  onClick?: React.MouseEventHandler<HTMLElement>
  /** A Card.Title reports that it rendered, so the root can tell a card whose
   *  link has nothing to be named by (development warning only). */
  claim: () => () => void
}

export const CardLinkContext = createContext<CardLink | undefined>(undefined)

export const useCardLink = () => useContext(CardLinkContext)
