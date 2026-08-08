import { format } from 'date-fns'
import { useState } from 'react'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Sheet } from '@/components/sheet'
import { CalendarIcon, X } from '@/internal/icons'

import type { DatePickerSheetProps } from './date-picker-sheet.types'

function DatePickerSheet({
  value,
  defaultValue,
  disabled,
  onChange,
  placeholder = 'dd/mm/yyyy',
  size,
  minDate,
  maxDate,
  valueFormat = 'dd/MM/yyyy',
  clearable = true,
  title = 'Selecionar data',
  description = 'Escolha uma data no calendário abaixo.',
  ...props
}: DatePickerSheetProps) {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null | undefined>(
    defaultValue,
  )

  const isControlled = value !== undefined
  const selectedDate = (isControlled ? value : internalDate) ?? null
  const hasClear = clearable && !!selectedDate && !disabled
  const displayValue = selectedDate ? format(selectedDate, valueFormat) : ''

  const handleSelect = (date: Date | null) => {
    if (!isControlled) {
      setInternalDate(date)
    }
    onChange?.(date)
    setOpen(false)
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!isControlled) {
      setInternalDate(null)
    }
    onChange?.(null)
  }

  return (
    <>
      <Input
        {...props}
        className="date-picker-sheet-trigger"
        disabled={disabled}
        leftSection={<CalendarIcon className="size-4" />}
        onClick={() => !disabled && setOpen(true)}
        placeholder={placeholder}
        readOnly
        rightSection={
          <button
            className={`cursor-pointer text-muted-foreground hover:text-foreground ${
              hasClear ? 'visible' : 'invisible'
            }`}
            onClick={handleClear}
            tabIndex={hasClear ? 0 : -1}
            type="button"
          >
            <X className="size-4" />
          </button>
        }
        size={size}
        value={displayValue}
      />

      <Sheet onChange={setOpen} open={open} side="bottom">
        <Sheet.Header bordered closable>
          <Sheet.Header.Title>{title}</Sheet.Header.Title>
          {description ? (
            <Sheet.Header.Description>{description}</Sheet.Header.Description>
          ) : null}
        </Sheet.Header>

        <Sheet.Body minHeight="25rem">
          <Calendar
            fullWidth
            maxDate={maxDate}
            minDate={minDate}
            mode="single"
            onDateChange={handleSelect}
            selected={selectedDate}
            size={size}
          />
        </Sheet.Body>
      </Sheet>
    </>
  )
}

export { DatePickerSheet }
