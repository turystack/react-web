/**
 * DropdownMenu
 *
 * Context menu / action menu with items, checkboxes, radio groups,
 * sub-menus, labels, separators, and keyboard shortcuts.
 *
 * Behavior:
 * - Trigger click opens a floating menu via Portal
 * - Items: clickable actions with optional icon and destructive variant (red text)
 * - CheckboxItem: toggleable with check indicator
 * - RadioGroup + RadioItem: single-select within group with dot indicator
 * - Shortcut: right-aligned keyboard shortcut text
 * - Label: non-interactive section header (inset variant for alignment)
 * - Separator: horizontal divider between groups
 *
 * Implementation:
 * - Use Radix UI DropdownMenu primitives (full keyboard nav, ARIA, focus management)
 * - Portal rendering for z-index isolation
 * - Animation: zoom 95%, fade in, slide from anchor side
 * - <DropdownMenu>
 *     <DropdownMenu.Trigger asChild><Button>Actions</Button></DropdownMenu.Trigger>
 *     <DropdownMenu.Content side="bottom" align="end">
 *       <DropdownMenu.Label>Options</DropdownMenu.Label>
 *       <DropdownMenu.Item onClick={handleEdit}>Edit<DropdownMenu.Shortcut>⌘E</DropdownMenu.Shortcut></DropdownMenu.Item>
 *       <DropdownMenu.Separator />
 *       <DropdownMenu.Item variant="destructive" onClick={handleDelete}>Delete</DropdownMenu.Item>
 *       <DropdownMenu.Sub>
 *         <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
 *         <DropdownMenu.SubContent>...</DropdownMenu.SubContent>
 *       </DropdownMenu.Sub>
 *     </DropdownMenu.Content>
 *   </DropdownMenu>
 *
 * Dependencies: @radix-ui/react-dropdown-menu, @turystack/react-icons (Check, Circle, ChevronRight)
 */

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'
export type DropdownMenuAlign = 'start' | 'center' | 'end'

export type DropdownMenuProps = {
  open?: boolean // controlled open state
  onOpenChange?: (open: boolean) => void // fires on open/close
}

export type DropdownMenuTriggerProps = {
  asChild?: boolean // render as child element
}

export type DropdownMenuContentProps = {
  width?: React.CSSProperties['width'] // dropdown width
  side?: DropdownMenuSide // preferred side for popover
  align?: DropdownMenuAlign // alignment relative to trigger
  sideOffset?: number // distance from trigger in px
}

export type DropdownMenuItemVariant = 'default' | 'destructive'
export type DropdownMenuItemProps = {
  variant?: DropdownMenuItemVariant // visual variant
  disabled?: boolean // prevents interaction
  asChild?: boolean // render as child element
  onClick?: React.MouseEventHandler<HTMLDivElement> // click handler
}

export type DropdownMenuCheckboxItemProps = {
  checked?: boolean // checkbox state
  disabled?: boolean // prevents interaction
  onCheckedChange?: (checked: boolean) => void // fires on toggle
}

export type DropdownMenuRadioGroupProps = {
  value?: string // controlled selected radio value
  onValueChange?: (value: string) => void // fires on selection change
}

export type DropdownMenuRadioItemProps = {
  value: string // radio value (required)
  disabled?: boolean // prevents interaction
}

export type DropdownMenuLabelProps = {
  inset?: boolean // adds left padding for alignment with items
}

export type DropdownMenuSeparatorProps = {}

export type DropdownMenuShortcutProps = {}

export type DropdownMenuGroupProps = {}

export type DropdownMenuSubProps = {}

export type DropdownMenuSubTriggerProps = {
  inset?: boolean // adds left padding for alignment
}

export type DropdownMenuSubContentProps = {}
