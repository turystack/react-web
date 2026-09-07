import type { Currency } from '@/components/currency-input/currency-input.types'

/**
 * One description of a currency for the whole package.
 *
 * `CurrencyInput` reads it to parse and mask what the user types; `MoneyText`
 * reads it to render a stored amount. They were two independent maps for as
 * long as only the input existed, and the moment a second reader appeared the
 * duplicate became a promise nobody was keeping: an app adding a currency would
 * have had to add it twice, and the pair that drifted would show one symbol in
 * the field and another in the table beside it.
 */
export type CurrencyConfig = {
  label: string
  locale: string
  radix: string
  symbol: string
  thousandsSeparator: string
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  brl: {
    label: 'BRL',
    locale: 'pt-BR',
    radix: ',',
    symbol: 'R$',
    thousandsSeparator: '.',
  },
  eur: {
    label: 'EUR',
    locale: 'de-DE',
    radix: ',',
    symbol: '€',
    thousandsSeparator: '.',
  },
  usd: {
    label: 'USD',
    locale: 'en-US',
    radix: '.',
    symbol: '$',
    thousandsSeparator: ',',
  },
}
