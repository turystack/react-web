import { tv } from 'tailwind-variants'
import { axes } from '@/support/utils'

import type { EmptyStateProps } from './empty-state.types'

export const styles = tv({
  defaultVariants: {
    bordered: 'none',
    size: 'md',
  },
  slots: {
    // Set apart from the text above it, not stacked on it: the root's gap is
    // the rhythm between title and description, and a button sitting at that
    // same 6px reads as a third line of copy rather than the way out.
    // `text-foreground`, because a state card usually sits in a muted
    // container — a table's empty cell is `text-muted-foreground` — and an
    // outline button inherits its text colour: Try again read as disabled.
    action: 'empty-state-action text-foreground',
    description: 'empty-state-description max-w-prose text-muted-foreground',
    icon: 'empty-state-icon flex items-center justify-center rounded-full bg-muted text-muted-foreground',
    root: 'empty-state flex w-full flex-col items-center justify-center text-center',
    title: 'empty-state-title font-medium text-foreground',
  },
  variants: {
    // A bordered empty state sits inside a card or a section, where the
    // border marks the region that is empty; the size still sets the padding,
    // so `sm` + `dashed` is the compact section-level box.
    bordered: {
      dashed: {
        root: 'rounded-lg border border-border border-dashed',
      },
      none: {},
      solid: {
        root: 'rounded-lg border border-border',
      },
    },
    size: {
      lg: {
        action: 'mt-5',
        description: 'text-base',
        icon: 'mb-4 size-14 [&_svg]:size-6',
        root: 'gap-2 px-6 py-16',
        title: 'text-lg',
      },
      md: {
        action: 'mt-4',
        description: 'text-sm',
        icon: 'mb-3 size-12 [&_svg]:size-5',
        root: 'gap-1.5 px-4 py-10',
        title: 'text-base',
      },
      sm: {
        action: 'mt-3',
        description: 'text-xs',
        icon: 'mb-2 size-9 [&_svg]:size-4',
        root: 'gap-1 px-3 py-6',
        title: 'text-sm',
      },
    },
  },
})

export function EmptyState({
  action,
  bordered = 'none',
  description,
  headingLevel,
  icon,
  size = 'md',
  title,
}: EmptyStateProps) {
  // A paragraph unless the empty state is the region itself: inside a table
  // or a card the region already has its heading.
  const Title = headingLevel ? (`h${headingLevel}` as const) : 'p'
  const {
    action: actionSlot,
    description: descriptionSlot,
    icon: iconSlot,
    root,
    title: titleSlot,
  } = styles({
    bordered,
    size,
  })

  return (
    <div
      className={root()}
      {...axes(styles, {
        bordered,
        size,
      })}
      data-testid="empty-state"
    >
      {icon ? (
        <span aria-hidden="true" className={iconSlot()}>
          {icon}
        </span>
      ) : null}
      <Title className={titleSlot()} data-testid="empty-state-title">
        {title}
      </Title>
      {description ? (
        <p className={descriptionSlot()} data-testid="empty-state-description">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className={actionSlot()} data-testid="empty-state-action">
          {action}
        </div>
      ) : null}
    </div>
  )
}
