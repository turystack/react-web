import { tv } from 'tailwind-variants'

import type { EmptyStateProps } from './empty-state.types'

export const styles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    action: 'empty-state-action',
    description: 'empty-state-description max-w-prose text-muted-foreground',
    icon: 'empty-state-icon flex items-center justify-center rounded-full bg-muted text-muted-foreground',
    root: 'empty-state flex w-full flex-col items-center justify-center text-center',
    title: 'empty-state-title font-medium text-foreground',
  },
  variants: {
    size: {
      lg: {
        description: 'text-base',
        icon: 'mb-4 size-14 [&_svg]:size-6',
        root: 'gap-2 px-6 py-16',
        title: 'text-lg',
      },
      md: {
        description: 'text-sm',
        icon: 'mb-3 size-12 [&_svg]:size-5',
        root: 'gap-1.5 px-4 py-10',
        title: 'text-base',
      },
      sm: {
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
  description,
  icon,
  size = 'md',
  title,
}: EmptyStateProps) {
  const {
    action: actionSlot,
    description: descriptionSlot,
    icon: iconSlot,
    root,
    title: titleSlot,
  } = styles({
    size,
  })

  return (
    <div className={root()} data-testid="empty-state">
      {icon ? (
        <span aria-hidden="true" className={iconSlot()}>
          {icon}
        </span>
      ) : null}
      <p className={titleSlot()} data-testid="empty-state-title">
        {title}
      </p>
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
