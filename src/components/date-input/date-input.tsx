import { format } from 'date-fns'
import { useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Calendar } from '@/components/calendar'
import { ComposedInput } from '@/components/input/input.composed'
import { useLabels } from '@/components/labels-provider'
import { ComposedPopover } from '@/components/popover/popover.composed'
import { CalendarIcon, X } from '@/internal/icons'

import type { DateInputProps } from './date-input.types'

const dateInput = tv({
  slots: {
    clearTrigger:
      'date-input-clear-trigger flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
    openTrigger: [
      'date-input-open-trigger pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-md',
      'text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:cursor-not-allowed',
    ],
    root: 'date-input-root',
  },
  variants: {
    clearable: {
      false: { clearTrigger: 'invisible' },
      true: { clearTrigger: 'visible' },
    },
    // The field keeps a focus ring while its calendar is on screen, as it did
    // when a wrapper around it was the trigger.
    open: {
      true: { root: 'border-ring ring-3 ring-ring/50' },
    },
  },
})

function DateInput({
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
  const labels = useLabels()
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLInputElement>(null)
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

  const handleClear = () => {
    if (!isControlled) {
      setInternalDate(null)
    }
    onChange?.(null)
  }

  const clearable = Boolean(selectedDate) && !disabled
  const styles = dateInput({
    clearable,
    open,
  })

  /*
    The calendar button and the clear button are siblings on either side of
    the field, each a real <button> with its own name — nothing interactive
    sits inside anything else. The popup is anchored to the field, not to the
    small button that opens it, so it still opens under the whole field and
    matches its width.
  */
  return (
    <ComposedInput
      {...props}
      disabled={disabled}
      fieldClass={styles.root()}
      leftSection={
        <ComposedPopover
          align="start"
          anchor={fieldRef}
          asChild
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
          popupClassName="date-input-popup overflow-hidden p-0"
          side="bottom"
          sideOffset={8}
          width="trigger"
        >
          <button
            aria-label={labels.dateInput.open}
            className={styles.openTrigger()}
            disabled={disabled}
            type="button"
          >
            {leftSection ?? <CalendarIcon className="date-input-icon size-4" />}
          </button>
        </ComposedPopover>
      }
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) {
          handleOpenChange(true)
        }
      }}
      placeholder={placeholder}
      readOnly
      ref={fieldRef}
      rightSection={
        rightSection ?? (
          <button
            aria-label={labels.dateInput.clear}
            className={styles.clearTrigger()}
            onClick={handleClear}
            tabIndex={clearable ? 0 : -1}
            type="button"
          >
            <X className="date-input-clear-icon size-4" />
          </button>
        )
      }
      size={size}
      value={displayValue}
    />
  )
}

export { DateInput }
