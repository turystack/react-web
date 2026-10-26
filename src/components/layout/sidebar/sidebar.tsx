'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { Dialog } from '@base-ui/react/dialog'
import { Menu } from '@base-ui/react/menu'
import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as React from 'react'
import { tv } from 'tailwind-variants'
import { ComposedButton } from '@/components/button/button.composed'
import { usePortalContainer } from '@/components/portal-provider'
import { Skeleton } from '@/components/skeleton'
import {
  DisabledReason,
  type DisabledReasonA11y,
  describedBy,
} from '@/components/tooltip/tooltip.composed'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChevronDown, ChevronsLeft, ChevronsRight } from '@/internal/icons'

import {
  SidebarContext,
  useOptionalSidebar,
  useSidebar,
} from './sidebar.context'
import type {
  SidebarBrandProps,
  SidebarCollapsible,
  SidebarContentProps,
  SidebarContextValue,
  SidebarFooterProps,
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
  SidebarHeaderProps,
  SidebarHeight,
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuButtonProps,
  SidebarMenuButtonTooltip,
  SidebarMenuCollapsibleContentProps,
  SidebarMenuCollapsibleProps,
  SidebarMenuCollapsibleTriggerProps,
  SidebarMenuItemProps,
  SidebarMenuProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarMenuSubItemProps,
  SidebarMenuSubProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarSeparatorProps,
  SidebarSide,
  SidebarTriggerProps,
  SidebarWidth,
} from './sidebar.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH: Record<SidebarWidth, string> = {
  lg: '20rem',
  md: '16rem',
  sm: '14rem',
}
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

/**
 * The provider's `height`, read by <Sidebar> to decide what its fixed container
 * is positioned against. Internal rather than on `useSidebar()`: it is how the
 * two halves of one component agree, not a question a consumer asks.
 */
const SidebarHeightCtx = React.createContext<SidebarHeight>('viewport')

/**
 * What a composing parent injects into the element it was handed.
 *
 * `DropdownMenu.Trigger asChild`, a Base UI `render={element}`, a Collapsible or
 * a Popover trigger clone their child with the props that make it their trigger
 * — onClick, onKeyDown, aria-expanded, aria-haspopup, data-popup-open, id, ref.
 * Those arrive here at runtime whatever the public type says, and dropping them
 * leaves a button that looks like a menu trigger and opens nothing. So the
 * composable parts read `props as PublicProps & InjectedProps`, take their
 * semantic props out, and forward the rest to their DOM element.
 *
 * Never exported: this is plumbing between components, not a contract, and a
 * consumer who writes `id` or `data-foo` on a menu button gets a type error.
 */
type InjectedProps = {
  [attribute: string]: unknown
}

/**
 * The injected props minus the two a parent must not be able to restyle the
 * part with. PROP-1 is about the contract; this keeps the runtime honest to it.
 */
function composed(injected: InjectedProps): InjectedProps {
  const { className: _className, style: _style, ...rest } = injected
  return rest
}

/**
 * The reason's props for a composable part: its focus anchor, and its
 * description joined to the one a composing parent injected, not replacing it.
 */
function withReason(
  a11y: DisabledReasonA11y,
  injected: InjectedProps,
  ...own: (string | undefined)[]
): DisabledReasonA11y {
  const parent = injected['aria-describedby']

  return {
    ...a11y,
    'aria-describedby': describedBy(
      typeof parent === 'string' ? parent : undefined,
      ...own,
      a11y['aria-describedby'],
    ),
  }
}

/**
 * The accessible name a row takes on the collapsed icon rail. There the label
 * is hidden and only the icon shows, so a row the consumer did not name with
 * `ariaLabel` would be announced as an unnamed button — while the words it
 * needs are already sitting in its tooltip. An explicit `ariaLabel` wins; a
 * tooltip whose content is not plain text cannot be a name and gives none.
 */
function railName(
  ariaLabel: string | undefined,
  tooltip: SidebarMenuButtonTooltip | undefined,
): { 'aria-label'?: string } {
  if (ariaLabel !== undefined) {
    return { 'aria-label': ariaLabel }
  }
  const text = typeof tooltip === 'string' ? tooltip : tooltip?.children
  return typeof text === 'string' && text.trim() !== ''
    ? { 'aria-label': text }
    : {}
}

/** A section prop that renders something (null, undefined and false do not). */
function isSet(node: React.ReactNode): boolean {
  return node !== undefined && node !== null && node !== false
}

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

/**
 * Stores the toggle through the Cookie Store API: name, value, path and
 * lifetime go in as fields, not as a hand-assembled `document.cookie` string
 * (the lint's noDocumentCookie). A browser without the API (Safari before
 * 18.4, Firefox before 140) keeps the toggle for the page's life only — the
 * sidebar still works, it just opens from `defaultOpen` next time. A refused
 * write (a sandboxed frame, cookies blocked) is the same case, not an error.
 */
function writeSidebarCookie(open: boolean) {
  if (typeof window === 'undefined' || !('cookieStore' in window)) {
    return
  }
  window.cookieStore
    .set({
      expires: Date.now() + SIDEBAR_COOKIE_MAX_AGE * 1000,
      name: SIDEBAR_COOKIE_NAME,
      path: '/',
      value: String(open),
    })
    .catch(() => undefined)
}

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
  defaultVariants: {
    height: 'viewport',
  },
  slots: {
    sidebarWrapper: [
      'layout-sidebar-wrapper group/sidebar-wrapper flex min-h-0 w-full max-w-full overflow-hidden',
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
  variants: {
    height: {
      // `relative` makes the wrapper the box the rail is positioned against
      // (see the container's `absolute` below) and the offsetParent every
      // popover inside the shell measures from. `overflow-clip`, not the
      // `overflow-hidden` above: a hidden box is still a scroll container, and
      // a collapsed offcanvas rail sits a full rail-width off its edge — focus
      // landing in anything out there would scroll the frame sideways. A
      // clipped box cannot be scrolled at all.
      fill: {
        sidebarWrapper: 'relative h-full flex-1 overflow-clip',
      },
      viewport: {
        sidebarWrapper: 'h-svh',
      },
    },
  },
})

/**
 * The column a banner adds above the row. It takes over the height the row
 * would have had, and the row inside becomes `fill`: a rail fixed to the window
 * at `h-svh` would run under the banner and past the bottom of the screen by the
 * banner's height, where an absolute rail ends where the row ends.
 */
const frameStyles = tv({
  defaultVariants: {
    height: 'viewport',
  },
  slots: {
    sidebarBanner: 'layout-sidebar-banner w-full shrink-0',
    sidebarFrame:
      'layout-sidebar-frame flex min-h-0 w-full max-w-full flex-col overflow-hidden',
  },
  variants: {
    height: {
      fill: {
        sidebarFrame: 'h-full flex-1',
      },
      viewport: {
        sidebarFrame: 'h-svh',
      },
    },
  },
})

const mobileSidebarStyles = tv({
  defaultVariants: {
    side: 'left',
  },
  slots: {
    sidebarBackdrop: [
      'layout-sidebar-backdrop fixed inset-0 z-50 bg-overlay backdrop-blur-overlay',
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
    height: 'viewport',
    variant: 'sidebar',
  },
  slots: {
    sidebarContainer: [
      'layout-sidebar-container inset-y-0 z-10 hidden w-(--sidebar-width)',
      'transition-[left,right,width] duration-200 ease-linear',
      'data-[side=right]:right-0 data-[side=left]:left-0',
      'data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
      'data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
      'md:flex',
    ],
  },
  variants: {
    // Fixed to the window when the shell is the screen. Inside a `fill`
    // provider the rail is absolute against the wrapper instead, so it ends
    // where the wrapper ends — a fixed h-svh rail in a framed shell put the
    // footer a screen below the fold.
    height: {
      fill: {
        sidebarContainer: 'absolute h-full',
      },
      viewport: {
        sidebarContainer: 'fixed h-svh',
      },
    },
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
    sidebarGroup: [
      'layout-sidebar-group relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
      // A blocked Group.Action sits in a disabled-reason wrapper named for
      // it. That wrapper takes the action's corner, so the tooltip anchors on
      // the `+` and not on an empty box in the flow; any other blocked control
      // placed in the group keeps its place.
      '*:data-[reason-slot=sidebar-group-action]:absolute *:data-[reason-slot=sidebar-group-action]:top-2 *:data-[reason-slot=sidebar-group-action]:right-2',
    ],
    // The same 32px square, at the same gutter, as the brand's action above it
    // and every menu row below it. `top-3.5 right-3 w-5` was a metric of its
    // own: a 20px box 12px from the edge, which put the `+` two pixels off the
    // toggle's axis and nothing else's.
    sidebarGroupAction: [
      'layout-sidebar-group-action absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-md p-0',
      'in-data-[reason-slot=sidebar-group-action]:static aria-disabled:pointer-events-none aria-disabled:opacity-50',
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
    sidebarMenuItem: [
      'layout-sidebar-menu-item group/menu-item relative group-data-[collapsible=icon]:w-auto',
      // A blocked Menu.Action sits in a disabled-reason wrapper named for it,
      // which takes the action's corner at the row's height (the action's own
      // peer offsets cannot see past the wrapper).
      '*:data-[reason-slot=sidebar-menu-action]:absolute *:data-[reason-slot=sidebar-menu-action]:top-1.5 *:data-[reason-slot=sidebar-menu-action]:right-1',
      'has-data-[size=sm]:*:data-[reason-slot=sidebar-menu-action]:top-1 has-data-[size=lg]:*:data-[reason-slot=sidebar-menu-action]:top-2.5',
    ],
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

// The frame holds the scroller and the two fades, so a fade stays pinned to its
// edge while the groups scroll under it. The scroller keeps `no-scrollbar`;
// the fade is the affordance instead: shown on a side only while more of the
// rail lies past it. Decoration only — it never takes a pointer, and it is
// hidden on the icon rail, which clips instead of scrolling.
const contentFadeStyles = tv({
  slots: {
    sidebarContentFade: [
      'layout-sidebar-content-fade pointer-events-none absolute inset-x-0 z-10 h-8',
      'from-sidebar to-transparent transition-opacity duration-200 motion-reduce:transition-none',
      'group-data-[collapsible=icon]:hidden',
    ],
    sidebarContentFrame:
      'layout-sidebar-content-frame relative flex min-h-0 flex-1 flex-col',
  },
  variants: {
    edge: {
      bottom: {
        sidebarContentFade: 'bottom-0 bg-linear-to-t',
      },
      top: {
        sidebarContentFade: 'top-0 bg-linear-to-b',
      },
    },
    visible: {
      false: {
        sidebarContentFade: 'opacity-0',
      },
      true: {
        sidebarContentFade: 'opacity-100',
      },
    },
  },
})

const { sidebarContentFrame: contentFrameClass } = contentFadeStyles()

/** Which ends of the rail's scroller have more of the rail past them. */
type SidebarContentEdges = {
  bottom: boolean
  top: boolean
}

/**
 * Tracks whether Sidebar.Content can scroll toward either end. Measured on
 * mount, then on scroll (passive) and on resize, at most once a frame. The
 * scroller and each of its children are observed, so a group that opens (a
 * Menu.Collapsible) or a row that arrives re-measures as well as a window that
 * gets shorter; `deps` re-attaches the observers when the children change.
 */
function useContentEdges(deps: readonly unknown[]) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = React.useState<SidebarContentEdges>({
    bottom: false,
    top: false,
  })

  React.useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    let frame = 0

    const measure = () => {
      frame = 0
      const offset = element.scrollTop
      const room = element.scrollHeight - element.clientHeight
      const top = offset > 1
      const bottom = room - offset > 1

      setEdges((previous) =>
        previous.top === top && previous.bottom === bottom
          ? previous
          : {
              bottom,
              top,
            },
      )
    }

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure)
      }
    }

    measure()
    element.addEventListener('scroll', schedule, {
      passive: true,
    })

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(schedule)

    if (observer) {
      observer.observe(element)

      for (const child of Array.from(element.children)) {
        observer.observe(child)
      }
    }

    return () => {
      element.removeEventListener('scroll', schedule)
      observer?.disconnect()

      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, deps)

  return [ref, edges] as const
}

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
      // On the strip the toggle sits above the mark, and at the brand's 4px
      // gap the two read as one stacked control. The extra room under it is
      // what makes the toggle its own thing and the logo the start of the rail.
      'group-data-[collapsible=icon]:pb-2',
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
    // The parts of a sectioned row (leftSection, description, rightSection).
    // Phrasing only — spans — because the row is a <button>, and a button may
    // not hold block content: the account row used to be built from Box/Flex
    // divs inside it. The left section comes first, so on the icon rail the
    // rule above keeps it (the avatar) and hides the rest.
    sidebarMenuButtonBody:
      'layout-sidebar-menu-button-body grid min-w-0 flex-1 text-left leading-tight',
    sidebarMenuButtonDescription:
      'layout-sidebar-menu-button-description truncate text-sidebar-foreground/70 text-xs',
    sidebarMenuButtonLeftSection:
      'layout-sidebar-menu-button-left-section inline-flex shrink-0 items-center',
    sidebarMenuButtonRightSection:
      'layout-sidebar-menu-button-right-section ml-auto inline-flex shrink-0 items-center',
    sidebarMenuButtonTitle: 'layout-sidebar-menu-button-title truncate',
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
          'bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]',
      },
    },
  },
})

const menuActionStyles = tv({
  slots: {
    sidebarMenuAction: [
      'layout-sidebar-menu-action absolute top-1.5 right-1 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-md p-0',
      'in-data-[reason-slot=sidebar-menu-action]:static aria-disabled:pointer-events-none aria-disabled:opacity-50',
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
  height = 'viewport',
  width = 'md',
  banner,
  children,
}: SidebarProviderProps) {
  // With a banner the frame owns the height and the row fills what is left.
  const rowHeight: SidebarHeight = banner ? 'fill' : height
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
      writeSidebarCookie(next)
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

  const row = (
    <div
      className={wrapperStyles({
        height: rowHeight,
      }).sidebarWrapper()}
      data-height={rowHeight}
      data-slot="sidebar-wrapper"
      style={
        {
          '--sidebar-width': SIDEBAR_WIDTH[width],
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )

  return (
    <SidebarSetSideCtx.Provider value={setSide}>
      <SidebarSetCollapsibleCtx.Provider value={setCollapsible}>
        <SidebarContext.Provider value={contextValue}>
          <SidebarHeightCtx.Provider value={rowHeight}>
            {banner ? (
              <div
                className={frameStyles({ height }).sidebarFrame()}
                data-height={height}
                data-slot="sidebar-frame"
              >
                <div
                  className={frameStyles().sidebarBanner()}
                  data-slot="sidebar-banner"
                >
                  {banner}
                </div>
                {row}
              </div>
            ) : (
              row
            )}
          </SidebarHeightCtx.Provider>
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
  children,
}: SidebarProps) {
  const height = React.useContext(SidebarHeightCtx)
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
          }).sidebarStatic()}
          data-side={side}
          data-slot="sidebar"
          data-variant={variant}
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
              className={sidebarMobilePopup()}
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
            height,
            variant,
          }).sidebarContainer()}
          data-side={side}
          data-slot="sidebar-container"
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

function SidebarTrigger(props: SidebarTriggerProps) {
  // Composable: a header can hand the trigger to `DropdownMenu.Trigger
  // asChild` or a Tooltip trigger. See InjectedProps — Button forwards them
  // to the element the same way.
  const {
    ariaLabel,
    asChild,
    children,
    disabled,
    loading,
    onClick,
    size = 'icon-sm',
    variant = 'ghost',
    ...injected
  } = props as SidebarTriggerProps & InjectedProps
  const { side, state, toggleSidebar } = useSidebar()

  // Which way the rail will move, not what it is. A static icon makes the
  // control a coin flip: on a collapsed strip the one thing a reader needs to
  // know is that pressing it brings the rail back.
  const pointsAway =
    side === 'left' ? state === 'expanded' : state !== 'expanded'
  const Chevrons = pointsAway ? ChevronsLeft : ChevronsRight

  return (
    <ComposedButton
      {...composed(injected)}
      ariaLabel={ariaLabel}
      asChild={asChild}
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
    </ComposedButton>
  )
}

// ─── Structure ────────────────────────────────────────────────────────────────

function SidebarHeader({ children }: SidebarHeaderProps) {
  return (
    <div
      className={headerClass()}
      data-sidebar="header"
      data-slot="sidebar-header"
    >
      {children}
    </div>
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
function SidebarBrand({ action, children, logo, subtitle }: SidebarBrandProps) {
  return (
    <div className={brandClass()} data-slot="sidebar-brand">
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

function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <div
      className={footerClass()}
      data-sidebar="footer"
      data-slot="sidebar-footer"
    >
      {children}
    </div>
  )
}

function SidebarContent({ children }: SidebarContentProps) {
  const [scrollerRef, edges] = useContentEdges([children])

  return (
    <div className={contentFrameClass()} data-slot="sidebar-content-frame">
      <div
        className={contentClass()}
        data-sidebar="content"
        data-slot="sidebar-content"
        ref={scrollerRef}
      >
        {children}
      </div>
      {(['top', 'bottom'] as const).map((edge) => (
        <div
          aria-hidden="true"
          className={contentFadeStyles({
            edge,
            visible: edges[edge],
          }).sidebarContentFade()}
          data-edge={edge}
          data-slot="sidebar-content-fade"
          data-state={edges[edge] ? 'visible' : 'hidden'}
          key={edge}
        />
      ))}
    </div>
  )
}

function SidebarSeparator(_props: SidebarSeparatorProps) {
  return (
    <SeparatorPrimitive
      className={separatorClass()}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      data-testid="separator"
    />
  )
}

function SidebarGroup({ children }: SidebarGroupProps) {
  return (
    <div
      className={groupClass()}
      data-sidebar="group"
      data-slot="sidebar-group"
    >
      {children}
    </div>
  )
}

function SidebarGroupLabel({ children }: SidebarGroupLabelProps) {
  // On the collapsed icon rail the label is only faded and pulled up out of
  // view (opacity 0, -mt-8): without these it would still be read out, and
  // anything focusable in it still reached, over a rail that shows none of it.
  const sidebar = useOptionalSidebar()
  const collapsible = React.useContext(SidebarStructureCtx)
  const hidden =
    !!sidebar &&
    !sidebar.isMobile &&
    sidebar.state === 'collapsed' &&
    collapsible === 'icon'

  return (
    <div
      aria-hidden={hidden || undefined}
      className={groupLabelClass()}
      data-sidebar="group-label"
      data-slot="sidebar-group-label"
      inert={hidden || undefined}
    >
      {children}
    </div>
  )
}

function SidebarGroupAction(props: SidebarGroupActionProps) {
  // Composable: see InjectedProps.
  const {
    ariaLabel,
    children,
    disabled,
    disabledReason,
    onClick,
    ...injected
  } = props as SidebarGroupActionProps & InjectedProps
  // A reason blocks the action as surely as `disabled` does, but keeps it in
  // the tab order: a control nobody can reach cannot tell anyone why.
  const blocked = Boolean(disabledReason)

  return (
    <DisabledReason
      reason={disabledReason}
      side="right"
      slot="sidebar-group-action"
    >
      {(a11y) => (
        <ButtonPrimitive
          {...composed(injected)}
          aria-label={ariaLabel}
          className={groupActionClass()}
          data-sidebar="group-action"
          data-slot="sidebar-group-action"
          disabled={disabled || blocked}
          focusableWhenDisabled={blocked}
          onClick={onClick}
          {...withReason(a11y, injected)}
        >
          {children}
        </ButtonPrimitive>
      )}
    </DisabledReason>
  )
}

function SidebarGroupContent({ children }: SidebarGroupContentProps) {
  return (
    <div
      className={groupContentClass()}
      data-sidebar="group-content"
      data-slot="sidebar-group-content"
    >
      {children}
    </div>
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function SidebarMenu({ children }: SidebarMenuProps) {
  return (
    <ul className={menuClass()} data-sidebar="menu" data-slot="sidebar-menu">
      {children}
    </ul>
  )
}

function SidebarMenuItem({ children }: SidebarMenuItemProps) {
  return (
    <li
      className={menuItemClass()}
      data-sidebar="menu-item"
      data-slot="sidebar-menu-item"
    >
      {children}
    </li>
  )
}

function SidebarMenuButton(props: SidebarMenuButtonProps) {
  // Composable: the account and workspace rows are this button handed to
  // `DropdownMenu.Trigger asChild`. See InjectedProps.
  const {
    ariaLabel,
    children,
    description,
    disabled,
    disabledReason,
    isActive = false,
    leftSection,
    onClick,
    rightSection,
    size = 'default',
    tooltip,
    variant = 'default',
    ...injected
  } = props as SidebarMenuButtonProps & InjectedProps
  const { isMobile, state } = useSidebar()
  const portalContainer = usePortalContainer()
  const id = React.useId()

  // A reason blocks the row as surely as `disabled` does, but keeps it in the
  // tab order: a control nobody can reach cannot tell anyone why.
  const blocked = Boolean(disabledReason)
  // A tooltip on the collapsed icon rail, where the label is hidden.
  const onRail = Boolean(tooltip) && state === 'collapsed' && !isMobile
  // Plain button unless the rail's label tooltip applies. A blocked row takes
  // the reason's tooltip instead: one tooltip at a time, and the one that
  // explains wins. The label still names it (below), so nothing is lost to a
  // screen reader; a sighted user sees why before what.
  const plain = !onRail || blocked
  // The explicit ariaLabel, else — on the collapsed rail — the tooltip text.
  const name: { 'aria-label'?: string } = onRail
    ? railName(ariaLabel, tooltip)
    : ariaLabel === undefined
      ? {}
      : {
          'aria-label': ariaLabel,
        }

  // A sectioned row: [left section] [title / description] [right section],
  // all spans. It is named by its title alone and described by the second
  // line and the right section — "Ana Souza, button" before
  // "ana@acme.com". An aria-label (ariaLabel, or the tooltip on the rail)
  // replaces the title as the name, so aria-labelledby steps aside for it.
  const hasDescription = isSet(description)
  const hasLeftSection = isSet(leftSection)
  const hasRightSection = isSet(rightSection)
  const sectioned = hasDescription || hasLeftSection || hasRightSection
  const titleId = `${id}-title`
  const detailIds = [
    hasDescription ? `${id}-description` : undefined,
    hasRightSection ? `${id}-right` : undefined,
  ].filter(Boolean)

  const {
    sidebarMenuButtonBody: bodyClass,
    sidebarMenuButtonDescription: descriptionClass,
    sidebarMenuButtonLeftSection: leftSectionClass,
    sidebarMenuButtonRightSection: rightSectionClass,
    sidebarMenuButtonTitle: titleClass,
  } = menuButtonStyles()

  const content = sectioned ? (
    <>
      {hasLeftSection ? (
        <span
          className={leftSectionClass()}
          data-slot="sidebar-menu-button-left-section"
        >
          {leftSection}
        </span>
      ) : null}
      <span className={bodyClass()} data-slot="sidebar-menu-button-body">
        <span className={titleClass()} id={titleId}>
          {children}
        </span>
        {hasDescription ? (
          <span
            className={descriptionClass()}
            data-slot="sidebar-menu-button-description"
            id={`${id}-description`}
          >
            {description}
          </span>
        ) : null}
      </span>
      {hasRightSection ? (
        <span
          className={rightSectionClass()}
          data-slot="sidebar-menu-button-right-section"
          id={`${id}-right`}
        >
          {rightSection}
        </span>
      ) : null}
    </>
  ) : (
    children
  )

  // The reason joins the details, and both join a composing parent's own
  // description: the row is described by all of them.
  const buttonProps = (a11y: DisabledReasonA11y) => ({
    ...composed(injected),
    ...name,
    ...withReason(a11y, injected, ...(sectioned ? detailIds : [])),
    ...(sectioned && name['aria-label'] === undefined
      ? {
          'aria-labelledby': titleId,
        }
      : {}),
    'aria-current': isActive ? ('page' as const) : undefined,
    className: menuButtonStyles({
      isActive,
      size,
      variant,
    }).sidebarMenuButton(),
    'data-active': isActive || undefined,
    'data-sidebar': 'menu-button',
    'data-size': size,
    'data-slot': 'sidebar-menu-button',
    disabled,
    onClick,
  })

  const tooltipContent =
    tooltip === undefined || typeof tooltip === 'string'
      ? tooltip
      : tooltip.children
  const tooltipSide =
    tooltip === undefined || typeof tooltip === 'string'
      ? ('right' as const)
      : (tooltip.side ?? 'right')
  const tooltipOffset =
    tooltip === undefined || typeof tooltip === 'string'
      ? 4
      : (tooltip.sideOffset ?? 4)
  const tooltipAlign =
    tooltip === undefined || typeof tooltip === 'string'
      ? ('center' as const)
      : (tooltip.align ?? 'center')

  // One DisabledReason around every branch, so a reason that arrives or
  // leaves on the focused row only remounts the row, and hands focus back.
  return (
    <DisabledReason display="block" reason={disabledReason} side="right">
      {(a11y) => {
        if (blocked) {
          // Base UI's Button keeps it focusable (aria-disabled) and refuses
          // click, Enter, Space and pointerdown — its own and those a
          // composing trigger injected — so no menu opens from it either.
          return (
            <ButtonPrimitive
              {...buttonProps(a11y)}
              disabled
              focusableWhenDisabled
            >
              {content}
            </ButtonPrimitive>
          )
        }

        if (plain || tooltip === undefined) {
          return (
            <button type="button" {...buttonProps(a11y)}>
              {content}
            </button>
          )
        }

        return (
          <TooltipPrimitive.Provider delay={200}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger {...buttonProps(a11y)}>
                {content}
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
      }}
    </DisabledReason>
  )
}

function SidebarMenuAction(props: SidebarMenuActionProps) {
  // Composable: a row's "more" action is usually a DropdownMenu trigger. See
  // InjectedProps.
  const {
    ariaLabel,
    children,
    disabledReason,
    onClick,
    showOnHover = false,
    ...injected
  } = props as SidebarMenuActionProps & InjectedProps
  // A reason blocks the action but keeps it in the tab order. Base UI's
  // Button refuses click, Enter, Space and pointerdown — its own and those a
  // composing trigger injected — so no menu opens from it either.
  const blocked = Boolean(disabledReason)

  return (
    <DisabledReason
      reason={disabledReason}
      side="right"
      slot="sidebar-menu-action"
    >
      {(a11y) => (
        <ButtonPrimitive
          {...composed(injected)}
          aria-label={ariaLabel}
          className={menuActionStyles({
            showOnHover,
          }).sidebarMenuAction()}
          data-sidebar="menu-action"
          data-slot="sidebar-menu-action"
          disabled={blocked}
          focusableWhenDisabled={blocked}
          onClick={onClick}
          {...withReason(a11y, injected)}
        >
          {children}
        </ButtonPrimitive>
      )}
    </DisabledReason>
  )
}

function SidebarMenuBadge({ children }: SidebarMenuBadgeProps) {
  return (
    <div
      className={menuBadgeClass()}
      data-sidebar="menu-badge"
      data-slot="sidebar-menu-badge"
    >
      {children}
    </div>
  )
}

function SidebarMenuSkeleton({ showIcon = false }: SidebarMenuSkeletonProps) {
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
      className={root()}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
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

function SidebarMenuSub({ children }: SidebarMenuSubProps) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  // In icon mode the sub renders inside a Menu.Popup portal — strip the
  // sidebar-specific indentation/border styles so it looks like a plain list.
  return (
    <ul
      className={isIconMode ? undefined : menuSubClass()}
      data-sidebar="menu-sub"
      data-slot="sidebar-menu-sub"
    >
      {children}
    </ul>
  )
}

function SidebarMenuSubItem({ children }: SidebarMenuSubItemProps) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  return (
    <li
      className={isIconMode ? undefined : menuSubItemClass()}
      data-sidebar="menu-sub-item"
      data-slot="sidebar-menu-sub-item"
    >
      {children}
    </li>
  )
}

function SidebarMenuSubButton(props: SidebarMenuSubButtonProps) {
  // Composable: a router's Link hands its navigation to this anchor through
  // Base UI `render`. See InjectedProps.
  const {
    children,
    disabledReason,
    href,
    isActive = false,
    onClick,
    size = 'md',
    ...injected
  } = props as SidebarMenuSubButtonProps & InjectedProps
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  const { sidebarMenuDropdownItem: item } = collapsibleDropdownStyles()
  // A blocked link drops its href — its own and one a router's Link injected
  // — so nothing can navigate, not a click, a middle click or "open in new
  // tab". It keeps the link role and its place in the tab order (an anchor
  // with no href leaves it on its own), and a click does nothing; in icon
  // mode the menu keeps it in the arrow order instead.
  const blocked = Boolean(disabledReason)
  const anchorProps = (a11y: DisabledReasonA11y) => ({
    ...composed(injected),
    ...(blocked
      ? {
          'aria-disabled': true,
          href: undefined,
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) =>
            event.preventDefault(),
        }
      : {
          ...(href === undefined
            ? {}
            : {
                href,
              }),
          onClick,
        }),
    ...withReason(a11y, injected),
  })

  return (
    <DisabledReason display="block" reason={disabledReason} side="right">
      {(a11y) =>
        // In icon mode, render as a Menu.Item so keyboard navigation works;
        // a blocked one stays in the arrow order and refuses activation.
        isIconMode ? (
          <Menu.Item
            aria-current={isActive ? 'page' : undefined}
            className={item()}
            data-active={isActive || undefined}
            data-sidebar="menu-sub-button"
            data-slot="sidebar-menu-sub-button"
            disabled={blocked}
            render={<a {...anchorProps(a11y)} />}
          >
            {children}
          </Menu.Item>
        ) : (
          <a
            {...anchorProps(a11y)}
            {...(blocked
              ? {
                  role: 'link',
                  tabIndex: 0,
                }
              : {})}
            aria-current={isActive ? 'page' : undefined}
            className={menuSubButtonStyles({
              isActive,
              size,
            }).sidebarMenuSubButton()}
            data-active={isActive || undefined}
            data-sidebar="menu-sub-button"
            data-size={size}
            data-slot="sidebar-menu-sub-button"
          >
            {children}
          </a>
        )
      }
    </DisabledReason>
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

function SidebarMenuCollapsibleTrigger(
  props: SidebarMenuCollapsibleTriggerProps,
) {
  // Composable like Menu.Button: a parent that hands it on through `render`
  // reaches the element. See InjectedProps.
  const {
    ariaLabel,
    children,
    disabled,
    disabledReason,
    isActive = false,
    size = 'default',
    tooltip,
    variant = 'default',
    ...injected
  } = props as SidebarMenuCollapsibleTriggerProps & InjectedProps
  // A reason blocks the trigger as surely as `disabled` does, but keeps it in
  // the tab order; on the rail it replaces the label tooltip (Menu.Button).
  const blocked = Boolean(disabledReason)
  const { isIconMode, open } = React.useContext(SidebarMenuCollapsibleCtx)
  const { isMobile } = useSidebar()
  const portalContainer = usePortalContainer()

  const triggerClass = menuButtonStyles({
    isActive,
    size,
    variant,
  }).sidebarMenuButton()
  const sharedDataProps = {
    ...composed(injected),
    ...(ariaLabel === undefined
      ? {}
      : {
          'aria-label': ariaLabel,
        }),
    'data-active': isActive || undefined,
    'data-sidebar': 'menu-button',
    'data-size': size,
    'data-slot': 'sidebar-menu-collapsible-trigger',
    disabled: disabled || blocked,
  }

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

  function iconTrigger(a11y: DisabledReasonA11y) {
    if (blocked) {
      // Not a Menu.Trigger: Base UI's would take the `disabled` attribute and
      // leave the tab order. Nothing opens from a blocked row anyway.
      return (
        <ButtonPrimitive
          className={triggerClass}
          {...sharedDataProps}
          {...railName(ariaLabel, tooltip)}
          focusableWhenDisabled
          {...withReason(a11y, injected)}
        >
          {children}
        </ButtonPrimitive>
      )
    }

    if (!tooltipContent || isMobile) {
      return (
        <Menu.Trigger
          className={triggerClass}
          {...sharedDataProps}
          {...withReason(a11y, injected)}
        >
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
            {...railName(ariaLabel, tooltip)}
            {...withReason(a11y, injected)}
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

  // One DisabledReason around every branch, so a reason that arrives or
  // leaves on the focused trigger only remounts it, and hands focus back.
  // Expanded, Base UI's Collapsible.Trigger stays focusable when disabled
  // (aria-disabled) and refuses to toggle, so the reason only adds its part.
  return (
    <DisabledReason display="block" reason={disabledReason} side="right">
      {(a11y) =>
        isIconMode ? (
          iconTrigger(a11y)
        ) : (
          <CollapsiblePrimitive.Trigger
            className={triggerClass}
            {...sharedDataProps}
            {...withReason(a11y, injected)}
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
    </DisabledReason>
  )
}

function SidebarMenuCollapsibleContent({
  children,
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
            className={popup()}
            data-slot="sidebar-menu-collapsible-content"
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
      className={collapsiblePanelClass()}
      data-slot="sidebar-menu-collapsible-content"
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
