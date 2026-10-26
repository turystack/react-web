import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { ComposedInput } from '@/components/input/input.composed'
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

/**
 * The grid variant: the same items as a form's filter section.
 *
 * The columns answer to the grid's own width through a container query. The
 * place this variant exists for is a modal or a sheet, and a viewport
 * breakpoint there reads the screen behind the surface — a 512px modal on a
 * wide monitor would be asked for four columns of 110px each.
 */
const gridStyles = tv({
  defaultVariants: {
    columns: 2,
  },
  slots: {
    grid: 'search-grid @container/search-grid flex min-w-0 flex-col gap-3',
    gridCells: 'search-grid-cells grid grid-cols-1 gap-3',
    // `min-w-0`, because a grid cell's floor is its content's intrinsic width,
    // and a Select holding chips would otherwise push its column wider than
    // its neighbours — the same movement the bar's fixed boxes exist to stop.
    gridCell: 'search-grid-cell flex min-w-0 flex-col gap-1.5',
    gridField: 'search-grid-field w-full',
    gridFooter: 'search-grid-footer flex justify-end',
  },
  variants: {
    columns: {
      1: {},
      2: {
        gridCells: '@sm/search-grid:grid-cols-2',
      },
      3: {
        gridCells: '@sm/search-grid:grid-cols-2 @2xl/search-grid:grid-cols-3',
      },
      4: {
        gridCells: '@sm/search-grid:grid-cols-2 @3xl/search-grid:grid-cols-4',
      },
    },
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
  columns = 2,
  filter,
  items = [],
  onReset,
  value,
  variant = 'bar',
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

  function renderQuery(className: string) {
    return filter === undefined ? null : (
      <ComposedInput
        // Named even before anything is typed and after the placeholder goes:
        // ariaLabel, else the words the placeholder shows.
        ariaLabel={
          filter.ariaLabel ?? filter.placeholder ?? labels.search.placeholder
        }
        debounce
        defaultValue={filter.defaultValue}
        leftSection={<SearchIcon />}
        loading={filter.loading}
        onChange={filter.onChange}
        placeholder={filter.placeholder ?? labels.search.placeholder}
        rootClass={className}
        value={filter.value}
      />
    )
  }

  const reset =
    onReset === undefined ? null : (
      <Button
        className="search-reset"
        disabled={activeCount === 0 && !queryFilled}
        onClick={onReset}
        size="sm"
        variant="ghost"
      >
        {labels.search.reset}
      </Button>
    )

  if (variant === 'grid') {
    const { grid, gridCell, gridCells, gridField, gridFooter } = gridStyles({
      columns,
    })

    return (
      <div className={grid()} data-testid="search-root" data-variant="grid">
        {renderQuery(gridField())}

        <div className={gridCells()} data-testid="search-grid-cells">
          {items.map((item) => (
            // A <label> around the field names it — the one way to name a
            // control this bar does not build. Every field it holds must put
            // its own control first: NumberInput draws its Decrease button
            // before the input by CSS order, not by DOM order, for this reason.
            <label
              className={gridCell()}
              data-testid={`search-cell-${item.id}`}
              key={item.id}
            >
              {item.label === undefined ? null : (
                <span className={filterLabelClass()}>{item.label}</span>
              )}
              {item.field}
            </label>
          ))}
        </div>

        {reset === null ? null : <div className={gridFooter()}>{reset}</div>}
      </div>
    )
  }

  return (
    <div className={rootClass()} data-testid="search-root">
      <div className={rowClass()} data-testid="search-row">
        {renderQuery(fieldClass())}

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
            asChild
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

        {reset}
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
