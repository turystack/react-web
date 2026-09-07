/**
 * FormatterText
 *
 * The shared contract behind every `*Text` formatter, and the renderer they
 * all go through. It is not a component an application composes with: there is
 * no public `FormatterText`, because a formatter that took the formatting as a
 * prop would be a `<span>` with extra steps. What is public is the props type,
 * so a wrapper can accept the same appearance vocabulary the family speaks.
 *
 * Behavior:
 * - Renders through Typography's own classes, so a formatted value sits beside
 *   ordinary text without a second type scale appearing in the design system
 * - A value that is null, undefined or unreadable renders `fallback` — a
 *   formatter never renders "Invalid Date" or "NaN"
 * - `copyable` puts the rendered text on the clipboard, never the raw value:
 *   what the reader sees is what they paste, and a redacted document number
 *   stays redacted
 * - `tooltip` reveals the same rendered text on hover, which is what makes a
 *   truncated value readable
 * - Colour is `muted` / `destructive` rather than Typography's `variant`,
 *   because `variant` belongs to each formatter's own domain: a DateText
 *   variant is a date shape, a MoneyText variant is a money shape
 *
 * Implementation:
 * - Every formatter's props extend this type and add only its own domain
 * - <MoneyText copyable size="lg" value={123456} weight="semibold" />
 *
 * Dependencies: Typography (classes), Tooltip, Button, useCopyToClipboard
 */

import type {
  TypographyAlign,
  TypographyComponent,
  TypographySize,
  TypographyWeight,
} from '@/components/typography/typography.types'

/** When a number writes its sign, in the words Intl uses. */
export type FormatterSignDisplay = 'auto' | 'always' | 'never' | 'exceptZero'

export type FormatterTextProps = {
  align?: TypographyAlign // text alignment
  component?: TypographyComponent // HTML element to render as
  copyable?: boolean // adds a control that copies the rendered text
  destructive?: boolean // applies the error text colour
  fallback?: string // what an absent or unreadable value renders as; default "—"
  muted?: boolean // renders in the muted foreground colour
  size?: TypographySize // font size preset
  tooltip?: boolean // reveals the rendered text on hover
  truncate?: boolean // truncates with ellipsis on overflow
  weight?: TypographyWeight // font weight
}
