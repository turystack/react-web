import { Popover } from '@base-ui/react/popover'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { useCallback, useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Badge } from '@/components/badge'
import { Loader } from '@/components/loader'
import { Check, ChevronDown, ChevronUp, Search, X } from '@/internal/icons'

import type { SelectProps } from './select.types'

const SELECT_POPUP_OFFSET = 8

const select = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
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
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
    },
    [],
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
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onSearchChange(query), 300)
    },
    [debounce, onSearchChange],
  )
}

function Select<T, I = string, O = I>(props: SelectProps<T, I, O>) {
  if (props.mode === 'multiple') {
    return <MultipleSelect {...props} />
  }
  if (props.searchable) {
    return <SingleSearchableSelect {...props} />
  }
  return <SinglePrimitiveSelect {...props} />
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
}: SelectProps<T, I, O> & {
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

  const sentinelRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!infinite?.onLoadMore || !sentinelRef.current) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          infinite.hasMore &&
          !infinite.loadingMore
        ) {
          infinite.onLoadMore?.()
        }
      },
      {
        threshold: 0.1,
      },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [infinite])

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
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
      >
        {leftSection && <span className="shrink-0">{leftSection}</span>}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              getLabel(selectedOption, optionLabel)
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        {loading ? (
          <Loader size="sm" />
        ) : rightSection ? (
          <span className="shrink-0">{rightSection}</span>
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
            render={<ChevronDown className="size-4 text-muted-foreground" />}
          />
        )}
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          alignItemWithTrigger={false}
          className="isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <SelectPrimitive.Popup className={popup()} data-testid="select-popup">
            <SelectPrimitive.ScrollUpArrow
              className="absolute inset-x-0 top-0 z-10 flex items-center justify-center bg-popover py-1"
              onMouseEnter={() => startAutoScroll('up')}
              onMouseLeave={stopAutoScroll}
            >
              <ChevronUp className="size-4" />
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
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </SelectPrimitive.Item>
                    )
                  })}
                </SelectPrimitive.Group>
              ))}
              {infinite?.hasMore && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <div className="flex justify-center py-2">
                  <Loader size="sm" />
                </div>
              )}
            </SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow
              className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-popover py-1"
              onMouseEnter={() => startAutoScroll('down')}
              onMouseLeave={stopAutoScroll}
            >
              <ChevronDown className="size-4" />
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
}: SelectProps<T, I, O> & {
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
  } = select({
    size,
    variant,
  })

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const isSearchControlled = searchValue !== undefined
  const currentQuery = isSearchControlled ? searchValue : query
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
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
    if (!infinite?.onLoadMore || !sentinelRef.current) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          infinite.hasMore &&
          !infinite.loadingMore
        ) {
          infinite.onLoadMore?.()
        }
      },
      {
        threshold: 0.1,
      },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [infinite])

  useEffect(() => {
    if (!open && !isSearchControlled) {
      setQuery('')
    }
  }, [isSearchControlled, open])

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
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
      >
        {leftSection && <span className="shrink-0">{leftSection}</span>}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              getLabel(selectedOption, optionLabel)
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        {loading ? (
          <Loader size="sm" />
        ) : rightSection ? (
          <span className="shrink-0">{rightSection}</span>
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
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <Popover.Popup
            className={popup()}
            data-testid="select-popup"
            initialFocus={searchInputRef}
          >
            <div className={search()} data-testid="select-search">
              <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
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
                ref={searchInputRef}
                value={currentQuery}
              />
            </div>
            <div className={list()} data-testid="select-list">
              {filteredOptions.length === 0 && (
                <div className={empty()} data-testid="select-empty">
                  {emptySection ?? 'No options found.'}
                </div>
              )}
              {grouped.map(({ group, items }) => (
                <div key={group || '__default'}>
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
                    const selected = key === currentKey
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
                          }
                        }}
                        role="option"
                        tabIndex={-1}
                      >
                        <span className="flex flex-1 items-center gap-2">
                          {renderOption ? renderOption(option) : label}
                        </span>
                        {selected && (
                          <span
                            className={itemCheck()}
                            data-testid="select-item-check"
                          >
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              {infinite?.hasMore && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <div className="flex justify-center py-2">
                  <Loader size="sm" />
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
}: SelectProps<T, I, O> & {
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
  } = select({
    size,
    variant,
  })

  const isControlled = value !== undefined
  const [internalValues, setInternalValues] = useState<string[]>(
    (defaultValue as unknown as I[] | undefined)?.map((v) =>
      toKey(v as unknown as O),
    ) ?? [],
  )
  const sentinelRef = useRef<HTMLDivElement>(null)
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

  const filteredOptions =
    searchable && currentQuery && !onSearchChange
      ? options.filter((o) =>
          getLabel(o, optionLabel)
            .toLowerCase()
            .includes(currentQuery.toLowerCase()),
        )
      : options

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
    if (!infinite?.onLoadMore || !sentinelRef.current) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          infinite.hasMore &&
          !infinite.loadingMore
        ) {
          infinite.onLoadMore?.()
        }
      },
      {
        threshold: 0.1,
      },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [infinite])

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
        className={trigger()}
        data-testid="select-trigger"
        disabled={disabled || loading}
      >
        {leftSection && <span className="shrink-0">{leftSection}</span>}
        <span className={triggerValue()} data-testid="select-value">
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <>
              {visibleBadges.map((o) => {
                const key = toKey(getValue(o, optionValue))
                return (
                  <Badge key={key} variant="secondary">
                    {renderValue ? renderValue(o) : getLabel(o, optionLabel)}
                    <button
                      className="pointer-events-auto ml-1 cursor-pointer rounded-full opacity-60 hover:opacity-100"
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
                <span className="shrink-0 text-muted-foreground text-xs">
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </span>
        {loading ? (
          <Loader size="sm" />
        ) : rightSection ? (
          <span className="shrink-0">{rightSection}</span>
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
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="isolate z-50"
          sideOffset={SELECT_POPUP_OFFSET}
        >
          <Popover.Popup className={popup()} data-testid="select-popup">
            {searchable && (
              <div className={search()} data-testid="select-search">
                <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
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
            <div className={list()} data-testid="select-list">
              {filteredOptions.length === 0 && (
                <div className={empty()} data-testid="select-empty">
                  {emptySection ?? 'No options found.'}
                </div>
              )}
              {grouped.map(({ group, items }) => (
                <div key={group || '__default'}>
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
              {infinite?.hasMore && (
                <div
                  className={sentinel()}
                  data-testid="select-sentinel"
                  ref={sentinelRef}
                />
              )}
              {infinite?.loadingMore && (
                <div className="flex justify-center py-2">
                  <Loader size="sm" />
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
