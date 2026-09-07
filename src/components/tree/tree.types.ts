/**
 * Tree
 *
 * A hierarchy the reader can open, close and pick from.
 *
 * Behavior:
 * - Data comes in as the app's own nested objects with extractors, the same
 *   contract Select and Combobox take — no pre-mapping into a shape invented
 *   here, and no flattening that loses the nesting
 * - Expansion and selection are separate, and both are controlled/uncontrolled
 *   pairs: opening a folder is not choosing it, and a tree that conflates them
 *   makes it impossible to browse without committing
 * - Arrow keys walk the visible rows, right opens a branch, left closes it or
 *   climbs to the parent, Enter picks. That is the tree pattern, and a widget
 *   with tree roles that ignores it is worse than a list
 * - Roles are real: tree, treeitem, group, aria-expanded, aria-selected
 *
 * Implementation:
 * - Roving tabindex over the rows that are actually visible
 * - <Tree items={folders} itemKey="id" itemLabel="name" itemChildren="children" onSelect={open} />
 *
 * Dependencies: none
 */

export type TreeProps<T, V = string> = {
  ariaLabel?: string // names the tree for assistive technology
  defaultExpanded?: V[] // uncontrolled open branches
  defaultSelected?: V | null // uncontrolled selection
  itemChildren?: keyof T | ((item: T) => T[] | undefined) // how to read children
  itemDisabled?: keyof T | ((item: T) => boolean) // per-node blocking
  itemIcon?: keyof T | ((item: T) => React.ReactNode) // node slot before the label
  itemKey: keyof T | ((item: T) => V) // stable identity (required)
  itemLabel: keyof T | ((item: T) => React.ReactNode) // what the row says (required)
  items: T[] // the roots
  onExpandedChange?: (expanded: V[]) => void // fires with every open branch
  onSelect?: (value: V, item: T) => void // fires with what was picked
  expanded?: V[] // controlled open branches
  selected?: V | null // controlled selection
}
