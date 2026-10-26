import { NumberField } from '@base-ui/react/number-field'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { useFormFieldControl } from '@/components/form/form.context'
import { Minus, Plus } from '@/internal/icons'
import { axes } from '@/support/utils'

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
      'number-input-field w-full min-w-0 border-none bg-transparent',
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
  id,
  name,
  form,
  ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  required,
  readOnly,
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
  // Form.Field's id, description/error ids and error state, unless given.
  const control = useFormFieldControl({
    describedBy: ariaDescribedBy,
    id,
    invalid: ariaInvalid,
  })
  // The group of field + steppers carries role="group" only when something
  // names it: an explicit ariaLabel, else the Form.Field's label. With no
  // name it stays a plain wrapper — an unnamed group is noise to a screen
  // reader, and the field inside is what is labelled.
  const groupLabelledBy =
    ariaLabel === undefined && control.inField ? control.labelledBy : undefined
  const groupNamed = ariaLabel !== undefined || groupLabelledBy !== undefined
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
    <div
      className={root()}
      {...axes(numberInput, {
        size,
      })}
      data-testid="number-input-root"
    >
      <NumberField.Root
        className="number-input-control w-full"
        defaultValue={defaultValue ?? undefined}
        disabled={disabled}
        form={form}
        format={resolvedFormat}
        id={control.id}
        max={max}
        min={min}
        name={name}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        readOnly={readOnly}
        required={required}
        step={step}
        value={resolvedValue}
      >
        <NumberField.Group
          aria-label={ariaLabel}
          aria-labelledby={groupLabelledBy}
          className={group()}
          data-disabled={disabled ? '' : undefined}
          data-testid="number-input-group"
          role={groupNamed ? 'group' : undefined}
        >
          {/*
            The field first in the DOM, the Decrease button drawn before it by
            `order-first`. A <label> wrapping this input hands its name and its
            clicks to the first labelable element inside it — which was the
            Decrease button, so a labelled NumberInput had an unnamed field and
            a caption that focused "−". The buttons are out of the tab order,
            so moving them changes nothing for the keyboard.
          */}
          <NumberField.Input
            aria-describedby={control.describedBy}
            aria-invalid={control.invalid || undefined}
            aria-label={ariaLabel}
            className={field()}
            data-testid="number-input-field"
            placeholder={placeholder}
          />
          <NumberField.Decrement
            className={btn({
              className: 'order-first border-r',
            })}
            data-testid="number-input-decrement"
          >
            <Minus size={14} />
          </NumberField.Decrement>
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
