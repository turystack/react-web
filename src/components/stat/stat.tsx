import { tv } from 'tailwind-variants'

import { Skeleton } from '@/components/skeleton'

import type { StatProps } from './stat.types'

export const styles = tv({
  defaultVariants: {
    align: 'start',
  },
  slots: {
    figure: 'stat-figure flex items-baseline gap-2 font-semibold text-2xl',
    hint: 'stat-hint text-muted-foreground text-xs',
    label: 'stat-label flex items-center gap-1.5 text-muted-foreground text-sm',
    root: 'stat flex flex-col gap-1',
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

  return (
    <div className={root()} data-testid="stat">
      <span className={labelSlot()} data-testid="stat-label">
        {icon}
        {label}
      </span>
      <span className={figure()} data-testid="stat-value">
        {loading ? <Skeleton height="sm" width="sm" /> : value}
        {trend && !loading ? (
          <span className={trendSlot()} data-testid="stat-trend">
            {trend}
          </span>
        ) : null}
      </span>
      {hint && !loading ? (
        <span className={hintSlot()} data-testid="stat-hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
