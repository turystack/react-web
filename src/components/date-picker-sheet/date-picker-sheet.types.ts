import type { InputProps } from '@/components/input/input.types'

export type DatePickerSheetProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange'
> & {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  valueFormat?: string
  clearable?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
}
