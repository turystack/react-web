import { useEffect, useId, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { tv } from 'tailwind-variants'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { Loader } from '@/components/loader'
import { Sheet } from '@/components/sheet'
import { Check, ChevronDown, Search, X } from '@/internal/icons'

import type { SelectSheetProps } from './select-sheet.types'

const selectSheet = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    clear: [
      'select-sheet-clear -mr-1 flex size-6 shrink-0 items-center justify-center rounded',
      'text-muted-foreground hover:bg-accent hover:text-foreground',
    ],
    content: 'select-sheet-content flex h-[min(60vh,28rem)] min-h-0 flex-col',
    empty: 'select-sheet-empty p-8 text-center text-muted-foreground text-sm',
    group: 'select-sheet-group flex flex-col gap-1',
    groupLabel:
      'select-sheet-group-label px-2 pt-3 pb-1 font-medium text-muted-foreground text-xs',
    item: [
      'select-sheet-item flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left',
      'text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    itemCheck: 'select-sheet-item-check ml-auto flex size-4 shrink-0',
    itemContent: 'select-sheet-item-content min-w-0 flex-1',
    list: 'select-sheet-list min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1',
    loading:
      'select-sheet-loading flex items-center justify-center gap-2 p-8 text-center text-muted-foreground text-sm',
    search: 'select-sheet-search mb-2 shrink-0',
    selectedBadges: 'select-sheet-selected-badges flex min-w-0 gap-1',
    simpleTrigger:
      'select-sheet-trigger focus:border-ring focus:ring-3 focus:ring-ring/50',
    trigger: [
      'select-sheet-trigger flex w-full min-w-0 items-center justify-between gap-1.5 rounded-lg',
      'whitespace-nowrap border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
      'has-[.select-sheet-trigger-button:focus]:border-ring has-[.select-sheet-trigger-button:focus]:ring-3 has-[.select-sheet-trigger-button:focus]:ring-ring/50',
      'disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
      'dark:bg-input/30 dark:disabled:bg-input/80',
    ],
    triggerButton:
      'select-sheet-trigger-button flex min-w-0 flex-1 items-center gap-2 text-left outline-none disabled:pointer-events-none',
    triggerValue:
      'select-sheet-trigger-value flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left',
    valueText: 'select-sheet-value-text min-w-0 truncate',
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
        simpleTrigger: 'focus:border-transparent',
        trigger:
          'border-transparent bg-transparent disabled:bg-transparent has-[.select-sheet-trigger-button:focus]:border-transparent dark:bg-transparent dark:disabled:bg-transparent',
      },
    },
  },
})

function getLabel<T>(
  option: T,
  extractor: keyof T | ((option: T) => string),
): string {
  return typeof extractor === 'function'
    ? extractor(option)
    : String(option[extractor])
}

function getValue<T, O>(option: T, extractor: keyof T | ((option: T) => O)): O {
  return typeof extractor === 'function'
    ? extractor(option)
    : (option[extractor] as O)
}

function toKey(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function SelectSheet<T, I = string, O = I>(props: SelectSheetProps<T, I, O>) {
  if (props.mode === 'multiple') {
    return (
      <MultipleSelectSheet
        {...(props as SelectSheetProps<T, I, O, 'multiple'>)}
      />
    )
  }

  return (
    <SingleSelectSheet {...(props as SelectSheetProps<T, I, O, 'single'>)} />
  )
}

function SingleSelectSheet<T, I = string, O = I>({
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
  clearable = true,
  value,
  defaultValue,
  onChange,
  open,
  onOpenChange,
  side = 'bottom',
  sheetSize,
  title,
  description,
}: SelectSheetProps<T, I, O, 'single'>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '')
  const [internalValue, setInternalValue] = useState<I | null>(
    defaultValue ?? null,
  )
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const currentOpen = open ?? internalOpen
  const currentSearch = internalSearch
  const currentValue = value !== undefined ? value : internalValue
  const selectedKey = currentValue === null ? '' : toKey(currentValue)

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const selectedOption = options.find(
    (option) => toKey(getValue(option, optionValue)) === selectedKey,
  )

  useEffect(() => {
    if (searchValue !== undefined) {
      setInternalSearch(searchValue)
    }
  }, [searchValue])

  useEffect(
    () => () => {
      clearTimeout(searchTimerRef.current)
    },
    [],
  )

  const handleSearchChange = (query: string | null) => {
    const nextQuery = query ?? ''
    setInternalSearch(nextQuery)
    if (!onSearchChange) {
      return
    }
    if (!debounce) {
      onSearchChange(nextQuery)
      return
    }
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => onSearchChange(nextQuery), 300)
  }

  const handleChange = (nextOption: T) => {
    const nextValue = getValue(nextOption, optionValue)
    if (value === undefined) {
      setInternalValue(nextValue as unknown as I)
    }
    onChange?.(nextValue)
    setOpen(false)
  }

  const handleClear: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation()
    if (value === undefined) {
      setInternalValue(null)
    }
    onChange?.(null)
  }

  return (
    <SelectSheetBase
      clearable={clearable}
      currentOpen={currentOpen}
      currentSearch={currentSearch}
      description={description}
      disabled={disabled}
      emptySection={emptySection}
      filteredOptions={
        onSearchChange
          ? options
          : filterOptions(options, optionLabel, currentSearch)
      }
      infinite={infinite}
      leftSection={leftSection}
      loading={loading}
      multiple={false}
      onClear={handleClear}
      onOpenChange={setOpen}
      onSearchChange={handleSearchChange}
      optionGroup={optionGroup}
      optionLabel={optionLabel}
      optionValue={optionValue}
      placeholder={placeholder}
      renderOption={renderOption}
      renderValue={renderValue}
      rightSection={rightSection}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      selectedKeys={selectedKey ? [selectedKey] : []}
      selectedOptions={selectedOption ? [selectedOption] : []}
      sheetSize={sheetSize}
      side={side}
      size={size}
      title={title}
      toggleOption={handleChange}
      triggerLabel={selectedOption ? getLabel(selectedOption, optionLabel) : ''}
      variant={variant}
    />
  )
}

function MultipleSelectSheet<T, I = string, O = I>({
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
  clearable = true,
  value,
  defaultValue = [],
  onChange,
  open,
  onOpenChange,
  side = 'bottom',
  sheetSize,
  title,
  description,
}: SelectSheetProps<T, I, O, 'multiple'>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '')
  const [internalValue, setInternalValue] = useState<I[]>(defaultValue)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const currentOpen = open ?? internalOpen
  const currentSearch = internalSearch
  const currentValue = value !== undefined ? value : internalValue
  const selectedKeys = currentValue.map(toKey)
  const selectedOptions = options.filter((option) =>
    selectedKeys.includes(toKey(getValue(option, optionValue))),
  )

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  useEffect(() => {
    if (searchValue !== undefined) {
      setInternalSearch(searchValue)
    }
  }, [searchValue])

  useEffect(
    () => () => {
      clearTimeout(searchTimerRef.current)
    },
    [],
  )

  const handleSearchChange = (query: string | null) => {
    const nextQuery = query ?? ''
    setInternalSearch(nextQuery)
    if (!onSearchChange) {
      return
    }
    if (!debounce) {
      onSearchChange(nextQuery)
      return
    }
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => onSearchChange(nextQuery), 300)
  }

  const handleChange = (nextOption: T) => {
    const nextValue = getValue(nextOption, optionValue)
    const nextKey = toKey(nextValue)
    const selected = selectedKeys.includes(nextKey)
    const nextValues = selected
      ? currentValue.filter((item) => toKey(item) !== nextKey)
      : [...currentValue, nextValue as unknown as I]

    if (value === undefined) {
      setInternalValue(nextValues)
    }
    onChange?.(nextValues as unknown as O[])
  }

  const handleClear: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation()
    if (value === undefined) {
      setInternalValue([])
    }
    onChange?.([])
  }

  return (
    <SelectSheetBase
      clearable={clearable}
      currentOpen={currentOpen}
      currentSearch={currentSearch}
      description={description}
      disabled={disabled}
      emptySection={emptySection}
      filteredOptions={
        onSearchChange
          ? options
          : filterOptions(options, optionLabel, currentSearch)
      }
      infinite={infinite}
      leftSection={leftSection}
      loading={loading}
      multiple
      onClear={handleClear}
      onOpenChange={setOpen}
      onSearchChange={handleSearchChange}
      optionGroup={optionGroup}
      optionLabel={optionLabel}
      optionValue={optionValue}
      placeholder={placeholder}
      renderOption={renderOption}
      renderValue={renderValue}
      rightSection={rightSection}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      selectedKeys={selectedKeys}
      selectedOptions={selectedOptions}
      sheetSize={sheetSize}
      side={side}
      size={size}
      title={title}
      toggleOption={handleChange}
      triggerLabel={selectedOptions
        .map((option) => getLabel(option, optionLabel))
        .join(', ')}
      variant={variant}
    />
  )
}

type SelectSheetBaseOwnProps<T> = {
  currentOpen: boolean
  currentSearch: string
  filteredOptions: T[]
  selectedKeys: string[]
  selectedOptions: T[]
  triggerLabel: string
  multiple: boolean
  onOpenChange: (open: boolean) => void
  onSearchChange: (query: string | null) => void
  onClear: React.MouseEventHandler<HTMLElement>
  toggleOption: (option: T) => void
}

type SelectSheetBaseInheritedProps<T, O> = Pick<
  SelectSheetProps<T, unknown, O, 'single'>,
  | 'clearable'
  | 'description'
  | 'disabled'
  | 'emptySection'
  | 'infinite'
  | 'leftSection'
  | 'loading'
  | 'optionGroup'
  | 'optionLabel'
  | 'optionValue'
  | 'placeholder'
  | 'renderOption'
  | 'renderValue'
  | 'rightSection'
  | 'searchable'
  | 'searchPlaceholder'
  | 'sheetSize'
  | 'side'
  | 'size'
  | 'title'
  | 'variant'
>

type SelectSheetBaseProps<T, O> = SelectSheetBaseOwnProps<T> &
  SelectSheetBaseInheritedProps<T, O>

function SelectSheetBase<T, O>({
  currentOpen,
  currentSearch,
  filteredOptions,
  selectedKeys,
  selectedOptions,
  triggerLabel,
  multiple,
  optionLabel,
  optionValue,
  optionGroup,
  renderOption,
  renderValue,
  placeholder,
  searchable,
  searchPlaceholder,
  emptySection,
  leftSection,
  rightSection,
  infinite,
  disabled,
  loading,
  size,
  variant,
  clearable,
  side,
  sheetSize,
  title,
  description,
  onOpenChange,
  onSearchChange,
  onClear,
  toggleOption,
}: SelectSheetBaseProps<T, O>) {
  const listId = useId()
  const {
    trigger,
    triggerButton,
    triggerValue,
    valueText,
    simpleTrigger,
    clear,
    selectedBadges,
    content,
    search,
    list,
    group,
    groupLabel,
    item,
    itemContent,
    itemCheck,
    empty,
    loading: loadingSlot,
  } = selectSheet({
    size,
    variant,
  })

  const hasValue = selectedOptions.length > 0
  const groupedOptions = groupOptions(filteredOptions, optionGroup)
  const isEmpty = groupedOptions.length === 0
  const infiniteHasMore = Boolean(
    infinite?.hasMore &&
      infinite.onLoadMore &&
      !loading &&
      !infinite.loadingMore,
  )
  const handleLoadMore = () => {
    if (infiniteHasMore) {
      infinite?.onLoadMore?.()
    }
  }

  return (
    <>
      {multiple || renderValue ? (
        <div className={trigger()} data-testid="select-sheet-trigger">
          <button
            className={triggerButton()}
            disabled={disabled || loading}
            onClick={(event) => {
              event.currentTarget.focus()
              onOpenChange(true)
            }}
            type="button"
          >
            <span className={triggerValue()}>
              {leftSection}
              {hasValue ? (
                multiple ? (
                  <span className={selectedBadges()}>
                    {selectedOptions.slice(0, 2).map((option) => (
                      <Badge
                        key={toKey(getValue(option, optionValue))}
                        variant="secondary"
                      >
                        {renderValue?.(option) ?? getLabel(option, optionLabel)}
                      </Badge>
                    ))}
                    {selectedOptions.length > 2 && (
                      <Badge variant="outline">
                        +{selectedOptions.length - 2}
                      </Badge>
                    )}
                  </span>
                ) : (
                  <span className={valueText()}>
                    {renderValue?.(selectedOptions[0]) ?? triggerLabel}
                  </span>
                )
              ) : (
                <span
                  className={valueText({
                    className: 'text-muted-foreground',
                  })}
                >
                  {placeholder}
                </span>
              )}
            </span>
          </button>
          {loading ? (
            <Loader size="sm" />
          ) : clearable && hasValue ? (
            <button
              aria-label="Clear selection"
              className={clear()}
              onClick={onClear}
              type="button"
            >
              <X className="size-4" />
            </button>
          ) : (
            (rightSection ?? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ))
          )}
        </div>
      ) : (
        <Input
          className={simpleTrigger()}
          disabled={disabled}
          leftSection={leftSection}
          loading={loading}
          onClick={() => !disabled && !loading && onOpenChange(true)}
          placeholder={placeholder}
          readOnly
          rightSection={
            clearable && hasValue ? (
              <button
                aria-label="Clear selection"
                className={clear()}
                onClick={onClear}
                type="button"
              >
                <X className="size-4" />
              </button>
            ) : (
              (rightSection ?? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ))
            )
          }
          size={size}
          value={triggerLabel}
          variant={variant}
        />
      )}
      <Sheet
        onChange={onOpenChange}
        open={currentOpen}
        side={side}
        size={sheetSize}
      >
        {(title || description) && (
          <Sheet.Header bordered closable>
            {title && <Sheet.Header.Title>{title}</Sheet.Header.Title>}
            {description && (
              <Sheet.Header.Description>{description}</Sheet.Header.Description>
            )}
          </Sheet.Header>
        )}
        <Sheet.Body>
          <div className={content()} data-testid="select-sheet-content">
            {searchable && (
              <div className={search()}>
                <Input
                  leftSection={<Search className="size-4" />}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                  value={currentSearch}
                />
              </div>
            )}
            <div className={list()} data-testid="select-sheet-list" id={listId}>
              {isEmpty ? (
                loading ? (
                  <SelectSheetLoadingState className={loadingSlot()} />
                ) : (
                  <SelectSheetEmptyState
                    className={empty()}
                    query={currentSearch}
                  >
                    {emptySection}
                  </SelectSheetEmptyState>
                )
              ) : (
                <InfiniteScroll
                  dataLength={filteredOptions.length}
                  hasMore={infiniteHasMore}
                  loader={null}
                  next={handleLoadMore}
                  scrollableTarget={listId}
                  scrollThreshold="64px"
                >
                  {groupedOptions.map((optionGroupItem) => (
                    <div
                      className={group()}
                      data-testid="select-sheet-group"
                      key={optionGroupItem.group}
                    >
                      {optionGroupItem.group && (
                        <div className={groupLabel()}>
                          {optionGroupItem.group}
                        </div>
                      )}
                      {optionGroupItem.items.map((option) => {
                        const optionKey = toKey(getValue(option, optionValue))
                        const selected = selectedKeys.includes(optionKey)

                        return (
                          <button
                            aria-pressed={selected}
                            className={item()}
                            data-testid="select-sheet-item"
                            key={optionKey}
                            onClick={() => toggleOption(option)}
                            type="button"
                          >
                            <span className={itemContent()}>
                              {renderOption?.(option) ??
                                getLabel(option, optionLabel)}
                            </span>
                            {selected && (
                              <span className={itemCheck()}>
                                <Check className="size-4" />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </InfiniteScroll>
              )}
              {infinite?.loadingMore && (
                <SelectSheetLoadMoreState
                  loadingMoreText={infinite.loadingMoreText}
                />
              )}
            </div>
          </div>
        </Sheet.Body>
      </Sheet>
    </>
  )
}

function filterOptions<T>(
  options: T[],
  optionLabel: keyof T | ((option: T) => string),
  query: string,
) {
  if (!query) {
    return options
  }

  const normalizedQuery = query.toLocaleLowerCase()
  return options.filter((option) =>
    getLabel(option, optionLabel).toLocaleLowerCase().includes(normalizedQuery),
  )
}

type SelectSheetEmptyStateProps = {
  className: string
  query: string
  children?: React.ReactNode
}

function SelectSheetEmptyState({
  className,
  query,
  children,
}: SelectSheetEmptyStateProps) {
  const trimmedQuery = query.trim()
  const content =
    children ??
    (trimmedQuery
      ? `No results for "${trimmedQuery}".`
      : 'No options available.')

  return (
    <div className={className} data-testid="select-sheet-empty">
      {content}
    </div>
  )
}

type SelectSheetLoadingStateProps = {
  className: string
}

function SelectSheetLoadingState({ className }: SelectSheetLoadingStateProps) {
  return (
    <div className={className} data-testid="select-sheet-loading">
      <Loader size="sm" />
      <span>Loading options...</span>
    </div>
  )
}

type SelectSheetLoadMoreStateProps = {
  loadingMoreText?: React.ReactNode
}

function SelectSheetLoadMoreState({
  loadingMoreText,
}: SelectSheetLoadMoreStateProps) {
  return (
    <div
      className="flex justify-center py-3"
      data-testid="select-sheet-loading-more"
    >
      <Loader size="sm" />
      {loadingMoreText && (
        <span className="ml-2 text-muted-foreground text-sm">
          {loadingMoreText}
        </span>
      )}
    </div>
  )
}

function groupOptions<T>(
  options: T[],
  optionGroup: keyof T | ((option: T) => string) | undefined,
) {
  if (options.length === 0) {
    return []
  }

  if (!optionGroup) {
    return [
      {
        group: '',
        items: options,
      },
    ]
  }

  return options.reduce<
    {
      group: string
      items: T[]
    }[]
  >((acc, option) => {
    const group = getLabel(option, optionGroup)
    const existing = acc.find((item) => item.group === group)

    if (existing) {
      existing.items.push(option)
      return acc
    }

    acc.push({
      group,
      items: [option],
    })
    return acc
  }, [])
}

export { SelectSheet }
