import { useFormat } from '@/components/format-provider'
import {
  DEFAULT_FALLBACK,
  FormatterText,
  type FormatterTone,
} from '@/components/formatter-text/formatter-text'

import type { NumberTextProps } from './number-text.types'

function optionsOf(props: NumberTextProps): Intl.NumberFormatOptions {
  const variant = props.variant ?? 'decimal'
  const compact = variant === 'compact'
  const digits = props.fractionDigits

  return {
    maximumFractionDigits: digits ?? (compact ? 1 : undefined),
    minimumFractionDigits: digits,
    notation: compact ? 'compact' : 'standard',
    signDisplay: props.signDisplay ?? 'auto',
    style: variant === 'percent' ? 'percent' : 'decimal',
  }
}

function toneOf(props: NumberTextProps): FormatterTone | undefined {
  if (!props.colored || !props.value) {
    return undefined
  }

  return props.value > 0 ? 'positive' : 'negative'
}

export function NumberText(props: NumberTextProps) {
  const values = useFormat()
  const locale = props.locale ?? values.locale
  const readable =
    props.value !== null &&
    props.value !== undefined &&
    Number.isFinite(props.value)
  const formatted = readable
    ? new Intl.NumberFormat(locale, optionsOf(props)).format(
        props.value as number,
      )
    : undefined
  const text = formatted
    ? props.unit
      ? `${formatted} ${props.unit}`
      : formatted
    : (props.fallback ?? DEFAULT_FALLBACK)

  return (
    <FormatterText
      {...props}
      testId="number-text"
      text={text}
      tone={toneOf(props)}
    />
  )
}
