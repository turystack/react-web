import type { SlotProps } from 'input-otp'
import { OTPInput as OTPInputPrimitive } from 'input-otp'
import { Fragment, useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { MinusIcon } from '@/internal/icons'

import type { OTPInputProps } from './otp-input.types'

const otpInput = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    caret:
      'otp-input-caret h-4 w-px animate-caret-blink bg-foreground duration-1000',
    group: [
      'otp-input-group flex items-center rounded-lg',
      'has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20',
      'dark:has-aria-invalid:ring-destructive/40',
    ],
    root: 'otp-input-root flex items-center has-disabled:opacity-50',
    separator:
      "otp-input-separator flex items-center [&_svg:not([class*='size-'])]:size-4",
    slot: [
      'otp-input-slot relative flex items-center justify-center border-input border-y border-r outline-none transition-all',
      'first:rounded-l-lg first:border-l last:rounded-r-lg',
      'aria-invalid:border-destructive',
      'data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50',
      'data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20',
      'dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40',
    ],
  },
  variants: {
    size: {
      lg: {
        slot: 'size-11 text-base',
      },
      md: {
        slot: 'size-10 text-sm',
      },
      sm: {
        slot: 'size-9 text-sm',
      },
    },
  },
})

function Slot({
  slotData,
  slotClass,
  caretClass,
}: {
  slotData: SlotProps
  slotClass: string
  caretClass: string
}) {
  const { char, hasFakeCaret, isActive } = slotData

  return (
    <div
      className={slotClass}
      data-active={isActive}
      data-testid="otp-input-slot"
    >
      {char}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          data-testid="otp-input-caret"
        >
          <div className={caretClass} />
        </div>
      )}
    </div>
  )
}

function OTPInput({
  pattern = [6],
  size,
  value,
  defaultValue,
  onChange,
}: OTPInputProps) {
  const maxLength = useMemo(
    () => pattern.reduce((sum, n) => sum + n, 0),
    [pattern],
  )

  const { root, group, slot, separator, caret } = otpInput({
    size,
  })

  const handleChange = (val: string) => {
    onChange?.(val === '' ? null : val)
  }

  const controlledProps =
    value !== undefined
      ? {
          value: value ?? '',
        }
      : {
          defaultValue: defaultValue ?? undefined,
        }

  return (
    <OTPInputPrimitive
      containerClassName={root()}
      data-testid="otp-input-root"
      maxLength={maxLength}
      onChange={handleChange}
      spellCheck={false}
      {...controlledProps}
      render={(renderProps) => {
        let slotIndex = 0
        return pattern.map((count, groupIndex) => {
          const startIndex = slotIndex
          slotIndex += count

          return (
            <Fragment key={groupIndex}>
              <div className={group()} data-testid="otp-input-group">
                {Array.from(
                  {
                    length: count,
                  },
                  (_, i) => (
                    <Slot
                      caretClass={caret()}
                      key={startIndex + i}
                      slotClass={slot()}
                      slotData={renderProps.slots[startIndex + i]}
                    />
                  ),
                )}
              </div>
              {groupIndex < pattern.length - 1 && (
                <div
                  aria-hidden="true"
                  className={separator()}
                  data-testid="otp-input-separator"
                >
                  <MinusIcon />
                </div>
              )}
            </Fragment>
          )
        })
      }}
    />
  )
}

export { OTPInput }
