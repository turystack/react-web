/**
 * SpotlightSearch
 *
 * The palette that opens over the page: type what you want, press Enter, it
 * happens.
 *
 * Behavior:
 * - Sits near the top of the viewport rather than centred, because the reader's
 *   eye is already on the field they just summoned and a dialog that grows
 *   downward keeps the first result in the same place as the tenth
 * - Items are data, not children. The palette owns the matching, the flat index
 *   the arrow keys walk, and the grouping — a compound API would hand all three
 *   back to every caller, and the tenth caller would get one of them wrong
 * - Matching reads the label, the description and `keywords`, which is how
 *   "billing" finds "Invoices": the word the reader thinks in is rarely the
 *   word in the menu
 * - `onSearchChange` hands the query to the app — a request, a debounce, a
 *   server — and the palette stops filtering, because filtering a page of
 *   results the server already filtered is how rows disappear for no visible
 *   reason
 * - Running an item closes the palette; that is what a command is. An item that
 *   opens something else says so by setting `keepOpen`
 * - Arrow keys move the active row, Enter runs it, Escape closes. The active
 *   row is scrolled into view, so a long list does not strand the selection
 *   below the fold
 * - `inline` drops the overlay and renders the same field and list in place,
 *   for a search panel that lives on a page
 *
 * Implementation:
 * - Base UI Dialog for the portal, the backdrop, the focus trap and Escape;
 *   the positioning is this component's own
 * - <SpotlightSearch groups={groups} onOpenChange={setOpen} open={open} shortcut />
 *
 * Dependencies: @base-ui/react/dialog, EmptyState, Loader, PortalProvider,
 * LabelsProvider
 */

export type SpotlightSearchItem = {
  /** Blocks the row, and visibly so. */
  disabled?: boolean
  /** The line under the label: what it does, or where it goes. */
  description?: string
  /** Node slot before the label, never an icon name. */
  icon?: React.ReactNode
  /** Stable identity, and the React key. */
  id: string
  /** Words that should also find this row, beyond its label and description. */
  keywords?: string[]
  /** Keeps the palette open after the row runs, for a row that opens a step. */
  keepOpen?: boolean
  /** What the row says (required). */
  label: string
  /** Runs the command. */
  onSelect?: () => void
  /** The keys that also run it, rendered as keycaps on the right. */
  shortcut?: string[]
}

export type SpotlightSearchGroup = {
  /** Names the section above its rows. */
  heading?: string
  /** Stable identity, and the React key. Defaults to the heading. */
  id?: string
  items: SpotlightSearchItem[]
}

export type SpotlightSearchProps = {
  /** Names the palette for assistive technology. */
  ariaLabel?: string
  /** Uncontrolled initial visibility. */
  defaultOpen?: boolean
  /** What an empty result says. */
  emptySection?: React.ReactNode
  /** A node under the list: key hints, a count, a link to advanced search. */
  footer?: React.ReactNode
  /** The rows, in the sections they belong to (required). */
  groups: SpotlightSearchGroup[]
  /** Renders in place instead of over the page. */
  inline?: boolean
  /** Results are on their way. */
  loading?: boolean
  /** Fires when it opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Takes over filtering entirely, for a palette backed by a server. */
  onSearchChange?: (query: string) => void
  /** Controlled visibility. */
  open?: boolean
  /** What the empty field says. */
  placeholder?: string
  /** Controlled query. */
  searchValue?: string
  /** Binds Cmd+K and Ctrl+K to open it. */
  shortcut?: boolean
}
