import { tv } from 'tailwind-variants'

export const DEFAULT_SECTION_WIDTH = 36

/**
 * How long the debounced inputs wait. It was written four times, in four
 * files, as the same literal — which is three chances for one of them to drift
 * and nobody to notice.
 */
export const DEBOUNCE_MS = 300

/**
 * One definition of an input's styling, for every input in the package.
 *
 * `Input` used to keep a second copy of this, and the two had already drifted
 * in the only two places they could: this one was missing
 * `read-only:cursor-pointer`, and it carried `hasLeft`/`hasRight` variants no
 * caller ever passed — `Input` reserves that space with a computed padding,
 * because a section's width is a prop, not one of two fixed sizes. Both are
 * settled here: the rule is back, the dead variants are gone, and there is one
 * place left to change.
 */
export const inputShared = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    field: [
      'input-field w-full min-w-0 rounded-lg border border-input bg-transparent',
      'text-base outline-none transition-colors md:text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'read-only:cursor-pointer',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
      'dark:bg-input/30 dark:disabled:bg-input/80',
      'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    ],
    root: 'input-root relative flex w-full items-center',
    // The width is a reservation, not a hint: content wider than it is clipped
    // rather than allowed to paint past the field's border.
    section:
      'input-section pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden text-muted-foreground',
  },
  variants: {
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
