import {
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Loader } from '@/components/loader'
import { Clock } from '@/internal/icons'
import { cn } from '@/support/utils'

import { DEFAULT_SECTION_WIDTH, inputShared } from '../input/input.shared'
import {
  clampTime,
  formatTime,
  parsePaste,
  parseTime,
  type TimeParts,
} from './time-input.logic'
import type { TimeInputProps } from './time-input.types'

const HH_MAX = 23
const MM_MAX = 59
const SS_MAX = 59

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

type SpinSegmentProps = {
  ariaLabel?: string
  className?: string
  disabled?: boolean
  max: number
  min: number
  onNextInput?: () => void
  onPreviousInput?: () => void
  onValueChange: (value: number | null) => void
  readOnly?: boolean
  ref?: Ref<HTMLInputElement>
  tabIndex?: number
  value: number | null
}

/**
 * Single time segment — adapted from Mantine's SpinInput. Auto-advances when
 * the typed digit cannot extend into a valid 2-digit value (clamped > maxDigit)
 * or when leading zeros fill the slot ("00").
 */
function SpinSegment({
  ariaLabel,
  className,
  disabled,
  max,
  min,
  onNextInput,
  onPreviousInput,
  onValueChange,
  readOnly,
  ref,
  tabIndex,
  value,
}: SpinSegmentProps) {
  const maxDigit = Number(String(max)[0])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (readOnly) {
      return
    }
    const raw = e.currentTarget.value
    const digits = raw.replace(/\D/g, '')
    if (digits === '') {
      onValueChange(null)
      return
    }
    const parsed = Number.parseInt(digits, 10)
    const clamped = Math.max(min, Math.min(parsed, max))
    onValueChange(clamped)
    if (clamped > maxDigit || digits.startsWith('00')) {
      onNextInput?.()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (readOnly) {
      return
    }

    if ((e.key === '0' || e.key === 'Num0') && value === 0) {
      e.preventDefault()
      onNextInput?.()
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      if (value !== null) {
        onValueChange(null)
      } else {
        onPreviousInput?.()
      }
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onNextInput?.()
      return
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onPreviousInput?.()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next =
        value === null ? min : Math.max(min, Math.min(value + 1, max))
      onValueChange(next)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next =
        value === null ? max : Math.max(min, Math.min(value - 1, max))
      onValueChange(next)
      return
    }
  }

  return (
    <input
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value === null ? 0 : value}
      className={className}
      data-empty={value === null || undefined}
      disabled={disabled}
      inputMode="numeric"
      onChange={handleChange}
      onClick={(e) => {
        e.stopPropagation()
        e.currentTarget.select()
      }}
      onFocus={(e) => {
        e.currentTarget.select()
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      placeholder="--"
      readOnly={readOnly}
      ref={ref}
      role="spinbutton"
      tabIndex={tabIndex}
      type="text"
      value={value === null ? '' : pad(value)}
    />
  )
}

function TimeInput({
  size,
  variant,
  value,
  defaultValue,
  leftSection,
  leftSectionWidth = DEFAULT_SECTION_WIDTH,
  rightSection,
  rightSectionWidth = DEFAULT_SECTION_WIDTH,
  loading,
  rootClassName,
  className,
  onChange,
  withSeconds = false,
  minTime,
  maxTime,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  ...props
}: TimeInputProps) {
  const isControlled = value !== undefined
  const initial = parseTime(value ?? defaultValue ?? null, withSeconds)
  const [hh, setHh] = useState<number | null>(initial.hh)
  const [mm, setMm] = useState<number | null>(initial.mm)
  const [ss, setSs] = useState<number | null>(initial.ss)

  const hhRef = useRef<HTMLInputElement>(null)
  const mmRef = useRef<HTMLInputElement>(null)
  const ssRef = useRef<HTMLInputElement>(null)
  // True when the next external `value` change should sync internal state.
  // Reset to true after each internal change so that subsequent external
  // updates (parent re-renders driven by something other than our onChange)
  // still flow in.
  const acceptExternalChange = useRef(true)
  const containsFocus = useRef(false)

  useEffect(() => {
    if (!isControlled) {
      return
    }
    if (!acceptExternalChange.current) {
      acceptExternalChange.current = true
      return
    }
    const parts = parseTime(value ?? null, withSeconds)
    setHh(parts.hh)
    setMm(parts.mm)
    setSs(parts.ss)
  }, [value, withSeconds, isControlled])

  function emit(parts: TimeParts) {
    const formatted = formatTime(parts, withSeconds)
    onChange?.(formatted)
  }

  function makeHandler(field: 'hh' | 'mm' | 'ss') {
    return (val: number | null) => {
      acceptExternalChange.current = false
      if (field === 'hh') {
        setHh(val)
      }
      if (field === 'mm') {
        setMm(val)
      }
      if (field === 'ss') {
        setSs(val)
      }
      emit({
        hh: field === 'hh' ? val : hh,
        mm: field === 'mm' ? val : mm,
        ss: field === 'ss' ? val : ss,
      })
    }
  }

  function focusField(field: 'hh' | 'mm' | 'ss') {
    if (field === 'hh') {
      hhRef.current?.focus()
    }
    if (field === 'mm') {
      mmRef.current?.focus()
    }
    if (field === 'ss') {
      ssRef.current?.focus()
    }
  }

  function handleGroupFocus(e: FocusEvent<HTMLDivElement>) {
    if (containsFocus.current) {
      return
    }
    containsFocus.current = true
    onFocus?.(e as unknown as FocusEvent<HTMLInputElement>)
  }

  function handleGroupBlur(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
      return
    }
    containsFocus.current = false
    if (
      hh !== null &&
      mm !== null &&
      (!withSeconds || ss !== null) &&
      (minTime || maxTime)
    ) {
      const formatted = formatTime(
        {
          hh,
          mm,
          ss,
        },
        withSeconds,
      )
      if (formatted) {
        const clamped = clampTime(formatted, withSeconds, minTime, maxTime)
        if (clamped !== formatted) {
          const reparsed = parseTime(clamped, withSeconds)
          setHh(reparsed.hh)
          setMm(reparsed.mm)
          setSs(reparsed.ss)
          acceptExternalChange.current = false
          onChange?.(clamped)
        }
      }
    }
    onBlur?.(e as unknown as FocusEvent<HTMLInputElement>)
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    if (readOnly || disabled) {
      return
    }
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const parts = parsePaste(text, withSeconds)
    if (!parts) {
      return
    }
    setHh(parts.hh)
    setMm(parts.mm)
    setSs(parts.ss)
    acceptExternalChange.current = false
    const formatted = formatTime(parts, withSeconds)
    if (formatted) {
      const clamped =
        minTime || maxTime
          ? clampTime(formatted, withSeconds, minTime, maxTime)
          : formatted
      onChange?.(clamped)
    }
  }

  const effectiveLeft =
    leftSection !== undefined ? leftSection : <Clock size={14} />
  const effectiveRight = loading ? <Loader size="sm" /> : rightSection
  const hasLeft = Boolean(effectiveLeft)
  const hasRight = Boolean(effectiveRight)

  const { root, field, section } = inputShared({
    size,
    variant,
  })

  // Apply the shared field styling to the wrapper so that the multi-input
  // group looks like a single input. has-focus-visible lifts the
  // focus-visible ring from any child <input> to the wrapper border.
  const wrapperClass = cn(
    field({}),
    'flex cursor-text items-center gap-0',
    variant === 'ghost'
      ? 'has-[input:focus-visible]:border-transparent has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50'
      : 'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50',
    disabled &&
      (variant === 'ghost'
        ? 'pointer-events-none cursor-not-allowed bg-transparent opacity-50 dark:bg-transparent'
        : 'pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80'),
    className,
  )

  // The focused segment fills with primary color so the `--` placeholder
  // renders highlighted-looking even when empty, mirroring Mantine. Native
  // ::selection is suppressed so it doesn't double up with the focus fill,
  // and the caret is hidden because each focus selects the whole segment.
  const segmentClass = cn(
    'h-full w-[calc(2ch+0.3em)] min-w-0 border-0 px-[0.15em] py-0 text-center',
    'bg-transparent caret-transparent tabular-nums outline-none',
    'selection:bg-transparent',
    'placeholder:text-muted-foreground placeholder:opacity-100',
    'focus:rounded-sm focus:bg-primary focus:text-primary-foreground',
    'focus:placeholder:text-primary-foreground',
    'disabled:cursor-not-allowed disabled:opacity-50',
  )

  const colonClass = 'select-none text-muted-foreground'

  return (
    <div
      className={root({
        className: rootClassName,
      })}
      data-testid="time-input-root"
    >
      {hasLeft && (
        <span
          className={section({
            className: 'pointer-events-auto left-0 justify-center',
          })}
          data-testid="time-input-section-left"
          style={{
            width: leftSectionWidth,
          }}
        >
          {effectiveLeft}
        </span>
      )}
      <div
        {...(props as object)}
        className={wrapperClass}
        data-testid="time-input-field"
        onBlur={handleGroupBlur}
        onFocus={handleGroupFocus}
        onPaste={handlePaste}
        style={{
          ...(hasLeft
            ? {
                paddingLeft: leftSectionWidth,
              }
            : {}),
          ...(hasRight
            ? {
                paddingRight: rightSectionWidth,
              }
            : {}),
        }}
      >
        <SpinSegment
          ariaLabel="hours"
          className={segmentClass}
          disabled={disabled}
          max={HH_MAX}
          min={0}
          onNextInput={() => focusField('mm')}
          onValueChange={makeHandler('hh')}
          readOnly={readOnly}
          ref={hhRef}
          value={hh}
        />
        <span aria-hidden="true" className={colonClass}>
          :
        </span>
        <SpinSegment
          ariaLabel="minutes"
          className={segmentClass}
          disabled={disabled}
          max={MM_MAX}
          min={0}
          onNextInput={withSeconds ? () => focusField('ss') : undefined}
          onPreviousInput={() => focusField('hh')}
          onValueChange={makeHandler('mm')}
          readOnly={readOnly}
          ref={mmRef}
          tabIndex={-1}
          value={mm}
        />
        {withSeconds && (
          <>
            <span aria-hidden="true" className={colonClass}>
              :
            </span>
            <SpinSegment
              ariaLabel="seconds"
              className={segmentClass}
              disabled={disabled}
              max={SS_MAX}
              min={0}
              onPreviousInput={() => focusField('mm')}
              onValueChange={makeHandler('ss')}
              readOnly={readOnly}
              ref={ssRef}
              tabIndex={-1}
              value={ss}
            />
          </>
        )}
      </div>
      {hasRight && (
        <span
          className={section({
            className: 'right-0 justify-center',
          })}
          data-testid="time-input-section-right"
          style={{
            width: rightSectionWidth,
          }}
        >
          {effectiveRight}
        </span>
      )}
    </div>
  )
}

export { TimeInput }
