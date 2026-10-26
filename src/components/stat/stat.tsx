import { tv } from 'tailwind-variants'

import { Skeleton } from '@/components/skeleton'

import type { StatProps } from './stat.types'

export const styles = tv({
  defaultVariants: {
    align: 'start',
  },
  slots: {
    // `min-w-0` on the figure and the root lets a narrow tile shrink them
    // instead of pushing the delta past the edge; `flex-wrap` then sends the
    // trend to the next line when the value leaves it no room.
    figure:
      'stat-figure flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 font-semibold text-2xl',
    hint: 'stat-hint text-muted-foreground text-xs',
    label: 'stat-label flex items-center gap-1.5 text-muted-foreground text-sm',
    root: 'stat flex min-w-0 flex-col gap-1',
    trend: 'stat-trend font-medium text-sm',
  },
  variants: {
    align: {
      center: {
        figure: 'justify-center',
        label: 'justify-center',
        root: 'items-center text-center',
      },
      start: {},
    },
  },
})

export function Stat({
  align = 'start',
  hint,
  icon,
  label,
  loading,
  trend,
  trendPlacement = 'inline',
  value,
}: StatProps) {
  const {
    figure,
    hint: hintSlot,
    label: labelSlot,
    root,
    trend: trendSlot,
  } = styles({
    align,
  })
  const trendNode =
    trend && !loading ? (
      <span
        className={trendSlot()}
        data-placement={trendPlacement}
        data-testid="stat-trend"
      >
        {trend}
      </span>
    ) : null

  return (
    <div className={root()} data-testid="stat">
      <span className={labelSlot()} data-testid="stat-label">
        {icon}
        {label}
      </span>
      <span className={figure()} data-testid="stat-value">
        {loading ? <Skeleton height="sm" width="sm" /> : value}
        {trendPlacement === 'inline' ? trendNode : null}
      </span>
      {trendPlacement === 'below' ? trendNode : null}
      {hint && !loading ? (
        <span className={hintSlot()} data-testid="stat-hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
