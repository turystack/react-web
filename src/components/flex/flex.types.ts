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
 * - hideBelow / hideAbove show or hide the row per Tailwind breakpoint
 *   (sm 640px, md 768px, lg 1024px, xl 1280px): hideBelow="md" is gone on a
 *   phone and a flex row again from 768px (inline-flex when inline);
 *   hideAbove="md" is there on a phone and gone from 768px. A header's links
 *   take hideBelow="md" and its menu button hideAbove="md". Both together
 *   show it only between the two (hideBelow must be the smaller breakpoint).
 *   Hidden is display: none, so it leaves the accessibility tree too
 * - id lands on the element, so a Flex row can be an in-page anchor target
 *   (AnchorNav, `#pricing` links) without a wrapper
 *
 * Implementation:
 * - tailwind-variants (tv) for all flex properties
 * - Renders a <div> with computed flex classes
 * - <Flex direction="row" justify="between" align="center" gap="md">children</Flex>
 * - <Flex gap="md" hideBelow="md">{links}</Flex>
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

export type FlexBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

export type FlexMinHeight = 'sm' | 'md' | 'lg' | 'screen'

export type FlexProps = {
  direction?: FlexDirection // flex-direction
  justify?: FlexJustify // justify-content
  align?: FlexAlign // align-items
  gap?: FlexGap // gap between items
  id?: string // DOM id, the target of an in-page anchor link
  wrap?: FlexWrap // flex-wrap behavior
  inline?: boolean // uses inline-flex instead of flex
  minHeight?: FlexMinHeight // minimum height preset
  block?: boolean // makes the flex container full-width
  hideAbove?: FlexBreakpoint // hidden from this breakpoint up
  hideBelow?: FlexBreakpoint // hidden below this breakpoint, a flex row from it on
}
