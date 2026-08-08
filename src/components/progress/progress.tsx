import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { tv } from 'tailwind-variants'

import { Label } from '@/components/label'

import type { ProgressProps } from './progress.types'

const progress = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    indicator:
      'progress-indicator h-full bg-primary transition-all duration-300',
    label: 'progress-label',
    root: 'progress-root flex w-full flex-col gap-2',
    track:
      'progress-track relative w-full overflow-hidden rounded-full bg-muted',
  },
  variants: {
    size: {
      lg: {
        track: 'h-6',
      },
      md: {
        track: 'h-4',
      },
      sm: {
        track: 'h-2',
      },
    },
  },
})

function Progress({ value, defaultValue, size, label }: ProgressProps) {
  const {
    root,
    label: labelCls,
    track,
    indicator,
  } = progress({
    size,
  })

  const labelText = typeof label === 'string' ? label : label?.content
  const labelExtras = typeof label === 'object' && label !== null ? label : {}

  return (
    <ProgressPrimitive.Root
      className={root()}
      data-testid="progress-root"
      value={value ?? defaultValue ?? null}
    >
      {labelText && (
        <div className={labelCls()} data-testid="progress-label">
          <Label
            disabled={
              (
                labelExtras as {
                  disabled?: boolean
                }
              ).disabled
            }
            optional={
              (
                labelExtras as {
                  optional?: boolean
                }
              ).optional
            }
            required={
              (
                labelExtras as {
                  required?: boolean
                }
              ).required
            }
            tooltip={
              (
                labelExtras as {
                  tooltip?: React.ReactNode
                }
              ).tooltip
            }
          >
            {labelText}
          </Label>
        </div>
      )}
      <ProgressPrimitive.Track className={track()} data-testid="progress-track">
        <ProgressPrimitive.Indicator
          className={indicator()}
          data-testid="progress-indicator"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
