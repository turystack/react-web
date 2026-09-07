import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { tv } from 'tailwind-variants'

import type {
  ToggleGroupProps,
  ToggleProps,
  ToggleSize,
  ToggleVariant,
} from './toggle.types'

export const styles = tv({
  base: [
    'toggle inline-flex cursor-pointer items-center justify-center gap-2 rounded-md',
    'font-medium text-sm outline-none transition-colors',
    'hover:bg-muted hover:text-foreground',
    'focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-pressed:bg-accent data-pressed:text-accent-foreground',
    '[&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  variants: {
    size: {
      lg: 'h-11 min-w-11 px-3',
      md: 'h-10 min-w-10 px-2.5',
      sm: 'h-9 min-w-9 px-2',
    },
    variant: {
      default: 'bg-transparent',
      outline: 'border border-input bg-transparent',
    },
  },
})

const groupStyles = tv({
  slots: {
    group: 'toggle-group inline-flex items-center gap-1',
  },
})

type ToggleGroupContextValue = {
  size?: ToggleSize
  variant?: ToggleVariant
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({})

function ToggleRoot({
  ariaLabel,
  children,
  defaultPressed,
  disabled,
  onChange,
  pressed,
  size,
  value,
  variant,
}: PropsWithChildren<ToggleProps>) {
  const group = useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      aria-label={ariaLabel}
      className={styles({
        size: size ?? group.size,
        variant: variant ?? group.variant,
      })}
      data-testid="toggle"
      defaultPressed={defaultPressed}
      disabled={disabled}
      onPressedChange={onChange ? (next: boolean) => onChange(next) : undefined}
      pressed={pressed}
      value={value}
    >
      {children}
    </TogglePrimitive>
  )
}

function ToggleGroup({
  ariaLabel,
  children,
  defaultValue,
  disabled,
  mode = 'multiple',
  onChange,
  size,
  value,
  variant,
}: PropsWithChildren<ToggleGroupProps>) {
  return (
    <ToggleGroupContext
      value={{
        size,
        variant,
      }}
    >
      <ToggleGroupPrimitive
        aria-label={ariaLabel}
        className={groupStyles().group()}
        data-testid="toggle-group"
        defaultValue={defaultValue}
        disabled={disabled}
        multiple={mode === 'multiple'}
        onValueChange={
          onChange ? (next: string[]) => onChange(next) : undefined
        }
        value={value}
      >
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupContext>
  )
}

const Toggle = Object.assign(ToggleRoot, {
  Group: ToggleGroup,
})

export { Toggle }
