import {
  type PropsWithChildren,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { useFilterBar } from '@/components/filter-bar/filter-bar.context'
import { useLabels } from '@/components/labels-provider'
import { Popover } from '@/components/popover'
import {
  DisabledReason,
  type DisabledReasonA11y,
} from '@/components/tooltip/tooltip.composed'
import { Plus, X } from '@/internal/icons'

import type { FilterChipProps } from './filter-chip.types'

const styles = tv({
  defaultVariants: {
    active: false,
    disabled: false,
    interactive: false,
    removable: false,
  },
  slots: {
    root: [
      'filter-chip-root inline-flex h-8 shrink-0 items-center rounded-full border',
      'whitespace-nowrap text-(length:--text-compact) transition-colors',
    ],
    body: [
      'filter-chip-body inline-flex h-full items-center gap-1 rounded-full px-3',
      '[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
    ],
    icon: 'filter-chip-icon',
    label: 'filter-chip-label text-muted-foreground',
    value: 'filter-chip-value font-medium text-primary',
    remove: [
      'filter-chip-remove ml-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full',
      'text-muted-foreground outline-none transition-colors',
      'hover:bg-muted hover:text-foreground',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
      '[&_svg]:pointer-events-none [&_svg]:size-3.5',
    ],
  },
  variants: {
    active: {
      false: {
        root: 'border-border border-dashed',
      },
      true: {
        root: 'border-border bg-muted/40',
      },
    },
    disabled: {
      true: {
        root: 'opacity-50',
      },
    },
    removable: {
      true: {
        // The × takes the leading place the "+" had, so the body loses the
        // padding on that side to keep the pill's inner spacing even.
        body: 'pl-1.5',
      },
    },
    interactive: {
      true: {
        body: [
          'cursor-pointer outline-none',
          'hover:bg-muted',
          'focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent',
        ],
      },
    },
  },
})

function FilterChip({
  children,
  defaultOpen,
  disabled = false,
  disabledReason,
  label,
  onOpenChange,
  onRemove,
  open,
  value,
}: PropsWithChildren<FilterChipProps>) {
  const labels = useLabels()
  const bar = useFilterBar()
  const id = useId()
  const bodyRef = useRef<HTMLButtonElement>(null)
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false)

  // A reason blocks the picker and the × like `disabled` but keeps both
  // focusable, so each can say why; with both set, the reason wins.
  const blocked = Boolean(disabledReason)
  const inert = disabled || blocked
  const active = value !== undefined && value !== null
  const interactive = children !== undefined && children !== null
  const removable = active && onRemove !== undefined
  const isOpen = !inert && (open ?? innerOpen)

  // The bar offers Clear filters from what its chips report, so a chip that
  // leaves the row, or is emptied, stops counting on its own. A blocked chip
  // does not count either: its value is locked, and Clear filters must not
  // offer to wipe what the chip itself refuses to clear.
  const clearable = active && !blocked

  useEffect(() => {
    bar?.report(id, clearable)

    return () => bar?.report(id, false)
  }, [bar, id, clearable])

  const {
    body,
    icon,
    label: labelClass,
    remove,
    root,
    value: valueClass,
  } = styles({
    active,
    disabled: inert,
    interactive,
    removable,
  })

  function changeOpen(next: boolean) {
    if (open === undefined) {
      setInnerOpen(next)
    }
    onOpenChange?.(next)
  }

  function clear() {
    // The × leaves with the value it clears. Focus is handed to the chip's
    // body first, or it would fall to the page.
    bodyRef.current?.focus()
    onRemove?.()
  }

  const content = (
    <>
      {active ? null : (
        <Plus className={icon()} data-testid="filter-chip-add" />
      )}
      {active ? (
        <>
          <span className={labelClass()}>
            {label}
            {labels.filterChip.separator}
          </span>{' '}
          <span className={valueClass()}>{value}</span>
        </>
      ) : (
        <span className={labelClass()}>{label}</span>
      )}
    </>
  )

  function renderBody() {
    if (!interactive) {
      return (
        <span className={body()} data-testid="filter-chip-body">
          {content}
        </span>
      )
    }

    const trigger = (a11y: DisabledReasonA11y) => (
      <button
        aria-disabled={blocked || undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={body()}
        data-filter-chip-trigger=""
        data-testid="filter-chip-trigger"
        disabled={disabled && !blocked}
        ref={bodyRef}
        type="button"
        {...a11y}
      >
        {content}
      </button>
    )

    // One DisabledReason around every state, so a reason that arrives or
    // leaves on the focused chip only remounts the trigger, and hands focus
    // back. A blocked chip has no picker to open, so it is not wrapped in
    // one: the popover's trigger would still answer a click on its padding.
    return (
      <DisabledReason reason={disabledReason}>
        {(a11y) =>
          inert ? (
            trigger(a11y)
          ) : (
            <Popover
              align="start"
              asChild
              content={children}
              onOpenChange={changeOpen}
              open={isOpen}
            >
              {trigger(a11y)}
            </Popover>
          )
        }
      </DisabledReason>
    )
  }

  return (
    <span
      className={root()}
      data-state={active ? 'active' : 'suggested'}
      data-testid="filter-chip"
    >
      {removable ? (
        <DisabledReason reason={disabledReason}>
          {(a11y) => (
            <button
              aria-disabled={blocked || undefined}
              aria-label={labels.filterChip.remove(label)}
              className={remove()}
              data-testid="filter-chip-remove"
              disabled={disabled && !blocked}
              onClick={blocked ? undefined : clear}
              type="button"
              {...a11y}
            >
              <X />
            </button>
          )}
        </DisabledReason>
      ) : null}
      {renderBody()}
    </span>
  )
}

export { FilterChip }
