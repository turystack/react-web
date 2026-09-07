import { useFormat } from '@/components/format-provider'
import {
  DEFAULT_FALLBACK,
  FormatterText,
} from '@/components/formatter-text/formatter-text'

import type { FileSizeTextProps } from './file-size-text.types'
import { scaleBytes } from './file-size-text.utils'

const DEFAULT_FRACTION_DIGITS = 1

export function FileSizeText(props: FileSizeTextProps) {
  const values = useFormat()
  const locale = props.locale ?? values.locale
  const readable =
    props.value !== null &&
    props.value !== undefined &&
    Number.isFinite(props.value)

  if (!readable) {
    return (
      <FormatterText
        {...props}
        testId="file-size-text"
        text={props.fallback ?? DEFAULT_FALLBACK}
      />
    )
  }

  const { amount, unit } = scaleBytes(
    props.value as number,
    props.variant ?? 'decimal',
  )
  const digits =
    unit === 'B' ? 0 : (props.fractionDigits ?? DEFAULT_FRACTION_DIGITS)
  const text = `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(amount)} ${unit}`

  return <FormatterText {...props} testId="file-size-text" text={text} />
}
