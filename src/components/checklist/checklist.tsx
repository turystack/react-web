import { useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Progress } from '@/components/progress'
import { Check, X } from '@/internal/icons'

import type { ChecklistItem, ChecklistProps } from './checklist.types'

export const styles = tv({
  slots: {
    action: 'checklist-action shrink-0',
    count: 'checklist-count text-muted-foreground text-sm',
    header: 'checklist-header flex items-start justify-between gap-3',
    heading: 'checklist-heading flex min-w-0 flex-col gap-1',
    list: 'checklist-list flex flex-col',
    root: 'checklist flex w-full flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground',
    title: 'checklist-title font-semibold text-base',
    toggle: [
      'checklist-toggle cursor-pointer self-start rounded-sm text-muted-foreground text-sm underline-offset-4',
      'hover:text-foreground hover:underline',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    ],
  },
})

/**
 * One look per item state. `next` is the first undone step: its label
 * carries the weight and its marker the primary border, so the eye lands on
 * what to do now rather than on the list as a whole.
 */
const itemStyles = tv({
  defaultVariants: {
    state: 'pending',
  },
  slots: {
    itemBody: 'checklist-item-body flex min-w-0 flex-1 flex-col gap-0.5',
    itemDescription: 'checklist-item-description text-muted-foreground text-sm',
    item: 'checklist-item flex items-start gap-3 border-border border-t py-3 first:border-t-0',
    itemLabel: 'checklist-item-label text-sm',
    itemMarker:
      'checklist-item-marker mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3',
  },
  variants: {
    state: {
      done: {
        itemLabel: 'text-muted-foreground line-through',
        itemMarker: 'border-primary bg-primary text-primary-foreground',
      },
      next: {
        itemLabel: 'font-medium text-foreground',
        itemMarker: 'border-primary',
      },
      pending: {
        itemLabel: 'text-foreground',
        itemMarker: 'border-border',
      },
    },
  },
})

type ChecklistItemState = 'done' | 'next' | 'pending'

function stateOf(
  item: ChecklistItem,
  nextId: string | undefined,
): ChecklistItemState {
  if (item.done) {
    return 'done'
  }

  return item.id === nextId ? 'next' : 'pending'
}

function ChecklistRow({
  doneLabel,
  item,
  state,
}: {
  doneLabel: string
  item: ChecklistItem
  state: ChecklistItemState
}) {
  const {
    item: itemSlot,
    itemBody,
    itemDescription,
    itemLabel,
    itemMarker,
  } = itemStyles({
    state,
  })

  return (
    <li
      aria-current={state === 'next' ? 'step' : undefined}
      className={itemSlot()}
      data-done={item.done ? '' : undefined}
      data-testid={`checklist-item-${item.id}`}
    >
      <span aria-hidden="true" className={itemMarker()}>
        {item.done ? <Check /> : null}
      </span>
      <div className={itemBody()}>
        <span
          className={itemLabel()}
          data-testid={`checklist-item-label-${item.id}`}
        >
          {item.label}
          {item.done ? (
            <span className="checklist-item-status sr-only">{` (${doneLabel})`}</span>
          ) : null}
        </span>
        {item.description ? (
          <span className={itemDescription()}>{item.description}</span>
        ) : null}
      </div>
      {!item.done && item.action ? (
        <div
          className={styles().action()}
          data-testid={`checklist-item-action-${item.id}`}
        >
          {item.action}
        </div>
      ) : null}
    </li>
  )
}

export function Checklist({
  collapsible = false,
  items,
  onDismiss,
  title,
}: ChecklistProps) {
  const labels = useLabels()
  const titleId = useId()
  const listId = useId()
  const [expanded, setExpanded] = useState(false)
  const {
    count,
    header,
    heading,
    list,
    root,
    title: titleSlot,
    toggle,
  } = styles()

  const doneCount = items.filter((item) => item.done).length
  const total = items.length
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)
  const nextId = items.find((item) => !item.done)?.id
  const folded = collapsible && !expanded
  const shown = folded ? items.filter((item) => !item.done) : items

  return (
    <div className={root()} data-testid="checklist">
      <div className={header()}>
        <div className={heading()}>
          {title ? (
            <div className={titleSlot()} id={titleId}>
              {title}
            </div>
          ) : null}
          <span className={count()} data-testid="checklist-count">
            {labels.checklist.progress(doneCount, total)}
          </span>
        </div>
        {onDismiss ? (
          <Button
            ariaLabel={labels.common.close}
            data-testid="checklist-dismiss"
            onClick={onDismiss}
            size="icon-sm"
            variant="ghost"
          >
            <X />
          </Button>
        ) : null}
      </div>

      <Progress
        ariaLabel={labels.checklist.progress(doneCount, total)}
        size="sm"
        value={percent}
      />

      {shown.length > 0 ? (
        <ol
          aria-labelledby={title ? titleId : undefined}
          className={list()}
          data-testid="checklist-list"
          id={listId}
        >
          {shown.map((item) => (
            <ChecklistRow
              doneLabel={labels.checklist.done}
              item={item}
              key={item.id}
              state={stateOf(item, nextId)}
            />
          ))}
        </ol>
      ) : null}

      {collapsible && doneCount > 0 ? (
        <button
          aria-controls={shown.length > 0 ? listId : undefined}
          aria-expanded={expanded}
          className={toggle()}
          data-testid="checklist-toggle"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded
            ? labels.checklist.hideCompleted
            : labels.checklist.showCompleted(doneCount)}
        </button>
      ) : null}
    </div>
  )
}
