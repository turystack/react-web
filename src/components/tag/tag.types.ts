import type { BadgeVariant } from '@/components/badge'

/**
 * Tag
 *
 * A chip that can be taken away — an applied coupon, a chosen filter shown
 * outside a FilterBar, a label on a record. It is a Badge with an × of its
 * own: same variants, same pill, same type scale.
 *
 * Behavior:
 * - Renders the library's Badge; `variant` takes every Badge variant
 *   (default secondary, the quiet one a list of tags reads best in) and
 *   `size` maps sm → Badge md, md → Badge lg
 * - `onRemove` adds an × button at the trailing edge, a tab stop of its own,
 *   named "Remove <label>" through the labels contract (`tag.remove`).
 *   Without `onRemove` the tag is plain text and takes no focus
 * - Once the × is used, focus moves to the × of the next sibling Tag, else
 *   the previous one, so a keyboard user clearing a row of tags keeps their
 *   place instead of falling back to the top of the page
 * - The ×'s name needs a string. Plain-text children are that string; rich
 *   children (a formatted price, an element) must come with `label` — the
 *   type refuses them without it
 * - `icon` sits before the text, decorative; `disabled` blocks the × and dims
 *   the tag, which stays readable
 * - `disabledReason` blocks the × like `disabled` and says why: the × stays
 *   in the tab order (aria-disabled, not the attribute), using it removes
 *   nothing, a tooltip shows the reason on hover and keyboard focus, and the
 *   × is described by it (ARC-ERR-9). Without `onRemove` there is no × and
 *   the tag is only dimmed
 *
 * Implementation:
 * - Composes Badge rather than extending it: Badge turns into a button with
 *   `onClick` and renders onto its child with `asChild`, and an × button
 *   cannot live inside either, so the removable chip is its own component
 *   over Badge's styles, not a second copy of them
 * - <Tag onRemove={clearCoupon} variant="success">BEMVINDO10</Tag>
 * - <Tag disabledReason="Applied by your plan" onRemove={clearCoupon}>PLANO10</Tag>
 * - <Tag icon={<MapPin />} label="São Paulo" onRemove={drop}><strong>São Paulo</strong></Tag>
 *
 * Dependencies: Badge component; labels provider
 */

export type TagVariant = BadgeVariant

export type TagSize = 'sm' | 'md'

export type TagTextProps = {
  children: string | number // plain text: it names the × too
  label?: string // overrides the name the × reads
}

export type TagRichProps = {
  children: React.ReactNode // rich content (a formatted value, an element)
  label: string // what the × names — required when children are not text
}

export type TagBaseProps = {
  variant?: TagVariant // any Badge variant; default secondary
  size?: TagSize // sm (Badge md) or md (Badge lg); default md
  icon?: React.ReactNode // decorative node before the text, never an icon name
  onRemove?: () => void // shows the × and fires when it is used
  disabled?: boolean // blocks the × and dims the tag
  disabledReason?: string // blocks the ×, stays focusable, tooltip says why
}

export type TagProps = TagBaseProps & (TagTextProps | TagRichProps)
