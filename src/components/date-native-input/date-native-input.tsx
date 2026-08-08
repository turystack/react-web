import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Input } from '@/components/input'
import { CalendarIcon, X } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  DateNativeInputMode,
  DateNativeInputProps,
} from './date-native-input.types'

const styles = tv({
  slots: {
    clearTrigger:
      'visible relative z-20 cursor-pointer text-muted-foreground hover:text-foreground',
    nativeInput:
      'absolute top-0 bottom-0 left-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed',
    root: 'group relative w-full',
    trigger:
      'pointer-events-none group-focus-within:border-ring group-focus-within:ring-3 group-focus-within:ring-ring/50',
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

function getNativeType(mode: DateNativeInputMode) {
  return mode === 'date-time' ? 'datetime-local' : 'date'
}

function getDisplayFormat(mode: DateNativeInputMode, valueFormat?: string) {
  if (valueFormat) {
    return valueFormat
  }
  return mode === 'date-time' ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'
}

function getPlaceholder(mode: DateNativeInputMode, placeholder?: string) {
  if (placeholder) {
    return placeholder
  }
  return mode === 'date-time' ? 'dd/mm/yyyy hh:mm' : 'dd/mm/yyyy'
}

function formatNativeValue(value: Date | null, mode: DateNativeInputMode) {
  if (!value) {
    return ''
  }
  if (mode === 'date-time') {
    return format(value, "yyyy-MM-dd'T'HH:mm")
  }
  return format(value, 'yyyy-MM-dd')
}

function parseNativeValue(value: string, mode: DateNativeInputMode) {
  if (!value) {
    return null
  }

  const [datePart, timePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  if (mode === 'date') {
    return new Date(year, month - 1, day)
  }

  const [hour = 0, minute = 0] = (timePart ?? '').split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

function DateNativeInput({
  mode = 'date',
  value,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  size,
  minDate,
  maxDate,
  step,
  clearable = true,
  valueFormat,
  rightSectionWidth = 36,
  rootClassName,
  className,
  id,
  name,
  required,
  autoComplete,
  form,
  onBlur,
  onFocus,
  onInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: DateNativeInputProps) {
  const [internalValue, setInternalValue] = useState<Date | null | undefined>(
    defaultValue,
  )

  const isControlled = value !== undefined
  const selectedValue = (isControlled ? value : internalValue) ?? null
  const hasClear = clearable && !!selectedValue && !disabled
  const nativeType = getNativeType(mode)
  const nativeValue = formatNativeValue(selectedValue, mode)
  const displayValue = selectedValue
    ? format(selectedValue, getDisplayFormat(mode, valueFormat))
    : ''
  const lastNativeValueRef = useRef(nativeValue)
  const nativeInputRef = useRef<HTMLInputElement>(null)

  const { clearTrigger, nativeInput, root, trigger } = styles()

  useEffect(() => {
    lastNativeValueRef.current = nativeValue
  }, [nativeValue])

  const commit = (nextValue: Date | null) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(nextValue)
  }

  const commitNativeValue = (nextNativeValue: string) => {
    if (lastNativeValueRef.current === nextNativeValue) {
      return
    }

    lastNativeValueRef.current = nextNativeValue
    commit(parseNativeValue(nextNativeValue, mode))
  }

  const handleNativeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commitNativeValue(event.target.value)
  }

  const handleNativeInput = (event: React.FormEvent<HTMLInputElement>) => {
    commitNativeValue(event.currentTarget.value)
  }

  const handleNativeClick = () => {
    const input = nativeInputRef.current

    if (!input || disabled) {
      return
    }

    input.focus()

    try {
      input.showPicker()
    } catch {
      // Some WebViews/Safari variants throw despite exposing showPicker.
    }
  }

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    commit(null)
  }

  return (
    <div
      className={root({
        className: rootClassName,
      })}
    >
      <Input
        {...props}
        aria-hidden
        className={cn(trigger(), className)}
        disabled={disabled}
        leftSection={<CalendarIcon className="size-4" />}
        placeholder={getPlaceholder(mode, placeholder)}
        readOnly
        rightSection={
          <ButtonPrimitive
            aria-label="Clear date"
            className={clearTrigger({
              disabled,
              hasValue: hasClear,
            })}
            disabled={disabled}
            onClick={handleClear}
            tabIndex={hasClear ? 0 : -1}
            type="button"
          >
            <X className="size-4" />
          </ButtonPrimitive>
        }
        rightSectionWidth={rightSectionWidth}
        size={size}
        tabIndex={-1}
        value={displayValue}
      />
      <input
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        autoComplete={autoComplete}
        className={nativeInput()}
        disabled={disabled}
        form={form}
        id={id}
        max={formatNativeValue(maxDate ?? null, mode)}
        min={formatNativeValue(minDate ?? null, mode)}
        name={name}
        onBlur={onBlur}
        onChange={handleNativeChange}
        onClick={handleNativeClick}
        onFocus={onFocus}
        onInput={handleNativeInput}
        onInvalid={onInvalid}
        ref={nativeInputRef}
        required={required}
        step={step}
        style={{
          right: hasClear ? rightSectionWidth : 0,
        }}
        type={nativeType}
        value={nativeValue}
      />
    </div>
  )
}

export { DateNativeInput }
