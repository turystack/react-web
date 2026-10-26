import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { DisabledReason } from '@/components/tooltip/tooltip.composed'
import { axes } from '@/support/utils'

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
    // A disabledReason blocks without the attribute, so it stays focusable.
    'data-blocked:cursor-not-allowed data-blocked:opacity-50 data-blocked:hover:bg-transparent',
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
  inGroup?: boolean
  size?: ToggleSize
  variant?: ToggleVariant
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({})

function ToggleRoot({
  ariaLabel,
  children,
  defaultPressed,
  disabled,
  disabledReason,
  onChange,
  pressed,
  size,
  value,
  variant,
}: PropsWithChildren<ToggleProps>) {
  const group = useContext(ToggleGroupContext)

  const [focused, setFocused] = useState(false)
  const blocked = Boolean(disabledReason)
  // A group's arrow keys skip anything aria-disabled, and Base UI's
  // ToggleGroup takes no disabledIndices to say otherwise. Inside a group the
  // blocked toggle says aria-disabled only while it holds focus, so the
  // arrows still land on it and a screen reader hears the state there.
  const ariaDisabled = blocked && (!group.inGroup || focused)

  // Base UI's Toggle drops a disabled toggle out of the tab order and the
  // group's roving focus, so a reason never uses `disabled`: the toggle
  // stays focusable and every press is cancelled — which also vetoes the
  // group's value change, since they share details. With both set, the
  // reason wins, as on Button.
  return (
    <DisabledReason stable reason={disabledReason}>
      {(a11y) => (
        <TogglePrimitive
          aria-label={ariaLabel}
          className={styles({
            size: size ?? group.size,
            variant: variant ?? group.variant,
          })}
          {...axes(styles, {
            size: size ?? group.size,
            variant: variant ?? group.variant,
          })}
          data-testid="toggle"
          defaultPressed={defaultPressed}
          disabled={disabled && !blocked}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onPressedChange={(next, details) => {
            if (blocked) {
              details.cancel()
              return
            }

            onChange?.(next)
          }}
          pressed={pressed}
          value={value}
          {...(blocked
            ? {
                'aria-disabled': ariaDisabled || undefined,
                'data-blocked': '',
              }
            : {})}
          {...a11y}
        >
          {children}
        </TogglePrimitive>
      )}
    </DisabledReason>
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
        inGroup: true,
        size,
        variant,
      }}
    >
      <ToggleGroupPrimitive
        aria-label={ariaLabel}
        className={groupStyles().group()}
        // The group's default is the toggle's: a bare group publishes the
        // size and variant its toggles resolve to.
        {...axes(styles, {
          size,
          variant,
        })}
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
