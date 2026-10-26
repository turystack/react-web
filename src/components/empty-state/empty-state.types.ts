/**
 * EmptyState
 *
 * What a surface says when it has nothing to show.
 *
 * Behavior:
 * - Title, an optional reason, an optional icon and an optional way out — in
 *   that order, because a reader needs to know what is missing before being
 *   offered a button
 * - Sizes exist because the same state renders inside a Select popup and
 *   inside a full page, and one padding cannot serve both
 * - `bordered` draws the edge of the empty region: `dashed` is the
 *   section-level empty inside a card or a section (a 1px dashed box), `solid`
 *   a plain outline, `none` (default) no edge. It composes with `size`: the
 *   size sets the padding, the border only outlines it
 * - The title is a paragraph by default, because an empty state usually sits
 *   inside a region that already has its heading (a table, a card).
 *   headingLevel makes it a real heading (h1–h6) for the empty state that is
 *   the region itself — a whole page or section with nothing in it yet
 * - Built to be handed to the `emptySection` prop List, Table, Select and
 *   Uploader already take, so the empty screen stops being reinvented per page
 *
 * Implementation:
 * - <List emptySection={<EmptyState title="No bookings yet" />} … />
 * - <EmptyState bordered="dashed" size="sm" title="No payouts yet" />
 * - <EmptyState headingLevel={2} size="lg" title="No projects yet" />
 * - <EmptyState action={<Button>New booking</Button>} description="…" icon={<Search />} title="Nothing matches that filter" />
 *
 * Dependencies: none
 */

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export type EmptyStateBordered = 'none' | 'solid' | 'dashed'

// 1 included: on a system page (404, 500) the empty state's title IS the page title.
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type EmptyStateProps = {
  action?: React.ReactNode // the way out: a button, a link, nothing
  bordered?: EmptyStateBordered // edge of the empty region; default none
  description?: string // why it is empty, when that is not obvious
  headingLevel?: EmptyStateHeadingLevel // renders the title as that heading (h1–h6); default none, a paragraph
  icon?: React.ReactNode // node slot, never an icon name
  size?: EmptyStateSize // how much room it takes; default md
  title: string // what is missing (required)
}
