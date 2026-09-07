/**
 * NumberText
 *
 * Renders a plain number in the reader's number system.
 *
 * Behavior:
 * - Variants: decimal, percent and compact (12.3K)
 * - The percent variant reads a ratio, the way Intl does: 0.15 renders 15%.
 *   A value already scaled to 100 would render 1,500%, which is the kind of
 *   bug that reaches production, so the unit is stated here rather than guessed
 * - `unit` is written after the number exactly as given — "km", "pax", "nights"
 * - `colored` paints a positive number green and a negative one in the error
 *   colour, for a delta column
 *
 * Implementation:
 * - Intl.NumberFormat with the FormatProvider locale
 * - <NumberText value={1234.5} />
 * - <NumberText value={0.153} variant="percent" fractionDigits={1} />
 * - <NumberText unit="km" value={480} />
 *
 * Dependencies: FormatProvider, FormatterText
 */

import type {
  FormatterSignDisplay,
  FormatterTextProps,
} from '@/components/formatter-text/formatter-text.types'

export type NumberTextVariant = 'decimal' | 'percent' | 'compact'

export type NumberTextSignDisplay = FormatterSignDisplay

export type NumberTextProps = FormatterTextProps & {
  colored?: boolean // paints the number by its sign
  fractionDigits?: number // fixed decimal places
  locale?: string // overrides the FormatProvider locale
  rightSection?: React.ReactNode // trailing note rendered beside the number
  signDisplay?: NumberTextSignDisplay // when to write the sign; default auto
  unit?: string // text written after the number
  value: number | null | undefined // the number to render
  variant?: NumberTextVariant // number shape; default decimal
}
