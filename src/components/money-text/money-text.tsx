import { useFormat } from '@/components/format-provider'
import {
  DEFAULT_FALLBACK,
  FormatterText,
  type FormatterTone,
  RANGE_SEPARATOR,
} from '@/components/formatter-text/formatter-text'
import { useLabels } from '@/components/labels-provider'
import { CURRENCY_CONFIGS } from '@/internal/currency'

import type {
  MoneyTextProps,
  MoneyTextRangeProps,
  MoneyTextSingleProps,
} from './money-text.types'

const CENTS_IN_UNIT = 100

type MoneyResolution = {
  fractionDigits?: number
  hideSymbol?: boolean
  locale: string
  props: MoneyTextProps
}

function optionsOf(resolution: MoneyResolution): Intl.NumberFormatOptions {
  const { props } = resolution
  const currency =
    CURRENCY_CONFIGS[props.currency ?? 'usd'] ?? CURRENCY_CONFIGS.usd
  const variant = props.variant ?? 'standard'
  const compact = variant === 'compact'
  const digits = resolution.fractionDigits ?? (compact ? 1 : 2)

  return {
    currency: currency.label,
    currencyDisplay: variant === 'code' ? 'code' : 'symbol',
    currencySign: variant === 'accounting' ? 'accounting' : 'standard',
    maximumFractionDigits: digits,
    minimumFractionDigits: compact ? 0 : digits,
    notation: compact ? 'compact' : 'standard',
    signDisplay: props.signDisplay ?? 'auto',
    style: resolution.hideSymbol ? 'decimal' : 'currency',
  }
}

function formatMoney(
  cents: number | null | undefined,
  resolution: MoneyResolution,
): string | undefined {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) {
    return undefined
  }

  return new Intl.NumberFormat(resolution.locale, optionsOf(resolution)).format(
    cents / CENTS_IN_UNIT,
  )
}

function toneOf(
  cents: number | null | undefined,
  colored: boolean | undefined,
): FormatterTone | undefined {
  if (!colored || !cents) {
    return undefined
  }

  return cents > 0 ? 'positive' : 'negative'
}

function useResolution(props: MoneyTextProps): MoneyResolution {
  const values = useFormat()

  return {
    fractionDigits: props.fractionDigits,
    hideSymbol: props.hideSymbol,
    locale: props.locale ?? values.locale,
    props: {
      ...props,
      currency: props.currency ?? values.currency,
    },
  }
}

function MoneyTextSingle(props: MoneyTextSingleProps) {
  const resolution = useResolution(props)
  const text = formatMoney(props.value, resolution)

  return (
    <FormatterText
      {...props}
      testId="money-text"
      text={text ?? props.fallback ?? DEFAULT_FALLBACK}
      tone={toneOf(props.value, props.colored)}
    />
  )
}

function MoneyTextRange(props: MoneyTextRangeProps) {
  const resolution = useResolution(props)
  const labels = useLabels()
  const from = formatMoney(props.value?.from, resolution)
  const to = formatMoney(props.value?.to, resolution)

  const text = from
    ? to
      ? `${from}${RANGE_SEPARATOR}${to}`
      : labels.common.from(from)
    : to
      ? labels.common.upTo(to)
      : (props.fallback ?? DEFAULT_FALLBACK)

  return <FormatterText {...props} testId="money-text" text={text} />
}

export function MoneyText(props: MoneyTextProps) {
  if (props.mode === 'range') {
    return <MoneyTextRange {...props} />
  }

  return <MoneyTextSingle {...props} />
}
