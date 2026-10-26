import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { useId } from 'react'
import { tv } from 'tailwind-variants'
import { useFormFieldControl } from '@/components/form/form.context'

import { ComposedLabel } from '@/components/label/label.composed'
import { axes } from '@/support/utils'

import type { SwitchProps } from './switch.types'

const switchStyles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    content: 'switch-content flex flex-col gap-0.5',
    description: 'switch-description text-muted-foreground text-sm',
    // The label is the only text that toggles the switch, so it is the only
    // text that may claim the pointer — the wrapper and the description do not.
    label: 'switch-label cursor-pointer',
    root: [
      'switch-root group/switch relative inline-flex shrink-0 cursor-pointer items-center',
      'rounded-full border border-transparent outline-none transition-all',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    ],
    thumb: [
      'switch-thumb pointer-events-none block rounded-full bg-background ring-0 transition-transform',
      'data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0',
      'dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground',
    ],
    wrapper: 'switch-wrapper flex items-center gap-3',
  },
  variants: {
    bordered: {
      true: {
        wrapper: 'rounded-lg border border-input px-3 py-2.5',
      },
    },
    hasDescription: {
      true: {
        root: 'mt-px',
        wrapper: 'items-start',
      },
    },
    size: {
      lg: {
        root: 'h-5.5 w-10',
        thumb: 'size-5',
      },
      md: {
        root: 'h-4.5 w-8',
        thumb: 'size-4',
      },
      sm: {
        root: 'h-3.5 w-6',
        thumb: 'size-3',
      },
    },
  },
})

function Switch({
  size,
  bordered,
  description,
  label,
  value,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
}: SwitchProps) {
  const hasDescription = Boolean(description)
  const {
    wrapper,
    root,
    thumb,
    content,
    description: descCls,
    label: labelCls,
  } = switchStyles({
    bordered,
    hasDescription,
    size,
  })

  const {
    content: labelText,
    disabled: labelDisabled,
    htmlFor,
    ...labelProps
  } = typeof label === 'string'
    ? {
        content: label,
      }
    : (label ?? {})

  const generatedId = useId()
  // In a Form.Field: without a label of its own the switch takes the field's
  // id, so the field's label names it; with one, both labels name it
  // (aria-labelledby: field label, then its own). Either way it takes the
  // field's description/error ids and error state.
  const fieldControl = useFormFieldControl(
    {
      id: htmlFor,
    },
    {
      labelable: !labelText,
    },
  )
  const controlId = fieldControl.id ?? generatedId
  const labelId = `${controlId}-label`
  const labelledBy =
    labelText && fieldControl.inField && fieldControl.labelledBy
      ? `${fieldControl.labelledBy} ${labelId}`
      : undefined
  const descriptionId = `${controlId}-description`
  const describedBy =
    [description ? descriptionId : undefined, fieldControl.describedBy]
      .filter(Boolean)
      .join(' ') || undefined
  const hasContent = Boolean(labelText || description)

  // The wrapper cannot be a <label>: Label renders one of its own, and a label
  // nested inside a label is inert — the click on the visible text never
  // reaches the control.
  return (
    <div className={wrapper()} data-testid="switch-wrapper">
      <SwitchPrimitive.Root
        aria-describedby={describedBy}
        aria-invalid={fieldControl.invalid}
        aria-labelledby={labelledBy}
        checked={checked}
        className={root()}
        {...axes(switchStyles, {
          size,
        })}
        data-testid="switch-root"
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={controlId}
        onCheckedChange={
          onCheckedChange
            ? (nextChecked: boolean) => onCheckedChange(nextChecked)
            : undefined
        }
        value={value}
      >
        <SwitchPrimitive.Thumb className={thumb()} data-testid="switch-thumb" />
      </SwitchPrimitive.Root>
      {hasContent && (
        <div className={content()} data-testid="switch-content">
          {labelText && (
            <ComposedLabel
              {...labelProps}
              className={labelCls()}
              disabled={disabled ?? labelDisabled}
              htmlFor={controlId}
              id={labelId}
            >
              {labelText}
            </ComposedLabel>
          )}
          {description && (
            <span
              className={descCls()}
              data-testid="switch-description"
              id={descriptionId}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { Switch }
