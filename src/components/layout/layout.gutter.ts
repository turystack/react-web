import type { LayoutPadding } from './layout.types'

/**
 * The shell's one gutter scale, read by the header, the content and the footer.
 *
 * It used to be two scales: the header and the footer stepped 8/16/24px while
 * the content stepped 16/24/32px, so at every setting the content's left edge
 * sat 8px inside the header's and nothing in a column lined up. One map read by
 * all three is what keeps `sm` meaning the same distance everywhere — a part
 * cannot drift from a number it does not declare.
 *
 * Literal strings, whole, so Tailwind finds every class in the source.
 */
export const GUTTER_X: Record<LayoutPadding, string> = {
  lg: 'px-8',
  md: 'px-6',
  none: 'px-0',
  sm: 'px-4',
}

/** The same steps, vertically — only the content has a vertical gutter. */
export const GUTTER_Y: Record<LayoutPadding, string> = {
  lg: 'py-8',
  md: 'py-6',
  none: 'py-0',
  sm: 'py-4',
}

/** What every part falls back to, inside or outside a `<Layout>`. */
export const DEFAULT_PADDING: LayoutPadding = 'md'
