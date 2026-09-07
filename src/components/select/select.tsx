import { Popover } from '@base-ui/react/popover'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { useDebounceCallback } from '@turystack/react-hooks'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { DEBOUNCE_MS } from '@/components/input/input.shared'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { usePortalContainer } from '@/components/portal-provider'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  X,
} from '@/internal/icons'

import type {
  SelectCreatableOptions,
  SelectInfiniteProps,
  SelectProps,
} from './select.types'

const SELECT_POPUP_OFFSET = 8

const select = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    create: [
      'select-create flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2',
      'select-none text-left text-sm outline-none',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:bg-accent focus-visible:text-accent-foreground',
      'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    createLabel: 'select-create-label min-w-0 flex-1 truncate',
    checkbox: [
      'select-checkbox flex size-4 items-center justify-center rounded border border-input transition-colors',
      'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
    ],
    clearTrigger: [
      'select-clear-trigger -mr-1 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded',
      'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
    ],
    empty: 'select-empty px-3 py-4 text-center text-muted-foreground text-sm',
    groupLabel:
      'select-group-label px-2.5 py-1.5 font-medium text-muted-foreground text-xs',
    item: [
      'select-item relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md py-2 pr-8 pl-2.5',
      'select-none text-sm outline-none',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:bg-accent focus-visible:text-accent-foreground',
      'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
      'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      'data-current:font-medium',
    ],
    itemCheck:
      'select-item-check pointer-events-none absolute right-2 flex size-4 items-center justify-center',
    list: 'select-list min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1.5',
    multipleItem: [
      'select-multiple-item relative my-1 flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2',
      'select-none text-sm outline-none',
      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
    ],
    popup: [
      'select-popup relative isolate z-50 flex max-h-64 w-(--anchor-width) min-w-36 flex-col',
      'origin-(--transform-origin) overflow-hidden rounded-lg',
      'bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    search: [
      'select-search flex shrink-0 items-center border-input border-b bg-popover px-2',
    ],
    searchInput: [
      'select-search-input w-full bg-transparent py-2 text-sm outline-none',
      'placeholder:text-muted-foreground',
    ],
    sentinel: 'select-sentinel h-1',
    trigger: [
      'select-trigger flex w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-lg',
      'whitespace-nowrap border border-input bg-transparent px-2.5 text-sm',
      'select-none outline-none transition-colors',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50',
      'disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'data-placeholder:text-muted-foreground',
      'dark:bg-input/30 dark:disabled:bg-input/80',
    ],
    triggerValue:
      'select-trigger-value flex flex-1 items-center gap-2 overflow-hidden text-left',
  },
  variants: {
    size: {
      lg: {
        trigger: 'h-11',
      },
      md: {
        trigger: 'h-10',
      },
      sm: {
        trigger: 'h-9',
      },
    },
    variant: {
      default: {},
      ghost: {
        trigger:
          'border-transparent bg-transparent focus-visible:border-transparent disabled:bg-transparent data-popup-open:border-transparent dark:bg-transparent dark:disabled:bg-transparent',
      },
    },
  },
})

function getLabel<T>(
  option: T,
  extractor: keyof T | ((o: T) => string),
): string {
  return typeof extractor === 'function'
    ? extractor(option)
    : String(option[extractor as keyof T])
}

function getValue<T, O>(option: T, extractor: keyof T | ((o: T) => O)): O {
  return typeof extractor === 'function'
    ? extractor(option)
    : (option[extractor as keyof T] as unknown as O)
}

function toKey<O>(val: O): string {
  if (val === null || val === undefined) {
    return ''
  }
  return typeof val === 'string' ? val : JSON.stringify(val)
}

function useSearchChange(
  onSearchChange: ((query: string) => void) | undefined,
  debounce: boolean | undefined,
) {
  const emitDebounced = useDebounceCallback(
    (query: string) => onSearchChange?.(query),
    DEBOUNCE_MS,
  )

  return useCallback(
    (query: string) => {
      if (!onSearchChange) {
        return
      }
      if (!debounce) {
        onSearchChange(query)
        return
      }
      emitDebounced(query)
    },
    [debounce, emitDebounced, onSearchChange],
  )
}

/**
 * Whether the query on screen is worth offering as a new option, and what
 * happens when the offer is taken.
 *
 * The offer is withheld while an option already carries that label, because a
 * list that offers to create the row sitting right under it is asking the
 * reader to make a duplicate. `allowDuplicates` is for the caller who really
 * does keep two things of the same name.
 */
function useCreatable<T>({
  creatable,
  creatableOptions,
  labelOf,
  options,
  query,
  onCreated,
}: {
  creatable: boolean | undefined
  creatableOptions: SelectCreatableOptions | undefined
  labelOf: (option: T) => string
  options: T[]
  query: string
  onCreated: () => void
}) {
  const [creating, setCreating] = useState(false)
  const trimmed = query.trim()
  const minLength = creatableOptions?.minLength ?? 1

  const taken = options.some(
    (option) => labelOf(option).toLowerCase() === trimmed.toLowerCase(),
  )

  const offered =
    Boolean(creatable) &&
    trimmed.length >= minLength &&
    trimmed.length > 0 &&
    (creatableOptions?.allowDuplicates === true || !taken)

  const create = async () => {
    if (creating) {
      return
    }

    setCreating(true)
    try {
      await Promise.resolve(creatableOptions?.onCreate?.(trimmed))
    } finally {
      setCreating(false)
    }
    onCreated()
  }

  return {
    create,
    creating,
    offered,
    position: creatableOptions?.position ?? 'top',
    query: trimmed,
  }
}

function SelectCreateRow({
  className,
  labelClassName,
  creating,
  onCreate,
  query,
  text,
}: {
  className: string
  labelClassName: string
  creating: boolean
  onCreate: () => void
  query: string
  text: (query: string) => string
}) {
  return (
    <button
      className={className}
      data-testid="select-create"
      disabled={creating}
      onClick={onCreate}
      type="button"
    >
      {creating ? (
        <Loader decorative size="sm" />
      ) : (
        <Plus className="select-create-icon size-4 shrink-0 text-muted-foreground" />
      )}
      <span className={labelClassName}>{text(query)}</span>
    </button>
  )
}

/**
 * Watches the sentinel at the bottom of the list and asks for the next page.
 *
 * A **ref callback**, not a ref object read from an effect. The list lives
 * inside a popup that is not in the DOM until it opens, and the non-searchable
 * Select keeps its open state inside Base UI — opening it re-renders nothing
 * here. An effect therefore ran exactly once, on mount, with the popup shut and
 * the sentinel not yet created, read `null`, and returned. The observer was
 * never attached, so `onLoadMore` never fired and `loadingMore` never turned
 * true: infinite scroll looked wired up and did nothing.
 *
 * React calls a ref callback when the node mounts, whatever caused it, which is
 * the one signal that does not depend on this component re-rendering.
 */
function useInfiniteSentinel(infinite: SelectInfiniteProps | undefined) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  /**
   * Read through a ref so the observer is built once per sentinel rather than
   * once per render — callers pass `infinite` as an object literal, so its
   * identity changes constantly while its meaning does not.
   */
  const latest = useRef(infinite)
  latest.current = infinite

  useEffect(
    () => () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    },
    [],
  )

  return useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null

    if (!node || !latest.current?.onLoadMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const state = latest.current

        if (entries[0].isIntersecting && state?.hasMore && !state.loadingMore) {
          state.onLoadMore?.()
        }
      },
      {
        threshold: 0.1,
      },
    )

    observer.observe(node)
    observerRef.current = observer
  }, [])
}

function SelectLoadingMore({ text }: { text?: string }) {
  return (
    <div
      className="select-loading-more flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm"
      data-testid="select-loading-more"
    >
      <Loader size="sm" />
      {text}
    </div>
  )
}

type WithoutSelectData<P> = P extends unknown
  ? Omit<P, 'options' | 'outcome'>
  : never

type ResolvedSelectProps<T, I, O> = WithoutSelectData<SelectProps<T, I, O>> & {
  options: T[]
}

/**
 * The five states of a read collapse into the props the field already has.
 *
 * A failed read deliberately does not disable the trigger: a disabled control
 * fires no pointer events, so the reason inside the popup would be
 * unreachable, which is worse than no reason at all.
 */
function useSelectData<T, I, O>(
  props: SelectProps<T, I, O>,
): ResolvedSelectProps<T, I, O> {
  const labels = useLabels()
  const { options, outcome, ...rest } = props
  const resolve = (extra: Record<string, unknown>) =>
    ({ ...rest, ...extra }) as ResolvedSelectProps<T, I, O>

  if (!outcome) {
    return resolve({
      options: options ?? [],
    })
  }

  if (outcome.status === 'success') {
    return resolve({
      loading: rest.loading || outcome.refreshing,
      options: outcome.data,
    })
  }

  if (outcome.status === 'denied') {
    return resolve({
      emptySection: rest.deniedSection ?? (
        <EmptyState size="sm" title={outcome.reason} />
      ),
      options: [],
    })
  }

  if (outcome.status === 'error') {
    return resolve({
      emptySection: rest.errorSection ?? (
        <EmptyState
          action={
            <Button onClick={outcome.retry} type="button" variant="outline">
              {labels.common.retry}
            </Button>
          }
          size="sm"
          title={labels.select.error}
        />
      ),
      options: [],
    })
  }

  if (outcome.status === 'pending') {
    return resolve({
      loading: true,
      options: [],
    })
  }

  return resolve({
    options: [],
  })
}

function Select<T, I = string, O = I>(props: SelectProps<T, I, O>) {
  const resolved = useSelectData(props)

  if (resolved.mode === 'multiple') {
    return <MultipleSelect {...resolved} />
  }
  if (resolved.searchable || resolved.creatable) {
    return <SingleSearchableSelect {...resolved} />
  }
  return <SinglePrimitiveSelect {...resolved} />
}

function SinglePrimitiveSelect<T, I = string, O = I>({
  options,
  optionLabel,
  optionValue,
  optionGroup,
  renderOption,
  renderValue,
  placeholder = 'Select...',
  emptySection,
  leftSection,
  rightSection,
  infinite,
  disabled,
  loading,
  size,
  variant,
  value,
  defaultValue,
  onChange,
  clearable = true,
}: ResolvedSelectProps<T, I, O> & {
  mode: 'single'
}) {
  const {
    trigger,
    triggerValue,
    popup,
    list,
    groupLabel,
    item,
    itemCheck,
    sentinel,
    empty,
    clearTrigger,
  } = select({
    size,
    variant,
  })

  const portalContainer = usePortalContainer()
  const sentinelRef = useInfiniteSentinel(infinite)
  const listRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startAutoScroll = (direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
    }
    scrollIntervalRef.current = setInterval(() => {
      if (!listRef.current) {
        return
      }
      listRef.current.scrollTop += direction === 'up' ? -8 : 8
    }, 16)
  }

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  useEffect(
    () => () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    },
    [],
  )

  const isControlled = value !== undefined
  const defaultKey =
    defaultValue !== undefined && defaultValue !== null
      ? toKey(defaultValue as O)
      : undefined
  const [internalKey, setInternalKey] = useState<string>(defaultKey ?? '')

  const currentKey = isControlled
    ? value !== null
      ? toKey(value as O)
      : ''
    : internalKey

  const grouped = optionGroup
    ? options.reduce<
        {
          group: string
          items: T[]
        }[]
      >((acc, option) => {
        const g = getLabel(option, optionGroup as keyof T | ((o: T) => string))
        const existing = acc.find((a) => a.group === g)
        if (existing) {
          existing.items.push(option)
        } else {
          acc.push({
            group: g,
            items: [option],
          })
        }
        return acc
      }, [])
    : [
        {
          group: '',
          items: options,
        },
      ]

  const selectedOption = options.find(
    (o) => toKey(getValue(o, optionValue)) === currentKey,
  )

  const handleClear = () => {
    if (!isControlled) {
      setInternalKey('')
    }
    onChange?.(null)
  }

  const showClear = clearable && !!selectedOption && !disabled && !loading

  return (
    <SelectPrimitive.Root
      onValueChange={(key: string | null) => {
        if (!isControlled) {
          setInternalKey(key ?? '')
        }
        const option = key
          ? options.find((o) => toKey(getValue(o, optionValue)) === key)
          : undefined
        onChange?.(option ? getValue(option, optionValue) : null)
      }}
      value={currentKey || null}
    >
      <SelectPrimitive.Trigger
        aria-busy={loading}
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
      >
        {leftSection && (
          <span className="select-left-section shrink-0">{leftSection}</span>
        )}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              getLabel(selectedOption, optionLabel)
            )
          ) : (
            <span className="select-placeholder text-muted-foreground">
              {placeholder}
            </span>
          )}
        </span>
        {loading ? (
          <Loader decorative size="sm" />
        ) : rightSection ? (
          <span className="select-right-section shrink-0">{rightSection}</span>
        ) : showClear ? (
          // biome-ignore lint/a11y/useSemanticElements: nested button inside the select trigger is invalid HTML
          <span
            aria-label="Clear"
            className={clearTrigger()}
            data-testid="select-clear"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClear()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <X size={14} />
          </span>
        ) : (
          <SelectPrimitive.Icon
            render={
              <ChevronDown className="select-trigger-icon size-4 text-muted-foreground" />
            }
          />
        )}
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal container={portalContainer}>
        <SelectPrimitive.Positioner
          alignItemWithTrigger={false}
          className="select-positioner isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <SelectPrimitive.Popup className={popup()} data-testid="select-popup">
            <SelectPrimitive.ScrollUpArrow
              className="select-scroll-up-arrow absolute inset-x-0 top-0 z-10 flex items-center justify-center bg-popover py-1"
              onMouseEnter={() => startAutoScroll('up')}
              onMouseLeave={stopAutoScroll}
            >
              <ChevronUp className="select-scroll-up-icon size-4" />
            </SelectPrimitive.ScrollUpArrow>
            <SelectPrimitive.List
              className={list()}
              data-testid="select-list"
              ref={listRef}
            >
              {options.length === 0 && (
                <div className={empty()} data-testid="select-empty">
                  {emptySection ?? 'No options found.'}
                </div>
              )}
              {grouped.map(({ group, items }) => (
                <SelectPrimitive.Group key={group || '__default'}>
                  {group && (
                    <SelectPrimitive.GroupLabel
                      className={groupLabel()}
                      data-testid="select-group-label"
                    >
                      {group}
                    </SelectPrimitive.GroupLabel>
                  )}
                  {items.map((option) => {
                    const key = toKey(getValue(option, optionValue))
                    const label = getLabel(option, optionLabel)
                    const isCurrent = key === currentKey && key !== ''
                    return (
                      <SelectPrimitive.Item
                        className={item()}
                        data-current={isCurrent || undefined}
                        data-testid="select-item"
                        key={key}
                        value={key}
                      >
                        <SelectPrimitive.ItemText>
                          {renderOption ? renderOption(option) : label}
                        </SelectPrimitive.ItemText>
                        {isCurrent && (
                          <span
                            className={itemCheck()}
                            data-testid="select-item-check"
                          >
                            <Check className="select-item-check-icon size-3.5" />
                          </span>
                        )}
                      </SelectPrimitive.Item>
                    )
                  })}
                </SelectPrimitive.Group>
              ))}
              {infinite?.hasMore && !infinite.error && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <SelectLoadingMore text={infinite.loadingMoreText} />
              )}
              {infinite?.error && infinite.errorSection && (
                <div
                  className="select-load-more-error px-2 py-2 text-center text-muted-foreground text-sm"
                  data-testid="select-load-more-error"
                >
                  {infinite.errorSection}
                </div>
              )}
            </SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow
              className="select-scroll-down-arrow absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-popover py-1"
              onMouseEnter={() => startAutoScroll('down')}
              onMouseLeave={stopAutoScroll}
            >
              <ChevronDown className="select-scroll-down-icon size-4" />
            </SelectPrimitive.ScrollDownArrow>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function SingleSearchableSelect<T, I = string, O = I>({
  options,
  optionLabel,
  optionValue,
  optionGroup,
  renderOption,
  renderValue,
  creatable,
  creatableOptions,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  searchValue,
  emptySection,
  leftSection,
  rightSection,
  onSearchChange,
  debounce,
  infinite,
  disabled,
  loading,
  size,
  variant,
  value,
  defaultValue,
  onChange,
  clearable = true,
}: ResolvedSelectProps<T, I, O> & {
  mode: 'single'
}) {
  const {
    trigger,
    triggerValue,
    popup,
    search,
    searchInput,
    list,
    groupLabel,
    item,
    itemCheck,
    sentinel,
    empty,
    clearTrigger,
    create,
    createLabel,
  } = select({
    size,
    variant,
  })

  const labels = useLabels()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const isSearchControlled = searchValue !== undefined
  const currentQuery = isSearchControlled ? searchValue : query
  const portalContainer = usePortalContainer()
  const sentinelRef = useInfiniteSentinel(infinite)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])
  const listboxId = useId()
  const handleSearchChange = useSearchChange(onSearchChange, debounce)

  const isControlled = value !== undefined
  const defaultKey =
    defaultValue !== undefined && defaultValue !== null
      ? toKey(defaultValue as O)
      : undefined
  const [internalKey, setInternalKey] = useState<string>(defaultKey ?? '')

  const currentKey = isControlled
    ? value !== null
      ? toKey(value as O)
      : ''
    : internalKey

  const handleSelect = (key: string, option: T) => {
    if (!isControlled) {
      setInternalKey(key)
    }
    onChange?.(getValue(option, optionValue))
    setOpen(false)
  }

  const filteredOptions =
    currentQuery && !onSearchChange
      ? options.filter((o) =>
          getLabel(o, optionLabel)
            .toLowerCase()
            .includes(currentQuery.toLowerCase()),
        )
      : options

  const creator = useCreatable({
    creatable,
    creatableOptions,
    labelOf: (option: T) => getLabel(option, optionLabel),
    onCreated: () => {
      setActiveIndex(-1)
      if (!isSearchControlled) {
        setQuery('')
      }
      handleSearchChange('')
    },
    options,
    query: currentQuery,
  })

  const createRow = creator.offered ? (
    <SelectCreateRow
      className={create()}
      creating={creator.creating}
      key="__create"
      labelClassName={createLabel()}
      onCreate={() => void creator.create()}
      query={creator.query}
      text={creatableOptions?.label ?? labels.select.create}
    />
  ) : null

  const grouped = optionGroup
    ? filteredOptions.reduce<
        {
          group: string
          items: T[]
        }[]
      >((acc, option) => {
        const g = getLabel(option, optionGroup as keyof T | ((o: T) => string))
        const existing = acc.find((a) => a.group === g)
        if (existing) {
          existing.items.push(option)
        } else {
          acc.push({
            group: g,
            items: [option],
          })
        }
        return acc
      }, [])
    : [
        {
          group: '',
          items: filteredOptions,
        },
      ]

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1)
      if (!isSearchControlled) {
        setQuery('')
      }
    }
  }, [isSearchControlled, open])

  const groupOffsets = grouped.reduce<number[]>((acc, _group, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + grouped[index - 1].items.length)
    return acc
  }, [])

  const focusOption = (index: number) => {
    setActiveIndex(index)
    optionRefs.current[index]?.focus()
  }

  const moveActive = (delta: number) => {
    const count = filteredOptions.length
    if (count === 0) {
      return
    }
    if (activeIndex < 0) {
      focusOption(delta > 0 ? 0 : count - 1)
      return
    }
    focusOption((activeIndex + delta + count) % count)
  }

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }
    if (event.key === 'Home' && filteredOptions.length > 0) {
      event.preventDefault()
      focusOption(0)
      return
    }
    if (event.key === 'End' && filteredOptions.length > 0) {
      event.preventDefault()
      focusOption(filteredOptions.length - 1)
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const selectedOption = options.find(
    (o) => toKey(getValue(o, optionValue)) === currentKey,
  )

  const handleClear = () => {
    if (!isControlled) {
      setInternalKey('')
    }
    onChange?.(null)
  }

  const showClear = clearable && !!selectedOption && !disabled && !loading

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger
        aria-busy={loading}
        aria-controls={open ? listboxId : undefined}
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
        role="combobox"
      >
        {leftSection && (
          <span className="select-left-section shrink-0">{leftSection}</span>
        )}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              getLabel(selectedOption, optionLabel)
            )
          ) : (
            <span className="select-placeholder text-muted-foreground">
              {placeholder}
            </span>
          )}
        </span>
        {loading ? (
          <Loader decorative size="sm" />
        ) : rightSection ? (
          <span className="select-right-section shrink-0">{rightSection}</span>
        ) : showClear ? (
          // biome-ignore lint/a11y/useSemanticElements: nested button inside the select trigger is invalid HTML
          <span
            aria-label="Clear"
            className={clearTrigger()}
            data-testid="select-clear"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClear()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <X size={14} />
          </span>
        ) : (
          <ChevronDown className="select-trigger-icon size-4 shrink-0 text-muted-foreground" />
        )}
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <Popover.Positioner
          className="select-positioner isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <Popover.Popup
            className={popup()}
            data-testid="select-popup"
            initialFocus={searchInputRef}
          >
            <div className={search()} data-testid="select-search">
              <Search className="select-search-icon mr-2 size-4 shrink-0 text-muted-foreground" />
              <input
                className={searchInput()}
                data-testid="select-search-input"
                onChange={(e) => {
                  setActiveIndex(-1)
                  if (!isSearchControlled) {
                    setQuery(e.target.value)
                  }
                  handleSearchChange(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    handleListKeyDown(e)
                  }
                }}
                placeholder={searchPlaceholder}
                ref={searchInputRef}
                value={currentQuery}
              />
            </div>
            <div
              className={list()}
              data-testid="select-list"
              id={listboxId}
              role="listbox"
            >
              {creator.position === 'top' ? createRow : null}
              {filteredOptions.length === 0 && !creator.offered && (
                <div className={empty()} data-testid="select-empty">
                  {emptySection ?? 'No options found.'}
                </div>
              )}
              {grouped.map(({ group, items }, groupIndex) => (
                <div key={group || '__default'} role="presentation">
                  {group && (
                    <div
                      className={groupLabel()}
                      data-testid="select-group-label"
                    >
                      {group}
                    </div>
                  )}
                  {items.map((option, itemIndex) => {
                    const key = toKey(getValue(option, optionValue))
                    const label = getLabel(option, optionLabel)
                    const selected = key === currentKey
                    const index = groupOffsets[groupIndex] + itemIndex
                    return (
                      <div
                        aria-selected={selected}
                        className={item()}
                        data-selected={selected || undefined}
                        data-testid="select-item"
                        key={key}
                        onClick={() => handleSelect(key, option)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelect(key, option)
                            return
                          }
                          handleListKeyDown(e)
                        }}
                        ref={(node) => {
                          optionRefs.current[index] = node
                        }}
                        role="option"
                        tabIndex={
                          index === (activeIndex < 0 ? 0 : activeIndex) ? 0 : -1
                        }
                      >
                        <span className="select-item-label flex flex-1 items-center gap-2">
                          {renderOption ? renderOption(option) : label}
                        </span>
                        {selected && (
                          <span
                            className={itemCheck()}
                            data-testid="select-item-check"
                          >
                            <Check className="select-item-check-icon size-3.5" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              {creator.position === 'bottom' ? createRow : null}
              {infinite?.hasMore && !infinite.error && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <SelectLoadingMore text={infinite.loadingMoreText} />
              )}
              {infinite?.error && infinite.errorSection && (
                <div
                  className="select-load-more-error px-2 py-2 text-center text-muted-foreground text-sm"
                  data-testid="select-load-more-error"
                >
                  {infinite.errorSection}
                </div>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function MultipleSelect<T, I = string, O = I>({
  options,
  optionLabel,
  optionValue,
  optionGroup,
  renderOption,
  renderValue,
  creatable,
  creatableOptions,
  placeholder = 'Select...',
  searchable,
  searchPlaceholder = 'Search...',
  searchValue,
  emptySection,
  leftSection,
  rightSection,
  onSearchChange,
  debounce,
  infinite,
  disabled,
  loading,
  size,
  variant,
  value,
  defaultValue,
  onChange,
  clearable = true,
}: ResolvedSelectProps<T, I, O> & {
  mode: 'multiple'
}) {
  const {
    trigger,
    triggerValue,
    popup,
    search,
    searchInput,
    list,
    groupLabel,
    multipleItem,
    checkbox,
    sentinel,
    empty,
    clearTrigger,
    create,
    createLabel,
  } = select({
    size,
    variant,
  })

  const labels = useLabels()
  const isControlled = value !== undefined
  const [internalValues, setInternalValues] = useState<string[]>(
    (defaultValue as unknown as I[] | undefined)?.map((v) =>
      toKey(v as unknown as O),
    ) ?? [],
  )
  const portalContainer = usePortalContainer()
  const sentinelRef = useInfiniteSentinel(infinite)
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const isSearchControlled = searchValue !== undefined
  const currentQuery = isSearchControlled ? searchValue : query
  const handleSearchChange = useSearchChange(onSearchChange, debounce)

  const selectedKeys: string[] = isControlled
    ? ((value as unknown as I[]) ?? []).map((v) => toKey(v as unknown as O))
    : internalValues

  const toggle = (key: string, _option: T) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key]
    if (!isControlled) {
      setInternalValues(next)
    }
    const nextOptions = options.filter((o) =>
      next.includes(toKey(getValue(o, optionValue))),
    )
    onChange?.(
      nextOptions.map((o) => getValue(o, optionValue)) as unknown as O[],
    )
  }

  const searching = Boolean(searchable) || Boolean(creatable)

  const filteredOptions =
    searching && currentQuery && !onSearchChange
      ? options.filter((o) =>
          getLabel(o, optionLabel)
            .toLowerCase()
            .includes(currentQuery.toLowerCase()),
        )
      : options

  const creator = useCreatable({
    creatable,
    creatableOptions,
    labelOf: (option: T) => getLabel(option, optionLabel),
    onCreated: () => {
      if (!isSearchControlled) {
        setQuery('')
      }
      handleSearchChange('')
    },
    options,
    query: currentQuery,
  })

  const createRow = creator.offered ? (
    <SelectCreateRow
      className={create()}
      creating={creator.creating}
      key="__create"
      labelClassName={createLabel()}
      onCreate={() => void creator.create()}
      query={creator.query}
      text={creatableOptions?.label ?? labels.select.create}
    />
  ) : null

  const grouped = optionGroup
    ? filteredOptions.reduce<
        {
          group: string
          items: T[]
        }[]
      >((acc, option) => {
        const g = getLabel(option, optionGroup as keyof T | ((o: T) => string))
        const existing = acc.find((a) => a.group === g)
        if (existing) {
          existing.items.push(option)
        } else {
          acc.push({
            group: g,
            items: [option],
          })
        }
        return acc
      }, [])
    : [
        {
          group: '',
          items: filteredOptions,
        },
      ]

  const selectedOptions = options.filter((o) =>
    selectedKeys.includes(toKey(getValue(o, optionValue))),
  )
  const visibleBadges = selectedOptions.slice(0, 2)
  const overflowCount = selectedOptions.length - visibleBadges.length

  const handleClear = () => {
    if (!isControlled) {
      setInternalValues([])
    }
    onChange?.([] as unknown as O[])
  }

  const showClear =
    clearable && selectedOptions.length > 0 && !disabled && !loading

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger
        aria-busy={loading}
        aria-controls={open ? listboxId : undefined}
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
        role="combobox"
      >
        {leftSection && (
          <span className="select-left-section shrink-0">{leftSection}</span>
        )}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOptions.length === 0 ? (
            <span className="select-placeholder text-muted-foreground">
              {placeholder}
            </span>
          ) : (
            <>
              {visibleBadges.map((o) => {
                const key = toKey(getValue(o, optionValue))
                return (
                  <Badge key={key} variant="secondary">
                    {renderValue ? renderValue(o) : getLabel(o, optionLabel)}
                    <button
                      aria-label={`Remove ${getLabel(o, optionLabel)}`}
                      className="select-value-remove pointer-events-auto ml-1 cursor-pointer rounded-full opacity-60 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(key, o)
                      }}
                      type="button"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                )
              })}
              {overflowCount > 0 && (
                <span className="select-value-overflow shrink-0 text-muted-foreground text-xs">
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </span>
        {loading ? (
          <Loader decorative size="sm" />
        ) : rightSection ? (
          <span className="select-right-section shrink-0">{rightSection}</span>
        ) : showClear ? (
          // biome-ignore lint/a11y/useSemanticElements: nested button inside the select trigger is invalid HTML
          <span
            aria-label="Clear"
            className={clearTrigger()}
            data-testid="select-clear"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClear()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <X size={14} />
          </span>
        ) : (
          <ChevronDown className="select-trigger-icon size-4 shrink-0 text-muted-foreground" />
        )}
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <Popover.Positioner
          className="select-positioner isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <Popover.Popup className={popup()} data-testid="select-popup">
            {searching && (
              <div className={search()} data-testid="select-search">
                <Search className="select-search-icon mr-2 size-4 shrink-0 text-muted-foreground" />
                <input
                  className={searchInput()}
                  data-testid="select-search-input"
                  onChange={(e) => {
                    if (!isSearchControlled) {
                      setQuery(e.target.value)
                    }
                    handleSearchChange(e.target.value)
                  }}
                  placeholder={searchPlaceholder}
                  value={currentQuery}
                />
              </div>
            )}
            <div
              aria-multiselectable
              className={list()}
              data-testid="select-list"
              id={listboxId}
              role="listbox"
            >
              {creator.position === 'top' ? createRow : null}
              {filteredOptions.length === 0 && !creator.offered && (
                <div className={empty()} data-testid="select-empty">
                  {emptySection ?? 'No options found.'}
                </div>
              )}
              {grouped.map(({ group, items }) => (
                <div key={group || '__default'} role="presentation">
                  {group && (
                    <div
                      className={groupLabel()}
                      data-testid="select-group-label"
                    >
                      {group}
                    </div>
                  )}
                  {items.map((option) => {
                    const key = toKey(getValue(option, optionValue))
                    const label = getLabel(option, optionLabel)
                    const checked = selectedKeys.includes(key)
                    return (
                      <div
                        aria-selected={checked}
                        className={multipleItem()}
                        data-testid="select-item"
                        key={key}
                        onClick={() => toggle(key, option)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggle(key, option)
                          }
                        }}
                        role="option"
                        tabIndex={0}
                      >
                        <span
                          className={checkbox()}
                          data-checked={checked || undefined}
                          data-testid="select-checkbox"
                        >
                          {checked && <Check size={10} />}
                        </span>
                        {renderOption ? renderOption(option) : label}
                      </div>
                    )
                  })}
                </div>
              ))}
              {creator.position === 'bottom' ? createRow : null}
              {infinite?.hasMore && !infinite.error && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <SelectLoadingMore text={infinite.loadingMoreText} />
              )}
              {infinite?.error && infinite.errorSection && (
                <div
                  className="select-load-more-error px-2 py-2 text-center text-muted-foreground text-sm"
                  data-testid="select-load-more-error"
                >
                  {infinite.errorSection}
                </div>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { Select }
