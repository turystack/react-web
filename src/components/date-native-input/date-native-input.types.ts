import type { InputProps } from '@/components/input/input.types'

export type DateNativeInputMode = 'date' | 'date-time'

export type DateNativeInputProps = Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'type'
  | 'debounce'
  | 'min'
  | 'max'
  | 'step'
  | 'readOnly'
  | 'autoFocus'
> & {
  mode?: DateNativeInputMode
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  minDate?: Date
  maxDate?: Date
  step?: number
  clearable?: boolean
  valueFormat?: string
}
