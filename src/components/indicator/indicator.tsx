import { cloneElement, isValidElement, type ReactElement, useId } from 'react'
import { tv } from 'tailwind-variants'
import { axes } from '@/support/utils'

import type { IndicatorProps } from './indicator.types'

// The number mirrors Badge's `sm` size (h-4, 0.625rem type, rounded-full) so an
// indicator and a badge beside it read as the same family. It is not the Badge
// component: an overlay needs a solid fill on any surface, a ring to part it
// from the anchor, and a min-width so one digit stays a circle.
export const styles = tv({
  defaultVariants: {
    dot: false,
    position: 'top-right',
    variant: 'default',
  },
  slots: {
    badge: [
      'indicator-badge pointer-events-none absolute z-1 inline-flex items-center justify-center',
      'rounded-full font-medium tabular-nums ring-2 ring-background',
    ],
    label: 'indicator-label sr-only',
    root: 'indicator-root relative inline-flex w-fit shrink-0',
  },
  variants: {
    dot: {
      false: {
        badge: 'h-4 min-w-4 px-1 text-2xs leading-none',
      },
      true: {
        badge: 'size-2.5',
      },
    },
    position: {
      'bottom-left': {
        badge: 'bottom-0 left-0 -translate-x-1/3 translate-y-1/3',
      },
      'bottom-right': {
        badge: 'right-0 bottom-0 translate-x-1/3 translate-y-1/3',
      },
      'top-left': {
        badge: 'top-0 left-0 -translate-x-1/3 -translate-y-1/3',
      },
      'top-right': {
        badge: 'top-0 right-0 translate-x-1/3 -translate-y-1/3',
      },
    },
    variant: {
      default: {
        badge: 'bg-primary text-primary-foreground',
      },
      destructive: {
        badge: 'bg-destructive text-destructive-foreground',
      },
    },
  },
})

const DEFAULT_MAX = 99

function isVisible(
  count: number | undefined,
  dot: boolean,
  showZero: boolean,
): boolean {
  if (count === undefined) {
    return dot
  }
  return count > 0 || (showZero && count === 0)
}

type DescribableProps = {
  'aria-describedby'?: string
}

// The label only reaches assistive technology if the control it is pinned to
// points at it: a sibling sr-only span is read in document order, apart from
// the button, and is not part of what the control says about itself. So a
// single element child is cloned with the label's id appended to whatever
// description it already carried.
function describe(children: React.ReactNode, id: string): React.ReactNode {
  if (!isValidElement(children)) {
    return children
  }
  const child = children as ReactElement<DescribableProps>
  const existing = child.props['aria-describedby']
  return cloneElement(child, {
    'aria-describedby': existing ? `${existing} ${id}` : id,
  })
}

export function Indicator({
  children,
  count,
  dot = false,
  label,
  max = DEFAULT_MAX,
  position = 'top-right',
  showZero = false,
  variant = 'default',
}: IndicatorProps) {
  const {
    badge,
    label: labelSlot,
    root,
  } = styles({
    dot,
    position,
    variant,
  })
  const labelId = useId()
  const visible = isVisible(count, dot, showZero)
  const described = visible && Boolean(label)
  const text =
    dot || count === undefined ? null : count > max ? `${max}+` : String(count)

  return (
    <span
      className={root()}
      {...axes(styles, {
        variant,
      })}
      data-testid="indicator"
    >
      {described ? describe(children, labelId) : children}
      {visible ? (
        <>
          <span
            aria-hidden={label || dot ? true : undefined}
            className={badge()}
            data-position={position}
            data-testid="indicator-badge"
          >
            {text}
          </span>
          {label ? (
            <span
              className={labelSlot()}
              data-testid="indicator-label"
              id={labelId}
            >
              {label}
            </span>
          ) : null}
        </>
      ) : null}
    </span>
  )
}
