import { NumberField } from '@base-ui/react/number-field'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { Minus, Plus } from '@/internal/icons'

import type { NumberInputProps } from './number-input.types'

const numberInput = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    btn: [
      'number-input-btn flex cursor-pointer items-center border-input px-2',
      'bg-transparent text-muted-foreground transition-colors',
      'hover:bg-muted hover:text-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    field: [
      'w-full min-w-0 border-none bg-transparent',
      'px-2.5 py-1 text-center text-base outline-none md:text-sm',
      'placeholder:text-muted-foreground',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    ],
    group: [
      'number-input-group flex w-full overflow-hidden rounded-lg border border-input',
      'bg-transparent transition-colors',
      'has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
      'data-disabled:pointer-events-none data-disabled:bg-input/50 data-disabled:opacity-50',
      'dark:bg-input/30 dark:data-disabled:bg-input/80',
    ],
    root: 'number-input-root relative flex w-full items-center',
  },
  variants: {
    size: {
      lg: {
        group: 'h-11',
      },
      md: {
        group: 'h-10',
      },
      sm: {
        group: 'h-9',
      },
    },
  },
})

function NumberInput({
  value,
  defaultValue,
  onChange,
  step = 1,
  min,
  max,
  size,
  disabled,
  placeholder,
  grouping = true,
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<number | null | undefined>(
    undefined,
  )
  const { root, group, field, btn } = numberInput({
    size,
  })

  const resolvedFormat: Intl.NumberFormatOptions | undefined = grouping
    ? undefined
    : {
        useGrouping: false,
      }

  const resolvedValue = displayValue !== undefined ? displayValue : value

  function handleValueChange(nextValue: number | null) {
    if (nextValue === null) {
      setDisplayValue(null)
      onChange?.(null)
      return
    }

    setDisplayValue(undefined)
    onChange?.(nextValue)
  }

  function handleValueCommitted(nextValue: number | null) {
    if (nextValue === null) {
      return
    }

    setDisplayValue(undefined)
  }

  return (
    <div className={root()} data-testid="number-input-root">
      <NumberField.Root
        className="w-full"
        defaultValue={defaultValue ?? undefined}
        disabled={disabled}
        format={resolvedFormat}
        max={max}
        min={min}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        step={step}
        value={resolvedValue}
      >
        <NumberField.Group
          className={group()}
          data-disabled={disabled ? '' : undefined}
          data-testid="number-input-group"
        >
          <NumberField.Decrement
            className={btn({
              className: 'border-r',
            })}
            data-testid="number-input-decrement"
          >
            <Minus size={14} />
          </NumberField.Decrement>
          <NumberField.Input
            className={field()}
            data-testid="number-input-field"
            placeholder={placeholder}
          />
          <NumberField.Increment
            className={btn({
              className: 'border-l',
            })}
            data-testid="number-input-increment"
          >
            <Plus size={14} />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
    </div>
  )
}

export { NumberInput }
