import { Dialog } from '@base-ui/react/dialog'
import { Popover } from '@base-ui/react/popover'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { EmptyState } from '@/components/empty-state'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { usePortalContainer } from '@/components/portal-provider'
import { tooltipStyles } from '@/components/tooltip'
import { Search } from '@/internal/icons'
import { axes } from '@/support/utils'

import type {
  SpotlightSearchGroup,
  SpotlightSearchItem,
  SpotlightSearchProps,
} from './spotlight-search.types'

export const styles = tv({
  defaultVariants: {
    variant: 'dialog',
    width: 'md',
  },
  slots: {
    anchor: 'spotlight-search-anchor relative max-w-full',
    backdrop: [
      'spotlight-search-backdrop fixed inset-0 isolate z-50 bg-overlay backdrop-blur-overlay',
      'data-open:fade-in-0 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out',
      'motion-reduce:animate-none',
    ],
    dropdown: [
      'spotlight-search-dropdown flex w-(--anchor-width) min-w-80 max-w-(--available-width)',
      'flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground',
      'shadow-md outline-hidden ring-1 ring-foreground/10 origin-(--transform-origin)',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
      'motion-reduce:animate-none',
    ],
    empty: 'spotlight-search-empty py-2',
    field:
      'spotlight-search-field flex shrink-0 items-center gap-2.5 border-border border-b px-3.5',
    footer: [
      'spotlight-search-footer flex items-center gap-2 border-border border-t px-3 py-2',
      'text-muted-foreground text-xs',
    ],
    group: 'spotlight-search-group mb-1 last:mb-0',
    groupAction:
      'spotlight-search-group-action flex shrink-0 items-center font-normal',
    groupHeading: 'spotlight-search-group-heading min-w-0 truncate',
    groupLabel: [
      'spotlight-search-group-label flex items-center justify-between gap-2 px-2 py-1.5',
      'font-medium text-muted-foreground text-xs',
    ],
    input: [
      'spotlight-search-input h-12 w-full bg-transparent text-sm outline-none',
      'placeholder:text-muted-foreground',
    ],
    item: [
      'spotlight-search-item flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2',
      'select-none text-left text-sm outline-none',
      'data-active:bg-accent data-active:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      // Blocked with a reason: still hovered and walked to, so it can say why.
      'data-blocked:cursor-not-allowed data-blocked:opacity-50',
    ],
    itemBody: 'spotlight-search-item-body flex min-w-0 flex-1 flex-col',
    itemDescription:
      'spotlight-search-item-description truncate text-muted-foreground text-xs',
    itemIcon:
      'spotlight-search-item-icon flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4',
    itemLabel: 'spotlight-search-item-label truncate',
    itemShortcut:
      'spotlight-search-item-shortcut flex shrink-0 items-center gap-1',
    key: [
      'spotlight-search-key inline-flex h-5 min-w-5 items-center justify-center rounded border',
      'border-border bg-muted px-1 font-medium font-mono text-2xs text-muted-foreground',
    ],
    list: 'spotlight-search-list max-h-80 overflow-y-auto p-2',
    popup: [
      'spotlight-search-popup',
      'fixed top-[14vh] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl',
      '-translate-x-1/2 flex-col overflow-hidden rounded-xl bg-popover',
      'text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
      'motion-reduce:animate-none',
    ],
    positioner: 'spotlight-search-positioner isolate z-50',
    root: 'spotlight-search flex w-full flex-col overflow-hidden',
  },
  variants: {
    variant: {
      dialog: {},
      inline: {},
      popover: {
        field: [
          'h-9 w-full gap-2 rounded-lg border border-input bg-transparent px-2.5',
          'transition-colors dark:bg-input/30',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        ],
        input: 'h-8',
      },
    },
    width: {
      full: { anchor: 'w-full' },
      lg: { anchor: 'w-96' },
      md: { anchor: 'w-72' },
      sm: { anchor: 'w-56' },
    },
  },
})

const { arrow: reasonArrow, popup: reasonPopup } = tooltipStyles()

/** Everything a row can be found by, folded into one haystack. */
function haystack(item: SpotlightSearchItem): string {
  return [item.label, item.description, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function filterGroups(
  groups: SpotlightSearchGroup[],
  query: string,
): SpotlightSearchGroup[] {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return groups
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => haystack(item).includes(needle)),
    }))
    .filter((group) => group.items.length > 0)
}

function Keycaps({ keys, className }: { keys: string[]; className: string }) {
  return (
    <>
      {keys.map((value) => (
        <kbd className={className} key={value}>
          {value}
        </kbd>
      ))}
    </>
  )
}

/** Binds Cmd+K / Ctrl+K while the palette wants it. */
function useShortcut(enabled: boolean, onShortcut: () => void) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) {
        return
      }

      event.preventDefault()
      onShortcut()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled, onShortcut])
}

/** Whether an event started inside the element — the field owns its own keys and clicks. */
function startedIn(element: HTMLElement | null, event: Event | undefined) {
  const target = event?.target

  return Boolean(element && target instanceof Node && element.contains(target))
}

export function SpotlightSearch({
  ariaLabel,
  defaultOpen,
  defaultSearchValue,
  emptyQueryGroups,
  emptySection,
  footer,
  groups,
  loading,
  onOpenChange,
  onSearchChange,
  open,
  placeholder,
  searchValue,
  shortcut,
  variant = 'dialog',
  width = 'md',
}: SpotlightSearchProps) {
  const labels = useLabels()
  const portalContainer = usePortalContainer()
  const listboxId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isInline = variant === 'inline'
  const isPopover = variant === 'popover'

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [query, setQuery] = useState(defaultSearchValue ?? '')
  const [active, setActive] = useState(0)

  const isOpenControlled = open !== undefined
  const visible = isInline ? true : (open ?? internalOpen)
  const isSearchControlled = searchValue !== undefined
  const currentQuery = isSearchControlled ? searchValue : query
  const isQueryEmpty = currentQuery.trim() === ''

  /**
   * The same close can arrive twice in one keystroke — the field's own Escape
   * and the popover's dismissal — and the owner must hear it once. The ref is
   * written before React re-renders, so the second caller sees the new value.
   */
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === visibleRef.current) {
        return
      }

      visibleRef.current = next

      if (!isOpenControlled) {
        setInternalOpen(next)
      }

      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange],
  )

  const onShortcut = useCallback(() => {
    if (isPopover) {
      inputRef.current?.focus()
      return
    }

    setOpen(!visibleRef.current)
  }, [isPopover, setOpen])

  useShortcut(Boolean(shortcut) && !isInline, onShortcut)

  /**
   * A server that filtered already must not be filtered again here: the rows it
   * returned are the answer, and re-running a local `includes` over them makes
   * results vanish for reasons the reader cannot see.
   */
  const visibleGroups = useMemo(() => {
    if (isQueryEmpty && emptyQueryGroups) {
      return emptyQueryGroups
    }

    return onSearchChange ? groups : filterGroups(groups, currentQuery)
  }, [currentQuery, emptyQueryGroups, groups, isQueryEmpty, onSearchChange])

  const flat = useMemo(
    () => visibleGroups.flatMap((group) => group.items),
    [visibleGroups],
  )

  /**
   * The rows the arrows walk. A row blocked with a reason stays in the walk —
   * a row nobody can reach cannot say why it is blocked — while a plain
   * `disabled` row is skipped as before.
   */
  const runnable = useMemo(
    () => flat.filter((item) => !item.disabled || item.disabledReason),
    [flat],
  )

  useEffect(() => {
    setActive((current) => (current >= runnable.length ? 0 : current))
  }, [runnable.length])

  /**
   * Closing the dialog forgets the query, so the next Cmd+K starts clean. The
   * header field keeps what was typed: it is still on screen, and clearing
   * text the reader can see is a surprise.
   */
  useEffect(() => {
    if (!visible) {
      setActive(0)
      if (!isSearchControlled && variant === 'dialog') {
        setQuery('')
      }
    }
  }, [isSearchControlled, variant, visible])

  // Escape hides the active row's reason until another row becomes active
  // (WCAG 1.4.13) — in place, where Escape closes nothing else.
  const [dismissedReason, setDismissedReason] = useState<string | null>(null)
  // Inline, the list is always on screen and the first row is active from the
  // start, so its reason waits for the reader: the field holding focus or the
  // pointer on that very row — not anywhere in the list, or entering over a
  // heading would pop a reason up rows away from the pointer. Opened as a
  // dialog or a dropdown, the palette is the interaction already.
  const [fieldFocused, setFieldFocused] = useState(false)
  const [pointerRow, setPointerRow] = useState<string | null>(null)
  const activeItem = visible ? runnable[active] : undefined
  const engaged =
    !isInline ||
    fieldFocused ||
    (pointerRow !== null && pointerRow === activeItem?.id)

  const activeReason =
    engaged && activeItem?.disabledReason && dismissedReason !== activeItem.id
      ? activeItem.disabledReason
      : undefined

  const select = useCallback(
    (item: SpotlightSearchItem) => {
      if (item.disabled || item.disabledReason) {
        return
      }

      item.onSelect?.()

      if (!item.keepOpen && !isInline) {
        setOpen(false)
      }
    },
    [isInline, setOpen],
  )

  const changeQuery = (next: string) => {
    if (!isSearchControlled) {
      setQuery(next)
    }
    setActive(0)
    onSearchChange?.(next)
  }

  const move = (delta: number) => {
    if (runnable.length === 0) {
      return
    }

    setDismissedReason(null)
    setActive((current) => {
      const next = (current + delta + runnable.length) % runnable.length
      requestAnimationFrame(() => {
        listRef.current
          ?.querySelector('[data-active="true"]')
          ?.scrollIntoView({ block: 'nearest' })
      })
      return next
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isPopover && !visible && event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
      return
    }
    if (event.key === 'Home' && visible) {
      event.preventDefault()
      setActive(0)
      return
    }
    if (event.key === 'End' && visible) {
      event.preventDefault()
      setActive(Math.max(runnable.length - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      if (!visible) {
        return
      }
      event.preventDefault()
      const item = runnable[active]
      if (item) {
        select(item)
      }
      return
    }
    if (event.key === 'Escape' && isInline && activeItem?.disabledReason) {
      setDismissedReason(activeItem.id)
      return
    }
    if (event.key === 'Escape' && !isInline) {
      event.preventDefault()
      if (isPopover && !visible) {
        changeQuery('')
        return
      }
      setOpen(false)
    }
  }

  /** The header field opens on focus only when there is something to show. */
  const handleFocus = () => {
    setFieldFocused(true)
    if (isPopover && (!isQueryEmpty || (emptyQueryGroups?.length ?? 0) > 0)) {
      setOpen(true)
    }
  }

  /** Tabbing away from the header field closes its results. */
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFieldFocused(false)
    if (!isPopover) {
      return
    }

    const next = event.relatedTarget
    if (next instanceof Node && dropdownRef.current?.contains(next)) {
      return
    }

    setOpen(false)
  }

  const {
    anchor,
    backdrop,
    dropdown,
    empty,
    field,
    footer: footerSlot,
    group: groupSlot,
    groupAction,
    groupHeading,
    groupLabel,
    input: inputSlot,
    item: itemSlot,
    itemBody,
    itemDescription,
    itemIcon,
    itemLabel,
    itemShortcut,
    key: keySlot,
    list,
    popup,
    positioner,
    root,
  } = styles({ variant, width })

  const fieldNode = (
    <div className={field()} data-testid="spotlight-search-field">
      {loading ? (
        <Loader decorative size="sm" />
      ) : (
        <Search
          aria-hidden
          className="spotlight-search-field-icon size-4 shrink-0 text-muted-foreground"
        />
      )}
      <input
        aria-activedescendant={
          activeItem ? `${listboxId}-${activeItem.id}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={visible ? listboxId : undefined}
        aria-expanded={visible}
        aria-label={ariaLabel}
        autoComplete="off"
        className={inputSlot()}
        data-testid="spotlight-search-input"
        onBlur={handleBlur}
        onChange={(event) => {
          changeQuery(event.target.value)
          if (isPopover) {
            setOpen(true)
          }
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        role="combobox"
        value={currentQuery}
      />
      {variant === 'dialog' && (
        <kbd className={keySlot()} data-testid="spotlight-search-escape">
          ESC
        </kbd>
      )}
    </div>
  )

  // A listbox must be named. The palette's own name when it has one, else what
  // the field asks for, else the results label.
  const listLabel = ariaLabel || placeholder || labels.spotlightSearch.results

  const listNode = (
    // Pressing a row must not pull focus out of the field: the field is where
    // the arrows, Enter and Escape are read, and the click still fires.
    <div
      aria-label={listLabel}
      className={list()}
      data-testid="spotlight-search-list"
      id={listboxId}
      onMouseDown={(event) => event.preventDefault()}
      onMouseLeave={() => setPointerRow(null)}
      ref={listRef}
      role="listbox"
    >
      {flat.length === 0 ? (
        <div className={empty()} data-testid="spotlight-search-empty">
          {emptySection ?? <EmptyState size="sm" title={labels.list.empty} />}
        </div>
      ) : (
        visibleGroups.map((group) => (
          <div
            className={groupSlot()}
            key={group.id ?? group.heading ?? '__default'}
            role="presentation"
          >
            {group.heading || group.action ? (
              <div
                className={groupLabel()}
                data-testid="spotlight-search-group-label"
              >
                <span className={groupHeading()}>{group.heading}</span>
                {group.action ? (
                  <span
                    className={groupAction()}
                    data-testid="spotlight-search-group-action"
                  >
                    {group.action}
                  </span>
                ) : null}
              </div>
            ) : null}
            {group.items.map((item) => {
              const isActive = activeItem?.id === item.id

              return (
                <div
                  aria-describedby={
                    item.disabledReason
                      ? `${listboxId}-${item.id}-reason`
                      : undefined
                  }
                  aria-disabled={
                    item.disabled || item.disabledReason ? true : undefined
                  }
                  aria-selected={isActive}
                  className={itemSlot()}
                  data-active={isActive || undefined}
                  data-blocked={
                    item.disabledReason && !item.disabled ? '' : undefined
                  }
                  data-disabled={
                    item.disabled && !item.disabledReason ? '' : undefined
                  }
                  data-testid="spotlight-search-item"
                  id={`${listboxId}-${item.id}`}
                  key={item.id}
                  onClick={() => select(item)}
                  // Arriving on a row re-arms a reason Escape hid, even on the
                  // row that was already active: the pointer is a new reader.
                  onMouseEnter={() => {
                    setPointerRow(item.id)
                    if (dismissedReason === item.id) {
                      setDismissedReason(null)
                    }
                  }}
                  onMouseMove={() => {
                    const index = runnable.findIndex(
                      (candidate) => candidate.id === item.id,
                    )
                    if (index >= 0 && index !== active) {
                      setDismissedReason(null)
                      setActive(index)
                    }
                  }}
                  role="option"
                  tabIndex={-1}
                >
                  {item.icon ? (
                    <span className={itemIcon()}>{item.icon}</span>
                  ) : null}
                  <span className={itemBody()}>
                    <span className={itemLabel()}>{item.label}</span>
                    {item.description ? (
                      <span className={itemDescription()}>
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {item.shortcut ? (
                    <span className={itemShortcut()}>
                      <Keycaps className={keySlot()} keys={item.shortcut} />
                    </span>
                  ) : null}
                  {item.disabledReason ? (
                    <span hidden id={`${listboxId}-${item.id}-reason`}>
                      {item.disabledReason}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )

  /**
   * The active row's reason, beside it. Focus never leaves the field (the rows
   * are walked by aria-activedescendant), so the shared DisabledReason — which
   * opens on its own focus and hover — cannot follow the walk; this is the same
   * popup, opened by the active row instead. Hover makes a row active, so the
   * pointer reaches it too; the hidden text above is what is announced.
   */
  const reasonNode = activeReason ? (
    <TooltipPrimitive.Root open>
      <TooltipPrimitive.Portal container={portalContainer}>
        <TooltipPrimitive.Positioner
          anchor={() =>
            activeItem
              ? document.getElementById(`${listboxId}-${activeItem.id}`)
              : null
          }
          className="tooltip-positioner isolate z-50"
          side="right"
          sideOffset={4}
        >
          <TooltipPrimitive.Popup
            aria-hidden
            className={reasonPopup()}
            data-testid="disabled-reason-popup"
          >
            {activeReason}
            <TooltipPrimitive.Arrow className={reasonArrow()} />
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  ) : null

  const footerNode = footer ? (
    <div className={footerSlot()} data-testid="spotlight-search-footer">
      {footer}
    </div>
  ) : null

  if (isPopover) {
    return (
      <Popover.Root
        onOpenChange={(next, details) => {
          // The field is outside the popup, so to Base UI a click or an Escape
          // in it looks like a dismissal. The field handles its own.
          if (!next && startedIn(anchorRef.current, details.event)) {
            return
          }
          setOpen(next)
        }}
        open={visible}
      >
        <div
          className={anchor()}
          data-open={visible || undefined}
          data-testid="spotlight-search-anchor"
          ref={anchorRef}
        >
          {fieldNode}
        </div>
        <Popover.Portal container={portalContainer}>
          <Popover.Positioner
            align="start"
            anchor={anchorRef}
            className={positioner()}
            side="bottom"
            sideOffset={4}
          >
            <Popover.Popup
              aria-label={ariaLabel}
              className={dropdown()}
              data-testid="spotlight-search-dropdown"
              finalFocus={false}
              initialFocus={false}
              ref={dropdownRef}
            >
              <div
                className={root()}
                {...axes(styles, {
                  variant,
                })}
                data-testid="spotlight-search"
              >
                {listNode}
                {reasonNode}
                {footerNode}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    )
  }

  const palette = (
    <div
      className={root()}
      {...axes(styles, {
        variant,
      })}
      data-testid="spotlight-search"
    >
      {fieldNode}
      {listNode}
      {reasonNode}
      {footerNode}
    </div>
  )

  if (isInline) {
    return palette
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={visible}>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Backdrop
          className={backdrop()}
          data-testid="spotlight-search-backdrop"
        />
        <Dialog.Popup
          aria-label={ariaLabel}
          className={popup()}
          data-testid="spotlight-search-popup"
          initialFocus={inputRef}
        >
          {palette}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
