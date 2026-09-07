import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

import { Loader } from '@/components/loader'

import type { SegmentedControlProps } from './segmented-control.types'

export const styles = tv({
  defaultVariants: {
    block: false,
    orientation: 'horizontal',
    size: 'md',
  },
  slots: {
    root: 'segmented-control inline-flex rounded-lg bg-muted p-[3px] text-muted-foreground',
    segment:
      'segmented-control-segment inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent font-medium outline-none transition-all hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm data-disabled:pointer-events-none data-disabled:opacity-50 dark:data-checked:border-input dark:data-checked:bg-input/30 [&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  },
  variants: {
    block: {
      true: {
        root: 'flex w-full',
        segment: 'flex-1',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-row',
      },
      vertical: {
        root: 'flex-col',
        segment: 'w-full justify-start',
      },
    },
    size: {
      lg: {
        root: 'min-h-11',
        segment: 'px-3 py-2 text-base',
      },
      md: {
        root: 'min-h-10',
        segment: 'px-3 py-1.5 text-sm',
      },
      sm: {
        root: 'min-h-8',
        segment: 'px-2 py-1 text-xs',
      },
    },
  },
})

function read<T, R>(
  option: T,
  extractor: keyof T | ((value: T) => R) | undefined,
): R | undefined {
  if (extractor === undefined) {
    return undefined
  }

  return typeof extractor === 'function'
    ? extractor(option)
    : (option[extractor] as unknown as R)
}

function toKey(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function SegmentedControl<T, I = string, O = I>({
  ariaLabel,
  block = false,
  defaultValue,
  disabled,
  loading,
  onChange,
  optionDisabled,
  optionIcon,
  optionLabel,
  optionValue,
  options,
  orientation = 'horizontal',
  readOnly,
  size = 'md',
  value,
}: SegmentedControlProps<T, I, O>) {
  const { root, segment } = styles({
    block,
    orientation,
    size,
  })

  const entries = options.map((option) => {
    const optionOutput = read<T, O>(option, optionValue) as O

    return {
      disabled: Boolean(read<T, boolean>(option, optionDisabled)),
      icon: read<T, ReactNode>(option, optionIcon),
      key: toKey(optionOutput),
      label: read<T, ReactNode>(option, optionLabel),
      value: optionOutput,
    }
  })

  const selected = value === undefined ? undefined : toKey(value)

  return (
    <RadioGroupPrimitive
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={root()}
      data-testid="segmented-control"
      defaultValue={
        defaultValue === undefined ? undefined : toKey(defaultValue)
      }
      disabled={disabled || loading}
      onValueChange={(next) => {
        const match = entries.find((entry) => entry.key === next)

        if (match) {
          onChange?.(match.value)
        }
      }}
      readOnly={readOnly}
      value={selected}
    >
      {entries.map((entry) => (
        <RadioPrimitive.Root
          className={segment()}
          data-testid="segmented-control-segment"
          disabled={entry.disabled}
          key={entry.key}
          value={entry.key}
        >
          {loading && entry.key === selected ? (
            <Loader decorative size="sm" />
          ) : (
            entry.icon
          )}
          {entry.label}
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}
