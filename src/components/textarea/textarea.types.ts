/**
 * Textarea
 *
 * Multi-line text input with auto-expanding height and character counter.
 *
 * Behavior:
 * - Auto-expands height based on content using scrollHeight measurement
 * - maxLength shows a character counter (e.g. "45/200") in bottom-right
 * - leftSection/rightSection for icons or actions
 * - resize is disabled — height adjusts automatically
 * - Empty string converts to null in onChange
 * - Size variants match Input component for visual consistency
 *
 * Implementation:
 * - Native <textarea> with resize-none, overflow-hidden
 * - useEffect adjusts height: reset to 0 then set to scrollHeight
 * - Counter renders as absolute-positioned text
 * - <Textarea value={v} onChange={setV} maxLength={500} size="md" />
 *
 * Dependencies: Input component (InputSize type)
 */

import type { InputSize } from '@/components/input/input.types'

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'size' | 'value' | 'defaultValue'
> & {
  value?: string | null // controlled value
  defaultValue?: string | null // uncontrolled initial value
  size?: InputSize // visual size (matches Input sizes)
  rootClassName?: string // className for root wrapper
  leftSection?: React.ReactNode // element on the left
  rightSection?: React.ReactNode // element on the right
  onChange?: (value: string | null) => void // fires on value change
  maxLength?: number // max character count (renders counter UI)
}
