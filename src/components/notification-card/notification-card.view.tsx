import { tv } from 'tailwind-variants'

import { toDate } from '@/components/date-text/date-text.utils'
import { useLabels } from '@/components/labels-provider'
import {
  formatNotificationTime,
  type NotificationClock,
} from '@/components/notification-list/notification-list.utils'
import { axes } from '@/support/utils'

import type { NotificationCardProps } from './notification-card.types'

const notificationCardStyles = tv({
  defaultVariants: {
    density: 'comfortable',
    interactive: false,
    read: true,
  },
  slots: {
    // A title-line tall box at the card's top padding: whatever control sits
    // in it is centred on the title's line, the same line the unread dot is on.
    actions:
      'notification-card-actions flex h-5 shrink-0 items-center self-start',
    body: 'notification-card-body flex min-w-0 flex-1 flex-col gap-0.5',
    description:
      'notification-card-description line-clamp-2 text-muted-foreground',
    main: 'notification-card-main flex min-w-0 flex-1 items-start rounded-md text-left outline-none',
    media:
      'notification-card-media flex shrink-0 items-center justify-center text-muted-foreground',
    // The whole card lights up under the pointer, actions included: a reader
    // scans a feed card by card. accent, like Select and menu items — muted/50
    // barely showed on a popover or sheet.
    root: 'notification-card-root flex min-w-0 items-start gap-1 rounded-md transition-colors hover:bg-accent',
    time: 'notification-card-time text-muted-foreground text-xs',
    title: 'notification-card-title min-w-0 text-foreground text-sm',
    unread:
      'notification-card-unread mt-1.5 size-2 shrink-0 rounded-full bg-primary',
    unreadLabel: 'notification-card-unread-label sr-only',
  },
  variants: {
    density: {
      comfortable: {
        actions: 'box-content pt-3',
        description: 'text-sm',
        main: 'gap-3 p-3',
      },
      compact: {
        actions: 'box-content pt-2',
        description: 'text-xs',
        main: 'gap-2.5 px-2 py-2',
      },
    },
    // Only a card that opens something gets the pointer and the focus ring.
    interactive: {
      false: {},
      true: {
        main: 'cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50',
      },
    },
    read: {
      false: {
        title: 'font-semibold',
      },
      true: {
        title: 'font-normal',
      },
    },
  },
})

/**
 * The card as drawn, from a clock it is handed. NotificationCard keeps its own
 * clock live; NotificationList hands every row the one it already keeps, so a
 * feed of a hundred notifications runs one timer, not a hundred and one.
 * Not exported from the package.
 */
function NotificationCardView({
  actions,
  clock,
  density = 'comfortable',
  notification,
  onClick,
}: NotificationCardProps & {
  clock: NotificationClock
}) {
  const labels = useLabels()
  const unread = !notification.read
  const interactive = Boolean(notification.href || onClick)
  const slots = notificationCardStyles({
    density,
    interactive,
    read: !unread,
  })
  const handleClick = onClick ? () => onClick(notification) : undefined

  const content = (
    <>
      {notification.media ? (
        <span className={slots.media()} data-testid="notification-card-media">
          {notification.media}
        </span>
      ) : null}
      <span className={slots.body()}>
        <span className={slots.title()}>{notification.title}</span>
        {notification.description ? (
          <span className={slots.description()}>
            {notification.description}
          </span>
        ) : null}
        <time
          className={slots.time()}
          dateTime={toDate(notification.at)?.toISOString()}
        >
          {formatNotificationTime(notification.at, clock)}
        </time>
      </span>
      {unread ? (
        <>
          <span
            aria-hidden
            className={slots.unread()}
            data-testid="notification-card-unread"
          />
          <span className={slots.unreadLabel()}>
            {labels.notifications.unread}
          </span>
        </>
      ) : null}
    </>
  )

  // The card's one control: a link when it goes somewhere, a button when it
  // does something, plain content otherwise. The actions sit beside it, never
  // inside, so no control is nested in another.
  const main = notification.href ? (
    <a className={slots.main()} href={notification.href} onClick={handleClick}>
      {content}
    </a>
  ) : handleClick ? (
    <button className={slots.main()} onClick={handleClick} type="button">
      {content}
    </button>
  ) : (
    <div className={slots.main()}>{content}</div>
  )

  return (
    <div
      className={slots.root()}
      {...axes(notificationCardStyles, {
        density,
      })}
      data-read={unread ? 'false' : 'true'}
      data-testid="notification-card-root"
    >
      {main}
      {actions ? (
        <div className={slots.actions()} data-row-click-ignore>
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export { NotificationCardView, notificationCardStyles }
