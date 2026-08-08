import { forwardRef, useCallback, useRef } from 'react'
import { tv } from 'tailwind-variants'

import { Loader } from '@/components/loader'
import { cn } from '@/support/utils'

import { DEFAULT_SECTION_WIDTH } from './input.shared'
import type { InputProps } from './input.types'

const input = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    field: [
      'input-field w-full min-w-0 rounded-lg border border-input bg-transparent',
      'text-base outline-none transition-colors md:text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'read-only:cursor-pointer',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
      'dark:bg-input/30 dark:disabled:bg-input/80',
      'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    ],
    root: 'input-root relative flex w-full items-center',
    section:
      'input-section pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center text-muted-foreground',
  },
  variants: {
    size: {
      lg: {
        field: 'h-11 px-3 py-1',
      },
      md: {
        field: 'h-10 px-2.5 py-1',
      },
      sm: {
        field: 'h-9 px-2.5 py-1',
      },
    },
    variant: {
      default: {},
      ghost: {
        field:
          'border-transparent bg-transparent focus-visible:border-transparent disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent',
      },
    },
  },
})

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
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

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
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onChange(val), 300)
    },
    [onChange, debounce],
  )

  const effectiveRight = loading ? <Loader size="sm" /> : rightSection
  const hasLeft = Boolean(leftSection)
  const hasRight = Boolean(effectiveRight)

  const { root, field, section } = input({
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
        data-slot="input"
        data-testid="input-field"
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
