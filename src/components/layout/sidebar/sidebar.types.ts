import type React from 'react'

// ─── Sidebar configuration ────────────────────────────────────────────────────

export type SidebarSide = 'left' | 'right'

/**
 * - `sidebar`  — flush against the viewport edge (default)
 * - `floating` — detached card with rounded corners and shadow
 * - `inset`    — content area is inset inside the page frame
 */
export type SidebarVariant = 'sidebar' | 'floating' | 'inset'

/**
 * - `offcanvas` — slides fully off-screen when collapsed
 * - `icon`      — shrinks to a 3rem icon rail; tooltips / popovers reveal labels
 * - `none`      — never collapses
 */
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

export type SidebarState = 'expanded' | 'collapsed'

// ─── Context ──────────────────────────────────────────────────────────────────

export type SidebarContextValue = {
  state: SidebarState
  variant: SidebarVariant
  open: boolean
  setOpen: (open: boolean | ((current: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  /** Collapsible mode of the nearest <Sidebar>. Needed by SidebarMenuCollapsible for dual-mode rendering. */
  collapsible: SidebarCollapsible
}

// ─── SidebarProvider ──────────────────────────────────────────────────────────

export type SidebarProviderProps = React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: SidebarVariant
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export type SidebarProps = React.ComponentProps<'div'> & {
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────

export type SidebarTriggerProps = React.ComponentProps<'button'> & {
  /** Render as a child element instead of the default button. */
  asChild?: boolean
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────

/** The main content area that sits next to (or inside) the sidebar. */
export type SidebarInsetProps = React.ComponentProps<'main'>

// ─── SidebarGroupLabel ────────────────────────────────────────────────────────

export type SidebarGroupLabelProps = React.ComponentProps<'div'> & {
  asChild?: boolean
}

// ─── SidebarGroupAction ───────────────────────────────────────────────────────

export type SidebarGroupActionProps = React.ComponentProps<'button'> & {
  asChild?: boolean
}

// ─── SidebarMenuButton ────────────────────────────────────────────────────────

export type SidebarMenuButtonVariant = 'default' | 'outline'

export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg'

/**
 * Tooltip shown only when the sidebar is collapsed to icon mode.
 * - `string` — used as tooltip text
 * - `object` — full control over tooltip popup props
 */
export type SidebarMenuButtonTooltip =
  | string
  | {
      children: React.ReactNode
      className?: string
      side?: 'top' | 'right' | 'bottom' | 'left'
      align?: 'start' | 'center' | 'end'
      sideOffset?: number
    }

export type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  variant?: SidebarMenuButtonVariant
  size?: SidebarMenuButtonSize
  tooltip?: SidebarMenuButtonTooltip
}

// ─── SidebarMenuAction ────────────────────────────────────────────────────────

export type SidebarMenuActionProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  /** Visible only on hover / focus-within of the parent menu item. */
  showOnHover?: boolean
}

// ─── SidebarMenuSubButton ─────────────────────────────────────────────────────

export type SidebarMenuSubButtonSize = 'sm' | 'md'

export type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: SidebarMenuSubButtonSize
  isActive?: boolean
}

// ─── SidebarMenuSkeleton ──────────────────────────────────────────────────────

export type SidebarMenuSkeletonProps = React.ComponentProps<'div'> & {
  showIcon?: boolean
}

// ─── SidebarMenuCollapsible ───────────────────────────────────────────────────

/**
 * Dual-mode collapsible menu item.
 * - **Sidebar expanded** → inline `Collapsible` panel with animated chevron.
 * - **Sidebar collapsed (icon mode)** → `Popover` anchored to the icon button.
 */
export type SidebarMenuCollapsibleProps = {
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Title shown as a bordered, non-clickable group header inside the icon-mode dropdown. */
  label?: React.ReactNode
}

export type SidebarMenuCollapsibleTriggerProps = Omit<
  React.ComponentProps<'button'>,
  // `children` is re-declared as ReactNode (not ButtonHTMLAttributes children)
  // to allow any render content (icon + label). Do not remove this Omit.
  'children'
> & {
  children: React.ReactNode
  isActive?: boolean
  variant?: SidebarMenuButtonVariant
  size?: SidebarMenuButtonSize
  /** Tooltip shown in icon mode before the popover is opened. */
  tooltip?: SidebarMenuButtonTooltip
}

export type SidebarMenuCollapsibleContentProps = React.ComponentProps<'div'>
