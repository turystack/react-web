import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { AvatarProps } from './avatar.types'

const avatar = tv({
  defaultVariants: {
    size: 'md',
    variant: 'circle',
  },
  slots: {
    fallback:
      'avatar-fallback flex size-full items-center justify-center bg-muted text-muted-foreground',
    image: 'avatar-image aspect-square size-full object-cover',
    root: 'avatar-root relative flex shrink-0 select-none overflow-hidden',
  },
  variants: {
    size: {
      lg: {
        fallback: 'text-base',
        root: 'size-12',
      },
      md: {
        fallback: 'text-sm',
        root: 'size-9',
      },
      sm: {
        fallback: 'text-xs',
        root: 'size-7',
      },
    },
    variant: {
      circle: {
        fallback: 'rounded-full',
        image: 'rounded-full',
        root: 'rounded-full',
      },
      square: {
        fallback: 'rounded-md',
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

export { Avatar }
