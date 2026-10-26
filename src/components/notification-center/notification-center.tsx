import { type DataOutcome, useControllableState } from '@turystack/react-hooks'
import { useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { Indicator } from '@/components/indicator'
import { useLabels } from '@/components/labels-provider'
import { NotificationFilter } from '@/components/notification-filter'
import type { NotificationFilterStatus } from '@/components/notification-filter/notification-filter.types'
import { NotificationList } from '@/components/notification-list'
import type { NotificationItem } from '@/components/notification-list/notification-list.types'
import { Popover } from '@/components/popover'
import { ComposedSheet } from '@/components/sheet/sheet.composed'
import { Bell } from '@/internal/icons'

import type { NotificationCenterProps } from './notification-center.types'

const DEFAULT_LIMIT = 5

const styles = tv({
  slots: {
    bell: 'notification-center-bell flex items-center justify-center',
    // Header and footer bleed through the popover's p-4, so their rules run
    // edge to edge instead of stopping at the padding.
    footer: 'notification-center-footer -mx-4 border-border border-t px-4 pt-2',
    header:
      'notification-center-header -mx-4 flex min-w-0 items-center justify-between gap-2 border-border border-b px-4 pb-3',
    panel: 'notification-center-panel flex min-w-0 flex-col gap-2',
    root: 'notification-center-root inline-flex',
    sheetBody: 'notification-center-sheet-body flex min-w-0 flex-col gap-3',
    sheetHeader:
      'notification-center-sheet-header flex min-w-0 flex-wrap items-center justify-between gap-2',
    title:
      'notification-center-title font-heading font-medium text-base leading-none',
  },
  variants: {
    triggerSize: {
      md: { bell: 'size-8' },
      sm: { bell: 'size-7' },
    },
  },
})

function mapOutcome(
  outcome: DataOutcome<NotificationItem[]>,
  map: (items: NotificationItem[]) => NotificationItem[],
): DataOutcome<NotificationItem[]> {
  return outcome.status === 'success'
    ? { ...outcome, data: map(outcome.data) }
    : outcome
}

export function NotificationCenter(props: NotificationCenterProps) {
  const {
    ariaLabel,
    defaultOpen = false,
    defaultSheetOpen = false,
    emptySection,
    endReachedSection,
    hasMore,
    itemActions,
    limit = DEFAULT_LIMIT,
    loadingMore,
    onItemClick,
    onLoadMore,
    onMarkAllRead,
    onOpenChange,
    onSheetOpenChange,
    open: openProp,
    sheetOpen: sheetOpenProp,
    triggerSize = 'sm',
    triggerVariant = 'ghost',
    unreadCount,
    viewAll,
  } = props
  const labels = useLabels()
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: openProp,
  })
  const [sheetOpen, setSheetOpen] = useControllableState({
    defaultValue: defaultSheetOpen,
    onChange: onSheetOpenChange,
    value: sheetOpenProp,
  })
  const [status, setStatus] = useState<NotificationFilterStatus>('all')
  const slots = styles({ triggerSize })

  const loaded = props.outcome
    ? props.outcome.status === 'success'
      ? props.outcome.data
      : []
    : (props.items ?? [])
  const unread = unreadCount ?? loaded.filter((item) => !item.read).length
  const canMarkAll = Boolean(onMarkAllRead) && unread > 0

  const withData = (map: (items: NotificationItem[]) => NotificationItem[]) =>
    props.outcome
      ? { outcome: mapOutcome(props.outcome, map) }
      : { items: map(props.items ?? []), loading: props.loading }

  const latest = withData((items) => items.slice(0, limit))
  const filtered = withData((items) =>
    status === 'unread' ? items.filter((item) => !item.read) : items,
  )

  const markAll = canMarkAll ? (
    <Button onClick={onMarkAllRead} size="sm" type="button" variant="ghost">
      {labels.notifications.markAllRead}
    </Button>
  ) : null

  const openSheet = () => {
    setOpen(false)
    setSheetOpen(true)
  }

  // The sheet has no trigger of its own — the "View all" that opened it left
  // with the popover — so focus is sent back to the bell by hand.
  const focusBell = () =>
    rootRef.current?.querySelector<HTMLElement>('button') ?? null

  const content = (
    <div className={slots.panel()} data-testid="notification-center-panel">
      <div className={slots.header()}>
        <h2 className={slots.title()}>{labels.notifications.title}</h2>
        {markAll}
      </div>
      <NotificationList
        density="compact"
        emptySection={emptySection}
        loadingRows={limit > 3 ? 3 : limit}
        onItemClick={
          onItemClick
            ? (item) => {
                setOpen(false)
                onItemClick(item)
              }
            : undefined
        }
        {...latest}
      />
      {viewAll ? (
        <div className={slots.footer()}>
          {viewAll === 'sheet' ? (
            <Button
              block
              onClick={openSheet}
              size="sm"
              type="button"
              variant="ghost"
            >
              {labels.notifications.viewAll}
            </Button>
          ) : (
            <Button block href={viewAll.href} size="sm" variant="ghost">
              {labels.notifications.viewAll}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <span
      className={slots.root()}
      data-testid="notification-center"
      ref={rootRef}
    >
      <Popover
        align="end"
        asChild
        content={content}
        onOpenChange={setOpen}
        open={open}
        width="lg"
      >
        <Button
          ariaLabel={ariaLabel ?? labels.notifications.trigger(unread)}
          size={triggerSize === 'md' ? 'icon-md' : 'icon-sm'}
          type="button"
          variant={triggerVariant}
        >
          {/* Inside the button, so the one control keeps one name: the count
              is in that name, not read beside it. Pinned to a box almost the
              button's size rather than to the 16px glyph, so the badge sits
              on the button's corner instead of covering the bell. */}
          <Indicator count={unread} variant="destructive">
            <span className={slots.bell()}>
              <Bell />
            </span>
          </Indicator>
        </Button>
      </Popover>
      {viewAll === 'sheet' ? (
        <ComposedSheet
          fillOnPhone
          finalFocus={focusBell}
          onChange={setSheetOpen}
          open={sheetOpen}
          side="right"
          size="sm"
        >
          <ComposedSheet.Header bordered closable>
            <div className={slots.sheetHeader()}>
              <ComposedSheet.Header.Title>
                {labels.notifications.title}
              </ComposedSheet.Header.Title>
              {markAll}
            </div>
          </ComposedSheet.Header>
          <ComposedSheet.Body>
            <div className={slots.sheetBody()}>
              <NotificationFilter
                counts={{ unread }}
                onStatusChange={setStatus}
                status={status}
              />
              {/* Unread filters the rows already loaded. Paging on under it
                  would pull every older page looking for unread ones, since a
                  short filtered list keeps the sentinel in view. */}
              <NotificationList
                emptySection={emptySection}
                endReachedSection={
                  status === 'all' ? endReachedSection : undefined
                }
                groupBy="day"
                hasMore={status === 'all' ? hasMore : undefined}
                headingLevel={3}
                itemActions={itemActions}
                loadingMore={status === 'all' ? loadingMore : undefined}
                onItemClick={onItemClick}
                onLoadMore={status === 'all' ? onLoadMore : undefined}
                {...filtered}
              />
            </div>
          </ComposedSheet.Body>
        </ComposedSheet>
      ) : null}
    </span>
  )
}
