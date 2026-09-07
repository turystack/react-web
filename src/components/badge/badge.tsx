import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react'
import { tv } from 'tailwind-variants'
import { Loader2 } from '@/internal/icons'

import { cn } from '@/support/utils'

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
        root: 'h-4 gap-0.5 px-1.5 text-[0.625rem] [&>svg]:size-2.5',
        spinner: 'size-2.5',
      },
    },
    variant: {
      default: {
        root: 'bg-primary text-primary-foreground',
      },
      destructive: {
        root: 'bg-destructive/10 text-destructive',
      },
      info: {
        root: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
      },
      orange: {
        root: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
      },
      outline: {
        root: 'border-border text-foreground',
      },
      pink: {
        root: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
      },
      purple: {
        root: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
      },
      secondary: {
        root: 'bg-secondary text-secondary-foreground',
      },
      solid: {
        root: 'bg-foreground text-background',
      },
      'solid-destructive': {
        root: 'bg-red-600 text-white dark:bg-red-500',
      },
      'solid-info': {
        root: 'bg-sky-600 text-white dark:bg-sky-500',
      },
      'solid-success': {
        root: 'bg-emerald-600 text-white dark:bg-emerald-500',
      },
      success: {
        root: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
      },
      teal: {
        root: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
      },
      warning: {
        root: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
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
        'data-size': size,
        'data-testid': 'badge',
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
        data-size={size}
        data-testid="badge"
        disabled={loading}
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
      data-size={size}
      data-testid="badge"
    >
      {inner}
    </span>
  )
}

export { Badge }
