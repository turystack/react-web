import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react'
import { tv } from 'tailwind-variants'
import { Loader2 } from '@/internal/icons'

import { axes, cn } from '@/support/utils'

import type { BadgeProps } from './badge.types'

const badge = tv({
  defaultVariants: {
    align: 'center',
    size: 'md',
    variant: 'default',
  },
  slots: {
    content: 'badge-content inline-flex items-center',
    root: [
      'badge-root relative inline-flex w-fit shrink-0 items-center justify-center',
      'overflow-hidden rounded-full border border-transparent',
      'whitespace-nowrap font-medium transition-all',
      '[&>svg]:pointer-events-none',
    ],
    spinner: 'badge-spinner animate-spin',
    spinnerWrap:
      'badge-spinner-wrap absolute inset-0 flex items-center justify-center',
  },
  variants: {
    align: {
      center: {
        root: 'justify-center',
      },
      end: {
        root: 'justify-end',
      },
      start: {
        root: 'justify-start',
      },
    },
    block: {
      true: {
        root: 'w-full',
      },
    },
    clickable: {
      true: {
        root: [
          'cursor-pointer outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed',
        ],
      },
    },
    loading: {
      true: {
        content: 'invisible',
      },
    },
    size: {
      lg: {
        content: 'gap-1.5',
        root: 'h-6 gap-1.5 px-2.5 py-0.5 text-sm [&>svg]:size-3.5',
        spinner: 'size-3.5',
      },
      md: {
        content: 'gap-1',
        root: 'h-5 gap-1 px-2 py-0.5 text-xs [&>svg]:size-3',
        spinner: 'size-3',
      },
      sm: {
        content: 'gap-0.5',
        root: 'h-4 gap-0.5 px-1.5 text-2xs [&>svg]:size-2.5',
        spinner: 'size-2.5',
      },
    },
    /**
     * The status variants paint with the theme's status tokens, never a raw
     * palette. The soft ones tint only 5% in light mode because the tokens are
     * tuned to hold AA as text on the page: a heavier tint pulls the label
     * under 4.5:1, so the shape comes from a 25% border instead. Dark mode has
     * the headroom for a 15% tint. `solid-destructive` writes in the
     * background colour — white in light mode, near-black in dark — because
     * the theme has no destructive-foreground utility and white on the dark
     * theme's lighter red falls under AA.
     */
    variant: {
      default: {
        root: 'bg-primary text-primary-foreground',
      },
      destructive: {
        root: 'border-destructive/25 bg-destructive/5 text-destructive dark:bg-destructive/15',
      },
      info: {
        root: 'border-info/25 bg-info/5 text-info dark:bg-info/15',
      },
      orange: {
        root: 'bg-category-orange text-category-orange-foreground',
      },
      outline: {
        root: 'border-border text-foreground',
      },
      pink: {
        root: 'bg-category-pink text-category-pink-foreground',
      },
      purple: {
        root: 'bg-category-purple text-category-purple-foreground',
      },
      secondary: {
        root: 'bg-secondary text-secondary-foreground',
      },
      solid: {
        root: 'bg-foreground text-background',
      },
      'solid-destructive': {
        root: 'bg-destructive text-background',
      },
      'solid-info': {
        root: 'bg-info text-info-foreground',
      },
      'solid-success': {
        root: 'bg-success text-success-foreground',
      },
      success: {
        root: 'border-success/25 bg-success/5 text-success dark:bg-success/15',
      },
      teal: {
        root: 'bg-category-teal text-category-teal-foreground',
      },
      warning: {
        root: 'border-warning/25 bg-warning/5 text-warning dark:bg-warning/15',
      },
    },
  },
})

function Badge({
  children,
  variant,
  align,
  block,
  loading,
  size = 'md',
  asChild,
  onClick,
}: PropsWithChildren<BadgeProps>) {
  const child =
    asChild && isValidElement(children)
      ? (children as ReactElement<Record<string, unknown>>)
      : undefined
  const clickable = Boolean(onClick)
  const { root, content, spinner, spinnerWrap } = badge({
    align,
    block,
    clickable,
    loading,
    size,
    variant,
  })

  const inner = (
    <>
      <span className={content()} data-testid="badge-content">
        {child ? (child.props.children as ReactNode) : children}
      </span>
      {loading && (
        <span className={spinnerWrap()}>
          <Loader2 className={spinner()} />
        </span>
      )}
    </>
  )

  if (child) {
    return cloneElement(
      child,
      {
        'aria-busy': loading,
        'aria-disabled': loading || undefined,
        className: cn(root(), child.props.className as string | undefined),
        'data-testid': 'badge',
        ...axes(badge, {
          size,
          variant,
        }),
        ...(clickable
          ? {
              onClick: loading ? undefined : onClick,
            }
          : {}),
      },
      inner,
    )
  }

  if (clickable) {
    return (
      <button
        aria-busy={loading}
        className={root()}
        data-testid="badge"
        disabled={loading}
        {...axes(badge, {
          size,
          variant,
        })}
        onClick={onClick}
        type="button"
      >
        {inner}
      </button>
    )
  }

  return (
    <span
      aria-busy={loading}
      className={root()}
      data-testid="badge"
      {...axes(badge, {
        size,
        variant,
      })}
    >
      {inner}
    </span>
  )
}

export { Badge }
