/**
 * FormatProvider
 *
 * Supplies the locale, time zone and currency every formatter reads.
 *
 * Behavior:
 * - A formatter with no provider above it still renders, using `defaultFormat`
 * - Values merge one level deep: an app setting only `locale` keeps the rest
 * - Any formatter can override a single value per instance (`locale`, `timeZone`)
 * - `dateFormat` / `timeFormat` / `dateTimeFormat` are date-fns patterns and,
 *   when given, replace the pattern derived from the locale
 *
 * Implementation:
 * - Context holding the merged values, read through `useFormat`
 * - Defaults are `en-US` / `usd` for the same reason the labels are English:
 *   the package cannot guess the product's country, so it states its guess in
 *   one place an app overrides in one line
 * - <FormatProvider format={{ currency: 'brl', locale: 'pt-BR', timeZone: 'America/Sao_Paulo' }}>
 *
 * Dependencies: CurrencyInput (Currency type)
 */

import type { PropsWithChildren } from 'react'

import type { Currency } from '@/components/currency-input/currency-input.types'

export type FormatDefaults = {
  currency?: Currency // currency the money formatters read when given none
  dateFormat?: string // date-fns pattern replacing the locale's date shape
  dateTimeFormat?: string // date-fns pattern replacing the locale's date+time shape
  locale?: string // BCP 47 tag driving every Intl call
  timeFormat?: string // date-fns pattern replacing the locale's time shape
  timeZone?: string // IANA zone; absent means the runtime's own zone
}

export type FormatValues = {
  currency: Currency // always resolved
  dateFormat?: string
  dateTimeFormat?: string
  locale: string // always resolved
  timeFormat?: string
  timeZone?: string
}

export type FormatProviderProps = PropsWithChildren<{
  format?: FormatDefaults
}>
