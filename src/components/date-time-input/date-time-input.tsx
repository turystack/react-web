import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Popover } from '@/components/popover'
import { TimeInput } from '@/components/time-input'
import { CalendarIcon, Check, X } from '@/internal/icons'

import { Button } from '../button'
import type { DateTimeInputProps } from './date-time-input.types'

const styles = tv({
  slots: {
    clearTrigger:
      'visible cursor-pointer text-muted-foreground hover:text-foreground',
    popoverContent:
      'flex flex-col overflow-hidden rounded-[inherit] bg-background',
    root: 'date-time-input-root',
    timeRow: 'flex items-center gap-2 border-border border-t px-2 pt-3 pb-2',
  },
  variants: {
    disabled: {
      true: {
        clearTrigger:
          'invisible cursor-not-allowed text-muted-foreground opacity-50',
      },
    },
    hasValue: {
      false: {
        clearTrigger:
          'invisible cursor-pointer text-muted-foreground hover:text-foreground',
      },
    },
  },
})

const FULL_TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/

function applyTime(date: Date, hhmmss: string): Date {
  const parts = hhmmss.split(':')
  const h = Number(parts[0]) || 0
  const m = Number(parts[1]) || 0
  const s = parts[2] ? Number(parts[2]) || 0 : 0
  const next = new Date(date)
  next.setHours(h, m, s, 0)
  return next
}

function DateTimeInput({
  value,
  defaultValue,
  defaultTime,
  withSeconds = false,
  valueFormat,
  disabled,
  onChange,
  placeholder,
  size,
  minDate,
  maxDate,
  minTime,
  maxTime,
  ...props
}: DateTimeInputProps) {
  const resolvedDefaultTime =
    defaultTime ?? (withSeconds ? '00:00:00' : '00:00')
  const resolvedFormat =
    valueFormat ?? (withSeconds ? 'dd/MM/yyyy HH:mm:ss' : 'dd/MM/yyyy HH:mm')
  const resolvedPlaceholder =
    placeholder ?? (withSeconds ? 'dd/mm/yyyy hh:mm:ss' : 'dd/mm/yyyy hh:mm')

  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<Date | null | undefined>(
    defaultValue,
  )

  const isControlled = value !== undefined
  const committedValue: Date | null =
    (isControlled ? value : internalValue) ?? null

  const [timeString, setTimeString] = useState<string>(() =>
    committedValue
      ? format(committedValue, withSeconds ? 'HH:mm:ss' : 'HH:mm')
      : '',
  )

  const timeWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (committedValue) {
      setTimeString(format(committedValue, withSeconds ? 'HH:mm:ss' : 'HH:mm'))
    } else {
      setTimeString('')
    }
  }, [committedValue, withSeconds])

  const commit = (next: Date | null) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      commit(null)
      return
    }
    const candidate = timeString || resolvedDefaultTime
    const useTime = FULL_TIME_RE.test(candidate)
      ? candidate
      : resolvedDefaultTime
    commit(applyTime(date, useTime))
    requestAnimationFrame(() => {
      const firstSegment = timeWrapperRef.current?.querySelector('input')
      firstSegment?.focus()
    })
  }

  const handleTimeChange = (next: string | null) => {
    setTimeString(next ?? '')
    if (next === null) {
      return
    }
    if (!committedValue) {
      return
    }
    commit(applyTime(committedValue, next))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    commit(null)
    setTimeString('')
  }

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setOpen(false)
    }
  }

  const displayValue = committedValue
    ? format(committedValue, resolvedFormat)
    : ''

  const { clearTrigger, popoverContent, root, timeRow } = styles()

  return (
    <Popover
      align="start"
      content={
        <div className={popoverContent()}>
          <Calendar
            className="rounded-[inherit]"
            maxDate={maxDate}
            minDate={minDate}
            mode="single"
            onDateChange={handleDateChange}
            selected={committedValue}
            size={size}
          />
          <div className={timeRow()} ref={timeWrapperRef}>
            <TimeInput
              className="flex-1"
              maxTime={maxTime}
              minTime={minTime}
              onChange={handleTimeChange}
              onKeyDown={handleTimeKeyDown}
              size={size}
              value={timeString || null}
              withSeconds={withSeconds}
            />
            <Button
              disabled={disabled}
              onClick={() => setOpen(false)}
              size="icon-sm"
            >
              <Check className="size-4" />
            </Button>
          </div>
        </div>
      }
      onOpenChange={(op) => {
        if (disabled) {
          return
        }
        setOpen(op)
      }}
      open={open}
      popupClassName="overflow-hidden p-0"
      side="bottom"
      sideOffset={8}
    >
      <Input
        {...props}
        className={root()}
        disabled={disabled}
        leftSection={<CalendarIcon className="size-4" />}
        placeholder={resolvedPlaceholder}
        readOnly
        rightSection={
          <ButtonPrimitive
            className={clearTrigger({
              disabled,
              hasValue: !!committedValue,
            })}
            disabled={disabled}
            onClick={handleClear}
            tabIndex={committedValue && !disabled ? 0 : -1}
          >
            <X className="size-4" />
          </ButtonPrimitive>
        }
        size={size}
        value={displayValue}
      />
    </Popover>
  )
}

export { DateTimeInput }
