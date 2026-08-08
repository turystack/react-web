import { tv } from 'tailwind-variants'

export const DEFAULT_SECTION_WIDTH = 36

export const inputShared = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    field: [
      'w-full min-w-0 rounded-lg border border-input bg-transparent',
      'text-base outline-none transition-colors md:text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
      'dark:bg-input/30 dark:disabled:bg-input/80',
      'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    ],
    root: 'relative flex w-full items-center',
    section:
      'pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center text-muted-foreground',
  },
  variants: {
    hasLeft: {
      true: {
        field: 'pl-9',
      },
    },
    hasRight: {
      true: {
        field: 'pr-9',
      },
    },
    size: {
      lg: {
        field: 'h-11 px-3 py-1',
      },
      md: {
        field: 'h-10 px-2.5 py-1',
      },
      sm: {
        field: 'h-9 px-2.5 py-1',
      },
    },
    variant: {
      default: {},
      ghost: {
        field:
          'border-transparent bg-transparent focus-visible:border-transparent disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent',
      },
    },
  },
})
