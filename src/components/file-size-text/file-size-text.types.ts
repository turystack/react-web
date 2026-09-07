/**
 * FileSizeText
 *
 * Renders a byte count as a size a person can judge.
 *
 * Behavior:
 * - Variants: decimal (kB, MB — powers of 1000, what storage vendors and
 *   browsers report) and binary (KiB, MiB — powers of 1024)
 * - Bytes stay whole; larger units get one decimal by default, because
 *   "1.4 MB" is the useful precision and "1.4331 MB" is noise
 * - The number goes through the reader's locale, so a decimal comma stays a
 *   decimal comma
 *
 * Implementation:
 * - <FileSizeText value={file.size} />
 * - <FileSizeText value={file.size} variant="binary" />
 *
 * Dependencies: FormatProvider, FormatterText
 */

import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'

export type FileSizeTextVariant = 'decimal' | 'binary'

export type FileSizeTextProps = FormatterTextProps & {
  fractionDigits?: number // decimal places above bytes; default 1
  locale?: string // overrides the FormatProvider locale
  value: number | null | undefined // size in bytes
  variant?: FileSizeTextVariant // unit system; default decimal
}
