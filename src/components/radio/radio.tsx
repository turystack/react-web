import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { useId, useState } from 'react'
import { tv } from 'tailwind-variants'
import { useFormFieldControl } from '@/components/form/form.context'
import {
  DisabledReason,
  type DisabledReasonA11y,
  describedBy,
} from '@/components/tooltip/tooltip.composed'
import { axes } from '@/support/utils'

import type {
  RadioGroupProps,
  RadioItem as RadioItemData,
  RadioProps,
} from './radio.types'

const radio = tv({
  defaultVariants: {
    variant: 'vertical',
  },
  slots: {
    control: [
      'radio-control relative flex aspect-square size-4 shrink-0 rounded-full',
      'border border-input outline-none transition-colors',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      'data-blocked:cursor-not-allowed data-blocked:opacity-50',
      'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
      'dark:bg-input/30 dark:data-checked:bg-primary',
    ],
    group: 'radio-group flex',
    /**
     * The card is the radio itself (Base UI's Radio.Root rendered as a div),
     * so the ring, the checked border and the disabled look all key off the
     * root's own state attributes.
     */
    card: [
      'radio-card group/radio-card flex w-full cursor-pointer select-none items-start gap-3',
      'rounded-lg border border-input p-4 text-left outline-none transition-colors',
      'hover:bg-muted/50',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-checked:border-primary data-checked:bg-primary/5 data-checked:ring-1 data-checked:ring-primary',
      'data-checked:focus-visible:ring-3 data-checked:focus-visible:ring-ring/50',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent',
      'data-blocked:cursor-not-allowed data-blocked:opacity-50 data-blocked:hover:bg-transparent',
    ],
    /**
     * Holds a blocked card's reason wrapper in the card's place in the row, so
     * the card keeps its share of a horizontal group.
     */
    cardSlot: 'radio-card-slot flex',
    cardBody: 'radio-card-body flex min-w-0 flex-1 flex-col gap-1',
    cardControl: [
      'radio-card-control relative mt-0.5 flex aspect-square size-4 shrink-0 rounded-full',
      'border border-input transition-colors dark:bg-input/30',
      'group-data-checked/radio-card:border-primary group-data-checked/radio-card:bg-primary',
    ],
    cardHeading: 'radio-card-heading flex flex-wrap items-center gap-2',
    cardLabel: 'radio-card-label font-medium text-sm leading-tight',
    cardDescription: 'radio-card-description text-muted-foreground text-sm',
    cardBadge: 'radio-card-badge inline-flex',
    cardRight: 'radio-card-right ml-auto shrink-0 text-right text-sm',
    indicator: 'radio-indicator flex size-4 items-center justify-center',
    root: 'radio-root flex cursor-pointer items-center gap-2',
  },
  variants: {
    bordered: {
      true: {
        root: 'w-full select-none rounded-md border p-3 hover:bg-muted/50 has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50 has-[[data-blocked]]:cursor-not-allowed has-[[data-blocked]]:opacity-50',
      },
    },
    hasDescription: {
      true: {
        control: 'mt-px',
        root: 'items-start',
      },
    },
    /**
     * Side by side, cards share the row evenly and wrap once each would drop
     * under 10rem.
     */
    spread: {
      false: {
        cardSlot: 'w-full',
      },
      true: {
        card: 'min-w-40 flex-1 basis-0',
        cardSlot: 'min-w-40 flex-1 basis-0',
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

/**
 * A blocked radio stays focusable and refuses selection; the group cancels
 * the change. Its aria-disabled is the subtle part: Base UI's radio group
 * skips aria-disabled radios on the arrow keys and takes no disabledIndices,
 * so in a group the radio says it only while it holds focus — the arrows
 * still land on it, and the state is heard there. A standalone radio says it
 * always.
 */
function useBlocked(disabledReason: string | undefined, grouped: boolean) {
  const [focused, setFocused] = useState(false)
  const blocked = Boolean(disabledReason)

  return {
    blocked,
    props: blocked
      ? {
          'aria-disabled': !grouped || focused ? (true as const) : undefined,
          'data-blocked': '',
          onBlur: () => setFocused(false),
          onFocus: () => setFocused(true),
        }
      : {},
  }
}

function RadioItem({
  label,
  description,
  disabled,
  disabledReason,
  bordered,
  grouped = false,
  value,
}: RadioProps & { grouped?: boolean }) {
  const { blocked, props: blockedProps } = useBlocked(disabledReason, grouped)
  const hasDescription = Boolean(description)
  const { root, control, indicator } = radio({
    bordered,
    hasDescription,
  })

  return (
    <DisabledReason
      display={bordered ? 'block' : 'inline'}
      reason={disabledReason}
    >
      {(a11y) => (
        <label className={root()} data-testid="radio-root">
          <RadioPrimitive.Root
            className={control()}
            data-slot="radio"
            data-testid="radio-control"
            disabled={disabled && !blocked}
            value={value ?? ''}
            {...blockedProps}
            {...a11y}
          >
            <RadioPrimitive.Indicator
              className={indicator()}
              data-slot="radio-indicator"
              data-testid="radio-indicator"
            >
              <span className="radio-dot absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
            </RadioPrimitive.Indicator>
          </RadioPrimitive.Root>
          {(label || description) && (
            <div className="radio-content flex flex-col gap-0.5">
              {label && (
                <span className="radio-label cursor-pointer font-medium text-sm leading-none">
                  {label}
                </span>
              )}
              {description && (
                <span className="radio-description text-muted-foreground text-xs">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
      )}
    </DisabledReason>
  )
}

function RadioCard({
  badge,
  description,
  disabled,
  disabledReason,
  label,
  rightSection,
  spread,
  value,
}: RadioItemData & { spread: boolean }) {
  const { blocked, props: blockedProps } = useBlocked(disabledReason, true)
  const id = useId()
  const labelId = `${id}-label`
  const detailIds = [
    badge ? `${id}-badge` : undefined,
    description ? `${id}-description` : undefined,
    rightSection ? `${id}-right` : undefined,
  ].filter(Boolean)
  const {
    card,
    cardBadge,
    cardBody,
    cardControl,
    cardDescription,
    cardHeading,
    cardLabel,
    cardRight,
    cardSlot,
    indicator,
  } = radio({
    spread,
  })

  // Named by the label alone and described by the rest: the details are read
  // after "Yearly, radio, checked", not folded into one long name. A reason
  // comes first among them: it is why the card cannot be chosen.
  const renderCard = (a11y: DisabledReasonA11y) => (
    <RadioPrimitive.Root
      {...a11y}
      aria-describedby={describedBy(a11y['aria-describedby'], ...detailIds)}
      aria-labelledby={labelId}
      className={card()}
      data-slot="radio-card"
      data-testid="radio-card"
      disabled={disabled && !blocked}
      render={<div />}
      value={value}
      {...blockedProps}
    >
      <span
        aria-hidden
        className={cardControl()}
        data-testid="radio-card-control"
      >
        <RadioPrimitive.Indicator
          className={indicator()}
          data-slot="radio-indicator"
          data-testid="radio-indicator"
        >
          <span className="radio-dot absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
        </RadioPrimitive.Indicator>
      </span>
      <div className={cardBody()}>
        <div className={cardHeading()}>
          <span className={cardLabel()} id={labelId}>
            {label}
          </span>
          {badge ? (
            <span className={cardBadge()} id={`${id}-badge`}>
              {badge}
            </span>
          ) : null}
        </div>
        {description ? (
          <div className={cardDescription()} id={`${id}-description`}>
            {description}
          </div>
        ) : null}
      </div>
      {rightSection ? (
        <div className={cardRight()} id={`${id}-right`}>
          {rightSection}
        </div>
      ) : null}
    </RadioPrimitive.Root>
  )

  // The same two nodes with or without a reason, so a reason that arrives
  // or leaves on the focused card only remounts the card, and the reason
  // hands focus back to it. With no reason the slot takes no box at all.
  return (
    <span
      className={disabledReason ? cardSlot() : 'contents'}
      data-testid={disabledReason ? 'radio-card-slot' : undefined}
    >
      <DisabledReason display="block" reason={disabledReason}>
        {renderCard}
      </DisabledReason>
    </span>
  )
}

function RadioRoot({
  checked,
  defaultChecked,
  disabledReason,
  onChange,
  value,
  ...props
}: RadioProps) {
  const innerValue = value ?? 'radio'
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  )
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  return (
    <RadioGroupPrimitive
      onValueChange={(next, details) => {
        if (disabledReason) {
          details.cancel()
          return
        }

        const nextChecked = next === innerValue
        if (!isControlled) {
          setInternalChecked(nextChecked)
        }
        onChange?.(nextChecked)
      }}
      value={isChecked ? innerValue : ''}
    >
      <RadioItem
        disabledReason={disabledReason}
        value={innerValue}
        {...props}
      />
    </RadioGroupPrimitive>
  )
}

function RadioGroup({
  ariaLabel,
  items,
  value,
  defaultValue,
  disabled,
  bordered,
  card,
  variant,
  onChange,
}: RadioGroupProps) {
  const spread = variant === 'horizontal'
  // In a Form.Field: named by its label (unless ariaLabel), described by its
  // description/error, invalid with its error.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )

  const { group } = radio({
    variant,
  })
  // A blocked option refuses every way in — click, label, arrow keys, Space
  // — at the one place they all meet: the group's change, cancelled.
  const blockedValues = new Set(
    items.filter((item) => item.disabledReason).map((item) => item.value),
  )

  return (
    <RadioGroupPrimitive
      aria-describedby={fieldControl.describedBy}
      aria-invalid={fieldControl.invalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : fieldControl.labelledBy}
      className={group()}
      {...axes(radio, {
        variant,
      })}
      data-testid="radio-group"
      defaultValue={defaultValue}
      disabled={disabled}
      onValueChange={(val, details) => {
        if (blockedValues.has(val as string)) {
          details.cancel()
          return
        }

        onChange?.(val as string)
      }}
      value={value}
    >
      {items.map((item) =>
        card ? (
          <RadioCard
            {...item}
            disabledReason={disabled ? undefined : item.disabledReason}
            key={item.value}
            spread={spread}
          />
        ) : (
          <RadioItem
            bordered={bordered}
            description={item.description}
            disabled={item.disabled}
            disabledReason={disabled ? undefined : item.disabledReason}
            grouped
            key={item.value}
            label={item.label}
            value={item.value}
          />
        ),
      )}
    </RadioGroupPrimitive>
  )
}

const Radio = Object.assign(RadioRoot, {
  Group: RadioGroup,
})

export { Radio }
