/**
 * Container
 *
 * Width-constrained wrapper that centers content horizontally.
 * Used as the main content wrapper for page-level layouts.
 *
 * Behavior:
 * - maxWidth sets the constraint: xs (320px) through 2xl (1536px) or full (100%)
 * - centered (default true) applies mx-auto for horizontal centering
 * - textAlign controls inner text alignment
 *
 * Implementation:
 * - Single <div> with max-width and margin classes
 * - <Container maxWidth="lg" centered>Page content</Container>
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

export type ContainerTextAlign = 'left' | 'center' | 'right'

export type ContainerProps = {
  centered?: boolean // centers the container horizontally with auto margins
  maxWidth?: ContainerMaxWidth // max-width breakpoint preset
  textAlign?: ContainerTextAlign // text alignment
}
