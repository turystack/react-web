import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { useId, useState } from 'react'
import { tv } from 'tailwind-variants'
import {
  FormFieldReset,
  useFormFieldControl,
} from '@/components/form/form.context'
import { DisabledReason } from '@/components/tooltip/tooltip.composed'
import { Check, Minus } from '@/internal/icons'
import { axes } from '@/support/utils'

import type { CheckboxGroupProps, CheckboxProps } from './checkbox.types'

const checkbox = tv({
  /**
   * The error message lines up with the label text: the box, the gap and — in
   * a bordered checkbox — the border's own padding sit before it.
   */
  compoundVariants: [
    { bordered: true, class: { error: 'pl-8' }, size: 'sm' },
    { bordered: true, class: { error: 'pl-9' }, size: 'md' },
    { bordered: true, class: { error: 'pl-10' }, size: 'lg' },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'vertical',
  },
  slots: {
    box: [
      'checkbox-box relative flex shrink-0 items-center justify-center',
      'rounded-[calc(var(--radius)*0.4)] border border-input outline-none transition-colors',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-blocked:cursor-not-allowed data-blocked:opacity-50',
      'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
      'data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground',
      'dark:bg-input/30 dark:data-checked:bg-primary dark:data-indeterminate:bg-primary',
      'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
      'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    ],
    error: 'checkbox-error text-destructive text-xs',
    field: 'checkbox-field flex flex-col gap-1.5',
    // A <fieldset> keeps a min-content floor by default, which would stop a
    // horizontal group from wrapping; min-w-0 lets it shrink like a div.
    group: 'checkbox-group m-0 flex min-w-0 border-0 p-0',
    // The group's message starts at the group's edge, not the label's: it
    // speaks for every item, so it aligns with none of them.
    groupError: 'checkbox-group-error text-destructive text-xs',
    indicator: 'checkbox-indicator grid place-content-center text-current',
    root: 'checkbox-root flex cursor-pointer items-center gap-2',
  },
  variants: {
    bordered: {
      true: {
        field: 'w-full',
        root: 'w-full select-none rounded-md border p-3 hover:bg-muted/50 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[[data-blocked]]:cursor-not-allowed has-[[data-blocked]]:opacity-50',
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
        error: 'pl-7',
        indicator: '[&>svg]:size-4',
      },
      md: {
        box: 'size-4',
        error: 'pl-6',
        indicator: '[&>svg]:size-3.5',
      },
      sm: {
        box: 'size-3',
        error: 'pl-5',
        indicator: '[&>svg]:size-2.5',
      },
    },
    variant: {
      horizontal: {
        group: 'flex-row flex-wrap gap-4',
      },
      vertical: {
        group: 'flex-col gap-2',
      },
    },
  },
})

function CheckboxRoot({
  ariaLabel,
  indeterminate,
  label,
  description,
  size,
  checked,
  defaultChecked,
  disabled,
  disabledReason,
  bordered,
  error,
  errorMessage,
  value,
  onChange,
}: CheckboxProps) {
  const hasDescription = Boolean(description)
  const hasErrorMessage =
    errorMessage !== undefined &&
    errorMessage !== null &&
    errorMessage !== false
  // In a Form.Field: named by its label when the box has no label of its
  // own, described by its description/error, invalid with its error.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )
  const invalid = Boolean(error) || hasErrorMessage || !!fieldControl.invalid
  const errorId = `${useId()}-error`
  const blocked = Boolean(disabledReason)
  // The reason is read first: it is why the box cannot be changed.
  const describedBy = (reasonId?: string) =>
    [reasonId, hasErrorMessage ? errorId : undefined, fieldControl.describedBy]
      .filter(Boolean)
      .join(' ') || undefined
  const {
    root,
    box,
    error: errorSlot,
    field,
    indicator,
  } = checkbox({
    bordered,
    hasDescription,
    size,
  })

  // Base UI's Checkbox drops a disabled box out of the tab order and offers
  // no focusableWhenDisabled, so a reason never uses `disabled`: the box
  // stays focusable, says aria-disabled, and every change is cancelled —
  // click, Space, or a click on its label. With both set, the reason wins.
  const control = (
    <DisabledReason
      stable
      display={bordered ? 'block' : 'inline'}
      reason={disabledReason}
    >
      {(a11y) => (
        <label
          className={root()}
          data-testid="checkbox-root"
          {...axes(checkbox, {
            size,
          })}
        >
          <CheckboxPrimitive.Root
            {...a11y}
            aria-describedby={describedBy(a11y['aria-describedby'])}
            aria-invalid={invalid || undefined}
            aria-label={ariaLabel}
            aria-labelledby={
              ariaLabel || label ? undefined : fieldControl.labelledBy
            }
            checked={checked}
            className={box()}
            data-slot="checkbox"
            data-testid="checkbox-box"
            defaultChecked={defaultChecked}
            disabled={disabled && !blocked}
            indeterminate={indeterminate}
            onCheckedChange={(val, details) => {
              if (blocked) {
                details.cancel()
                return
              }

              onChange?.(val === true)
            }}
            value={value}
            // Only when blocked: a disabled box gets aria-disabled from Base UI.
            {...(blocked
              ? {
                  'aria-disabled': true,
                  'data-blocked': '',
                }
              : {})}
          >
            <CheckboxPrimitive.Indicator
              className={indicator()}
              data-slot="checkbox-indicator"
              data-testid="checkbox-indicator"
            >
              {indeterminate ? <Minus /> : <Check />}
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          {(label || description) && (
            <div className="checkbox-content flex flex-col gap-0.5">
              {label && (
                <span className="checkbox-label cursor-pointer font-medium text-sm leading-none">
                  {label}
                </span>
              )}
              {description && (
                <span className="checkbox-description text-muted-foreground text-xs">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
      )}
    </DisabledReason>
  )

  if (!hasErrorMessage) {
    return control
  }

  // The message sits outside the <label>: inside it, it would join the
  // checkbox's name and be read twice — once as the name, once as the
  // description aria-describedby points at.
  return (
    <div className={field()} data-testid="checkbox-field">
      {control}
      <span className={errorSlot()} data-testid="checkbox-error" id={errorId}>
        {errorMessage}
      </span>
    </div>
  )
}

function CheckboxGroup({
  ariaLabel,
  items,
  value: controlledValue,
  defaultValue = [],
  size,
  disabled,
  bordered,
  variant,
  error,
  errorMessage,
  onChange,
}: CheckboxGroupProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
  const isControlled = controlledValue !== undefined
  const selected = isControlled ? controlledValue : internalValue
  const hasErrorMessage =
    errorMessage !== undefined &&
    errorMessage !== null &&
    errorMessage !== false
  // In a Form.Field: named by its label (unless ariaLabel), described by
  // its description/error, invalid with its error. The boxes below are not
  // the field's control, so the wiring stops at the group.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )
  const invalid = Boolean(error) || hasErrorMessage || !!fieldControl.invalid
  const errorId = `${useId()}-error`
  const describedBy =
    [hasErrorMessage ? errorId : undefined, fieldControl.describedBy]
      .filter(Boolean)
      .join(' ') || undefined
  const { field, group, groupError } = checkbox({
    bordered,
    variant,
  })

  const handleChange = (itemValue: string, checked: boolean) => {
    const next = checked
      ? [...selected, itemValue]
      : selected.filter((v) => v !== itemValue)
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  // The group carries the verdict and the reason, so the message is read once
  // on entering the group; every box is still marked invalid, so each one says
  // so when it takes focus and shows the destructive border.
  const control = (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : fieldControl.labelledBy}
      className={group()}
      data-testid="checkbox-group"
      {...axes(checkbox, {
        size,
        variant,
      })}
    >
      <FormFieldReset>
        {items.map((item) => (
          <CheckboxRoot
            bordered={bordered}
            checked={selected.includes(item.value)}
            description={item.description}
            disabled={disabled || item.disabled}
            disabledReason={disabled ? undefined : item.disabledReason}
            error={invalid}
            key={item.value}
            label={item.label}
            onChange={(checked) => handleChange(item.value, checked)}
            size={size}
            value={item.value}
          />
        ))}
      </FormFieldReset>
    </fieldset>
  )

  if (!hasErrorMessage) {
    return control
  }

  return (
    <div className={field()} data-testid="checkbox-group-field">
      {control}
      <span
        className={groupError()}
        data-testid="checkbox-group-error"
        id={errorId}
      >
        {errorMessage}
      </span>
    </div>
  )
}

const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
})

export { Checkbox }
