import { tv } from 'tailwind-variants'

/**
 * What a composing parent injects into the Button it was handed.
 *
 * `DropdownMenu.Trigger asChild`, a Tooltip or Popover trigger, a Base UI
 * `render={<Button />}` clone their child with the props that make it their
 * trigger — onPointerDown, onKeyDown, aria-expanded, aria-haspopup,
 * data-popup-open, id, ref. Those arrive at runtime whatever `ButtonProps`
 * says, and dropping them leaves a button that looks like a trigger and opens
 * nothing. So Button reads `props as ButtonProps & ButtonInjectedProps`, takes
 * its semantic props out and forwards the rest to the element — minus
 * `className` and `style`, which a parent must not be able to restyle it with
 * (PROP-1 is about the contract; this keeps the runtime honest to it).
 *
 * Never exported from the package: plumbing between components, not a
 * contract. A consumer who writes `id` or `onPointerDown` on a Button gets a
 * type error. The package's own composers (Sidebar.Trigger) reach it through
 * `ComposedButton` in button.composed.ts.
 */
export type ButtonInjectedProps = {
  [attribute: string]: unknown
}

export const buttonShared = tv({
  base: [
    'button group/button inline-flex shrink-0 items-center justify-center rounded-lg',
    'whitespace-nowrap border border-transparent font-medium text-sm',
    'cursor-pointer select-none outline-none transition-all',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    // A Button with href renders an <a>, which has no :disabled.
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    '[&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  // A link sits in a sentence, so it takes the text's box: no side padding
  // (it would be indented from the words around it), no fixed height and no
  // border adding a pixel on each side.
  compoundVariants: [
    {
      class: 'h-auto border-0 px-0 py-0',
      size: ['sm', 'md', 'lg'],
      variant: ['link', 'link-muted'],
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  variants: {
    block: {
      true: 'w-full',
    },
    size: {
      'icon-lg': 'size-11',
      'icon-md': 'size-10',
      'icon-sm': 'size-9',
      'icon-xs': 'size-6 rounded-md [&_svg:not([class*=size-])]:size-3',
      lg: 'h-11 gap-1.5 px-3',
      md: 'h-10 gap-1.5 px-2.5',
      sm: 'h-9 gap-1 px-2.5 text-(length:--text-compact) [&_svg:not([class*=size-])]:size-3.5',
    },
    variant: {
      dark: 'bg-foreground text-background hover:bg-foreground/90',
      dashed:
        'border-border border-dashed bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      default: 'bg-primary text-primary-foreground hover:bg-primary/80',
      destructive:
        'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30',
      // The nav variants mark the current page (data-current, set by
      // `current`) with the same quiet tint as their hover, held.
      ghost:
        'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground data-current:bg-muted data-current:text-foreground dark:hover:bg-muted/50 dark:data-current:bg-muted/50',
      link: 'text-primary underline-offset-4 hover:underline data-current:underline',
      'link-muted':
        'text-muted-foreground underline-offset-4 hover:text-foreground hover:underline data-current:text-foreground',
      outline:
        'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
    },
  },
})
