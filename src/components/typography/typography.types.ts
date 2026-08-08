/**
 * Typography
 *
 * Polymorphic text component that renders as any HTML text element.
 * Controls font size, weight, variant, and truncation.
 *
 * Behavior:
 * - component prop determines the rendered HTML element (span, p, h1-h6, div)
 * - Size: xs (12px) through 9xl (128px) following Tailwind scale
 * - Weight: thin through black (9 weights)
 * - Variant: default (foreground) or muted (text-muted-foreground)
 * - Truncate: adds text-overflow ellipsis with overflow-hidden (requires block display)
 *
 * Implementation:
 * - Dynamic element via React.createElement or JSX with variable tag
 * - tailwind-variants (tv) for all text properties
 * - <Typography component="h1" size="3xl" weight="bold">Title</Typography>
 * - <Typography component="p" variant="muted" truncate>Long text...</Typography>
 *
 * Dependencies: none (pure CSS utility)
 */

export type TypographySize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'

export type TypographyVariant = 'default' | 'muted'

export type TypographyAlign = 'left' | 'center' | 'right'

export type TypographyMaxWidth = 'xs' | 'sm' | 'md' | 'lg'

export type TypographyWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'

export type TypographyComponent =
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'div'

export type TypographyProps = {
  align?: TypographyAlign // text alignment
  centered?: boolean // centers the text block when maxWidth is set
  component?: TypographyComponent // HTML element to render as (polymorphic)
  maxWidth?: TypographyMaxWidth // maximum readable text width
  size?: TypographySize // font size preset
  variant?: TypographyVariant // color variant
  weight?: TypographyWeight // font weight
  truncate?: boolean // truncates text with ellipsis on overflow
  destructive?: boolean // applies destructive (error) text color
}
