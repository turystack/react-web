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
 * - Built to be handed to the `emptySection` prop List, Table, Select and
 *   Uploader already take, so the empty screen stops being reinvented per page
 *
 * Implementation:
 * - <List emptySection={<EmptyState title="No bookings yet" />} … />
 * - <EmptyState action={<Button>New booking</Button>} description="…" icon={<Search />} title="Nothing matches that filter" />
 *
 * Dependencies: none
 */

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export type EmptyStateProps = {
  action?: React.ReactNode // the way out: a button, a link, nothing
  description?: string // why it is empty, when that is not obvious
  icon?: React.ReactNode // node slot, never an icon name
  size?: EmptyStateSize // how much room it takes; default md
  title: string // what is missing (required)
}
