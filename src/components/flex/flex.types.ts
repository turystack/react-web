/**
 * Flex
 *
 * Flexbox layout primitive for composing flexible layouts.
 * Maps flex properties to design-token-based presets.
 *
 * Behavior:
 * - direction maps to flex-direction (row, col, row-reverse, col-reverse)
 * - gap uses spacing tokens: xs (4px), sm (8px), md (16px), lg (24px), xl (32px)
 * - inline renders as inline-flex instead of flex
 * - block makes the container full-width
 *
 * Implementation:
 * - tailwind-variants (tv) for all flex properties
 * - Renders a <div> with computed flex classes
 * - <Flex direction="row" justify="between" align="center" gap="md">children</Flex>
 *
 * Dependencies: none (pure CSS utility)
 */

export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse'

export type FlexJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly'

export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse'

export type FlexMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type FlexProps = {
  direction?: FlexDirection // flex-direction
  justify?: FlexJustify // justify-content
  align?: FlexAlign // align-items
  gap?: FlexGap // gap between items
  wrap?: FlexWrap // flex-wrap behavior
  inline?: boolean // uses inline-flex instead of flex
  minHeight?: FlexMinHeight // minimum height preset
  block?: boolean // makes the flex container full-width
}
