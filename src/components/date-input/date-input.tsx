import { format } from 'date-fns'
import { useState } from 'react'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Popover } from '@/components/popover'
import { CalendarIcon, X } from '@/internal/icons'

import type { DateInputProps } from './date-input.types'

function DateInput({
  value,
  defaultValue,
  disabled,
  onChange,
  placeholder = 'dd/mm/yyyy',
  size,
  ...props
}: DateInputProps) {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null | undefined>(
    defaultValue,
  )

  const isControlled = value !== undefined
  const selectedDate = isControlled ? value : internalDate

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
          className="rounded-[inherit]"
          mode="single"
          onDateChange={handleSelect}
          selected={selectedDate}
          size={size}
        />
      }
      onOpenChange={setOpen}
      open={open}
      popupClassName="overflow-hidden p-0"
      side="bottom"
      sideOffset={8}
    >
      <Input
        {...props}
        className="date-input-root"
        disabled={disabled}
        leftSection={<CalendarIcon className="size-4" />}
        onClick={() => !disabled && setOpen(true)}
        placeholder={placeholder}
        readOnly
        rightSection={
          <button
            className={`cursor-pointer text-muted-foreground hover:text-foreground ${selectedDate && !disabled ? 'visible' : 'invisible'}`}
            onClick={handleClear}
            tabIndex={selectedDate && !disabled ? 0 : -1}
            type="button"
          >
            <X className="size-4" />
          </button>
        }
        size={size}
        value={displayValue}
      />
    </Popover>
  )
}

export { DateInput }
