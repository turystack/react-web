import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { tv } from 'tailwind-variants'

import type { RadioGroupProps, RadioProps } from './radio.types'

const radio = tv({
  slots: {
    control: [
      'radio-control relative flex aspect-square size-4 shrink-0 rounded-full',
      'border border-input outline-none transition-colors',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
      'dark:bg-input/30 dark:data-checked:bg-primary',
    ],
    indicator: 'radio-indicator flex size-4 items-center justify-center',
    root: 'radio-root flex cursor-pointer items-center gap-2',
  },
  variants: {
    bordered: {
      true: {
        root: 'w-full select-none rounded-md border p-3 hover:bg-muted/50 has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50',
      },
    },
    hasDescription: {
      true: {
        control: 'mt-px',
        root: 'items-start',
      },
    },
  },
})

const radioGroup = tv({
  base: 'radio-group flex',
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

function RadioItem({
  label,
  description,
  disabled,
  bordered,
  value,
}: RadioProps) {
  const hasDescription = Boolean(description)
  const { root, control, indicator } = radio({
    bordered,
    hasDescription,
  })

  return (
    <label className={root()} data-testid="radio-root">
      <RadioPrimitive.Root
        className={control()}
        data-slot="radio"
        data-testid="radio-control"
        disabled={disabled}
        value={value ?? ''}
      >
        <RadioPrimitive.Indicator
          className={indicator()}
          data-slot="radio-indicator"
          data-testid="radio-indicator"
        >
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
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

function RadioRoot({ checked, onChange, value, ...props }: RadioProps) {
  const innerValue = value ?? 'radio'

  return (
    <RadioGroupPrimitive
      onValueChange={(v) => onChange?.(v === innerValue)}
      value={checked ? innerValue : ''}
    >
      <RadioItem value={innerValue} {...props} />
    </RadioGroupPrimitive>
  )
}

function RadioGroup({
  items,
  value,
  defaultValue,
  disabled,
  bordered,
  variant,
  onChange,
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      className={radioGroup({
        variant,
      })}
      data-testid="radio-group"
      defaultValue={defaultValue}
      disabled={disabled}
      onValueChange={(val) => onChange?.(val as string)}
      value={value}
    >
      {items.map((item) => (
        <RadioItem
          bordered={bordered}
          description={item.description}
          disabled={item.disabled}
          key={item.value}
          label={item.label}
          value={item.value}
        />
      ))}
    </RadioGroupPrimitive>
  )
}

const Radio = Object.assign(RadioRoot, {
  Group: RadioGroup,
})

export { Radio }
