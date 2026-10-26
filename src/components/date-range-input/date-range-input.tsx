import {
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { useMemo, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Calendar } from '@/components/calendar'
import { ComposedInput } from '@/components/input/input.composed'
import type { TuryLabels } from '@/components/labels-provider'
import { useLabels } from '@/components/labels-provider'
import { ComposedPopover } from '@/components/popover/popover.composed'
import { CalendarIcon, X } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  DateRange,
  DateRangeInputPreset,
  DateRangeInputProps,
} from './date-range-input.types'

const dateRangeInput = tv({
  slots: {
    clearTrigger:
      'date-range-input-clear-trigger flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
    openTrigger: [
      'date-range-input-open-trigger pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-md',
      'text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:cursor-not-allowed',
    ],
    root: 'date-range-input-root',
  },
  variants: {
    clearable: {
      false: { clearTrigger: 'invisible' },
      true: { clearTrigger: 'visible' },
    },
    // The field keeps a focus ring while its picker is on screen.
    open: {
      true: { root: 'border-ring ring-3 ring-ring/50' },
    },
  },
})

function createDefaultPresets(
  labels: TuryLabels['dateRangeInput'],
): DateRangeInputPreset[] {
  return [
    {
      getValue: () => {
        const today = startOfDay(new Date())
        return {
          from: today,
          to: today,
        }
      },
      key: 'today',
      label: labels.today,
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
      label: labels.yesterday,
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
      label: labels.last7Days,
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
      label: labels.last30Days,
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
      label: labels.thisMonth,
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
      label: labels.lastMonth,
    },
    {
      key: 'custom',
      label: labels.custom,
    },
  ]
}

function formatRange(
  range: DateRange | null | undefined,
  labels: TuryLabels['common'],
): string {
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
    return labels.upTo(format(to, 'dd/MM/yyyy'))
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
  applyLabel,
  cancelLabel,
  value,
  defaultValue,
  disabled,
  onChange,
  placeholder = 'dd/mm/yyyy ~ dd/mm/yyyy',
  presets,
  showPresets = true,
  size,
  onClick,
  ...props
}: DateRangeInputProps) {
  const labels = useLabels()
  const resolvedPresets = useMemo(
    () =>
      showPresets
        ? (presets ?? createDefaultPresets(labels.dateRangeInput))
        : [],
    [labels.dateRangeInput, presets, showPresets],
  )
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLInputElement>(null)
  const [internalRange, setInternalRange] = useState<
    DateRange | null | undefined
  >(copyRange(defaultValue))
  const [draftRange, setDraftRange] = useState<DateRange | null>(
    copyRange(defaultValue),
  )
  const [activePresetKey, setActivePresetKey] = useState<string | null>(() =>
    getActivePresetKey(defaultValue, resolvedPresets),
  )
  const [displayMonth, setDisplayMonth] = useState<Date>(
    defaultValue?.from ?? new Date(),
  )

  const isControlled = value !== undefined
  const selectedRange = isControlled ? value : internalRange
  const displayValue = formatRange(selectedRange, labels.common)
  const clearable = !!displayValue && !disabled
  const styles = dateRangeInput({ clearable, open })

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

  function handleClear() {
    commit(null)
    setDraftRange(null)
    setActivePresetKey(null)
    setOpen(false)
  }

  /*
    The calendar button and the clear button are siblings on either side of
    the field, each a real <button> with its own name — nothing interactive
    sits inside anything else. The popup is anchored to the field, not to the
    small button that opens it, so it still opens under the whole field.
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
            <div className="date-range-input-popover flex overflow-hidden rounded-[inherit] bg-background">
              {resolvedPresets.length > 0 && (
                <div className="date-range-input-preset-list flex min-w-40 flex-col gap-1 border-border border-r p-3">
                  {resolvedPresets.map((preset) => (
                    <button
                      className={cn(
                        'date-range-input-preset cursor-pointer rounded-md px-3 py-1.5 text-left text-sm transition-colors',
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
              <div className="date-range-input-calendar-panel flex flex-col">
                <Calendar
                  className="date-range-input-calendar rounded-none"
                  mode="range"
                  month={displayMonth}
                  onDateChange={handleSelect}
                  onMonthChange={setDisplayMonth}
                  selected={draftRange}
                  size={size}
                />
                <div className="date-range-input-actions flex items-center justify-end gap-2 border-border border-t bg-background px-3 py-2">
                  <Button
                    disabled={disabled}
                    onClick={handleCancel}
                    size="sm"
                    variant="ghost"
                  >
                    {cancelLabel ?? labels.common.cancel}
                  </Button>
                  <Button disabled={disabled} onClick={handleApply} size="sm">
                    {applyLabel ?? labels.common.apply}
                  </Button>
                </div>
              </div>
            </div>
          }
          onOpenChange={handleOpenChange}
          open={open}
          popupClassName="date-range-input-popup overflow-hidden p-0"
          side="bottom"
          sideOffset={8}
        >
          <button
            aria-label={labels.dateInput.open}
            className={styles.openTrigger()}
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="date-range-input-icon size-4" />
          </button>
        </ComposedPopover>
      }
      onClick={(event) => {
        // The consumer's handler runs as well, not instead of the opening.
        onClick?.(event)
        if (!disabled) {
          handleOpenChange(true)
        }
      }}
      placeholder={placeholder}
      readOnly
      ref={fieldRef}
      rightSection={
        <button
          aria-label={labels.common.clear}
          className={styles.clearTrigger()}
          onClick={handleClear}
          tabIndex={clearable ? 0 : -1}
          type="button"
        >
          <X className="date-range-input-clear-icon size-4" />
        </button>
      }
      size={size}
      value={displayValue}
    />
  )
}

export { DateRangeInput }
