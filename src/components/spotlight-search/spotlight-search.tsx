import { Dialog } from '@base-ui/react/dialog'
import {
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
import { Search } from '@/internal/icons'

import type {
  SpotlightSearchGroup,
  SpotlightSearchItem,
  SpotlightSearchProps,
} from './spotlight-search.types'

export const styles = tv({
  slots: {
    backdrop: [
      'spotlight-search-backdrop fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-sm',
      'data-open:fade-in-0 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out',
    ],
    empty: 'spotlight-search-empty py-2',
    field:
      'spotlight-search-field flex shrink-0 items-center gap-2.5 border-border border-b px-3.5',
    footer: [
      'spotlight-search-footer flex items-center gap-2 border-border border-t px-3 py-2',
      'text-muted-foreground text-xs',
    ],
    group: 'spotlight-search-group mb-1 last:mb-0',
    groupLabel:
      'spotlight-search-group-label px-2 py-1.5 font-medium text-muted-foreground text-xs',
    input: [
      'spotlight-search-input h-12 w-full bg-transparent text-sm outline-none',
      'placeholder:text-muted-foreground',
    ],
    item: [
      'spotlight-search-item flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2',
      'select-none text-left text-sm outline-none',
      'data-active:bg-accent data-active:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
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
      'border-border bg-muted px-1 font-medium font-mono text-[10px] text-muted-foreground',
    ],
    list: 'spotlight-search-list max-h-80 overflow-y-auto p-2',
    popup: [
      'spotlight-search-popup',
      'fixed top-[14vh] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl',
      '-translate-x-1/2 flex-col overflow-hidden rounded-xl bg-popover',
      'text-popover-foreground shadow-2xl outline-none ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    root: 'spotlight-search flex w-full flex-col overflow-hidden',
  },
})

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
function useShortcut(enabled: boolean, toggle: () => void) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) {
        return
      }

      event.preventDefault()
      toggle()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled, toggle])
}

export function SpotlightSearch({
  ariaLabel,
  defaultOpen,
  emptySection,
  footer,
  groups,
  inline,
  loading,
  onOpenChange,
  onSearchChange,
  open,
  placeholder,
  searchValue,
  shortcut,
}: SpotlightSearchProps) {
  const labels = useLabels()
  const portalContainer = usePortalContainer()
  const listboxId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const isOpenControlled = open !== undefined
  const visible = inline ? true : (open ?? internalOpen)
  const isSearchControlled = searchValue !== undefined
  const currentQuery = isSearchControlled ? searchValue : query

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(next)
      }

      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange],
  )

  const toggle = useCallback(() => {
    setOpen(!(open ?? internalOpen))
  }, [internalOpen, open, setOpen])

  useShortcut(Boolean(shortcut) && !inline, toggle)

  /**
   * A server that filtered already must not be filtered again here: the rows it
   * returned are the answer, and re-running a local `includes` over them makes
   * results vanish for reasons the reader cannot see.
   */
  const visibleGroups = useMemo(
    () => (onSearchChange ? groups : filterGroups(groups, currentQuery)),
    [currentQuery, groups, onSearchChange],
  )

  const flat = useMemo(
    () => visibleGroups.flatMap((group) => group.items),
    [visibleGroups],
  )

  const runnable = useMemo(() => flat.filter((item) => !item.disabled), [flat])

  /** A query that narrows the list must not leave the selection past its end. */
  useEffect(() => {
    setActive(0)
  }, [])

  useEffect(() => {
    setActive((current) => (current >= runnable.length ? 0 : current))
  }, [runnable.length])

  useEffect(() => {
    if (!visible) {
      setActive(0)
      if (!isSearchControlled) {
        setQuery('')
      }
    }
  }, [isSearchControlled, visible])

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [])

  const select = useCallback(
    (item: SpotlightSearchItem) => {
      if (item.disabled) {
        return
      }

      item.onSelect?.()

      if (!item.keepOpen && !inline) {
        setOpen(false)
      }
    },
    [inline, setOpen],
  )

  const move = (delta: number) => {
    if (runnable.length === 0) {
      return
    }

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
    if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setActive(Math.max(runnable.length - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const item = runnable[active]
      if (item) {
        select(item)
      }
      return
    }
    if (event.key === 'Escape' && !inline) {
      event.preventDefault()
      setOpen(false)
    }
  }

  const {
    backdrop,
    empty,
    field,
    footer: footerSlot,
    group: groupSlot,
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
    root,
  } = styles()

  const activeItem = runnable[active]

  const palette = (
    <div className={root()} data-testid="spotlight-search">
      <div className={field()} data-testid="spotlight-search-field">
        {loading ? (
          <Loader decorative size="sm" />
        ) : (
          <Search className="spotlight-search-field-icon size-4 shrink-0 text-muted-foreground" />
        )}
        <input
          aria-activedescendant={
            activeItem ? `${listboxId}-${activeItem.id}` : undefined
          }
          aria-controls={listboxId}
          aria-expanded
          aria-label={ariaLabel}
          autoComplete="off"
          className={inputSlot()}
          data-testid="spotlight-search-input"
          onChange={(event) => {
            if (!isSearchControlled) {
              setQuery(event.target.value)
            }
            setActive(0)
            onSearchChange?.(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          value={currentQuery}
        />
        {!inline && (
          <kbd className={keySlot()} data-testid="spotlight-search-escape">
            ESC
          </kbd>
        )}
      </div>

      <div
        className={list()}
        data-testid="spotlight-search-list"
        id={listboxId}
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
              {group.heading ? (
                <div
                  className={groupLabel()}
                  data-testid="spotlight-search-group-label"
                >
                  {group.heading}
                </div>
              ) : null}
              {group.items.map((item) => {
                const isActive = activeItem?.id === item.id

                return (
                  <div
                    aria-disabled={item.disabled || undefined}
                    aria-selected={isActive}
                    className={itemSlot()}
                    data-active={isActive || undefined}
                    data-disabled={item.disabled || undefined}
                    data-testid="spotlight-search-item"
                    id={`${listboxId}-${item.id}`}
                    key={item.id}
                    onClick={() => select(item)}
                    onMouseMove={() => {
                      const index = runnable.findIndex(
                        (candidate) => candidate.id === item.id,
                      )
                      if (index >= 0) {
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
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {footer ? (
        <div className={footerSlot()} data-testid="spotlight-search-footer">
          {footer}
        </div>
      ) : null}
    </div>
  )

  if (inline) {
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
