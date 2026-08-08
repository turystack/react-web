/**
 * Grid
 *
 * CSS Grid layout primitive with column and gap presets.
 * Grid.Item controls individual cell spanning.
 *
 * Behavior:
 * - cols sets grid-template-columns (1-12)
 * - gap uses spacing tokens matching Flex component
 * - Grid.Item span controls grid-column: span N (1-12 or "full")
 * - Default: 1 column, no gap
 *
 * Implementation:
 * - tailwind-variants (tv) for grid-cols-N and gap classes
 * - <Grid cols={3} gap="md">
 *     <Grid.Item span={2}>Wide</Grid.Item>
 *     <Grid.Item>Normal</Grid.Item>
 *   </Grid>
 *
 * Dependencies: none (pure CSS utility)
 */

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type GridProps = {
  cols?: GridCols // number of grid columns (grid-template-columns)
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

export type GridItemProps = {
  span?: GridItemSpan // how many columns this item spans (grid-column: span N)
}
