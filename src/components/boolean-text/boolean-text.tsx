import {
  DEFAULT_FALLBACK,
  FormatterText,
  type FormatterTone,
} from '@/components/formatter-text/formatter-text'
import type { TuryLabels } from '@/components/labels-provider'
import { useLabels } from '@/components/labels-provider'
import { Check, X } from '@/internal/icons'

import type { BooleanTextProps, BooleanTextVariant } from './boolean-text.types'

function wordFor(
  value: boolean,
  variant: BooleanTextVariant,
  labels: TuryLabels['booleanText'],
): string {
  if (variant === 'activeInactive') {
    return value ? labels.active : labels.inactive
  }

  if (variant === 'enabledDisabled') {
    return value ? labels.enabled : labels.disabled
  }

  return value ? labels.yes : labels.no
}

function toneOf(
  value: boolean,
  colored: boolean | undefined,
): FormatterTone | undefined {
  if (!colored) {
    return undefined
  }

  return value ? 'positive' : 'negative'
}

export function BooleanText(props: BooleanTextProps) {
  const labels = useLabels()
  const variant = props.variant ?? 'yesNo'

  if (props.value === null || props.value === undefined) {
    return (
      <FormatterText
        {...props}
        testId="boolean-text"
        text={props.fallback ?? DEFAULT_FALLBACK}
      />
    )
  }

  const word = wordFor(props.value, variant, labels.booleanText)

  return (
    <FormatterText
      {...props}
      testId="boolean-text"
      text={word}
      tone={toneOf(props.value, props.colored)}
    >
      {variant === 'check' ? (
        <>
          {props.value ? <Check /> : <X />}
          <span className="boolean-text-label sr-only">{word}</span>
        </>
      ) : undefined}
    </FormatterText>
  )
}
