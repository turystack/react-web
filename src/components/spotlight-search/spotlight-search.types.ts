/**
 * SpotlightSearch
 *
 * The search that answers while you type: a palette over the page, a field in
 * the app header whose results hang under it, or the same list in place.
 *
 * Behavior:
 * - `variant="dialog"` (default) opens over the page. It sits near the top of
 *   the viewport rather than centred, because the reader's eye is already on
 *   the field they just summoned and a dialog that grows downward keeps the
 *   first result in the same place as the tenth
 * - `variant="popover"` renders its own field, for the search box in an app
 *   header, and opens the results in a dropdown anchored under it — on focus
 *   when there is something to show, and on typing. Focus never leaves the
 *   field: the arrows walk the list through `aria-activedescendant`, Enter runs
 *   the active row, Escape closes the list and a second Escape clears the
 *   query. Clicking outside or tabbing away closes it; closing keeps what was
 *   typed. `width` picks the field's width from a preset
 * - `variant="inline"` drops the overlay and renders the same field and list in
 *   place, for a search panel that lives on a page
 * - Items are data, not children. The palette owns the matching, the flat index
 *   the arrow keys walk, and the grouping — a compound API would hand all three
 *   back to every caller, and the tenth caller would get one of them wrong
 * - Matching reads the label, the description and `keywords`, which is how
 *   "billing" finds "Invoices": the word the reader thinks in is rarely the
 *   word in the menu
 * - `emptyQueryGroups` is what shows before anything is typed — recent
 *   searches, "jump to" commands — and replaces `groups` until the query has a
 *   character in it. It is never filtered
 * - A group's `action` sits at the right of its heading — a "View all" link to
 *   the full results page. It is not a row: the arrows skip it and clicking it
 *   runs nothing
 * - The query follows the value pair: `searchValue` controls it,
 *   `defaultSearchValue` prefills it uncontrolled (a search page opened from
 *   a link that already carries `?q=`), and `onSearchChange` reports every
 *   change. The prefill is the first query only: closing the dialog still
 *   empties the field, so the next Cmd+K starts clean
 * - `onSearchChange` hands the query to the app — a request, a debounce, a
 *   server — and the palette stops filtering, because filtering a page of
 *   results the server already filtered is how rows disappear for no visible
 *   reason
 * - Running an item closes the palette; that is what a command is. An item that
 *   opens something else says so by setting `keepOpen`
 * - Arrow keys move the active row, Enter runs it, Escape closes. The active
 *   row is scrolled into view, so a long list does not strand the selection
 *   below the fold
 * - `shortcut` binds Cmd+K / Ctrl+K: it toggles the dialog, and moves focus
 *   into the popover's field
 * - `disabledReason` blocks a row and says why. Unlike `disabled`, the row
 *   stays in the arrow walk: while it is the active row (by keys or hover) a
 *   tooltip at its right shows the reason, the row is described by it so the
 *   reader hears it, and Enter or a click runs nothing
 * - The results listbox is always named: by `ariaLabel`, else by
 *   `placeholder`, else by the `spotlightSearch.results` label
 *
 * Implementation:
 * - Base UI Dialog (dialog, over the shared blurred `bg-overlay` scrim) and
 *   Base UI Popover anchored to the field (popover)
 *   own the portal, outside press and dismissal; the listbox is this
 *   component's own
 * - <SpotlightSearch groups={groups} onOpenChange={setOpen} open={open} shortcut />
 * - <SpotlightSearch emptyQueryGroups={recents} groups={results} onSearchChange={search} placeholder="Search" variant="popover" width="lg" />
 * - { id: 'export', label: 'Export CSV', disabledReason: 'Only admins can export' }
 * - <SpotlightSearch groups={[{ action: <a href="/search?q=ana">View all</a>, heading: 'Customers', items }]} variant="inline" />
 *
 * Dependencies: @base-ui/react/dialog, @base-ui/react/popover, EmptyState,
 * Loader, PortalProvider, LabelsProvider
 */

export type SpotlightSearchVariant = 'dialog' | 'popover' | 'inline'

export type SpotlightSearchWidth = 'sm' | 'md' | 'lg' | 'full'

export type SpotlightSearchItem = {
  description?: string // the line under the label: what it does, or where it goes
  disabled?: boolean // blocks the row, and visibly so
  disabledReason?: string // blocks it, still reachable by arrows; says why
  icon?: React.ReactNode // node slot before the label, never an icon name
  id: string // stable identity, and the React key (required)
  keepOpen?: boolean // keeps the palette open after the row runs, for a row that opens a step
  keywords?: string[] // words that should also find this row, beyond its label and description
  label: string // what the row says (required)
  onSelect?: () => void // runs the command
  shortcut?: string[] // the keys that also run it, rendered as keycaps on the right
}

export type SpotlightSearchGroup = {
  action?: React.ReactNode // node at the right of the heading, e.g. a "View all" link; never a row
  heading?: string // names the section above its rows
  id?: string // stable identity, and the React key; defaults to the heading
  items: SpotlightSearchItem[] // the rows of the section (required)
}

export type SpotlightSearchProps = {
  ariaLabel?: string // names the palette and its field for assistive technology
  defaultOpen?: boolean // uncontrolled initial visibility of the dialog or the dropdown
  defaultSearchValue?: string // uncontrolled initial query
  emptyQueryGroups?: SpotlightSearchGroup[] // shown instead of `groups` while the query is empty: recents, jump-to
  emptySection?: React.ReactNode // what an empty result says
  footer?: React.ReactNode // a node under the list: key hints, a count, a link to advanced search
  groups: SpotlightSearchGroup[] // the rows, in the sections they belong to (required)
  loading?: boolean // results are on their way; the field shows a loader
  onOpenChange?: (open: boolean) => void // fires when the dialog or the dropdown opens or closes
  onSearchChange?: (query: string) => void // takes over filtering entirely, for a palette backed by a server
  open?: boolean // controlled visibility of the dialog or the dropdown
  placeholder?: string // what the empty field says
  searchValue?: string // controlled query
  shortcut?: boolean // binds Cmd+K and Ctrl+K: toggles the dialog, focuses the popover's field
  variant?: SpotlightSearchVariant // dialog over the page, dropdown under its own field, or in place (default 'dialog')
  width?: SpotlightSearchWidth // width preset of the popover's field (default 'md')
}
