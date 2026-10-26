import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { type ReactNode, useState } from 'react'
import { tv } from 'tailwind-variants'

import { useFormFieldControl } from '@/components/form/form.context'
import { Loader } from '@/components/loader'
import {
  DisabledReason,
  type DisabledReasonA11y,
} from '@/components/tooltip/tooltip.composed'
import { axes } from '@/support/utils'

import type { SegmentedControlProps } from './segmented-control.types'

export const styles = tv({
  defaultVariants: {
    block: false,
    orientation: 'horizontal',
    size: 'md',
  },
  slots: {
    root: 'segmented-control inline-flex rounded-lg bg-muted p-0.75 text-muted-foreground',
    segment:
      'segmented-control-segment inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent font-medium outline-none transition-all hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm data-disabled:pointer-events-none data-disabled:opacity-50 data-blocked:cursor-not-allowed data-blocked:opacity-50 data-blocked:hover:text-muted-foreground dark:data-checked:border-input dark:data-checked:bg-input/30 [&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    // Holds a blocked segment's reason wrapper in the segment's place, so the
    // segment keeps its share of a block control.
    slot: 'segmented-control-slot inline-flex',
  },
  variants: {
    block: {
      true: {
        root: 'flex w-full',
        segment: 'flex-1',
        slot: 'flex flex-1',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-row',
      },
      vertical: {
        root: 'flex-col',
        segment: 'w-full justify-start',
        slot: 'flex w-full',
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

/**
 * One segment. A blocked one stays focusable and its selection is refused by
 * the group. Its aria-disabled is scoped to focus: Base UI's radio group skips
 * aria-disabled radios on the arrow keys and takes no disabledIndices, so the
 * segment says it only while it holds focus — the arrows still land on it,
 * and the state is heard there.
 */
function Segment({
  children,
  className,
  disabled,
  disabledReason,
  slotClassName,
  value,
}: {
  children: ReactNode
  className: string
  disabled: boolean
  disabledReason?: string
  slotClassName: string
  value: string
}) {
  const [focused, setFocused] = useState(false)

  const renderSegment = (a11y: DisabledReasonA11y) => (
    <RadioPrimitive.Root
      className={className}
      data-testid="segmented-control-segment"
      disabled={disabled && !disabledReason}
      value={value}
      {...(disabledReason
        ? {
            'aria-disabled': focused ? (true as const) : undefined,
            'data-blocked': '',
            onBlur: () => setFocused(false),
            onFocus: () => setFocused(true),
          }
        : {})}
      {...a11y}
    >
      {children}
    </RadioPrimitive.Root>
  )

  // The same two nodes with or without a reason, so a reason that arrives
  // or leaves on the focused segment only remounts the segment, and the
  // reason hands focus back to it. With no reason the slot takes no box.
  return (
    <span
      className={disabledReason ? slotClassName : 'contents'}
      data-testid={disabledReason ? 'segmented-control-slot' : undefined}
    >
      <DisabledReason display="block" reason={disabledReason}>
        {renderSegment}
      </DisabledReason>
    </span>
  )
}

export function SegmentedControl<T, I = string, O = I>({
  ariaLabel,
  block = false,
  defaultValue,
  disabled,
  loading,
  onChange,
  optionDisabled,
  optionDisabledReason,
  optionIcon,
  optionLabel,
  optionValue,
  options,
  orientation = 'horizontal',
  readOnly,
  size = 'md',
  value,
}: SegmentedControlProps<T, I, O>) {
  const { root, segment, slot } = styles({
    block,
    orientation,
    size,
  })

  const entries = options.map((option) => {
    const optionOutput = read<T, O>(option, optionValue) as O

    return {
      disabled: Boolean(read<T, boolean>(option, optionDisabled)),
      // A disabled or loading control blocks every segment with no reason.
      disabledReason:
        disabled || loading
          ? undefined
          : read<T, string | undefined>(option, optionDisabledReason) ||
            undefined,
      icon: read<T, ReactNode>(option, optionIcon),
      key: toKey(optionOutput),
      label: read<T, ReactNode>(option, optionLabel),
      value: optionOutput,
    }
  })

  const selected = value === undefined ? undefined : toKey(value)
  // In a Form.Field the radiogroup is named by the field's label (unless
  // ariaLabel), described by its description/error, invalid with its error.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )

  return (
    <RadioGroupPrimitive
      aria-describedby={fieldControl.describedBy}
      aria-invalid={fieldControl.invalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : fieldControl.labelledBy}
      aria-orientation={orientation}
      className={root()}
      {...axes(styles, {
        size,
      })}
      data-testid="segmented-control"
      defaultValue={
        defaultValue === undefined ? undefined : toKey(defaultValue)
      }
      disabled={disabled || loading}
      onValueChange={(next, details) => {
        const match = entries.find((entry) => entry.key === next)

        // A blocked segment refuses click, arrow keys and Space here, where
        // they all meet: the group's change, cancelled.
        if (match?.disabledReason) {
          details.cancel()
          return
        }

        if (match) {
          onChange?.(match.value)
        }
      }}
      readOnly={readOnly}
      value={selected}
    >
      {entries.map((entry) => (
        <Segment
          className={segment()}
          disabled={entry.disabled}
          disabledReason={entry.disabledReason}
          key={entry.key}
          slotClassName={slot()}
          value={entry.key}
        >
          {loading && entry.key === selected ? (
            <Loader decorative size="sm" />
          ) : (
            entry.icon
          )}
          {entry.label}
        </Segment>
      ))}
    </RadioGroupPrimitive>
  )
}
