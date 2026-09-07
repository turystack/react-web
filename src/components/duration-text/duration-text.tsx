import {
  DEFAULT_FALLBACK,
  FormatterText,
} from '@/components/formatter-text/formatter-text'
import type { TuryLabels } from '@/components/labels-provider'
import { useLabels } from '@/components/labels-provider'

import type { DurationTextProps } from './duration-text.types'
import { clockOf, splitDuration, toSeconds } from './duration-text.utils'

const DEFAULT_MAX_PARTS = 2

type Part = {
  amount: number
  long: string
  short: string
}

function partsOf(
  totalSeconds: number,
  labels: TuryLabels['durationText'],
): Part[] {
  const { days, hours, minutes, seconds } = splitDuration(totalSeconds)

  return [
    {
      amount: days,
      long: days === 1 ? labels.day : labels.days,
      short: labels.dayShort,
    },
    {
      amount: hours,
      long: hours === 1 ? labels.hour : labels.hours,
      short: labels.hourShort,
    },
    {
      amount: minutes,
      long: minutes === 1 ? labels.minute : labels.minutes,
      short: labels.minuteShort,
    },
    {
      amount: seconds,
      long: seconds === 1 ? labels.second : labels.seconds,
      short: labels.secondShort,
    },
  ]
}

function write(
  totalSeconds: number,
  maxParts: number,
  long: boolean,
  labels: TuryLabels['durationText'],
): string {
  const parts = partsOf(totalSeconds, labels)
  const firstMeaningful = parts.findIndex((part) => part.amount > 0)
  const kept =
    firstMeaningful === -1
      ? parts.slice(-1)
      : parts
          .slice(firstMeaningful, firstMeaningful + maxParts)
          .filter((part, index) => index === 0 || part.amount > 0)
  const sign = totalSeconds < 0 ? '-' : ''

  return `${sign}${kept
    .map((part) =>
      long ? `${part.amount} ${part.long}` : `${part.amount}${part.short}`,
    )
    .join(' ')}`
}

export function DurationText(props: DurationTextProps) {
  const labels = useLabels()
  const readable =
    props.value !== null &&
    props.value !== undefined &&
    Number.isFinite(props.value)

  if (!readable) {
    return (
      <FormatterText
        {...props}
        testId="duration-text"
        text={props.fallback ?? DEFAULT_FALLBACK}
      />
    )
  }

  const totalSeconds = toSeconds(props.value as number, props.unit ?? 'seconds')
  const variant = props.variant ?? 'short'
  const text =
    variant === 'clock'
      ? clockOf(totalSeconds)
      : write(
          totalSeconds,
          props.maxParts ?? DEFAULT_MAX_PARTS,
          variant === 'long',
          labels.durationText,
        )

  return <FormatterText {...props} testId="duration-text" text={text} />
}
