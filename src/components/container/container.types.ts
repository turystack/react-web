/**
 * Container
 *
 * Width-constrained wrapper that centers content horizontally.
 * Used as the main content wrapper for page-level layouts.
 *
 * Behavior:
 * - maxWidth sets the constraint: xs (320px), sm (384px), md (768px),
 *   lg (1152px), xl (1280px), 2xl (1536px) or full (100%)
 * - centered (default true) applies mx-auto for horizontal centering
 * - textAlign controls inner text alignment
 * - id lands on the element, so a section can be an in-page anchor target
 * - paddingX is a horizontal gutter inside the max-width: none (default, so
 *   existing containers are unchanged), sm 16px, md 24px, lg 32px — the
 *   shell's gutter scale. A full-bleed landing band that must not touch the
 *   screen edge on a phone is <Container maxWidth="lg" paddingX="sm">
 *
 * Implementation:
 * - Single <div> with max-width and margin classes
 * - <Container maxWidth="lg" centered>Page content</Container>
 * - <Container maxWidth="xl" paddingX="md">Landing section</Container>
 *
 * Dependencies: none (pure CSS utility)
 */

export type ContainerMaxWidth =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full'

export type ContainerPaddingX = 'none' | 'sm' | 'md' | 'lg'

export type ContainerTextAlign = 'left' | 'center' | 'right'

export type ContainerProps = {
  centered?: boolean // centers the container horizontally with auto margins
  id?: string // DOM id, the target of an in-page anchor link
  maxWidth?: ContainerMaxWidth // max-width breakpoint preset
  paddingX?: ContainerPaddingX // horizontal gutter inside the max-width; default none
  textAlign?: ContainerTextAlign // text alignment
}
