import { tv } from 'tailwind-variants'
import { axes } from '@/support/utils'

import type { IdentityProps } from './identity.types'

const identity = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    action: 'identity-action shrink-0',
    content: 'identity-content min-w-0 flex-1',
    heading: 'identity-heading flex min-w-0 items-center gap-2',
    description: 'identity-description truncate text-muted-foreground',
    media: 'identity-media shrink-0',
    root: 'identity inline-flex min-w-0 max-w-full items-center',
    title: 'identity-title truncate font-medium text-foreground',
  },
  variants: {
    size: {
      lg: {
        content: 'space-y-1',
        description: 'text-sm',
        root: 'gap-3',
        title: 'text-lg',
      },
      md: {
        content: 'space-y-0.5',
        description: 'text-sm',
        root: 'gap-2.5',
        title: 'text-sm',
      },
      sm: {
        content: 'space-y-0.5',
        description: 'text-xs',
        root: 'gap-2',
        title: 'text-sm',
      },
    },
    variant: {
      compact: {},
      default: {},
      header: {
        root: 'items-start',
      },
      table: {
        content: 'min-w-0',
        root: 'max-w-full',
      },
    },
  },
})

/**
 * A stable presentation for the identity of any domain entity.
 *
 * The component owns hierarchy, density and truncation; callers own domain
 * formatting. Pass `DocumentText`, `MoneyText`, `Badge`, or a composed node
 * through `description` rather than teaching Identity about organisations or products.
 */
function Identity({
  description,
  action,
  media,
  size,
  title,
  variant,
}: IdentityProps) {
  const {
    content,
    description: descriptionSlot,
    heading,
    action: actionSlot,
    media: mediaSlot,
    root,
    title: titleSlot,
  } = identity({
    size,
    variant,
  })

  return (
    <div
      className={root()}
      {...axes(identity, {
        size,
        variant,
      })}
      data-testid="identity"
    >
      {media ? <div className={mediaSlot()}>{media}</div> : null}
      <div className={content()}>
        <div className={heading()}>
          <div className={titleSlot()} data-testid="identity-title">
            {title}
          </div>
          {action ? <div className={actionSlot()}>{action}</div> : null}
        </div>
        {description ? (
          <div className={descriptionSlot()} data-testid="identity-description">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { Identity }
