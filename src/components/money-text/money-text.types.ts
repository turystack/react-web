/**
 * MoneyText
 *
 * Renders a stored amount as money.
 *
 * Behavior:
 * - The value is an integer number of cents, the same unit CurrencyInput reads
 *   and writes — one money contract in the package, not two
 * - Variants: standard, compact (R$ 1.2K), accounting (negatives in
 *   parentheses) and code (BRL instead of R$)
 * - `hideSymbol` drops the currency mark for a column that names it once in
 *   the header
 * - `colored` paints a credit green and a debit in the error colour
 * - Range mode reads a from/to pair and says "From R$ 10.00" when one bound is
 *   missing, matching CurrencyInput's own range wording
 *
 * Implementation:
 * - Intl.NumberFormat with the reader's locale and the value's currency, so a
 *   Brazilian price shown to an American reader keeps R$ and gains their
 *   separators
 * - <MoneyText value={123456} />
 * - <MoneyText colored value={-2500} variant="accounting" />
 * - <MoneyText mode="range" value={{ from: 10000, to: 50000 }} />
 *
 * Dependencies: FormatProvider, LabelsProvider, FormatterText, CurrencyInput
 * (Currency type)
 */

import type { Currency } from '@/components/currency-input/currency-input.types'
import type {
  FormatterSignDisplay,
  FormatterTextProps,
} from '@/components/formatter-text/formatter-text.types'

export type MoneyTextVariant = 'standard' | 'compact' | 'accounting' | 'code'

export type MoneyTextSignDisplay = FormatterSignDisplay

export type MoneyTextRangeValue = {
  from?: number | null
  to?: number | null
}

type MoneyTextBaseProps = FormatterTextProps & {
  colored?: boolean // paints the amount by its sign
  currency?: Currency // overrides the FormatProvider currency
  fractionDigits?: number // decimal places; default 2, or 1 when compact
  hideSymbol?: boolean // renders the number without the currency mark
  locale?: string // overrides the FormatProvider locale
  rightSection?: React.ReactNode // trailing note, such as "/ night"
  signDisplay?: MoneyTextSignDisplay // when to write the sign; default auto
  variant?: MoneyTextVariant // money shape; default standard
}

export type MoneyTextSingleProps = MoneyTextBaseProps & {
  mode?: 'single'
  value: number | null | undefined // amount in integer cents
}

export type MoneyTextRangeProps = MoneyTextBaseProps & {
  mode: 'range'
  value: MoneyTextRangeValue | null | undefined // bounds in integer cents
}

export type MoneyTextProps = MoneyTextSingleProps | MoneyTextRangeProps
