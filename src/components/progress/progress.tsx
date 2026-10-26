import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Label } from '@/components/label'
import { axes } from '@/support/utils'

import type { ProgressProps } from './progress.types'

/**
 * The indicator declares `w-0` because the headless primitive writes an inline
 * width only once a percentage is known: with no baseline an indeterminate bar
 * stretches to the track and reads as complete.
 */
const progressStyles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    indicator: [
      'progress-indicator h-full w-0 bg-primary transition-all duration-300',
      'data-indeterminate:w-1/3 data-indeterminate:animate-pulse',
    ],
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

function Progress({
  ariaLabel,
  value,
  defaultValue,
  size,
  label,
}: ProgressProps) {
  const {
    root,
    label: labelCls,
    track,
    indicator,
  } = progressStyles({
    size,
  })

  const [uncontrolledValue] = useState<number | null>(defaultValue ?? null)
  const labelId = useId()
  const { content: labelText, ...labelProps } =
    typeof label === 'string'
      ? {
          content: label,
        }
      : (label ?? {})
  // The bar needs a name of its own: the visible label sits beside it as a
  // plain <label> with nothing to point at. `ariaLabel` wins; otherwise the
  // visible label names it by reference, so the two can never disagree.
  const naming = ariaLabel
    ? {
        'aria-label': ariaLabel,
      }
    : labelText
      ? {
          'aria-labelledby': labelId,
        }
      : {}

  return (
    <ProgressPrimitive.Root
      {...naming}
      className={root()}
      {...axes(progressStyles, {
        size,
      })}
      data-testid="progress-root"
      value={value ?? uncontrolledValue}
    >
      {labelText && (
        <div className={labelCls()} data-testid="progress-label" id={labelId}>
          <Label {...labelProps}>{labelText}</Label>
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

export { Progress, progressStyles }
