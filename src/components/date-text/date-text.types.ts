/**
 * DateText
 *
 * Renders a date the way the reader's locale writes dates.
 *
 * Behavior:
 * - Accepts a Date, an ISO string or an epoch number; anything unreadable
 *   renders the fallback instead of "Invalid Date"
 * - Variants: date, time, dateTime, relative ("2 hours ago"), calendar
 *   ("Today"), month, weekday and iso
 * - Range mode reads a from/to pair; a half-open range reads back as
 *   "From 24/08/2026" or "Up to 24/08/2026", the same wording the range input
 *   uses
 * - `format` takes a date-fns pattern and wins over the variant
 * - The relative variant with `live` re-renders once a minute, so "a minute
 *   ago" does not sit there for an hour
 *
 * Implementation:
 * - Intl.DateTimeFormat for the calendar shapes, Intl.RelativeTimeFormat for
 *   the relative one — both take the locale as a string, which is what the
 *   FormatProvider carries; date-fns is used only for an explicit pattern
 * - Renders a <time> element, so the machine-readable instant travels with the
 *   human-readable one
 * - <DateText value={booking.createdAt} variant="relative" live />
 * - <DateText mode="range" value={{ from, to }} />
 *
 * Dependencies: FormatProvider, LabelsProvider, FormatterText, date-fns
 */

import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'

export type DateTextValue = Date | string | number | null | undefined

export type DateTextVariant =
  | 'date'
  | 'time'
  | 'dateTime'
  | 'relative'
  | 'calendar'
  | 'month'
  | 'weekday'
  | 'iso'

export type DateTextRangeValue = {
  from?: DateTextValue
  to?: DateTextValue
}

type DateTextBaseProps = FormatterTextProps & {
  format?: string // date-fns pattern; overrides the variant
  locale?: string // overrides the FormatProvider locale
  timeZone?: string // overrides the FormatProvider time zone
  variant?: DateTextVariant // shape of the rendered date; default date
}

export type DateTextSingleProps = DateTextBaseProps & {
  mode?: 'single'
  value: DateTextValue // the instant to render
  live?: boolean // relative variant only: refreshes once a minute
}

export type DateTextRangeProps = DateTextBaseProps & {
  mode: 'range'
  value: DateTextRangeValue | null | undefined // both bounds optional
}

export type DateTextProps = DateTextSingleProps | DateTextRangeProps
