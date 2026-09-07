/**
 * Stat
 *
 * One number a dashboard is built around: a label, the figure, and what it is
 * doing.
 *
 * Behavior:
 * - The figure is a node, not a string, so it is the formatter that renders it
 *   — MoneyText for revenue, NumberText for a count, DurationText for a
 *   duration. This component never formats anything, which is why it needs no
 *   locale of its own
 * - `trend` is the same idea for the change beside it; pass a coloured
 *   NumberText and it reads as up or down without a second colour vocabulary
 * - `loading` renders skeletons the size of the content that is coming, so the
 *   card does not resize when the number lands
 *
 * Implementation:
 * - <Stat label="Revenue" value={<MoneyText value={cents} />} trend={<NumberText colored signDisplay="always" value={0.12} variant="percent" />} />
 *
 * Dependencies: Skeleton
 */

export type StatAlign = 'start' | 'center'

export type StatProps = {
  align?: StatAlign // where the content sits; default start
  hint?: string // the small print under the figure: period, source, caveat
  icon?: React.ReactNode // node slot beside the label
  label: string // what the number counts (required)
  loading?: boolean // renders placeholders in the shape of the content
  trend?: React.ReactNode // the change beside the figure, already formatted
  value: React.ReactNode // the figure itself, already formatted (required)
}
