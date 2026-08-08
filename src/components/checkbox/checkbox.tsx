import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { Check } from '@/internal/icons'

import type { CheckboxGroupProps, CheckboxProps } from './checkbox.types'

const checkbox = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    box: [
      'checkbox-box relative flex shrink-0 items-center justify-center rounded-[4px]',
      'border border-input outline-none transition-colors',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
      'dark:bg-input/30 dark:data-checked:bg-primary',
    ],
    indicator: 'checkbox-indicator grid place-content-center text-current',
    root: 'checkbox-root flex cursor-pointer items-center gap-2',
  },
  variants: {
    bordered: {
      true: {
        root: 'w-full select-none rounded-md border p-3 hover:bg-muted/50 has-disabled:cursor-not-allowed has-disabled:opacity-50',
      },
    },
    hasDescription: {
      true: {
        box: 'mt-px',
        root: 'items-start',
      },
    },
    size: {
      lg: {
        box: 'size-5',
        indicator: '[&>svg]:size-4',
      },
      md: {
        box: 'size-4',
        indicator: '[&>svg]:size-3.5',
      },
      sm: {
        box: 'size-3',
        indicator: '[&>svg]:size-2.5',
      },
    },
  },
})

const checkboxGroup = tv({
  base: 'checkbox-group flex',
  defaultVariants: {
    variant: 'vertical',
  },
  variants: {
    variant: {
      horizontal: 'flex-row flex-wrap gap-4',
      vertical: 'flex-col gap-2',
    },
  },
})

function CheckboxRoot({
  label,
  description,
  size,
  checked,
  defaultChecked,
  disabled,
  bordered,
  value,
  onChange,
}: CheckboxProps) {
  const hasDescription = Boolean(description)
  const { root, box, indicator } = checkbox({
    bordered,
    hasDescription,
    size,
  })

  return (
    <label className={root()} data-testid="checkbox-root">
      <CheckboxPrimitive.Root
        checked={checked}
        className={box()}
        data-slot="checkbox"
        data-testid="checkbox-box"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(val) => onChange?.(val === true)}
        value={value}
      >
        <CheckboxPrimitive.Indicator
          className={indicator()}
          data-slot="checkbox-indicator"
          data-testid="checkbox-indicator"
        >
          <Check />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="cursor-pointer font-medium text-sm leading-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground text-xs">{description}</span>
          )}
        </div>
      )}
    </label>
  )
}

function CheckboxGroup({
  items,
  value: controlledValue,
  defaultValue = [],
  disabled,
  variant,
  onChange,
}: CheckboxGroupProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
  const isControlled = controlledValue !== undefined
  const selected = isControlled ? controlledValue : internalValue

  const handleChange = (itemValue: string, checked: boolean) => {
    const next = checked
      ? [...selected, itemValue]
      : selected.filter((v) => v !== itemValue)
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  return (
    <div
      className={checkboxGroup({
        variant,
      })}
      data-testid="checkbox-group"
    >
      {items.map((item) => (
        <CheckboxRoot
          checked={selected.includes(item.value)}
          disabled={disabled || item.disabled}
          key={item.value}
          label={item.label}
          onChange={(checked) => handleChange(item.value, checked)}
        />
      ))}
    </div>
  )
}

const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
})

export { Checkbox }
