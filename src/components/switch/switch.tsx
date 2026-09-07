import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { useId } from 'react'
import { tv } from 'tailwind-variants'

import { Label } from '@/components/label'

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
        root: 'h-[22px] w-10',
        thumb: 'size-5',
      },
      md: {
        root: 'h-[18px] w-8',
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
  const controlId = htmlFor ?? generatedId
  const descriptionId = `${controlId}-description`
  const hasContent = Boolean(labelText || description)

  // The wrapper cannot be a <label>: Label renders one of its own, and a label
  // nested inside a label is inert — the click on the visible text never
  // reaches the control.
  return (
    <div className={wrapper()} data-testid="switch-wrapper">
      <SwitchPrimitive.Root
        aria-describedby={description ? descriptionId : undefined}
        checked={checked}
        className={root()}
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
            <Label
              {...labelProps}
              className={labelCls({
                className: labelProps.className,
              })}
              disabled={disabled ?? labelDisabled}
              htmlFor={controlId}
            >
              {labelText}
            </Label>
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
