/**
 * Layout.Sidebar
 *
 * The navigation rail of the application shell, composed from a provider, the
 * rail itself and its parts: Header, Brand, Content, Group, Menu, Footer.
 *
 * Behavior:
 * - Every prop below is semantic. No part takes `className`, `style` or the
 *   attributes of the element it renders: the look is the library's, and the
 *   two things an embedding page legitimately needs — how tall the shell is and
 *   how wide the rail is — are the provider's `height` and `width`
 * - `height="viewport"` (default) makes the shell the screen: h-svh, and the
 *   rail is `position: fixed` against the window
 * - `height="fill"` makes the shell as tall as its parent, for a shell inside a
 *   framed box: the wrapper is h-full, `relative` and `overflow-clip`, and the
 *   rail is `position: absolute` against it. `relative` makes the wrapper the
 *   box popovers measure from; `overflow-clip` keeps an off-screen rail (the
 *   collapsed offcanvas one) from turning the frame into a scroll container
 * - `width` picks the rail's width: sm 14rem, md 16rem (default), lg 20rem. The
 *   icon strip stays 3.5rem and the mobile drawer 18rem
 * - `banner` puts a full-width strip (usually `<Alert layout="banner">`) above
 *   the rail and the Layout. The provider's `height` then belongs to a column
 *   of banner + row, and the row fills what the banner leaves — it switches to
 *   the `fill` behaviour (absolute rail), so the rail starts under the banner
 *   and ends at the bottom of the shell. Below md the drawer still overlays
 *   the whole screen
 * - Content scrolls without a scrollbar; while more of the rail lies above or
 *   below what is shown, a fade in the rail's colour marks that edge, so a
 *   group cut off at the bottom reads as "scroll for more" rather than as the
 *   end. Measured on scroll and on resize (at most once a frame), decorative
 *   (aria-hidden, no pointer), without a transition under reduced motion, and
 *   absent on the collapsed icon rail, which clips instead of scrolling
 * - Icon-only controls (Group.Action, Menu.Action) require `ariaLabel`
 * - On the collapsed icon rail a Group.Label is faded and pulled out of view,
 *   and also taken out of the accessibility tree (aria-hidden + inert), so a
 *   screen reader does not read section titles the rail does not show;
 *   expanded (and in the mobile drawer) it is read as usual
 * - On the collapsed icon rail a Menu.Button (and a Menu.Collapsible.Trigger)
 *   takes its accessible name from its tooltip text when no `ariaLabel` is
 *   given, so the tooltip is written once; expanded, the label names it
 * - Menu.Button takes `leftSection`, `description` and `rightSection` for a
 *   two-line row (the account row: avatar, name over email, chevron). All
 *   parts render as spans, so no block element sits inside the <button>; do
 *   not build the row from Box/Flex children. The row is then named by its
 *   label (children) alone and described by the description and right
 *   section; an `ariaLabel` (or, collapsed, the tooltip text) names it
 *   instead. On the collapsed icon rail only the leftSection shows. Use
 *   `size="lg"` for two lines. Without those props the children form is
 *   unchanged: icon and label as children
 * - `disabledReason` on Menu.Button, Menu.Action, Menu.Sub.Button,
 *   Group.Action and Menu.Collapsible.Trigger blocks it like `disabled` and
 *   says why: it stays in the tab order (aria-disabled, not the attribute), a
 *   tooltip on its right shows the reason on hover and on keyboard focus, and
 *   the control is described by it (ARC-ERR-9), after any description a
 *   composing parent gave it. Click, Enter and Space do nothing, and a menu or
 *   panel it triggers does not open. On the collapsed icon rail the reason
 *   replaces the label tooltip — one tooltip, the one that explains — while
 *   the label still names the row
 * - A blocked Menu.Sub.Button drops its href (and a router Link's), so
 *   nothing navigates; it stays a focusable link. A blocked Group.Action or
 *   Menu.Action keeps its corner; any other blocked control in a Group keeps
 *   its place in the flow
 * - Menu.Button, Menu.Action, Group.Action, Menu.Sub.Button and
 *   Menu.Collapsible.Trigger compose: under `DropdownMenu.Trigger asChild` or a
 *   Base UI `render`, the handlers, ARIA state and ref the parent injects reach
 *   the element they render. Those are forwarded at runtime and are not part
 *   of the contract
 *
 * Implementation:
 * - <Layout.Sidebar.Provider height="fill" width="lg">
 *     <Layout.Sidebar collapsible="icon">
 *       <Layout.Sidebar.Header>
 *         <Layout.Sidebar.Brand action={<Layout.Sidebar.Trigger />}>Acme</Layout.Sidebar.Brand>
 *       </Layout.Sidebar.Header>
 *       <Layout.Sidebar.Content>
 *         <Layout.Sidebar.Group>
 *           <Layout.Sidebar.Group.Label>Platform</Layout.Sidebar.Group.Label>
 *           <Layout.Sidebar.Group.Action ariaLabel="Add"><Plus /></Layout.Sidebar.Group.Action>
 *           <Layout.Sidebar.Menu>
 *             <Layout.Sidebar.Menu.Item>
 *               <Layout.Sidebar.Menu.Button isActive tooltip="Orders">…</Layout.Sidebar.Menu.Button>
 *             </Layout.Sidebar.Menu.Item>
 *             <Layout.Sidebar.Menu.Item>
 *               <Layout.Sidebar.Menu.Button disabledReason="Ask an admin for access" tooltip="Billing">…</Layout.Sidebar.Menu.Button>
 *             </Layout.Sidebar.Menu.Item>
 *           </Layout.Sidebar.Menu>
 *         </Layout.Sidebar.Group>
 *       </Layout.Sidebar.Content>
 *       <Layout.Sidebar.Footer>
 *         <Layout.Sidebar.Menu.Button size="lg" tooltip="Ana Souza" leftSection={<Avatar …/>}
 *           description="ana@acme.com" rightSection={<ChevronsUpDown />}>Ana Souza</Layout.Sidebar.Menu.Button>
 *       </Layout.Sidebar.Footer>
 *     </Layout.Sidebar>
 *     <Layout>…</Layout>
 *   </Layout.Sidebar.Provider>
 *
 * Dependencies: Base UI (Button, Collapsible, Dialog, Menu, Separator, Tooltip),
 * Button, Skeleton
 */

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

/**
 * - `viewport` — h-svh, the shell owns the screen and the rail is fixed to the
 *   window (the default)
 * - `fill`     — h-full flex-1, the shell fills whatever box it was given and
 *   the rail is positioned against it
 */
export type SidebarHeight = 'viewport' | 'fill'

/** The rail's width: `sm` 14rem, `md` 16rem (default), `lg` 20rem. */
export type SidebarWidth = 'sm' | 'md' | 'lg'

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

export type SidebarProviderProps = {
  children?: React.ReactNode // the rail and the Layout beside it
  defaultOpen?: boolean // starting open state; default true
  open?: boolean // controlled open state
  onOpenChange?: (open: boolean) => void // called with the next open state
  variant?: SidebarVariant // default variant for the rail; default sidebar
  height?: SidebarHeight // viewport-tall, or as tall as its parent; default viewport
  width?: SidebarWidth // the rail's width; default md
  banner?: React.ReactNode // full-width strip above the rail and the Layout; usually <Alert layout="banner">
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export type SidebarProps = {
  children?: React.ReactNode // the rail's parts
  side?: SidebarSide // edge the rail is pinned to; default left
  variant?: SidebarVariant // overrides the provider variant
  collapsible?: SidebarCollapsible // what collapsing does; default offcanvas
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────

/** Everything the trigger forwards to the Button it renders. */
export type SidebarTriggerProps = Pick<
  ButtonProps,
  | 'ariaLabel'
  | 'asChild'
  | 'disabled'
  | 'loading'
  | 'onClick'
  | 'size'
  | 'variant'
> & {
  children?: React.ReactNode // replaces the default chevron icon
}

// ─── SidebarBrand ─────────────────────────────────────────────────────────────

export type SidebarBrandProps = {
  /** The product name. Hidden with the rest of the words on the icon rail. */
  children?: React.ReactNode
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

// ─── Structural parts ─────────────────────────────────────────────────────────

/** Layout.Sidebar.Header — the top block: brand, workspace switcher. */
export type SidebarHeaderProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Content — the scrolling middle; fades an edge while more lies past it. */
export type SidebarContentProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Footer — the bottom block: account, sign out. */
export type SidebarFooterProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Separator — a horizontal rule in the sidebar border colour. */
export type SidebarSeparatorProps = {}

/** Layout.Sidebar.Group — one titled section of the rail. */
export type SidebarGroupProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Group.Content — the body of a group. */
export type SidebarGroupContentProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Menu — the <ul> of a group. */
export type SidebarMenuProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Menu.Item — one <li>; the hover group a menu action keys off. */
export type SidebarMenuItemProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Menu.Badge — a count pinned to the right of a row. */
export type SidebarMenuBadgeProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Menu.Sub — the <ul> of a nested list. */
export type SidebarMenuSubProps = {
  children?: React.ReactNode
}

/** Layout.Sidebar.Menu.Sub.Item — one <li> of a nested list. */
export type SidebarMenuSubItemProps = {
  children?: React.ReactNode
}

// ─── SidebarGroupLabel ────────────────────────────────────────────────────────

export type SidebarGroupLabelProps = {
  children?: React.ReactNode // the section title
}

// ─── SidebarGroupAction ───────────────────────────────────────────────────────

export type SidebarGroupActionProps = {
  children?: React.ReactNode // the icon
  ariaLabel: string // accessible name; required, the action is icon-only
  onClick?: React.MouseEventHandler<HTMLButtonElement> // click handler
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, tooltip says why
}

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

export type SidebarMenuButtonProps = {
  children?: React.ReactNode // icon and label; with a section prop, the label (title line) alone
  description?: React.ReactNode // second line under the label, muted (an email); phrasing content only
  leftSection?: React.ReactNode // leading element (an avatar, an icon); the only part the collapsed icon rail shows; phrasing content only
  rightSection?: React.ReactNode // trailing element (a chevron, a count); phrasing content only
  isActive?: boolean // marks the current route; default false
  variant?: SidebarMenuButtonVariant // default or outline; default default
  size?: SidebarMenuButtonSize // row height; default default
  tooltip?: SidebarMenuButtonTooltip // shown on the collapsed icon rail; its text names the row there
  onClick?: React.MouseEventHandler<HTMLButtonElement> // click handler
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, wins the rail tooltip
  ariaLabel?: string // accessible name, for a row whose content is not text; wins over the tooltip
}

// ─── SidebarMenuAction ────────────────────────────────────────────────────────

export type SidebarMenuActionProps = {
  children?: React.ReactNode // the icon
  ariaLabel: string // accessible name; required, the action is icon-only
  onClick?: React.MouseEventHandler<HTMLButtonElement> // click handler
  disabledReason?: string // blocks it, stays focusable, tooltip says why
  /** Visible only on hover / focus-within of the parent menu item. */
  showOnHover?: boolean
}

// ─── SidebarMenuSubButton ─────────────────────────────────────────────────────

export type SidebarMenuSubButtonSize = 'sm' | 'md'

export type SidebarMenuSubButtonProps = {
  children?: React.ReactNode // the nested row's label
  href?: string // where the link goes; the part renders an <a>
  isActive?: boolean // marks the current nested route; default false
  size?: SidebarMenuSubButtonSize // text size; default md
  onClick?: React.MouseEventHandler<HTMLAnchorElement> // click handler
  disabledReason?: string // blocks it: no href, stays focusable, says why
}

// ─── SidebarMenuSkeleton ──────────────────────────────────────────────────────

export type SidebarMenuSkeletonProps = {
  showIcon?: boolean // adds a square placeholder for the row icon
}

// ─── SidebarMenuCollapsible ───────────────────────────────────────────────────

/**
 * Dual-mode collapsible menu item.
 * - **Sidebar expanded** → inline `Collapsible` panel with animated chevron.
 * - **Sidebar collapsed (icon mode)** → `Popover` anchored to the icon button.
 */
export type SidebarMenuCollapsibleProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Title shown as a bordered, non-clickable group header inside the icon-mode dropdown. */
  label?: React.ReactNode
}

export type SidebarMenuCollapsibleTriggerProps = {
  children: React.ReactNode // icon and label
  isActive?: boolean // marks the row as current; default false
  variant?: SidebarMenuButtonVariant // same looks as a menu button
  size?: SidebarMenuButtonSize // same heights as a menu button
  /** Tooltip shown in icon mode before the popover is opened. */
  tooltip?: SidebarMenuButtonTooltip
  ariaLabel?: string // accessible name, for a row whose content is not text
  disabled?: boolean // prevents interaction
  disabledReason?: string // blocks it, stays focusable, wins the rail tooltip
}

export type SidebarMenuCollapsibleContentProps = {
  children?: React.ReactNode // the nested rows, in a Menu.Sub
}
