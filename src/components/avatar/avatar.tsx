import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import { Children, type PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { AvatarGroupProps, AvatarProps } from './avatar.types'

const avatar = tv({
  defaultVariants: {
    size: 'md',
    variant: 'circle',
  },
  slots: {
    fallback:
      'avatar-fallback flex size-full items-center justify-center bg-muted text-muted-foreground',
    group:
      'avatar-group flex items-center [&>*]:ring-2 [&>*]:ring-background [&>*:not(:first-child)]:-ml-2',
    groupCount:
      'avatar-group-count flex shrink-0 items-center justify-center bg-muted font-medium text-muted-foreground',
    image: 'avatar-image aspect-square size-full object-cover',
    root: 'avatar-root relative flex shrink-0 select-none overflow-hidden',
  },
  variants: {
    size: {
      lg: {
        fallback: 'text-base',
        groupCount: 'size-12 text-base',
        root: 'size-12',
      },
      md: {
        fallback: 'text-sm',
        groupCount: 'size-9 text-sm',
        root: 'size-9',
      },
      sm: {
        fallback: 'text-xs',
        groupCount: 'size-7 text-xs',
        root: 'size-7',
      },
    },
    variant: {
      circle: {
        fallback: 'rounded-full',
        groupCount: 'rounded-full',
        image: 'rounded-full',
        root: 'rounded-full',
      },
      square: {
        fallback: 'rounded-md',
        groupCount: 'rounded-md',
        image: 'rounded-md',
        root: 'rounded-md',
      },
    },
  },
})

function Avatar({
  src,
  alt,
  size,
  variant,
  children,
}: PropsWithChildren<AvatarProps>) {
  const { root, image, fallback } = avatar({
    size,
    variant,
  })

  return (
    <AvatarPrimitive.Root className={root()} data-testid="avatar-root">
      {src && (
        <AvatarPrimitive.Image
          alt={alt}
          className={image()}
          data-testid="avatar-image"
          src={src}
        />
      )}
      <AvatarPrimitive.Fallback
        className={fallback()}
        data-testid="avatar-fallback"
      >
        {children}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

/**
 * Stacked avatars, with the overflow as a number.
 *
 * The overlap is negative margin on every child but the first, and the ring is
 * what keeps two faces from blurring into one silhouette. `max` exists because
 * eleven avatars in a table cell is not information — "8 more" is.
 */
function AvatarGroup({
  children,
  max,
  size = 'md',
  variant = 'circle',
}: PropsWithChildren<AvatarGroupProps>) {
  const { group, groupCount } = avatar({
    size,
    variant,
  })
  const all = Children.toArray(children)
  const shown = max === undefined ? all : all.slice(0, max)
  const hidden = all.length - shown.length

  return (
    <div className={group()} data-testid="avatar-group">
      {shown}
      {hidden > 0 ? (
        <span className={groupCount()} data-testid="avatar-group-count">
          +{hidden}
        </span>
      ) : null}
    </div>
  )
}

const AvatarWithGroup = Object.assign(Avatar, {
  Group: AvatarGroup,
})

export { AvatarWithGroup as Avatar }
