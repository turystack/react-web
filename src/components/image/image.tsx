import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { ImageIcon } from '@/internal/icons'

import type { ImageProps } from './image.types'

const styles = tv({
  defaultVariants: {
    bordered: false,
    fit: 'cover',
    ratio: 'auto',
    rounded: 'md',
    width: 'full',
  },
  slots: {
    fallback: [
      'image-fallback flex items-center justify-center bg-muted text-muted-foreground',
      '[&_svg]:size-6 [&_svg]:shrink-0',
    ],
    img: 'image-img block h-auto',
    root: 'image-root relative overflow-hidden',
  },
  // The stand-in is a muted surface, and on a muted card it would be muted
  // on muted — gone. A hairline drawn inside its own box keeps its edge on
  // any surface, inherits the frame's corners and adds no size. `bordered`
  // already draws that edge on the frame, so it is not drawn twice.
  compoundVariants: [
    {
      bordered: false,
      class: {
        fallback: 'rounded-[inherit] ring-1 ring-border ring-inset',
      },
    },
  ],
  variants: {
    bordered: {
      false: {},
      true: {
        root: 'border border-border',
      },
    },
    fit: {
      contain: {
        img: 'object-contain',
      },
      cover: {
        img: 'object-cover',
      },
    },
    ratio: {
      '16/9': {
        fallback: 'aspect-video',
        img: 'aspect-video',
      },
      '21/9': {
        fallback: 'aspect-21/9',
        img: 'aspect-21/9',
      },
      '3/2': {
        fallback: 'aspect-3/2',
        img: 'aspect-3/2',
      },
      '4/3': {
        fallback: 'aspect-4/3',
        img: 'aspect-4/3',
      },
      auto: {
        fallback: 'aspect-4/3',
      },
      square: {
        fallback: 'aspect-square',
        img: 'aspect-square',
      },
    },
    rounded: {
      full: {
        root: 'rounded-full',
      },
      lg: {
        root: 'rounded-lg',
      },
      md: {
        root: 'rounded-md',
      },
      none: {
        root: 'rounded-none',
      },
      sm: {
        root: 'rounded-sm',
      },
      xl: {
        root: 'rounded-xl',
      },
    },
    width: {
      auto: {
        fallback: 'w-40 max-w-full',
        img: 'max-w-full',
        root: 'inline-block max-w-full align-middle',
      },
      full: {
        fallback: 'w-full',
        img: 'w-full',
        root: 'block w-full',
      },
    },
  },
})

function Image({
  alt,
  bordered = false,
  fallback,
  fit = 'cover',
  loading = 'lazy',
  ratio = 'auto',
  rounded = 'md',
  src,
  width = 'full',
}: ImageProps) {
  // The `src` that failed, not a flag: a new `src` is a new attempt, with no
  // effect needed to reset it.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const broken = src.trim() === '' || failedSrc === src
  const decorative = alt === ''

  const {
    fallback: fallbackSlot,
    img,
    root,
  } = styles({
    bordered,
    fit,
    ratio,
    rounded,
    width,
  })

  const standIn = fallback ?? <ImageIcon />

  // The stand-in keeps the image's name: it is what the reader was meant to
  // get. A decorative image stays hidden whether or not the file loaded.
  function renderFallback() {
    if (decorative) {
      return (
        <span
          aria-hidden="true"
          className={fallbackSlot()}
          data-testid="image-fallback"
        >
          {standIn}
        </span>
      )
    }

    return (
      <span
        aria-label={alt}
        className={fallbackSlot()}
        data-testid="image-fallback"
        role="img"
      >
        {standIn}
      </span>
    )
  }

  return (
    <span
      className={root()}
      data-fit={fit}
      data-ratio={ratio}
      data-rounded={rounded}
      data-state={broken ? 'fallback' : 'image'}
      data-testid="image"
      data-width={width}
    >
      {broken ? (
        renderFallback()
      ) : (
        <img
          alt={alt}
          className={img()}
          data-testid="image-img"
          decoding="async"
          loading={loading}
          onError={() => setFailedSrc(src)}
          src={src}
        />
      )}
    </span>
  )
}

export { Image }
