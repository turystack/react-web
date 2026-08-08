import { tv } from 'tailwind-variants'

export const buttonShared = tv({
  base: [
    'button group/button inline-flex shrink-0 items-center justify-center rounded-lg',
    'whitespace-nowrap border border-transparent font-medium text-sm',
    'cursor-pointer select-none outline-none transition-all',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    '[&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
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
      sm: 'h-9 gap-1 px-2.5 text-[0.8rem] [&_svg:not([class*=size-])]:size-3.5',
    },
    variant: {
      dark: 'bg-foreground text-background hover:bg-foreground/90',
      dashed:
        'border-border border-dashed bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      default: 'bg-primary text-primary-foreground hover:bg-primary/80',
      destructive:
        'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30',
      ghost:
        'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
      link: 'text-primary underline-offset-4 hover:underline',
      'link-muted': 'text-foreground underline-offset-4 hover:underline',
      outline:
        'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
    },
  },
})
