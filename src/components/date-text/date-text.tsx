import { useInterval } from '@turystack/react-hooks'
import { format as formatPattern } from 'date-fns'
import { useState } from 'react'

import { useFormat } from '@/components/format-provider'
import type { FormatValues } from '@/components/format-provider/format-provider.types'
import {
  DEFAULT_FALLBACK,
  FormatterText,
  RANGE_SEPARATOR,
} from '@/components/formatter-text/formatter-text'
import type { TuryLabels } from '@/components/labels-provider'
import { useLabels } from '@/components/labels-provider'

import type {
  DateTextProps,
  DateTextRangeProps,
  DateTextSingleProps,
  DateTextValue,
  DateTextVariant,
} from './date-text.types'
import { dayOffset, isoDay, relativeParts, toDate } from './date-text.utils'

const LIVE_INTERVAL_MS = 60_000

type Resolution = {
  format?: string
  labels: TuryLabels
  locale: string
  timeZone?: string
  values: FormatValues
  variant: DateTextVariant
}

function calendarLabel(date: Date, resolution: Resolution): string | undefined {
  const offset = dayOffset(date, new Date(), resolution.timeZone)

  if (offset === 0) {
    return resolution.labels.dateText.today
  }

  if (offset === -1) {
    return resolution.labels.dateText.yesterday
  }

  if (offset === 1) {
    return resolution.labels.dateText.tomorrow
  }

  return undefined
}

function formatDate(date: Date, resolution: Resolution): string {
  const { format, locale, timeZone, values, variant } = resolution

  if (format) {
    return formatPattern(date, format)
  }

  if (variant === 'relative') {
    const { amount, unit } = relativeParts(date.getTime() - Date.now())

    return new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
    }).format(amount, unit)
  }

  if (variant === 'calendar') {
    const label = calendarLabel(date, resolution)

    if (label) {
      return label
    }
  }

  if (variant === 'iso') {
    return isoDay(date, timeZone)
  }

  if (variant === 'month') {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      timeZone,
      year: 'numeric',
    }).format(date)
  }

  if (variant === 'weekday') {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: 'long',
    }).format(date)
  }

  if (variant === 'time') {
    return values.timeFormat
      ? formatPattern(date, values.timeFormat)
      : new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          timeZone,
        }).format(date)
  }

  if (variant === 'dateTime') {
    return values.dateTimeFormat
      ? formatPattern(date, values.dateTimeFormat)
      : new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          month: '2-digit',
          timeZone,
          year: 'numeric',
        }).format(date)
  }

  return values.dateFormat
    ? formatPattern(date, values.dateFormat)
    : new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        timeZone,
        year: 'numeric',
      }).format(date)
}

function useResolution(props: DateTextProps): Resolution {
  const values = useFormat()
  const labels = useLabels()

  return {
    format: props.format,
    labels,
    locale: props.locale ?? values.locale,
    timeZone: props.timeZone ?? values.timeZone,
    values,
    variant: props.variant ?? 'date',
  }
}

function useLiveTick(enabled: boolean) {
  const [, setTick] = useState(0)

  useInterval(
    () => setTick((current) => current + 1),
    enabled ? LIVE_INTERVAL_MS : null,
  )
}

function readBound(
  value: DateTextValue,
  resolution: Resolution,
): string | undefined {
  const date = toDate(value)

  return date ? formatDate(date, resolution) : undefined
}

function DateTextSingle(props: DateTextSingleProps) {
  const resolution = useResolution(props)
  const date = toDate(props.value)

  useLiveTick(Boolean(props.live) && resolution.variant === 'relative')

  const fallback = props.fallback ?? DEFAULT_FALLBACK

  return (
    <FormatterText
      {...props}
      dateTime={date?.toISOString()}
      tag="time"
      testId="date-text"
      text={date ? formatDate(date, resolution) : fallback}
    />
  )
}

function DateTextRange(props: DateTextRangeProps) {
  const resolution = useResolution(props)
  const labels = useLabels()
  const from = readBound(props.value?.from, resolution)
  const to = readBound(props.value?.to, resolution)
  const fallback = props.fallback ?? DEFAULT_FALLBACK

  const text = from
    ? to
      ? `${from}${RANGE_SEPARATOR}${to}`
      : labels.common.from(from)
    : to
      ? labels.common.upTo(to)
      : fallback

  return <FormatterText {...props} testId="date-text" text={text} />
}

export function DateText(props: DateTextProps) {
  if (props.mode === 'range') {
    return <DateTextRange {...props} />
  }

  return <DateTextSingle {...props} />
}
