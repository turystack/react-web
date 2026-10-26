import { createContext, type PropsWithChildren, useContext, useId } from 'react'
import { tv } from 'tailwind-variants'

import type {
  TimelineGroupProps,
  TimelineItemProps,
  TimelineProps,
} from './timeline.types'

export const styles = tv({
  defaultVariants: {
    status: 'pending',
  },
  slots: {
    body: 'timeline-body flex min-w-0 flex-1 flex-col gap-1 pb-6',
    connector:
      'timeline-connector absolute top-6 bottom-0 left-1.75 w-px bg-border',
    content: 'timeline-content text-muted-foreground text-sm',
    // A <fieldset> (a group, like the ARIA role it replaces) keeps a
    // min-content floor and its own border and padding; this resets them.
    group:
      'timeline-group m-0 flex min-w-0 flex-col border-0 p-0 pb-6 last:pb-0',
    groupItems: 'timeline-group-items flex flex-col',
    groupLabel:
      'timeline-group-label mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide',
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
        group: 'pb-3',
        groupLabel: 'mb-2',
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
        marker: 'border-destructive bg-destructive text-destructive-foreground',
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

/**
 * A period's entries under their date heading. The label is a real heading so
 * the months are landmarks a screen reader can jump between, and it names the
 * group, so an entry read on its own still says which period it is in.
 */
function TimelineGroup({
  children,
  headingLevel = 3,
  label,
}: PropsWithChildren<TimelineGroupProps>) {
  const compact = useContext(CompactContext)
  const labelId = useId()
  const { group, groupItems, groupLabel } = styles({
    compact,
  })
  const Heading = `h${headingLevel}` as const

  return (
    // A <fieldset> is the native group: the same role="group" named by the
    // heading, with no ARIA standing in for an element that exists.
    <fieldset
      aria-labelledby={labelId}
      className={group()}
      data-testid="timeline-group"
    >
      <Heading className={groupLabel()} id={labelId}>
        {label}
      </Heading>
      <div className={groupItems()}>{children}</div>
    </fieldset>
  )
}

const Timeline = Object.assign(TimelineRoot, {
  Group: TimelineGroup,
  Item: TimelineItem,
})

export { Timeline }
