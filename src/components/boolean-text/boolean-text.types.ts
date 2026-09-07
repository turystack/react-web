/**
 * BooleanText
 *
 * Renders a flag as the words the product uses for it.
 *
 * Behavior:
 * - Variants: yesNo, activeInactive, enabledDisabled and check (a tick or a
 *   cross)
 * - Every word comes from the labels, so a translated app translates this too
 * - The check variant still carries the word for assistive technology: an icon
 *   alone tells a screen reader nothing
 * - `colored` paints true green and false in the error colour
 * - A null flag is not false — it renders the fallback
 *
 * Implementation:
 * - <BooleanText value={booking.confirmed} />
 * - <BooleanText colored value={user.active} variant="activeInactive" />
 *
 * Dependencies: LabelsProvider, FormatterText
 */

import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'

export type BooleanTextVariant =
  | 'yesNo'
  | 'activeInactive'
  | 'enabledDisabled'
  | 'check'

export type BooleanTextProps = FormatterTextProps & {
  colored?: boolean // paints the flag by its state
  value: boolean | null | undefined // the flag to render
  variant?: BooleanTextVariant // wording; default yesNo
}
