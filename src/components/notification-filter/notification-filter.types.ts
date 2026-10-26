/**
 * NotificationFilter
 *
 * The controls above a notification list: all or only the unread ones, a
 * search, and a category.
 *
 * Behavior:
 * - `status` is always there: a two-option segmented control, All and Unread,
 *   each followed by its count when `counts` gives one ("Unread · 3")
 * - `search` adds a debounced search field; it reports `''` once cleared.
 *   The field owns what is being typed — `value` is where it starts, because
 *   a debounced field held from outside would drop the keystrokes typed
 *   before its first report came back
 * - `categories` adds one filter chip: suggested ("+ Categories") until a
 *   category is chosen, then "Categories: Billing" with an × that clears it.
 *   Its picker is a radio list, and choosing closes it
 * - Fully controlled: the component holds no filter state of its own, so the
 *   app decides whether the filtering happens on the server or in memory
 * - Wraps on a narrow screen instead of squeezing the controls
 *
 * Implementation:
 * - SegmentedControl for the status, Search (field only) for the query,
 *   FilterChip + Radio.Group for the category
 * - <NotificationFilter status={status} onStatusChange={setStatus} counts={{ unread: 3 }} />
 * - <NotificationFilter status={status} onStatusChange={setStatus}
 *     search={{ value: query, onChange: setQuery }}
 *     categories={[{ value: 'billing', label: 'Billing' }]} category={category} onCategoryChange={setCategory} />
 *
 * Dependencies: SegmentedControl, Search, FilterChip, Radio, LabelsProvider
 */

export type NotificationFilterStatus = 'all' | 'unread'

export type NotificationFilterCounts = {
  all?: number // shown beside All
  unread?: number // shown beside Unread
}

export type NotificationFilterSearch = {
  value: string // the query, controlled; typing is kept while the debounced change is on its way
  onChange: (value: string) => void // fires debounced; '' once cleared
  placeholder?: string // default from the labels contract
}

export type NotificationFilterCategory = {
  value: string // what onCategoryChange reports
  label: string // what the reader sees
}

export type NotificationFilterProps = {
  status: NotificationFilterStatus // which notifications show (required)
  onStatusChange: (status: NotificationFilterStatus) => void // fires on a new status (required)
  counts?: NotificationFilterCounts // numbers beside the status options
  search?: NotificationFilterSearch // adds the search field
  categories?: NotificationFilterCategory[] // adds the category chip
  category?: string // the chosen category's value
  onCategoryChange?: (value?: string) => void // fires with the chosen value, undefined once cleared
}
