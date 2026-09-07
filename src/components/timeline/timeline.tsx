import { createContext, type PropsWithChildren, useContext } from 'react'
import { tv } from 'tailwind-variants'

import type { TimelineItemProps, TimelineProps } from './timeline.types'

export const styles = tv({
  defaultVariants: {
    status: 'pending',
  },
  slots: {
    body: 'timeline-body flex min-w-0 flex-1 flex-col gap-1 pb-6',
    connector:
      'timeline-connector absolute top-6 bottom-0 left-[7px] w-px bg-border',
    content: 'timeline-content text-muted-foreground text-sm',
    item: 'timeline-item relative flex gap-3 last:[&_.timeline-connector]:hidden last:[&_.timeline-body]:pb-0',
    marker:
      'timeline-marker relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 bg-background [&_svg]:size-3',
    meta: 'timeline-meta text-muted-foreground text-xs',
    root: 'timeline flex w-full flex-col',
    title: 'timeline-title font-medium text-foreground text-sm',
  },
  variants: {
    compact: {
      true: {
        body: 'pb-3',
      },
    },
    status: {
      current: {
        marker: 'border-primary bg-primary text-primary-foreground',
      },
      done: {
        marker: 'border-primary bg-primary text-primary-foreground',
      },
      error: {
        marker: 'border-destructive bg-destructive text-white',
        title: 'text-destructive',
      },
      pending: {
        marker: 'border-border bg-muted',
      },
    },
  },
})

/**
 * `compact` is the root's decision and the item's spacing, so it travels by
 * context. It used to be read only where it was declared: the root computed a
 * `body` class it never rendered, and every item rebuilt its own spacing
 * without it — the prop was accepted, documented, and did nothing.
 */
const CompactContext = createContext(false)

function TimelineRoot({ children, compact }: PropsWithChildren<TimelineProps>) {
  const { root } = styles({
    compact,
  })

  return (
    <CompactContext value={Boolean(compact)}>
      <div className={root()} data-testid="timeline">
        {children}
      </div>
    </CompactContext>
  )
}

function TimelineItem({
  children,
  icon,
  meta,
  status = 'pending',
  title,
}: PropsWithChildren<TimelineItemProps>) {
  const compact = useContext(CompactContext)
  const {
    body,
    connector,
    content,
    item,
    marker,
    meta: metaSlot,
    title: titleSlot,
  } = styles({
    compact,
    status,
  })

  return (
    <div className={item()} data-status={status} data-testid="timeline-item">
      <span aria-hidden="true" className={connector()} />
      <span className={marker()} data-testid="timeline-marker">
        {icon}
      </span>
      <div className={body()}>
        <span className={titleSlot()} data-testid="timeline-title">
          {title}
        </span>
        {meta ? (
          <span className={metaSlot()} data-testid="timeline-meta">
            {meta}
          </span>
        ) : null}
        {children ? <div className={content()}>{children}</div> : null}
      </div>
    </div>
  )
}

const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
})

export { Timeline }
