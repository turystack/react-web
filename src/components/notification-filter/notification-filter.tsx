import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { FilterChip } from '@/components/filter-chip'
import { useLabels } from '@/components/labels-provider'
import { Radio } from '@/components/radio'
import { Search } from '@/components/search'
import { SegmentedControl } from '@/components/segmented-control'

import type {
  NotificationFilterProps,
  NotificationFilterStatus,
} from './notification-filter.types'

const styles = tv({
  slots: {
    // Wraps rather than squeezes: on a phone the search takes its own line.
    root: 'notification-filter-root flex min-w-0 flex-wrap items-center gap-2',
    search: 'notification-filter-search min-w-48 flex-1',
  },
})

type StatusOption = {
  label: string
  value: NotificationFilterStatus
}

function withCount(label: string, count?: number): string {
  return count === undefined ? label : `${label} · ${count}`
}

export function NotificationFilter({
  categories,
  category,
  counts,
  onCategoryChange,
  onStatusChange,
  search,
  status,
}: NotificationFilterProps) {
  const labels = useLabels()
  const [pickerOpen, setPickerOpen] = useState(false)
  const { root, search: searchSlot } = styles()

  const options: StatusOption[] = [
    {
      label: withCount(labels.notifications.statusAll, counts?.all),
      value: 'all',
    },
    {
      label: withCount(labels.notifications.statusUnread, counts?.unread),
      value: 'unread',
    },
  ]
  const chosen = categories?.find((option) => option.value === category)

  return (
    <div className={root()} data-testid="notification-filter">
      <SegmentedControl<StatusOption, NotificationFilterStatus>
        ariaLabel={labels.notifications.status}
        onChange={onStatusChange}
        optionLabel="label"
        optionValue="value"
        options={options}
        size="sm"
        value={status}
      />
      {search ? (
        <div className={searchSlot()}>
          <Search
            filter={{
              value: search.value,
              onChange: (value) => search.onChange(value ?? ''),
              placeholder: search.placeholder ?? labels.notifications.search,
            }}
          />
        </div>
      ) : null}
      {categories && categories.length > 0 ? (
        <FilterChip
          label={labels.notifications.categories}
          onOpenChange={setPickerOpen}
          onRemove={onCategoryChange ? () => onCategoryChange() : undefined}
          open={pickerOpen}
          value={chosen?.label}
        >
          <Radio.Group
            ariaLabel={labels.notifications.categories}
            items={categories}
            onChange={(value) => {
              onCategoryChange?.(value)
              setPickerOpen(false)
            }}
            value={category}
          />
        </FilterChip>
      ) : null}
    </div>
  )
}
