import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { useLabels } from '@/components/labels-provider'
import { Popover } from '@/components/popover'
import {
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  Search as SearchIcon,
} from '@/internal/icons'

import type { SearchItems, SearchProps } from './search.types'
import { isFilled } from './search.utils'

/**
 * One filter, on either row: a fixed box.
 *
 * A Select reports a wider intrinsic size once it holds chips, so a filter
 * sized by its content grows as it is filled and pushes everything after it —
 * the bar reflowing under the pointer of the person still choosing a value.
 * Fixed here rather than left to the caller, because the caller cannot see the
 * neighbours it would be moving.
 */
const FILTER_BOX = [
  'flex w-52 shrink-0 items-center gap-2',
  // Except when the control cannot change width with its value. A Switch is
  // 32px set or unset, and reserving 208px around it leaves a hole between two
  // filters — the box is here to stop movement, not to pad. Matched on the
  // role rather than declared per item, so the caller keeps saying what the
  // filter is and never how wide its cell should be.
  'has-[[role=switch]]:w-auto has-[[role=checkbox]]:w-auto',
].join(' ')

const styles = tv({
  slots: {
    // A row that wraps rather than a grid of N columns: at 360px three filters
    // side by side are three unreadable 90px controls.
    row: 'search-row flex min-w-0 flex-wrap items-center gap-2',
    root: 'search-root flex min-w-0 flex-col gap-3',
    field: 'search-field min-w-48 flex-1',
    inlineFilter: ['search-inline-filter', FILTER_BOX],
    // The second row is one row and stays one row. Scrolls rather than wraps:
    // the bar is two rows by definition, and an expand panel that grew a row
    // per filter turned a filter bar into a form.
    expandRow:
      'search-expand-row flex min-w-0 items-center gap-2 overflow-x-auto pb-1',
    expandFilter: ['search-expand-filter', FILTER_BOX],
    fieldBox: 'search-field-box min-w-0 flex-1',
    filter: 'search-filter flex min-w-0 flex-col gap-1.5',
    filterLabel:
      'search-filter-label shrink-0 font-medium text-muted-foreground text-xs',
    panel: 'search-panel grid w-56 gap-3',
    // The badge's own width, reserved. Setting a popover filter makes the
    // count appear, and a button that grows by a badge moves Show more and
    // Reset every time — the same jump the fixed filters are here to stop.
    filtersCount: 'search-filters-count flex w-5 justify-center',
  },
})

const {
  expandFilter: expandFilterClass,
  expandRow: expandRowClass,
  field: fieldClass,
  fieldBox: fieldBoxClass,
  filter: filterClass,
  filterLabel: filterLabelClass,
  filtersCount: filtersCountClass,
  inlineFilter: inlineFilterClass,
  panel: panelClass,
  root: rootClass,
  row: rowClass,
} = styles()

/** A filter on a row: its field, and its name beside it when it needs one. */
function RowFilter<T extends Record<string, unknown>>({
  className,
  item,
  testId,
}: {
  className: string
  item: SearchItems<T>
  testId: string
}) {
  return (
    <label className={className} data-testid={testId} key={item.id}>
      {item.label === undefined ? null : (
        <span className={filterLabelClass()}>{item.label}</span>
      )}
      <span className={fieldBoxClass()}>{item.field}</span>
    </label>
  )
}

function Panel<T extends Record<string, unknown>>({
  items,
  testId,
  value,
}: {
  items: SearchItems<T>[]
  testId: string
  value?: T
}) {
  return (
    <div className={panelClass()} data-testid={testId}>
      {items.map((item) => (
        <label className={filterClass()} key={item.id}>
          <span className={filterLabelClass()}>
            {item.label}
            {isActive(item, value) ? (
              <span
                className="search-filter-dot ml-1.5 inline-block size-1.5 rounded-full bg-primary align-middle"
                data-testid={`search-filter-dot-${item.id}`}
              />
            ) : null}
          </span>
          {item.field}
        </label>
      ))}
    </div>
  )
}

function isActive<T extends Record<string, unknown>>(
  item: SearchItems<T>,
  value?: T,
): boolean {
  const current = value?.[item.id]

  return item.isActive ? item.isActive(current as never) : isFilled(current)
}

function Search<T extends Record<string, unknown> = Record<string, unknown>>({
  filter,
  items = [],
  onReset,
  value,
}: SearchProps<T>) {
  const labels = useLabels()
  const [expanded, setExpanded] = useState(false)

  const inline = items.filter(
    (item) => (item.placement ?? 'inline') === 'inline',
  )
  const popover = items.filter((item) => item.placement === 'popover')
  const expand = items.filter((item) => item.placement === 'expand')

  // Only what was declared as an item can count. A route's search carries
  // `page`, `perPage` and `sort` as well, and counting every key of `value`
  // would report a filtered list to someone who filtered nothing.
  const activeCount = items.filter((item) => isActive(item, value)).length
  const popoverCount = popover.filter((item) => isActive(item, value)).length

  // Reset clears the query too, so the query decides whether there is anything
  // to clear. A controlled field reports its term; an uncontrolled one keeps it
  // to itself, and only the term it started with is visible from here.
  const queryFilled = isFilled(filter?.value ?? filter?.defaultValue)

  return (
    <div className={rootClass()} data-testid="search-root">
      <div className={rowClass()} data-testid="search-row">
        {filter === undefined ? null : (
          <Input
            debounce
            defaultValue={filter.defaultValue}
            leftSection={<SearchIcon />}
            loading={filter.loading}
            onChange={filter.onChange}
            placeholder={filter.placeholder ?? labels.search.placeholder}
            rootClassName={fieldClass()}
            value={filter.value}
          />
        )}

        {inline.map((item) => (
          <RowFilter
            className={inlineFilterClass()}
            item={item}
            key={item.id}
            testId={`search-inline-${item.id}`}
          />
        ))}

        {popover.length === 0 ? null : (
          <Popover
            content={
              <Panel
                items={popover}
                testId="search-popover-panel"
                value={value}
              />
            }
          >
            <Button
              className="search-filters"
              leftSection={<FilterIcon />}
              size="sm"
              variant="outline"
            >
              {labels.search.filters}
              <span className={filtersCountClass()}>
                {popoverCount > 0 ? (
                  <Badge size="sm">{popoverCount}</Badge>
                ) : null}
              </span>
            </Button>
          </Popover>
        )}

        {expand.length === 0 ? null : (
          <Button
            className="search-more"
            onClick={() => setExpanded((current) => !current)}
            rightSection={expanded ? <ChevronUp /> : <ChevronDown />}
            size="sm"
            variant="ghost"
          >
            {expanded ? labels.search.less : labels.search.more}
          </Button>
        )}

        {onReset === undefined ? null : (
          <Button
            className="search-reset"
            disabled={activeCount === 0 && !queryFilled}
            onClick={onReset}
            size="sm"
            variant="ghost"
          >
            {labels.search.reset}
          </Button>
        )}
      </div>

      {expanded && expand.length > 0 ? (
        <div className={expandRowClass()} data-testid="search-expand-row">
          {expand.map((item) => (
            <RowFilter
              className={expandFilterClass()}
              item={item}
              key={item.id}
              testId={`search-expand-${item.id}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { Search }
