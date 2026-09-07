import { useDebounceCallback } from '@turystack/react-hooks'
import { forwardRef, useCallback } from 'react'

import { Loader } from '@/components/loader'
import { cn } from '@/support/utils'

import { DEBOUNCE_MS, DEFAULT_SECTION_WIDTH, inputShared } from './input.shared'
import type { InputProps } from './input.types'

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    variant,
    value,
    defaultValue,
    leftSection,
    leftSectionWidth = DEFAULT_SECTION_WIDTH,
    rightSection,
    rightSectionWidth = DEFAULT_SECTION_WIDTH,
    loading,
    debounce,
    rootClassName,
    className,
    onChange,
    type = 'text',
    ...props
  },
  ref,
) {
  const emitDebounced = useDebounceCallback(
    (val: string | null) => onChange?.(val),
    DEBOUNCE_MS,
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) {
        return
      }
      const val = e.target.value === '' ? null : e.target.value
      if (!debounce) {
        onChange(val)
        return
      }
      emitDebounced(val)
    },
    [onChange, debounce, emitDebounced],
  )

  const effectiveRight = loading ? <Loader size="sm" /> : rightSection
  const hasLeft = Boolean(leftSection)
  const hasRight = Boolean(effectiveRight)

  const { root, field, section } = inputShared({
    size,
    variant,
  })

  const fieldStyle: React.CSSProperties = {
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
  }

  const controlledProps =
    value !== undefined
      ? {
          value: value ?? '',
        }
      : {
          defaultValue: defaultValue ?? undefined,
        }

  return (
    <div
      className={root({
        className: rootClassName,
      })}
      data-testid="input-root"
    >
      {hasLeft && (
        <span
          className={section({
            className: 'left-0 justify-center',
          })}
          data-testid="input-section-left"
          style={{
            width: leftSectionWidth,
          }}
        >
          {leftSection}
        </span>
      )}
      <input
        aria-busy={loading || undefined}
        data-slot="input"
        data-testid="input-field"
        disabled={props.disabled || loading}
        onChange={handleChange}
        ref={ref}
        style={fieldStyle}
        type={type}
        {...controlledProps}
        {...props}
        className={cn(
          field({
            className,
          }),
          className ?? '',
        )}
      />
      {hasRight && (
        <span
          className={section({
            className: 'pointer-events-auto right-0 justify-center',
          })}
          data-testid="input-section-right"
          style={{
            width: rightSectionWidth,
          }}
        >
          {effectiveRight}
        </span>
      )}
    </div>
  )
})

export { Input }
