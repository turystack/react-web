import type { FormatValues } from './format-provider.types'

/**
 * What a formatter renders with no provider above it.
 *
 * English and dollars, matching the labels: the package states one guess
 * instead of reading the runtime's locale, so the same value renders the same
 * way on a server, in a test and on a machine set to another language.
 */
export const defaultFormat: FormatValues = {
  currency: 'usd',
  locale: 'en-US',
}
