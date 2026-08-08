import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { Loader2 } from '@/internal/icons'

import type { BadgeProps } from './badge.types'

const badge = tv({
  defaultVariants: {
    align: 'center',
    variant: 'default',
  },
  slots: {
    content: 'badge-content inline-flex items-center gap-1',
    root: [
      'badge-root relative inline-flex h-5 w-fit shrink-0 items-center justify-center',
      'gap-1 overflow-hidden rounded-full border border-transparent',
      'whitespace-nowrap px-2 py-0.5 font-medium text-xs transition-all',
      '[&>svg]:pointer-events-none [&>svg]:size-3',
    ],
    spinner: 'size-3 animate-spin',
    spinnerWrap: 'absolute inset-0 flex items-center justify-center',
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
        root: 'cursor-pointer',
      },
    },
    loading: {
      true: {
        content: 'invisible',
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
  onClick,
}: PropsWithChildren<BadgeProps>) {
  const { root, content, spinner, spinnerWrap } = badge({
    align,
    block,
    clickable: Boolean(onClick),
    loading,
    variant,
  })

  return (
    <span className={root()} data-testid="badge" onClick={onClick}>
      <span className={content()} data-testid="badge-content">
        {children}
      </span>
      {loading && (
        <span className={spinnerWrap()}>
          <Loader2 className={spinner()} />
        </span>
      )}
    </span>
  )
}

export { Badge }
