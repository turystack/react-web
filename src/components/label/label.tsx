import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { Tooltip } from '@/components/tooltip'
import { Info } from '@/internal/icons'
import { cn } from '@/support/utils'

import type { LabelProps } from './label.types'

const label = tv({
  slots: {
    hint: 'label-hint font-normal text-muted-foreground',
    indicator: 'label-indicator text-destructive',
    root: 'label-root flex select-none items-center gap-1.5 font-medium text-sm leading-none',
    tooltipIcon: 'label-tooltip-icon text-muted-foreground',
  },
  variants: {
    disabled: {
      true: {
        root: 'pointer-events-none opacity-50',
      },
    },
  },
})

function Label({
  children,
  htmlFor,
  required,
  optional,
  disabled,
  tooltip,
  className,
}: PropsWithChildren<LabelProps>) {
  const { root, indicator, hint, tooltipIcon } = label({
    disabled,
  })

  return (
    <label
      className={cn(root(), className)}
      data-testid="label-root"
      htmlFor={htmlFor}
    >
      {children}
      {required && (
        <span className={indicator()} data-testid="label-indicator">
          *
        </span>
      )}
      {optional && (
        <span className={hint()} data-testid="label-hint">
          (opcional)
        </span>
      )}
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info
            className={tooltipIcon()}
            data-testid="label-tooltip-icon"
            size={14}
          />
        </Tooltip>
      )}
    </label>
  )
}

export { Label }
