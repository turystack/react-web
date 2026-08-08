import { useCallback } from 'react'
import { tv } from 'tailwind-variants'

import type { TextareaProps } from './textarea.types'

const DEFAULT_SECTION_WIDTH = 36

const textarea = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    counter:
      'textarea-counter pointer-events-none absolute right-2.5 bottom-2 text-muted-foreground text-xs',
    field: [
      'textarea-field field-sizing-content min-h-16 w-full min-w-0 resize-none rounded-lg border border-input bg-transparent',
      'outline-none transition-colors',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
      'dark:bg-input/30 dark:disabled:bg-input/80',
      'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    ],
    root: 'textarea-root relative flex w-full',
    section:
      'textarea-section pointer-events-none absolute top-3 flex items-center text-muted-foreground',
  },
  variants: {
    size: {
      lg: {
        field: 'px-3 py-2 text-base md:text-sm',
      },
      md: {
        field: 'px-2.5 py-2 text-base md:text-sm',
      },
      sm: {
        field: 'px-2.5 py-1 text-sm',
      },
    },
  },
})

function Textarea({
  size,
  value,
  defaultValue,
  leftSection,
  rightSection,
  rootClassName,
  onChange,
  maxLength,
  ...props
}: TextareaProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!onChange) {
        return
      }
      const val = e.target.value === '' ? null : e.target.value
      onChange(val)
    },
    [onChange],
  )

  const hasLeft = Boolean(leftSection)
  const hasRight = Boolean(rightSection)

  const { counter, field, root, section } = textarea({
    size,
  })

  const fieldStyle: React.CSSProperties = {
    ...(hasLeft
      ? {
          paddingLeft: DEFAULT_SECTION_WIDTH,
        }
      : {}),
    ...(hasRight
      ? {
          paddingRight: DEFAULT_SECTION_WIDTH,
        }
      : {}),
    ...(maxLength != null
      ? {
          paddingBottom: '1.5rem',
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

  const currentLength = value !== undefined ? (value ?? '').length : undefined

  return (
    <div
      className={root({
        className: rootClassName,
      })}
      data-testid="textarea-root"
    >
      {hasLeft && (
        <span
          className={section({
            className: 'left-0 justify-center',
          })}
          data-testid="textarea-section-left"
          style={{
            width: DEFAULT_SECTION_WIDTH,
          }}
        >
          {leftSection}
        </span>
      )}
      <textarea
        data-slot="textarea"
        data-testid="textarea-field"
        maxLength={maxLength}
        onChange={handleChange}
        style={fieldStyle}
        {...controlledProps}
        {...props}
        className={field()}
      />
      {hasRight && (
        <span
          className={section({
            className: 'pointer-events-auto right-0 justify-center',
          })}
          data-testid="textarea-section-right"
          style={{
            width: DEFAULT_SECTION_WIDTH,
          }}
        >
          {rightSection}
        </span>
      )}
      {maxLength != null && currentLength !== undefined && (
        <span className={counter()} data-testid="textarea-counter">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  )
}

export { Textarea }
