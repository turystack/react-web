/**
 * TruncatedText
 *
 * A long string — an id, a hash, a URL — shortened to fit, with the whole of
 * it one hover away.
 *
 * Behavior:
 * - Without `start`, `end` or `position` the text is clipped by CSS over
 *   `lines` lines (1, 2 or 3) and nothing is removed from the DOM
 * - With any of them the string itself is shortened by characters: `middle`
 *   (default) keeps `start` leading and `end` trailing characters (8 and 6 by
 *   default), `end` keeps only the start, `start` keeps only the end; a string
 *   that would not get shorter is left alone
 * - The untruncated value is always revealed in a tooltip on hover
 * - `copyable` adds a CopyButton that copies the full, untruncated value —
 *   never the shortened text on screen
 *
 * Implementation:
 * - <TruncatedText copyable position="middle" value="0x71c7656ec7ab88b098defb751b7401b5f6d8976f" />
 * - <TruncatedText lines={2} value={description} />
 *
 * Dependencies: Tooltip, CopyButton
 */

export type TruncatedTextComponent = 'code' | 'span'

export type TruncatedTextLines = 1 | 2 | 3

export type TruncatedTextPosition = 'end' | 'middle' | 'start'

export type TruncatedTextProps = {
  component?: TruncatedTextComponent // element the text renders as; default span
  copyable?: boolean // adds a control that copies the full, untruncated value
  end?: number // trailing characters kept by character truncation; default 6
  lines?: TruncatedTextLines // lines shown before CSS clipping; default 1
  position?: TruncatedTextPosition // where characters are elided; default middle
  start?: number // leading characters kept by character truncation; default 8
  value: number | string // the full value (required)
}
