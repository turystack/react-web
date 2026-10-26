/**
 * Timeline
 *
 * What happened to something, in the order it happened.
 *
 * Behavior:
 * - Each entry carries a status, and the status is the whole point: done,
 *   current, pending and error are four different facts about a booking, and a
 *   feed that renders them all as grey dots has thrown away the one thing the
 *   reader came for
 * - The connector between entries is drawn by the component, so a list of ten
 *   events cannot end up with nine different line treatments
 * - Content is compound rather than a prop bag: an entry holds a MoneyText, a
 *   link, an avatar — whatever the event was
 * - `Timeline.Group` gathers the entries of one period under a date heading
 *   ("September 2026"). The label is a real heading (`headingLevel`, default
 *   3), so a screen reader can jump from month to month, and the group is
 *   named by it. The connector stops at the last entry of every group: the
 *   break between two periods is the heading, not a line running through it
 *
 * Implementation:
 * - <Timeline>
 *     <Timeline.Item status="done" title="Booking confirmed" meta={<DateText value={at} variant="relative" />} />
 *     <Timeline.Item status="current" title="Awaiting payment" />
 *   </Timeline>
 * - <Timeline>
 *     <Timeline.Group label="September 2026">
 *       <Timeline.Item status="done" title="Booking confirmed" />
 *     </Timeline.Group>
 *     <Timeline.Group label="August 2026">…</Timeline.Group>
 *   </Timeline>
 *
 * Dependencies: none
 */

export type TimelineStatus = 'done' | 'current' | 'pending' | 'error'

export type TimelineGroupHeadingLevel = 2 | 3 | 4 | 5 | 6

export type TimelineProps = {
  compact?: boolean // tightens the spacing for a sidebar or a card
}

export type TimelineItemProps = {
  icon?: React.ReactNode // replaces the dot; a node, never an icon name
  meta?: React.ReactNode // when it happened, usually a DateText
  status?: TimelineStatus // what this entry is; default pending
  title: React.ReactNode // what happened (required)
}

export type TimelineGroupProps = {
  headingLevel?: TimelineGroupHeadingLevel // the heading element the label renders as; default 3
  label: React.ReactNode // the period its entries belong to, e.g. "September 2026" (required)
}
