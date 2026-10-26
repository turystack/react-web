import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Calendar } from '@/components/calendar'
import { FormFieldReset } from '@/components/form/form.context'
import { ComposedInput } from '@/components/input/input.composed'
import { useLabels } from '@/components/labels-provider'
import { ComposedPopover } from '@/components/popover/popover.composed'
import { ComposedTimeInput } from '@/components/time-input/time-input.composed'
import { CalendarIcon, Check, X } from '@/internal/icons'

import { Button } from '../button'
import type { DateTimeInputProps } from './date-time-input.types'

const styles = tv({
  slots: {
    clearTrigger:
      'date-time-input-clear-trigger visible flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
    openTrigger: [
      'date-time-input-open-trigger pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-md',
      'text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:cursor-not-allowed',
    ],
    popoverContent:
      'date-time-input-popover-content flex flex-col overflow-hidden rounded-[inherit] bg-background',
    root: 'date-time-input-root',
    timeRow:
      'date-time-input-time-row flex items-center gap-2 border-border border-t px-2 pt-3 pb-2',
  },
  variants: {
    disabled: {
      true: {
        clearTrigger: 'invisible cursor-not-allowed opacity-50',
      },
    },
    hasValue: {
      false: {
        clearTrigger: 'invisible',
      },
    },
    // The field keeps a focus ring while its picker is on screen.
    open: {
      true: { root: 'border-ring ring-3 ring-ring/50' },
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
  leftSection,
  onChange,
  onClick,
  placeholder,
  rightSection,
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

  const labels = useLabels()
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState<Date | null | undefined>(
    defaultValue,
  )
  const [displayMonth, setDisplayMonth] = useState<Date>(
    defaultValue ?? new Date(),
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

  const handleClear = () => {
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) {
      return
    }
    if (nextOpen) {
      setDisplayMonth(committedValue ?? new Date())
    }
    setOpen(nextOpen)
  }

  const { clearTrigger, openTrigger, popoverContent, root, timeRow } = styles({
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
      fieldClass={root()}
      leftSection={
        <ComposedPopover
          align="start"
          anchor={fieldRef}
          asChild
          content={
            // The time field is the popup's, not a Form.Field's control — the
            // date-time field itself is.
            <FormFieldReset>
              <div className={popoverContent()}>
                <Calendar
                  className="date-time-input-calendar rounded-[inherit]"
                  fullWidth
                  maxDate={maxDate}
                  minDate={minDate}
                  mode="single"
                  month={displayMonth}
                  onDateChange={handleDateChange}
                  onMonthChange={setDisplayMonth}
                  selected={committedValue}
                  size={size}
                />
                <div className={timeRow()} ref={timeWrapperRef}>
                  <ComposedTimeInput
                    fieldClass="date-time-input-time-field flex-1"
                    maxTime={maxTime}
                    minTime={minTime}
                    onChange={handleTimeChange}
                    onKeyDown={handleTimeKeyDown}
                    size={size}
                    value={timeString || null}
                    withSeconds={withSeconds}
                  />
                  <Button
                    ariaLabel={labels.confirm.confirm}
                    disabled={disabled}
                    onClick={() => setOpen(false)}
                    size="icon-sm"
                  >
                    <Check className="date-time-input-confirm-icon size-4" />
                  </Button>
                </div>
              </div>
            </FormFieldReset>
          }
          onOpenChange={handleOpenChange}
          open={open}
          popupClassName="date-time-input-popup overflow-hidden p-0"
          side="bottom"
          sideOffset={8}
          width="trigger"
        >
          <button
            aria-label={labels.dateInput.open}
            className={openTrigger()}
            disabled={disabled}
            type="button"
          >
            {leftSection ?? (
              <CalendarIcon className="date-time-input-icon size-4" />
            )}
          </button>
        </ComposedPopover>
      }
      onClick={(event) => {
        onClick?.(event)
        handleOpenChange(true)
      }}
      placeholder={resolvedPlaceholder}
      readOnly
      ref={fieldRef}
      rightSection={
        rightSection ?? (
          <ButtonPrimitive
            aria-label={labels.dateInput.clear}
            className={clearTrigger({
              disabled,
              hasValue: !!committedValue,
            })}
            disabled={disabled}
            onClick={handleClear}
            tabIndex={committedValue && !disabled ? 0 : -1}
          >
            <X className="date-time-input-clear-icon size-4" />
          </ButtonPrimitive>
        )
      }
      size={size}
      value={displayValue}
    />
  )
}

export { DateTimeInput }
