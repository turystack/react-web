/**
 * DurationText
 *
 * Renders a span of time as a length, not as a clock reading.
 *
 * Behavior:
 * - Reads seconds by default; minutes and milliseconds are one prop away, so
 *   an API that answers in either does not force a division at the call site
 * - Variants: short (2h 15min), long (2 hours 15 minutes) and clock (02:15:00)
 * - `maxParts` decides how much detail survives: a 26-hour flight reads
 *   "1d 2h", not "1d 2h 0min 0s"
 * - A negative duration keeps its sign — a delay and a saving are not the same
 *   fact
 * - Every word comes from the labels; only the clock variant is language-free
 *
 * Implementation:
 * - Pure arithmetic in duration-text.utils.ts
 * - <DurationText value={8100} />
 * - <DurationText unit="minutes" value={135} variant="long" />
 *
 * Dependencies: LabelsProvider, FormatterText
 */

import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'

export type DurationTextVariant = 'short' | 'long' | 'clock'

export type DurationTextUnit = 'seconds' | 'minutes' | 'milliseconds'

export type DurationTextProps = FormatterTextProps & {
  maxParts?: number // how many units to write; default 2
  unit?: DurationTextUnit // unit the value is in; default seconds
  value: number | null | undefined // the length of time
  variant?: DurationTextVariant // shape; default short
}
