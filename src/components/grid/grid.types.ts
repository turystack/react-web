/**
 * Grid
 *
 * CSS Grid layout primitive with column, gap and alignment presets.
 * Grid.Item controls individual cell spanning, across columns and rows.
 *
 * Behavior:
 * - cols sets grid-template-columns (1-12). A number is one count at every
 *   width; an object is mobile-first per Tailwind breakpoint —
 *   { base: 1, md: 2, lg: 3 } is one column on a phone, two from 768px and
 *   three from 1024px. A breakpoint left out inherits the one below it, and
 *   a missing base is 1
 * - gap uses spacing tokens matching Flex component
 * - align sets align-items for every cell: stretch (default, the cells of a
 *   row share its height), start, center or end
 * - Grid.Item span controls grid-column: span N (1-12 or "full")
 * - Grid.Item rowSpan controls grid-row: span N (1-6) — a tall feature tile
 *   beside two short ones in a bento layout
 * - span and rowSpan also take the per-breakpoint object cols takes, so a
 *   bento can collapse with its grid: span={{ base: 1, md: 2 }} is one column
 *   on a phone and two from 768px. A breakpoint left out inherits the one
 *   below it; a missing base spans one track
 * - Grid.Item order sets the CSS order (1-12, "first", "last", or "none"
 *   for the source position), alone or per breakpoint, so the reading order
 *   can differ by width: an alternating feature row keeps its copy first on a
 *   phone and puts the image first from 768px with
 *   order={{ base: 'last', md: 'first' }} on the image. Order moves the box,
 *   not the DOM: keyboard and screen-reader order stay the source order, so
 *   write the source in the order that reads right on a phone
 * - Grid.Item is a plain block: a Card inside a stretched cell fills it only
 *   with <Card height="full">
 * - Default: 1 column, no gap, stretched cells
 *
 * Implementation:
 * - tailwind-variants (tv) with one axis per breakpoint; every class is a
 *   literal string in the source so Tailwind generates it (no template
 *   strings built at runtime)
 * - <Grid cols={3} gap="md">
 *     <Grid.Item span={2}>Wide</Grid.Item>
 *     <Grid.Item>Normal</Grid.Item>
 *   </Grid>
 * - <Grid align="start" cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
 *     <Grid.Item rowSpan={2}>Tall</Grid.Item>
 *     <Grid.Item>Short</Grid.Item>
 *   </Grid>
 * - <Grid cols={{ base: 1, md: 3 }} gap="md">
 *     <Grid.Item rowSpan={{ md: 2 }} span={{ md: 2 }}>
 *       <Card height="full">…</Card>
 *     </Grid.Item>
 *   </Grid>
 * - <Grid cols={{ base: 1, md: 2 }} gap="lg">
 *     <Grid.Item>Copy</Grid.Item>
 *     <Grid.Item order={{ base: 'last', md: 'first' }}>Image</Grid.Item>
 *   </Grid>
 *
 * Dependencies: none (pure CSS utility)
 */

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/** One value per Tailwind breakpoint, mobile-first. */
export type GridResponsive<T> = {
  base?: T // below 640px, and every width no breakpoint overrides
  sm?: T // from 640px
  md?: T // from 768px
  lg?: T // from 1024px
  xl?: T // from 1280px
}

/** Column counts per Tailwind breakpoint, mobile-first; a missing base is 1. */
export type GridColsResponsive = GridResponsive<GridCols>

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type GridAlign = 'start' | 'center' | 'end' | 'stretch'

export type GridProps = {
  align?: GridAlign // align-items for every cell; default stretch
  cols?: GridCols | GridColsResponsive // column count, or one per breakpoint
  gap?: GridGap // gap between grid items
}

export type GridItemSpan =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 'full'

export type GridItemRowSpan = 1 | 2 | 3 | 4 | 5 | 6

/** Column spans per Tailwind breakpoint, mobile-first. */
export type GridItemSpanResponsive = GridResponsive<GridItemSpan>

/** Row spans per Tailwind breakpoint, mobile-first. */
export type GridItemRowSpanResponsive = GridResponsive<GridItemRowSpan>

export type GridItemOrder =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 'first'
  | 'last'
  | 'none'

/** CSS order per Tailwind breakpoint, mobile-first. */
export type GridItemOrderResponsive = GridResponsive<GridItemOrder>

export type GridItemProps = {
  order?: GridItemOrder | GridItemOrderResponsive // visual position among its siblings (1-12, first, last, none), or one per breakpoint
  rowSpan?: GridItemRowSpan | GridItemRowSpanResponsive // rows this item spans (grid-row: span N), or one per breakpoint
  span?: GridItemSpan | GridItemSpanResponsive // columns this item spans (grid-column: span N), or one per breakpoint
}
