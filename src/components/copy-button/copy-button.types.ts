/**
 * CopyButton
 *
 * The one control in the library that puts a string on the clipboard. Every
 * other `copyable` — the `*Text` formatters, EditableText, TruncatedText,
 * DescriptionList — renders this, so "copy" behaves, looks and announces the
 * same way everywhere it appears.
 *
 * Behavior:
 * - Clicking (or Enter / Space) writes `value` to the clipboard; `onCopy` runs
 *   only once the write has succeeded, with the string that was written
 * - After a successful copy the icon swaps to a check and `common.copied` is
 *   announced through a polite live region for two seconds; a failed write
 *   (no clipboard, permission denied) shows and announces nothing
 * - The accessible name stays stable — the confirmation is announced, not
 *   swapped into the name — so a screen reader never loses the control
 * - Without `label` the button is icon-only and is named by `ariaLabel`, or by
 *   the `common.copy` label when no `ariaLabel` is given
 * - `size` follows Button's scale: icon-only maps to `icon-<size>`; with a
 *   label `xs` renders as Button `sm`, the smallest text size Button has
 * - `variant` is Button's variant; default ghost
 * - `block` stretches the button (and its wrapper) to the full width of its
 *   container, like Button's `block` — the primary copy action of a screen
 *
 * - The root is a positioned box (`relative`), so the visually-hidden live
 *   region stays inside it instead of escaping a scroll container — no
 *   wrapper with `position="relative"` is needed around it
 *
 * Implementation:
 * - <CopyButton value={order.id} />
 * - <CopyButton label="Copy link" size="md" value={url} variant="outline" />
 * - <CopyButton block label="Copy boleto line" size="lg" value={line} variant="default" />
 *
 * Dependencies: Button, useCopyToClipboard (usehooks-ts), LabelsProvider
 */

import type { ReactNode } from 'react'

import type { ButtonVariant } from '@/components/button'

export type CopyButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type CopyButtonVariant = ButtonVariant

export type CopyButtonProps = {
  ariaLabel?: string // accessible name override; default the `common.copy` label when icon-only
  block?: boolean // full width of its container, like Button's block; default false
  'data-testid'?: string // testing handle; defaults to "copy-button"
  label?: ReactNode // visible text beside the icon; absent = icon-only
  onCopy?: (value: string) => void // runs after the value reached the clipboard
  size?: CopyButtonSize // Button scale; default sm
  value: string // the exact string written to the clipboard (required)
  variant?: CopyButtonVariant // Button variant; default ghost
}
