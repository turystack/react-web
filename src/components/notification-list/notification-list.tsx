import type { DataOutcome } from '@turystack/react-hooks'
import { useInterval } from '@turystack/react-hooks'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { EmptyState } from '@/components/empty-state'
import { useFormat } from '@/components/format-provider'
import { useLabels } from '@/components/labels-provider'
import { List } from '@/components/list'
import type { ListInfiniteProps } from '@/components/list/list.types'
import { NotificationCardView } from '@/components/notification-card/notification-card.view'
import { Skeleton } from '@/components/skeleton'
import { Inbox } from '@/internal/icons'
import { axes } from '@/support/utils'

import type {
  NotificationItem,
  NotificationListProps,
} from './notification-list.types'
import {
  formatNotificationDay,
  groupNotificationsByDay,
  type NotificationClock,
} from './notification-list.utils'

const LIVE_INTERVAL_MS = 60_000

const DEFAULT_LOADING_ROWS = 3

/**
 * The list's own chrome: the day headings and the skeleton rows. Each
 * notification is a NotificationCard, which owns its own slots.
 */
const styles = tv({
  defaultVariants: {
    density: 'comfortable',
  },
  slots: {
    body: 'notification-list-body flex min-w-0 flex-1 flex-col gap-0.5',
    heading:
      'notification-list-heading font-medium text-muted-foreground text-xs',
    loading: 'notification-list-loading flex flex-col',
    loadingRow: 'notification-list-loading-row flex min-w-0 items-start gap-1',
    main: 'notification-list-main flex min-w-0 flex-1 items-start rounded-md',
  },
  variants: {
    density: {
      comfortable: {
        heading: 'px-3 pt-4 pb-1',
        main: 'gap-3 p-3',
      },
      compact: {
        heading: 'px-2 pt-3 pb-1',
        main: 'gap-2.5 px-2 py-2',
      },
    },
  },
})

/** A row of the underlying List: a day's heading or a notification. */
type Entry =
  | { key: string; kind: 'day'; label: string }
  | { item: NotificationItem; key: string; kind: 'item' }

function toEntries(
  items: NotificationItem[],
  grouped: boolean,
  clock: NotificationClock,
): Entry[] {
  if (!grouped) {
    return items.map((item) => ({ item, key: item.id, kind: 'item' }))
  }

  return groupNotificationsByDay(items, clock.timeZone).flatMap((day) => [
    {
      key: `day:${day.key}`,
      kind: 'day' as const,
      label: formatNotificationDay(day.at, clock),
    },
    ...day.items.map((item) => ({
      item,
      key: item.id,
      kind: 'item' as const,
    })),
  ])
}

function toEntryOutcome(
  outcome: DataOutcome<NotificationItem[]>,
  map: (items: NotificationItem[]) => Entry[],
): DataOutcome<Entry[]> {
  return outcome.status === 'success'
    ? { ...outcome, data: map(outcome.data) }
    : outcome
}

export function NotificationList(props: NotificationListProps) {
  const {
    activeKey,
    ariaLabel,
    density = 'comfortable',
    emptySection,
    endReachedSection,
    groupBy = 'none',
    hasMore,
    headingLevel = 3,
    itemActions,
    loadingMore,
    loadingRows,
    onItemClick,
    onLoadMore,
  } = props
  const labels = useLabels()
  const format = useFormat()
  const [, setTick] = useState(0)

  // One clock for the whole feed: the headings and every row's time.
  useInterval(() => setTick((tick) => tick + 1), LIVE_INTERVAL_MS)

  const clock: NotificationClock = {
    locale: format.locale,
    now: new Date(),
    timeZone: format.timeZone,
    today: labels.notifications.today,
    yesterday: labels.notifications.yesterday,
  }
  const map = (items: NotificationItem[]) =>
    toEntries(items, groupBy === 'day', clock)
  const skeletonSlots = styles({ density })
  const { heading } = skeletonSlots
  const Heading = `h${headingLevel}` as const

  // Rows shaped like the ones that will arrive: a round media and three lines,
  // not List's generic blocks, which read as heavy cards in the popover.
  const loadingSection = (
    <div
      className={skeletonSlots.loading()}
      {...axes(styles, {
        density,
      })}
      data-testid="notification-list-loading"
    >
      {Array.from(
        { length: loadingRows ?? DEFAULT_LOADING_ROWS },
        (_, index) => (
          <div className={skeletonSlots.loadingRow()} key={`loading-${index}`}>
            <div className={skeletonSlots.main()}>
              <Skeleton
                height={density === 'compact' ? 'md' : 'lg'}
                shape="circle"
              />
              <div className={skeletonSlots.body()}>
                <Skeleton shape="text" width="lg" />
                <Skeleton shape="text" />
                <Skeleton height="xs" shape="text" width="sm" />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  )

  const infinite: ListInfiniteProps | undefined =
    hasMore !== undefined || onLoadMore
      ? { endReachedSection, hasMore, loadingMore, onLoadMore }
      : undefined

  const renderEntry = (entry: Entry) =>
    entry.kind === 'day' ? (
      <Heading
        className={heading()}
        {...axes(styles, {
          density,
        })}
        data-testid="notification-list-heading"
      >
        {entry.label}
      </Heading>
    ) : (
      <NotificationCardView
        actions={itemActions?.(entry.item)}
        clock={clock}
        density={density}
        notification={entry.item}
        onClick={onItemClick}
      />
    )

  const shared = {
    activeKey,
    ariaLabel: ariaLabel ?? labels.notifications.list,
    emptySection: emptySection ?? (
      <EmptyState
        description={labels.notifications.emptyDescription}
        icon={<Inbox />}
        size="sm"
        title={labels.notifications.empty}
      />
    ),
    gap: 'none' as const,
    infinite,
    itemKey: (entry: Entry) => entry.key,
    loadingRows,
    loadingSection,
    renderItem: renderEntry,
  }

  if (props.outcome) {
    return (
      <List<Entry> {...shared} outcome={toEntryOutcome(props.outcome, map)} />
    )
  }

  return (
    <List<Entry>
      {...shared}
      error={props.error}
      items={map(props.items ?? [])}
      loading={props.loading}
    />
  )
}
