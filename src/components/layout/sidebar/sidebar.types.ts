import type React from 'react'

import type { ButtonProps } from '@/components/button'

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
 * - `icon`      — shrinks to a 3.5rem icon rail; tooltips / popovers reveal labels
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
  /** Which edge the nearest <Sidebar> is pinned to. The trigger points its icon by it. */
  side: SidebarSide
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

/** Everything the trigger forwards to the Button it renders. */
export type SidebarTriggerProps = Pick<
  ButtonProps,
  | 'ariaLabel'
  | 'asChild'
  | 'className'
  | 'disabled'
  | 'loading'
  | 'onClick'
  | 'size'
  | 'variant'
>

// ─── SidebarBrand ─────────────────────────────────────────────────────────────

export type SidebarBrandProps = React.ComponentProps<'div'> & {
  /**
   * Leading control — the collapse toggle, a workspace switcher.
   *
   * It heads the row at full width and sits *above* the mark on the icon rail,
   * so it occupies the rail's icon column in both states: the same box, at the
   * same offset, as every menu row below it. It is also the control that undoes
   * the collapse, so it must not be the one that shrinks out of reach.
   */
  action?: React.ReactNode
  /** Mark shown at every width. It is the whole brand once the rail collapses. */
  logo?: React.ReactNode
  /** Second line under the name. Hidden with the name on the icon rail. */
  subtitle?: React.ReactNode
}

// ─── SidebarGroupLabel ────────────────────────────────────────────────────────

export type SidebarGroupLabelProps = React.ComponentProps<'div'>

// ─── SidebarGroupAction ───────────────────────────────────────────────────────

export type SidebarGroupActionProps = React.ComponentProps<'button'>

// ─── SidebarMenuButton ────────────────────────────────────────────────────────

export type SidebarMenuButtonVariant = 'default' | 'outline'

export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg'

export type SidebarTooltipSide = 'top' | 'right' | 'bottom' | 'left'

export type SidebarTooltipAlign = 'start' | 'center' | 'end'

/**
 * Tooltip shown only when the sidebar is collapsed to icon mode.
 * - `string` — used as tooltip text
 * - `object` — text plus placement (`side`, `align`, `sideOffset`)
 */
export type SidebarMenuButtonTooltip =
  | string
  | {
      children: React.ReactNode
      side?: SidebarTooltipSide
      align?: SidebarTooltipAlign
      sideOffset?: number
    }

export type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
  isActive?: boolean
  variant?: SidebarMenuButtonVariant
  size?: SidebarMenuButtonSize
  tooltip?: SidebarMenuButtonTooltip
}

// ─── SidebarMenuAction ────────────────────────────────────────────────────────

export type SidebarMenuActionProps = React.ComponentProps<'button'> & {
  /** Visible only on hover / focus-within of the parent menu item. */
  showOnHover?: boolean
}

// ─── SidebarMenuSubButton ─────────────────────────────────────────────────────

export type SidebarMenuSubButtonSize = 'sm' | 'md'

export type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
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
