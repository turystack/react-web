'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { Dialog } from '@base-ui/react/dialog'
import { Menu } from '@base-ui/react/menu'
import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as React from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { usePortalContainer } from '@/components/portal-provider'
import { Skeleton } from '@/components/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChevronDown, ChevronsLeft, ChevronsRight } from '@/internal/icons'
import { cn } from '@/support/utils'

import { SidebarContext, useSidebar } from './sidebar.context'
import type {
  SidebarBrandProps,
  SidebarCollapsible,
  SidebarContextValue,
  SidebarGroupActionProps,
  SidebarGroupLabelProps,
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
  SidebarMenuCollapsibleContentProps,
  SidebarMenuCollapsibleProps,
  SidebarMenuCollapsibleTriggerProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarSide,
  SidebarTriggerProps,
} from './sidebar.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3.5rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ─── Contexts ─────────────────────────────────────────────────────────────────

/**
 * Internal setter exposed by SidebarProvider so that a nested <Sidebar> can
 * register its `collapsible` mode into the shared context without prop-drilling.
 */
const SidebarSetCollapsibleCtx = React.createContext<
  React.Dispatch<React.SetStateAction<SidebarCollapsible>>
>(() => {})

/** The same registration for `side`, which the trigger reads to point its icon. */
const SidebarSetSideCtx = React.createContext<
  React.Dispatch<React.SetStateAction<SidebarSide>>
>(() => {})

/**
 * Internal context set by <Sidebar> so that deep descendants
 * (e.g. SidebarMenuCollapsible) can read the structural collapsible mode.
 */
const SidebarStructureCtx = React.createContext<SidebarCollapsible>('offcanvas')

type SidebarMenuCollapsibleCtxValue = {
  isIconMode: boolean
  label?: React.ReactNode
  open: boolean
}
const SidebarMenuCollapsibleCtx =
  React.createContext<SidebarMenuCollapsibleCtxValue>({
    isIconMode: false,
    open: false,
  })

function readSidebarCookie(): boolean | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE_NAME}=([^;]*)`),
  )
  if (!match) {
    return null
  }
  return match[1] === 'true'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapperStyles = tv({
  slots: {
    sidebarWrapper: [
      'layout-sidebar-wrapper group/sidebar-wrapper flex h-svh min-h-0 w-full max-w-full overflow-hidden',
      'has-data-[variant=inset]:bg-sidebar',
      // A right-hand rail reverses the row here rather than in the consumer's
      // JSX. The gap that reserves the rail's width is in normal flow, so with
      // the markup in reading order it landed on the left while the fixed rail
      // sat on the right — and the documented fix was "write <Layout> before
      // <Layout.Sidebar>", which then broke every `peer-` selector the inset
      // variant is built from, because the rail was no longer the peer.
      //
      // The `>` is load-bearing: without it this compiles to `:has(*[data-side
      // =right])`, a descendant match at any depth, and the whole page flips
      // sides the moment anything below it says `side="right"` — a Sheet, or a
      // collapsed rail's own tooltip, if the app's portal host sits inside the
      // shell. The rail is a direct child, so say so. Guarded by `md:` because
      // below it the rail is a portalled drawer rather than a row item.
      'md:has-[>[data-side=right]]:flex-row-reverse',
    ],
  },
})

const mobileSidebarStyles = tv({
  defaultVariants: {
    side: 'left',
  },
  slots: {
    sidebarBackdrop: [
      'layout-sidebar-backdrop fixed inset-0 z-50 bg-black/50',
      'data-open:fade-in-0 duration-200 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out data-closed:fill-mode-forwards',
    ],
    sidebarMobilePopup: [
      'layout-sidebar-mobile-popup fixed inset-y-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground',
      'w-(--sidebar-width) duration-200 ease-in-out',
      'data-closed:animate-out data-open:animate-in data-closed:fill-mode-forwards',
    ],
  },
  variants: {
    side: {
      left: {
        sidebarMobilePopup:
          'data-open:slide-in-from-left data-closed:slide-out-to-left left-0 border-r',
      },
      right: {
        sidebarMobilePopup:
          'data-open:slide-in-from-right data-closed:slide-out-to-right right-0 border-l',
      },
    },
  },
})

const sidebarNoneStyles = tv({
  compoundVariants: [
    {
      class: {
        sidebarStatic: 'border-r',
      },
      side: 'left',
      variant: 'sidebar',
    },
    {
      class: {
        sidebarStatic: 'border-l',
      },
      side: 'right',
      variant: 'sidebar',
    },
  ],
  defaultVariants: {
    side: 'left',
    variant: 'sidebar',
  },
  slots: {
    sidebarStatic:
      'layout-sidebar-static flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
  },
  variants: {
    side: {
      left: {
        sidebarStatic: '',
      },
      right: {
        sidebarStatic: '',
      },
    },
    variant: {
      floating: {
        sidebarStatic: 'rounded-lg shadow-sm ring-1 ring-sidebar-border',
      },
      inset: {
        sidebarStatic: '',
      },
      sidebar: {
        sidebarStatic: '',
      },
    },
  },
})

const sidebarRootStyles = tv({
  slots: {
    sidebarRoot:
      'layout-sidebar-root group peer hidden text-sidebar-foreground md:block',
  },
})

const sidebarGapStyles = tv({
  defaultVariants: {
    variant: 'sidebar',
  },
  slots: {
    sidebarGap: [
      'layout-sidebar-gap relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
      'group-data-[collapsible=offcanvas]:w-0',
      'group-data-[side=right]:rotate-180',
    ],
  },
  variants: {
    variant: {
      floating: {
        sidebarGap:
          'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
      },
      inset: {
        sidebarGap:
          'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
      },
      sidebar: {
        sidebarGap: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
      },
    },
  },
})

const sidebarContainerStyles = tv({
  defaultVariants: {
    variant: 'sidebar',
  },
  slots: {
    sidebarContainer: [
      'layout-sidebar-container fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width)',
      'transition-[left,right,width] duration-200 ease-linear',
      'data-[side=right]:right-0 data-[side=left]:left-0',
      'data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
      'data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
      'md:flex',
    ],
  },
  variants: {
    variant: {
      floating: {
        sidebarContainer:
          'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
      },
      inset: {
        sidebarContainer:
          'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
      },
      sidebar: {
        sidebarContainer: [
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          'group-data-[side=left]:border-r group-data-[side=right]:border-l',
        ],
      },
    },
  },
})

const sidebarInnerStyles = tv({
  slots: {
    sidebarInner: [
      'layout-sidebar-inner flex size-full flex-col bg-sidebar',
      'group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm',
      'group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border',
    ],
  },
})

const structureStyles = tv({
  slots: {
    sidebarContent: [
      'layout-sidebar-content no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto',
      'group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:overflow-hidden',
    ],
    sidebarFooter:
      'layout-sidebar-footer flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    sidebarGroup:
      'layout-sidebar-group relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    // The same 32px square, at the same gutter, as the brand's action above it
    // and every menu row below it. `top-3.5 right-3 w-5` was a metric of its
    // own: a 20px box 12px from the edge, which put the `+` two pixels off the
    // toggle's axis and nothing else's.
    sidebarGroupAction: [
      'layout-sidebar-group-action absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-md p-0',
      'text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform',
      'group-data-[collapsible=icon]:hidden',
      'after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
    ],
    sidebarGroupContent:
      'layout-sidebar-group-content w-full text-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center',
    sidebarGroupLabel: [
      'layout-sidebar-group-label flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs',
      'outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear',
      'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
      'focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
    ],
    sidebarHeader:
      'layout-sidebar-header flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    sidebarMenu:
      'layout-sidebar-menu flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:items-center',
    sidebarMenuBadge: [
      'layout-sidebar-menu-badge pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center',
      'justify-center rounded-md px-1 font-medium text-sidebar-foreground text-xs tabular-nums',
      'peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden',
      'peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1',
      'peer-data-active/menu-button:text-sidebar-accent-foreground',
    ],
    sidebarMenuCollapsiblePanel: [
      'layout-sidebar-menu-collapsible-panel overflow-hidden transition-[height] duration-200 ease-linear',
      'h-(--collapsible-panel-height)',
      'data-[ending-style]:h-0 data-[starting-style]:h-0',
    ],
    sidebarMenuItem:
      'layout-sidebar-menu-item group/menu-item relative group-data-[collapsible=icon]:w-auto',
    sidebarMenuSub: [
      'layout-sidebar-menu-sub mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 gap-1 border-sidebar-border border-l px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
    ],
    sidebarMenuSubItem:
      'layout-sidebar-menu-sub-item group/menu-sub-item relative',
    // The thickness is the whole element. Base UI's Separator renders a bare
    // <div role="separator"> with no intrinsic size, and this copy carried only
    // a colour — so every divider in every rail was 0px tall and invisible,
    // including the one the docs point at and call "a separator". The library's
    // own Separator gets it from the same two data-attribute rules.
    sidebarSeparator: [
      'layout-sidebar-separator shrink-0 bg-sidebar-border',
      'data-horizontal:h-px data-horizontal:w-auto',
      'data-vertical:w-px data-vertical:self-stretch',
    ],
  },
})

const {
  sidebarHeader: headerClass,
  sidebarFooter: footerClass,
  sidebarContent: contentClass,
  sidebarSeparator: separatorClass,
  sidebarGroup: groupClass,
  sidebarGroupLabel: groupLabelClass,
  sidebarGroupAction: groupActionClass,
  sidebarGroupContent: groupContentClass,
  sidebarMenu: menuClass,
  sidebarMenuItem: menuItemClass,
  sidebarMenuBadge: menuBadgeClass,
  sidebarMenuSub: menuSubClass,
  sidebarMenuSubItem: menuSubItemClass,
  sidebarMenuCollapsiblePanel: collapsiblePanelClass,
} = structureStyles()

const brandStyles = tv({
  slots: {
    // One DOM order, two directions. The action closes the row at full width,
    // in the same column as a group's own action — the `+` beside a section
    // title — and `flex-col-reverse` lifts it *above* the mark on the strip,
    // which is where it has to be: it is the control that undoes the collapse,
    // so it cannot be the thing that shrinks out of reach.
    //
    // The brand takes no horizontal padding of its own. The header's `p-2` is
    // the rail's gutter, and sharing it is what puts the 32px mark's centre on
    // the same axis as the 16px icon of every menu row below it.
    sidebarBrand: [
      // `h-12` matches a `size="lg"` menu row, which is what a sidebar footer
      // ends in — the account. Both ends of the rail are then the same block
      // inside the same `p-2`, so the mark sits as far from the top edge as
      // the avatar does from the bottom. At `h-8` it did not: a 32px brand
      // against a 48px account row put 8px above and 18px below.
      'layout-sidebar-brand flex h-12 w-full min-w-0 items-center gap-2',
      'group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:w-8',
      'group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-1',
      'group-data-[collapsible=icon]:justify-center',
    ],
    // The control is normalised to the rail's own icon column — 32px, the size
    // of a menu row — so it lines up with the icons below it instead of
    // standing 4px wider in every direction on its own.
    sidebarBrandAction: [
      'layout-sidebar-brand-action flex shrink-0 items-center justify-center',
      '[&>button]:size-8!',
    ],
    sidebarBrandLogo: [
      'layout-sidebar-brand-logo flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
      'bg-sidebar-primary text-sidebar-primary-foreground [&_svg]:size-4 [&_svg]:shrink-0',
    ],
    sidebarBrandSubtitle:
      'layout-sidebar-brand-subtitle truncate text-sidebar-foreground/70 text-xs',
    sidebarBrandText: [
      'layout-sidebar-brand-text grid min-w-0 flex-1 text-left leading-tight',
      'group-data-[collapsible=icon]:hidden',
    ],
    sidebarBrandTitle:
      'layout-sidebar-brand-title truncate font-semibold text-sm',
  },
})

const {
  sidebarBrand: brandClass,
  sidebarBrandAction: brandActionClass,
  sidebarBrandLogo: brandLogoClass,
  sidebarBrandSubtitle: brandSubtitleClass,
  sidebarBrandText: brandTextClass,
  sidebarBrandTitle: brandTitleClass,
} = brandStyles()

const menuButtonStyles = tv({
  defaultVariants: {
    isActive: false,
    size: 'default',
    variant: 'default',
  },
  slots: {
    sidebarMenuButton: [
      'layout-sidebar-menu-button peer/menu-button group/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm',
      'outline-hidden ring-sidebar-ring transition-[width,height,padding]',
      'group-has-data-[sidebar=menu-action]/menu-item:pr-8',
      'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2! group-has-data-[sidebar=menu-action]/menu-item:group-data-[collapsible=icon]:pr-2!',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
      'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
      'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
      'data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground',
      'data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground',
      '[&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0',
      // On the strip only the leading mark survives. This used to hide
      // `span:last-child`, which reads the row as "icon, then label" and is
      // wrong the moment anything trails the label: an account row of avatar,
      // name and chevron has no span as its last child, so nothing matched and
      // ~200px of content stayed inside a 32px button — clipped at both ends
      // rather than collapsed.
      'group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden',
    ],
  },
  variants: {
    isActive: {
      true: {
        sidebarMenuButton:
          'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
      },
    },
    size: {
      default: {
        sidebarMenuButton: 'h-8 text-sm',
      },
      lg: {
        sidebarMenuButton: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
      sm: {
        sidebarMenuButton: 'h-7 text-xs',
      },
    },
    variant: {
      default: {
        sidebarMenuButton:
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
      outline: {
        sidebarMenuButton:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
    },
  },
})

const menuActionStyles = tv({
  slots: {
    sidebarMenuAction: [
      'layout-sidebar-menu-action absolute top-1.5 right-1 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-md p-0',
      'text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform',
      'peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden',
      'peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1',
      'after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
    ],
  },
  variants: {
    showOnHover: {
      true: {
        sidebarMenuAction: [
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100',
          'aria-expanded:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground md:opacity-0',
        ],
      },
    },
  },
})

const menuSubButtonStyles = tv({
  defaultVariants: {
    isActive: false,
    size: 'md',
  },
  slots: {
    sidebarMenuSubButton: [
      'layout-sidebar-menu-sub-button flex h-7 min-w-0 -translate-x-px cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2',
      'text-sidebar-foreground outline-hidden ring-sidebar-ring',
      'group-data-[collapsible=icon]:hidden',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
      'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
      'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
      'data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground',
      '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
    ],
  },
  variants: {
    isActive: {
      true: {
        sidebarMenuSubButton:
          'bg-sidebar-accent text-sidebar-accent-foreground',
      },
    },
    size: {
      md: {
        sidebarMenuSubButton: 'text-sm',
      },
      sm: {
        sidebarMenuSubButton: 'text-xs',
      },
    },
  },
})

const menuSkeletonStyles = tv({
  slots: {
    sidebarMenuSkeleton:
      'layout-sidebar-menu-skeleton flex h-8 items-center gap-2 rounded-md px-2',
    sidebarMenuSkeletonIcon:
      'layout-sidebar-menu-skeleton-icon block size-4 shrink-0',
    sidebarMenuSkeletonText:
      'layout-sidebar-menu-skeleton-text block h-4 max-w-(--skeleton-width) flex-1',
  },
})

const tooltipPopupStyles = tv({
  slots: {
    sidebarTooltip: [
      'layout-sidebar-tooltip z-50 w-fit max-w-xs rounded-md',
      'origin-(--transform-origin) bg-foreground px-3 py-1.5 text-background text-xs',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      'data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
  },
})

const collapsibleDropdownStyles = tv({
  slots: {
    sidebarMenuDropdownItem: [
      'layout-sidebar-menu-dropdown-item flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm',
      'outline-hidden focus:bg-accent focus:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    sidebarMenuDropdownLabel: [
      'layout-sidebar-menu-dropdown-label pointer-events-none select-none',
      'px-2 py-1.5 font-medium text-muted-foreground text-xs',
      'mb-1 border-b pb-1.5',
    ],
    sidebarMenuDropdownPopup: [
      'layout-sidebar-menu-dropdown-popup z-50 max-h-(--available-height) min-w-40 origin-(--transform-origin)',
      'overflow-y-auto overflow-x-hidden rounded-lg p-1',
      'bg-popover text-popover-foreground text-sm shadow-md',
      'outline-none ring-1 ring-foreground/10',
      'data-[side=right]:slide-in-from-left-2',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out data-closed:overflow-hidden',
    ],
    sidebarMenuDropdownPositioner:
      'layout-sidebar-menu-dropdown-positioner isolate z-50 outline-none',
  },
})

// ─── SidebarProvider ──────────────────────────────────────────────────────────

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  variant = 'sidebar',
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  // Collapsible mode is registered by the nested <Sidebar> via SidebarSetCollapsibleCtx.
  const [collapsible, setCollapsible] =
    React.useState<SidebarCollapsible>('offcanvas')
  const [side, setSide] = React.useState<SidebarSide>('left')

  const setOpen = React.useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(next)
      } else {
        _setOpen(next)
      }
      // biome-ignore lint/suspicious/noDocumentCookie: sidebar persistence pattern from shadcn
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)),
    [isMobile, setOpen],
  )

  // The toggle writes `sidebar_state`; reading it back on mount is what turns
  // that write into persistence. It runs after the first paint so a server
  // render and the first client render still agree on `defaultOpen`.
  const isOpenControlled = openProp !== undefined
  React.useEffect(() => {
    if (isOpenControlled) {
      return
    }
    const stored = readSidebarCookie()
    if (stored !== null) {
      _setOpen(stored)
    }
  }, [isOpenControlled])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      collapsible,
      isMobile,
      open,
      openMobile,
      setOpen,
      setOpenMobile,
      side,
      state,
      toggleSidebar,
      variant,
    }),
    [
      collapsible,
      isMobile,
      open,
      openMobile,
      setOpen,
      side,
      toggleSidebar,
      state,
      variant,
    ],
  )

  return (
    <SidebarSetSideCtx.Provider value={setSide}>
      <SidebarSetCollapsibleCtx.Provider value={setCollapsible}>
        <SidebarContext.Provider value={contextValue}>
          <div
            className={wrapperStyles().sidebarWrapper({
              className,
            })}
            data-slot="sidebar-wrapper"
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        </SidebarContext.Provider>
      </SidebarSetCollapsibleCtx.Provider>
    </SidebarSetSideCtx.Provider>
  )
}

// ─── SidebarRoot ──────────────────────────────────────────────────────────────

function SidebarRoot({
  side = 'left',
  variant: variantProp,
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: SidebarProps) {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile,
    variant: contextVariant,
  } = useSidebar()
  const variant = variantProp ?? contextVariant
  const portalContainer = usePortalContainer()

  // Register this sidebar's collapsible mode into the provider context so that
  // SidebarMenuCollapsible (and useSidebar() consumers) can read it.
  const setCollapsible = React.useContext(SidebarSetCollapsibleCtx)
  const setSide = React.useContext(SidebarSetSideCtx)
  React.useLayoutEffect(() => {
    setCollapsible(collapsible)
    setSide(side)
  }, [collapsible, setCollapsible, setSide, side])

  if (collapsible === 'none') {
    return (
      <SidebarStructureCtx.Provider value={collapsible}>
        <div
          className={sidebarNoneStyles({
            side,
            variant,
          }).sidebarStatic({
            className,
          })}
          data-side={side}
          data-slot="sidebar"
          data-variant={variant}
          {...props}
        >
          {children}
        </div>
      </SidebarStructureCtx.Provider>
    )
  }

  if (isMobile) {
    const { sidebarBackdrop, sidebarMobilePopup } = mobileSidebarStyles({
      side: side as 'left' | 'right',
    })
    return (
      <SidebarStructureCtx.Provider value={collapsible}>
        <Dialog.Root onOpenChange={setOpenMobile} open={openMobile}>
          <Dialog.Portal container={portalContainer}>
            <Dialog.Backdrop className={sidebarBackdrop()} />
            <Dialog.Popup
              // The consumer's className reaches the drawer too. It was
              // destructured out of `props` and then only ever applied to the
              // desktop rail, so a `<Layout.Sidebar className>` silently did
              // nothing below 768px — the one width where nobody is looking.
              className={sidebarMobilePopup({
                className,
              })}
              data-mobile="true"
              data-side={side}
              data-sidebar="sidebar"
              data-slot="sidebar"
              data-variant={variant}
              style={
                {
                  '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                } as React.CSSProperties
              }
              {...props}
            >
              <div className="layout-sidebar-mobile-inner flex h-full w-full flex-col">
                {children}
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </SidebarStructureCtx.Provider>
    )
  }

  return (
    <SidebarStructureCtx.Provider value={collapsible}>
      <div
        className={sidebarRootStyles().sidebarRoot()}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-side={side}
        data-slot="sidebar"
        data-state={state}
        data-variant={variant}
      >
        {/* spacer that reserves width in the layout */}
        <div
          className={sidebarGapStyles({
            variant,
          }).sidebarGap()}
          data-slot="sidebar-gap"
        />
        <div
          className={sidebarContainerStyles({
            variant,
          }).sidebarContainer({
            className,
          })}
          data-side={side}
          data-slot="sidebar-container"
          {...props}
        >
          <div
            className={sidebarInnerStyles().sidebarInner()}
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
          >
            {children}
          </div>
        </div>
      </div>
    </SidebarStructureCtx.Provider>
  )
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────

function SidebarTrigger({
  ariaLabel,
  asChild,
  children,
  className,
  disabled,
  loading,
  onClick,
  size = 'icon-sm',
  variant = 'ghost',
}: React.PropsWithChildren<SidebarTriggerProps>) {
  const { side, state, toggleSidebar } = useSidebar()

  // Which way the rail will move, not what it is. A static icon makes the
  // control a coin flip: on a collapsed strip the one thing a reader needs to
  // know is that pressing it brings the rail back.
  const pointsAway =
    side === 'left' ? state === 'expanded' : state !== 'expanded'
  const Chevrons = pointsAway ? ChevronsLeft : ChevronsRight

  return (
    <Button
      ariaLabel={ariaLabel}
      asChild={asChild}
      className={className}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      disabled={disabled}
      loading={loading}
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      size={size}
      variant={variant}
    >
      {children ?? (
        <>
          <Chevrons />
          <span className="layout-sidebar-trigger-label sr-only">
            Toggle Sidebar
          </span>
        </>
      )}
    </Button>
  )
}

// ─── Structure ────────────────────────────────────────────────────────────────

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={headerClass({
        className,
      })}
      data-sidebar="header"
      data-slot="sidebar-header"
      {...props}
    />
  )
}

/**
 * The logo and the product name, collapsed to the logo alone on the icon rail.
 *
 * Written by hand this is four `group-data-[collapsible=icon]:` overrides on
 * three nested elements, and getting one wrong is invisible until the rail is
 * collapsed: the showcase and the dashboard demo each wrote their own, and one
 * of the two overflowed the 3.5rem rail because the label had no `min-w-0`
 * parent to truncate against. The rail is the one place a consumer cannot see
 * their mistake in the default state, so the library owns the incantation.
 */
function SidebarBrand({
  action,
  children,
  className,
  logo,
  subtitle,
  ...props
}: SidebarBrandProps) {
  return (
    <div
      className={brandClass({
        className,
      })}
      data-slot="sidebar-brand"
      {...props}
    >
      {logo === undefined ? null : (
        <span className={brandLogoClass()} data-slot="sidebar-brand-logo">
          {logo}
        </span>
      )}
      <span className={brandTextClass()} data-slot="sidebar-brand-text">
        <span className={brandTitleClass()}>{children}</span>
        {subtitle === undefined ? null : (
          <span className={brandSubtitleClass()}>{subtitle}</span>
        )}
      </span>
      {action === undefined ? null : (
        <span className={brandActionClass()} data-slot="sidebar-brand-action">
          {action}
        </span>
      )}
    </div>
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={footerClass({
        className,
      })}
      data-sidebar="footer"
      data-slot="sidebar-footer"
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={contentClass({
        className,
      })}
      data-sidebar="content"
      data-slot="sidebar-content"
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SeparatorPrimitive>, 'className'> & {
  className?: string
}) {
  return (
    <SeparatorPrimitive
      className={separatorClass({
        className,
      })}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      data-testid="separator"
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={groupClass({
        className,
      })}
      data-sidebar="group"
      data-slot="sidebar-group"
      {...props}
    />
  )
}

function SidebarGroupLabel({ className, ...props }: SidebarGroupLabelProps) {
  return (
    <div
      className={groupLabelClass({
        className,
      })}
      data-sidebar="group-label"
      data-slot="sidebar-group-label"
      {...props}
    />
  )
}

function SidebarGroupAction({ className, ...props }: SidebarGroupActionProps) {
  return (
    <ButtonPrimitive
      className={groupActionClass({
        className,
      })}
      data-sidebar="group-action"
      data-slot="sidebar-group-action"
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={groupContentClass({
        className,
      })}
      data-sidebar="group-content"
      data-slot="sidebar-group-content"
      {...props}
    />
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={menuClass({
        className,
      })}
      data-sidebar="menu"
      data-slot="sidebar-menu"
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      className={menuItemClass({
        className,
      })}
      data-sidebar="menu-item"
      data-slot="sidebar-menu-item"
      {...props}
    />
  )
}

function SidebarMenuButton({
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar()
  const portalContainer = usePortalContainer()

  // No tooltip or sidebar is not in collapsed icon mode → plain button
  if (!tooltip || state !== 'collapsed' || isMobile) {
    return (
      <button
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          menuButtonStyles({
            isActive,
            size,
            variant,
          }).sidebarMenuButton({
            className,
          }),
        )}
        data-active={isActive || undefined}
        data-sidebar="menu-button"
        data-size={size}
        data-slot="sidebar-menu-button"
        {...props}
      />
    )
  }

  const tooltipContent =
    typeof tooltip === 'string' ? tooltip : tooltip.children
  const tooltipSide =
    typeof tooltip === 'string' ? ('right' as const) : (tooltip.side ?? 'right')
  const tooltipOffset =
    typeof tooltip === 'string' ? 4 : (tooltip.sideOffset ?? 4)
  const tooltipAlign =
    typeof tooltip === 'string'
      ? ('center' as const)
      : (tooltip.align ?? 'center')

  return (
    <TooltipPrimitive.Provider delay={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          aria-current={isActive ? 'page' : undefined}
          className={menuButtonStyles({
            isActive,
            size,
            variant,
          }).sidebarMenuButton({
            className,
          })}
          data-active={isActive || undefined}
          data-sidebar="menu-button"
          data-size={size}
          data-slot="sidebar-menu-button"
          {...props}
        />
        <TooltipPrimitive.Portal container={portalContainer}>
          <TooltipPrimitive.Positioner
            align={tooltipAlign}
            className="layout-sidebar-tooltip-positioner isolate z-50"
            side={tooltipSide}
            sideOffset={tooltipOffset}
          >
            <TooltipPrimitive.Popup
              className={tooltipPopupStyles().sidebarTooltip()}
            >
              {tooltipContent}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

function SidebarMenuAction({
  showOnHover = false,
  className,
  ...props
}: SidebarMenuActionProps) {
  return (
    <ButtonPrimitive
      className={menuActionStyles({
        showOnHover,
      }).sidebarMenuAction({
        className,
      })}
      data-sidebar="menu-action"
      data-slot="sidebar-menu-action"
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={menuBadgeClass({
        className,
      })}
      data-sidebar="menu-badge"
      data-slot="sidebar-menu-badge"
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  showIcon = false,
  className,
  ...props
}: SidebarMenuSkeletonProps) {
  const [width] = React.useState(
    () => `${Math.floor(Math.random() * 40) + 50}%`,
  )
  const {
    sidebarMenuSkeleton: root,
    sidebarMenuSkeletonIcon: icon,
    sidebarMenuSkeletonText: text,
  } = menuSkeletonStyles()

  return (
    <div
      className={root({
        className,
      })}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
      {...props}
    >
      {showIcon && (
        <span className={icon()} data-sidebar="menu-skeleton-icon">
          <Skeleton height="sm" shape="rectangle" width="xs" />
        </span>
      )}
      <span
        className={text()}
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      >
        <Skeleton height="sm" />
      </span>
    </div>
  )
}

// ─── Sub Menu ─────────────────────────────────────────────────────────────────

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  // In icon mode the sub renders inside a Menu.Popup portal — strip the
  // sidebar-specific indentation/border styles so it looks like a plain list.
  return (
    <ul
      className={
        isIconMode
          ? className
          : menuSubClass({
              className,
            })
      }
      data-sidebar="menu-sub"
      data-slot="sidebar-menu-sub"
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  return (
    <li
      className={
        isIconMode
          ? className
          : menuSubItemClass({
              className,
            })
      }
      data-sidebar="menu-sub-item"
      data-slot="sidebar-menu-sub-item"
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  size = 'md',
  isActive = false,
  className,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  const { sidebarMenuDropdownItem: item } = collapsibleDropdownStyles()

  // In icon mode, render as a Menu.Item so keyboard navigation works.
  if (isIconMode) {
    return (
      <Menu.Item
        aria-current={isActive ? 'page' : undefined}
        className={item({
          className,
        })}
        data-active={isActive || undefined}
        data-sidebar="menu-sub-button"
        data-slot="sidebar-menu-sub-button"
        render={<a {...props} />}
      >
        {children}
      </Menu.Item>
    )
  }

  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={menuSubButtonStyles({
        isActive,
        size,
      }).sidebarMenuSubButton({
        className,
      })}
      data-active={isActive || undefined}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-slot="sidebar-menu-sub-button"
      {...props}
    >
      {children}
    </a>
  )
}

// ─── SidebarMenuCollapsible ───────────────────────────────────────────────────

/**
 * Dual-mode collapsible menu item.
 * - Sidebar expanded  → inline Collapsible panel with animated chevron.
 * - Sidebar icon mode → dropdown Menu anchored to the icon button.
 *
 * Closing on collapse: when the sidebar collapses, all open collapsibles are
 * reset to closed so they don't reopen pre-expanded on the next toggle.
 */
function SidebarMenuCollapsibleRoot({
  children,
  className,
  defaultOpen,
  label,
  open: openProp,
  onOpenChange,
}: SidebarMenuCollapsibleProps) {
  const { state } = useSidebar()
  const collapsible = React.useContext(SidebarStructureCtx)
  const isIconMode = state === 'collapsed' && collapsible === 'icon'

  // ── Panel state (expanded mode) ──────────────────────────────────────────
  // Supports controlled (openProp) and uncontrolled (panelOpen) usage.
  const [panelOpen, setPanelOpen] = React.useState(defaultOpen ?? false)
  const effectivePanelOpen = openProp ?? panelOpen

  const handlePanelChange = React.useCallback(
    (val: boolean) => {
      setPanelOpen(val)
      onOpenChange?.(val)
    },
    [onOpenChange],
  )

  // Close the panel whenever the sidebar collapses so it never carries over
  // as an already-open panel on the next expansion.
  const onOpenChangeRef = React.useRef(onOpenChange)
  React.useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange
  })
  React.useLayoutEffect(() => {
    if (state === 'collapsed') {
      setPanelOpen(false)
      onOpenChangeRef.current?.(false)
    }
  }, [state])

  // ── Dropdown state (icon mode) ───────────────────────────────────────────
  // Fully independent from panel state. Resets to closed on every mode switch
  // so the dropdown never opens automatically when the sidebar collapses.
  const [menuOpen, setMenuOpen] = React.useState(false)
  React.useLayoutEffect(() => {
    setMenuOpen(false)
  }, [isIconMode])

  const ctxValue = React.useMemo(
    () => ({
      isIconMode,
      label,
      open: effectivePanelOpen,
    }),
    [effectivePanelOpen, isIconMode, label],
  )

  if (isIconMode) {
    return (
      <SidebarMenuCollapsibleCtx.Provider value={ctxValue}>
        <Menu.Root onOpenChange={setMenuOpen} open={menuOpen}>
          <div
            className={className}
            data-sidebar="menu-collapsible"
            data-slot="sidebar-menu-collapsible"
          >
            {children}
          </div>
        </Menu.Root>
      </SidebarMenuCollapsibleCtx.Provider>
    )
  }

  return (
    <SidebarMenuCollapsibleCtx.Provider value={ctxValue}>
      <CollapsiblePrimitive.Root
        className={className}
        data-sidebar="menu-collapsible"
        data-slot="sidebar-menu-collapsible"
        onOpenChange={handlePanelChange}
        open={effectivePanelOpen}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </SidebarMenuCollapsibleCtx.Provider>
  )
}

function SidebarMenuCollapsibleTrigger({
  children,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuCollapsibleTriggerProps) {
  const { isIconMode, open } = React.useContext(SidebarMenuCollapsibleCtx)
  const { isMobile } = useSidebar()
  const portalContainer = usePortalContainer()

  const triggerClass = menuButtonStyles({
    isActive,
    size,
    variant,
  }).sidebarMenuButton({
    className,
  })
  const sharedDataProps = {
    'data-active': isActive || undefined,
    'data-sidebar': 'menu-button',
    'data-size': size,
    'data-slot': 'sidebar-menu-collapsible-trigger',
  }

  if (isIconMode) {
    const tooltipContent = !tooltip
      ? null
      : typeof tooltip === 'string'
        ? tooltip
        : tooltip.children
    const tooltipSide =
      !tooltip || typeof tooltip === 'string'
        ? ('right' as const)
        : (tooltip.side ?? 'right')
    const tooltipOffset =
      !tooltip || typeof tooltip === 'string' ? 4 : (tooltip.sideOffset ?? 4)
    const tooltipAlign =
      !tooltip || typeof tooltip === 'string'
        ? ('center' as const)
        : (tooltip.align ?? 'center')

    if (!tooltipContent || isMobile) {
      return (
        <Menu.Trigger className={triggerClass} {...sharedDataProps} {...props}>
          {children}
        </Menu.Trigger>
      )
    }

    return (
      <TooltipPrimitive.Provider delay={200}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger
            className={triggerClass}
            render={<Menu.Trigger />}
            {...sharedDataProps}
            {...props}
          >
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal container={portalContainer}>
            <TooltipPrimitive.Positioner
              align={tooltipAlign}
              className="layout-sidebar-tooltip-positioner isolate z-50"
              side={tooltipSide}
              sideOffset={tooltipOffset}
            >
              <TooltipPrimitive.Popup
                className={tooltipPopupStyles().sidebarTooltip()}
              >
                {tooltipContent}
              </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    )
  }

  return (
    <CollapsiblePrimitive.Trigger
      className={triggerClass}
      {...sharedDataProps}
      {...props}
    >
      {children}
      <ChevronDown
        className="layout-sidebar-menu-collapsible-chevron ml-auto -rotate-90 transition-transform duration-200 data-[open]:rotate-0"
        data-open={open || undefined}
        data-slot="sidebar-menu-collapsible-chevron"
      />
    </CollapsiblePrimitive.Trigger>
  )
}

function SidebarMenuCollapsibleContent({
  children,
  className,
  ...props
}: SidebarMenuCollapsibleContentProps) {
  const { isIconMode, label } = React.useContext(SidebarMenuCollapsibleCtx)
  const portalContainer = usePortalContainer()
  const {
    sidebarMenuDropdownPositioner: positioner,
    sidebarMenuDropdownPopup: popup,
    sidebarMenuDropdownLabel: groupLabel,
  } = collapsibleDropdownStyles()

  if (isIconMode) {
    return (
      <Menu.Portal container={portalContainer}>
        <Menu.Positioner
          align="start"
          className={positioner()}
          side="right"
          sideOffset={4}
        >
          <Menu.Popup
            className={popup({
              className,
            })}
            data-slot="sidebar-menu-collapsible-content"
            {...props}
          >
            {label && (
              <Menu.Group>
                <Menu.GroupLabel className={groupLabel()}>
                  {label}
                </Menu.GroupLabel>
                {children}
              </Menu.Group>
            )}
            {!label && children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    )
  }

  return (
    <CollapsiblePrimitive.Panel
      className={collapsiblePanelClass({
        className,
      })}
      data-slot="sidebar-menu-collapsible-content"
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  )
}

// ─── Compound component ───────────────────────────────────────────────────────

const Sidebar = Object.assign(SidebarRoot, {
  Brand: SidebarBrand,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: Object.assign(SidebarGroup, {
    Action: SidebarGroupAction,
    Content: SidebarGroupContent,
    Label: SidebarGroupLabel,
  }),
  Header: SidebarHeader,
  Menu: Object.assign(SidebarMenu, {
    Action: SidebarMenuAction,
    Badge: SidebarMenuBadge,
    Button: SidebarMenuButton,
    Collapsible: Object.assign(SidebarMenuCollapsibleRoot, {
      Content: SidebarMenuCollapsibleContent,
      Trigger: SidebarMenuCollapsibleTrigger,
    }),
    Item: SidebarMenuItem,
    Skeleton: SidebarMenuSkeleton,
    Sub: Object.assign(SidebarMenuSub, {
      Button: SidebarMenuSubButton,
      Item: SidebarMenuSubItem,
    }),
  }),
  Provider: SidebarProvider,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
})

export { Sidebar }
