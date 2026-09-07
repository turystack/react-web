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
 *
 * Implementation:
 * - <Timeline>
 *     <Timeline.Item status="done" title="Booking confirmed" meta={<DateText value={at} variant="relative" />} />
 *     <Timeline.Item status="current" title="Awaiting payment" />
 *   </Timeline>
 *
 * Dependencies: none
 */

export type TimelineStatus = 'done' | 'current' | 'pending' | 'error'

export type TimelineProps = {
  compact?: boolean // tightens the spacing for a sidebar or a card
}

export type TimelineItemProps = {
  icon?: React.ReactNode // replaces the dot; a node, never an icon name
  meta?: React.ReactNode // when it happened, usually a DateText
  status?: TimelineStatus // what this entry is; default pending
  title: React.ReactNode // what happened (required)
}
