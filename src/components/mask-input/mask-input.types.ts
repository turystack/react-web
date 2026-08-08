/**
 * MaskInput
 *
 * Input with configurable mask patterns for formatted data entry.
 * Foundation for DocumentInput and PhoneInput components.
 *
 * Behavior:
 * - Mask prop defines the pattern (e.g. "000.000.000-00" or ["(00) 0000-0000", "(00) 00000-0000"])
 * - Array masks allow multiple patterns (auto-selects based on input length)
 * - Sections (left/right) and loading state from Input
 * - onAccept fires with the masked/unmasked value
 *
 * Implementation:
 * - Use react-imask (IMaskInput) library for mask enforcement
 * - Wrap with Input-style container for consistent left/right sections
 * - <MaskInput mask="000.000.000-00" value={v} onChange={setV} />
 * - <MaskInput mask={["(00) 0000-0000", "(00) 00000-0000"]} />
 *
 * Dependencies: react-imask, Input component (InputProps)
 */

import type { InputProps } from '@/components/input/input.types'

export type MaskInputProps = Omit<
  InputProps,
  'type' | 'onChange' | 'debounce'
> & {
  mask: string | string[] // mask pattern(s): e.g. '999.999.999-99' (required)
  className?: string // additional CSS class
  onChange?: (value: string | null) => void // fires with unmasked/masked value
}
