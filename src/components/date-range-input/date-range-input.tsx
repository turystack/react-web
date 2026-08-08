import {
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { useMemo, useState } from 'react'
import { Button } from '@/components/button'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Popover } from '@/components/popover'
import { CalendarIcon, X } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  DateRange,
  DateRangeInputPreset,
  DateRangeInputProps,
} from './date-range-input.types'

const DEFAULT_PRESETS: DateRangeInputPreset[] = [
  {
    getValue: () => {
      const today = startOfDay(new Date())
      return {
        from: today,
        to: today,
      }
    },
    key: 'today',
    label: 'Hoje',
  },
  {
    getValue: () => {
      const yesterday = subDays(startOfDay(new Date()), 1)
      return {
        from: yesterday,
        to: yesterday,
      }
    },
    key: 'yesterday',
    label: 'Ontem',
  },
  {
    getValue: () => {
      const today = startOfDay(new Date())
      return {
        from: subDays(today, 6),
        to: today,
      }
    },
    key: 'last7Days',
    label: 'Últimos 7 dias',
  },
  {
    getValue: () => {
      const today = startOfDay(new Date())
      return {
        from: subDays(today, 29),
        to: today,
      }
    },
    key: 'last30Days',
    label: 'Últimos 30 dias',
  },
  {
    getValue: () => {
      const today = startOfDay(new Date())
      return {
        from: startOfMonth(today),
        to: today,
      }
    },
    key: 'thisMonth',
    label: 'Este mês',
  },
  {
    getValue: () => {
      const previousMonth = subMonths(startOfDay(new Date()), 1)
      return {
        from: startOfMonth(previousMonth),
        to: endOfMonth(previousMonth),
      }
    },
    key: 'lastMonth',
    label: 'Mês passado',
  },
  {
    key: 'custom',
    label: 'Personalizado',
  },
]

function formatRange(range: DateRange | null | undefined): string {
  if (!range) {
    return ''
  }
  const { from, to } = range
  if (from && to) {
    return `${format(from, 'dd/MM/yyyy')} ~ ${format(to, 'dd/MM/yyyy')}`
  }
  if (from) {
    return format(from, 'dd/MM/yyyy')
  }
  if (to) {
    return `Até ${format(to, 'dd/MM/yyyy')}`
  }
  return ''
}

function normalizeRange(range: DateRange | null | undefined): DateRange | null {
  if (!range || (!range.from && !range.to)) {
    return null
  }

  return {
    from: range.from,
    to: range.to,
  }
}

function copyRange(range: DateRange | null | undefined): DateRange | null {
  const normalizedRange = normalizeRange(range)

  if (!normalizedRange) {
    return null
  }

  return {
    from: normalizedRange.from ? new Date(normalizedRange.from) : undefined,
    to: normalizedRange.to ? new Date(normalizedRange.to) : undefined,
  }
}

function rangesMatch(
  a: DateRange | null | undefined,
  b: DateRange | null | undefined,
): boolean {
  const rangeA = normalizeRange(a)
  const rangeB = normalizeRange(b)

  if (!rangeA && !rangeB) {
    return true
  }

  if (!rangeA || !rangeB) {
    return false
  }

  const fromMatches =
    !rangeA.from && !rangeB.from
      ? true
      : !!rangeA.from && !!rangeB.from && isSameDay(rangeA.from, rangeB.from)
  const toMatches =
    !rangeA.to && !rangeB.to
      ? true
      : !!rangeA.to && !!rangeB.to && isSameDay(rangeA.to, rangeB.to)

  return fromMatches && toMatches
}

function getCustomPresetKey(presets: DateRangeInputPreset[]): string | null {
  return (
    presets.find((preset) => preset.key === 'custom')?.key ??
    presets.find((preset) => !preset.getValue)?.key ??
    null
  )
}

function getActivePresetKey(
  range: DateRange | null | undefined,
  presets: DateRangeInputPreset[],
): string | null {
  const normalizedRange = normalizeRange(range)

  if (!normalizedRange) {
    return null
  }

  const matchingPreset = presets.find(
    (preset) => preset.getValue && rangesMatch(preset.getValue(), range),
  )

  return matchingPreset?.key ?? getCustomPresetKey(presets)
}

function DateRangeInput({
  applyLabel = 'Aplicar',
  cancelLabel = 'Cancelar',
  className,
  value,
  defaultValue,
  disabled,
  onChange,
  placeholder = 'dd/mm/yyyy ~ dd/mm/yyyy',
  presets,
  showPresets = true,
  size,
  ...props
}: DateRangeInputProps) {
  const initialPresets = showPresets ? (presets ?? DEFAULT_PRESETS) : []
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<
    DateRange | null | undefined
  >(copyRange(defaultValue))
  const [draftRange, setDraftRange] = useState<DateRange | null>(
    copyRange(defaultValue),
  )
  const [activePresetKey, setActivePresetKey] = useState<string | null>(() =>
    getActivePresetKey(defaultValue, initialPresets),
  )
  const [displayMonth, setDisplayMonth] = useState<Date>(
    defaultValue?.from ?? new Date(),
  )

  const isControlled = value !== undefined
  const selectedRange = isControlled ? value : internalRange
  const displayValue = formatRange(selectedRange)
  const hasValue = !!displayValue
  const resolvedPresets = useMemo(
    () => (showPresets ? (presets ?? DEFAULT_PRESETS) : []),
    [presets, showPresets],
  )

  function commit(range: DateRange | null | undefined) {
    const normalizedRange = normalizeRange(range)

    if (!isControlled) {
      setInternalRange(normalizedRange)
    }

    onChange?.(normalizedRange)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (disabled && nextOpen) {
      return
    }

    if (nextOpen) {
      const nextDraftRange = copyRange(selectedRange)
      setDraftRange(nextDraftRange)
      setActivePresetKey(getActivePresetKey(nextDraftRange, resolvedPresets))
      setDisplayMonth(nextDraftRange?.from ?? new Date())
    }

    setOpen(nextOpen)
  }

  function handleSelect(range: DateRange | null) {
    setDraftRange(normalizeRange(range))
    setActivePresetKey(getCustomPresetKey(resolvedPresets))
  }

  function handlePresetClick(preset: DateRangeInputPreset) {
    setActivePresetKey(preset.key)

    if (!preset.getValue) {
      return
    }

    const nextRange = normalizeRange(preset.getValue())
    setDraftRange(nextRange)
    setDisplayMonth(nextRange?.from ?? new Date())
  }

  function handleApply() {
    commit(draftRange)
    setOpen(false)
  }

  function handleCancel() {
    setDraftRange(copyRange(selectedRange))
    setActivePresetKey(getActivePresetKey(selectedRange, resolvedPresets))
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    commit(null)
    setDraftRange(null)
    setActivePresetKey(null)
    setOpen(false)
  }

  return (
    <Popover
      align="start"
      content={
        <div className="date-range-input-popover flex overflow-hidden rounded-[inherit] bg-background">
          {resolvedPresets.length > 0 && (
            <div className="flex min-w-40 flex-col gap-1 border-border border-r p-3">
              {resolvedPresets.map((preset) => (
                <button
                  className={cn(
                    'cursor-pointer rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    activePresetKey === preset.key
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  key={preset.key}
                  onClick={() => handlePresetClick(preset)}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            <Calendar
              className="rounded-none"
              mode="range"
              month={displayMonth}
              onDateChange={handleSelect}
              onMonthChange={setDisplayMonth}
              selected={draftRange}
              size={size}
            />
            <div className="flex items-center justify-end gap-2 border-border border-t bg-background px-3 py-2">
              <Button
                disabled={disabled}
                onClick={handleCancel}
                size="sm"
                variant="ghost"
              >
                {cancelLabel}
              </Button>
              <Button disabled={disabled} onClick={handleApply} size="sm">
                {applyLabel}
              </Button>
            </div>
          </div>
        </div>
      }
      onOpenChange={handleOpenChange}
      open={open}
      popupClassName="overflow-hidden p-0"
      side="bottom"
      sideOffset={8}
    >
      <Input
        {...props}
        className={cn('date-range-input-root', className)}
        disabled={disabled}
        leftSection={<CalendarIcon className="size-4" />}
        onClick={() => !disabled && setOpen(true)}
        placeholder={placeholder}
        readOnly
        rightSection={
          <button
            className={`cursor-pointer text-muted-foreground hover:text-foreground ${hasValue && !disabled ? 'visible' : 'invisible'}`}
            onClick={handleClear}
            tabIndex={hasValue && !disabled ? 0 : -1}
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

export { DateRangeInput }
