import { useInterval } from '@turystack/react-hooks'
import { useState } from 'react'

import { useFormat } from '@/components/format-provider'
import { useLabels } from '@/components/labels-provider'
import type { NotificationClock } from '@/components/notification-list/notification-list.utils'

import type { NotificationCardProps } from './notification-card.types'
import {
  NotificationCardView,
  notificationCardStyles,
} from './notification-card.view'

const LIVE_INTERVAL_MS = 60_000

function NotificationCard(props: NotificationCardProps) {
  const labels = useLabels()
  const format = useFormat()
  const [, setTick] = useState(0)

  // "5 minutes ago" is only true for a minute.
  useInterval(() => setTick((tick) => tick + 1), LIVE_INTERVAL_MS)

  const clock: NotificationClock = {
    locale: format.locale,
    now: new Date(),
    timeZone: format.timeZone,
    today: labels.notifications.today,
    yesterday: labels.notifications.yesterday,
  }

  return <NotificationCardView {...props} clock={clock} />
}

export { NotificationCard, notificationCardStyles }
