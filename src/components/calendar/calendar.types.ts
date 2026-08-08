import type { Locale } from 'react-day-picker'

export type CalendarSize = 'sm' | 'md' | 'lg'

type CalendarBaseProps = {
  className?: string
  defaultMonth?: Date
  excludeDate?: (date: Date) => boolean
  fullWidth?: boolean
  highlightToday?: boolean
  locale?: Partial<Locale>
  maxDate?: Date
  minDate?: Date
  month?: Date
  numberOfMonths?: number
  onMonthChange?: (month: Date) => void
  showOutsideDays?: boolean
  size?: CalendarSize
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export type CalendarSingleProps = CalendarBaseProps & {
  mode: 'single'
  onDateChange?: (date: Date | null) => void
  selected?: Date | null
}

export type CalendarRangeProps = CalendarBaseProps & {
  mode: 'range'
  onDateChange?: (
    range: {
      from?: Date
      to?: Date
    } | null,
  ) => void
  selected?: {
    from?: Date
    to?: Date
  } | null
}

export type CalendarProps = CalendarRangeProps | CalendarSingleProps
