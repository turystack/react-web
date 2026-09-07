import { format } from 'date-fns'
import { useState } from 'react'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Popover } from '@/components/popover'
import { CalendarIcon, X } from '@/internal/icons'
import { cn } from '@/support/utils'

import type { DateInputProps } from './date-input.types'

function DateInput({
  className,
  value,
  defaultValue,
  disabled,
  leftSection,
  onChange,
  onClick,
  placeholder = 'dd/mm/yyyy',
  rightSection,
  size,
  ...props
}: DateInputProps) {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null | undefined>(
    defaultValue,
  )
  const [displayMonth, setDisplayMonth] = useState<Date>(
    defaultValue ?? new Date(),
  )

  const isControlled = value !== undefined
  const selectedDate = isControlled ? value : internalDate

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDisplayMonth(selectedDate ?? new Date())
    }
    setOpen(nextOpen)
  }

  const handleSelect = (date: Date | null) => {
    if (!isControlled) {
      setInternalDate(date)
    }
    onChange?.(date)
    setOpen(false)
  }

  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isControlled) {
      setInternalDate(null)
    }
    onChange?.(null)
  }

  return (
    <Popover
      align="start"
      content={
        <Calendar
          className="date-input-calendar rounded-[inherit]"
          fullWidth
          mode="single"
          month={displayMonth}
          onDateChange={handleSelect}
          onMonthChange={setDisplayMonth}
          selected={selectedDate}
          size={size}
        />
      }
      onOpenChange={handleOpenChange}
      open={open}
      popupClassName="w-(--anchor-width) overflow-hidden p-0"
      side="bottom"
      sideOffset={8}
    >
      <Input
        {...props}
        className={cn('date-input-root', className)}
        disabled={disabled}
        leftSection={
          leftSection ?? <CalendarIcon className="date-input-icon size-4" />
        }
        onClick={(event) => {
          onClick?.(event)
          if (!disabled) {
            setOpen(true)
          }
        }}
        placeholder={placeholder}
        readOnly
        rightSection={
          rightSection ?? (
            <button
              aria-label="Clear date"
              className={`date-input-clear-trigger cursor-pointer text-muted-foreground hover:text-foreground ${selectedDate && !disabled ? 'visible' : 'invisible'}`}
              onClick={handleClear}
              tabIndex={selectedDate && !disabled ? 0 : -1}
              type="button"
            >
              <X className="date-input-clear-icon size-4" />
            </button>
          )
        }
        size={size}
        value={displayValue}
      />
    </Popover>
  )
}

export { DateInput }
