'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { Dialog } from '@base-ui/react/dialog'
import { Menu } from '@base-ui/react/menu'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as React from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { Separator } from '@/components/separator'
import { Skeleton } from '@/components/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChevronDown, PanelLeft } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  SidebarCollapsible,
  SidebarContextValue,
  SidebarGroupActionProps,
  SidebarGroupLabelProps,
  SidebarInsetProps,
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
  SidebarMenuCollapsibleContentProps,
  SidebarMenuCollapsibleProps,
  SidebarMenuCollapsibleTriggerProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
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

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

/**
 * Internal setter exposed by SidebarProvider so that a nested <Sidebar> can
 * register its `collapsible` mode into the shared context without prop-drilling.
 */
const SidebarSetCollapsibleCtx = React.createContext<
  React.Dispatch<React.SetStateAction<SidebarCollapsible>>
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

function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return ctx
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapperStyles = tv({
  base: [
    'group/sidebar-wrapper flex h-svh min-h-0 w-full max-w-full overflow-hidden',
    'has-data-[variant=inset]:bg-sidebar',
  ],
})

const mobileSidebarStyles = tv({
  defaultVariants: {
    side: 'left',
  },
  slots: {
    backdrop: [
      'fixed inset-0 z-50 bg-black/50',
      'data-open:fade-in-0 duration-200 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out data-closed:fill-mode-forwards',
    ],
    popup: [
      'fixed inset-y-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground',
      'w-(--sidebar-width) duration-200 ease-in-out',
      'data-closed:animate-out data-open:animate-in data-closed:fill-mode-forwards',
    ],
  },
  variants: {
    side: {
      left: {
        popup:
          'data-open:slide-in-from-left data-closed:slide-out-to-left left-0 border-r',
      },
      right: {
        popup:
          'data-open:slide-in-from-right data-closed:slide-out-to-right right-0 border-l',
      },
    },
  },
})

const sidebarNoneStyles = tv({
  base: 'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
})

const sidebarRootStyles = tv({
  base: 'group peer hidden text-sidebar-foreground md:block',
})

const sidebarGapStyles = tv({
  base: [
    'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
    'group-data-[collapsible=offcanvas]:w-0',
    'group-data-[side=right]:rotate-180',
  ],
  defaultVariants: {
    variant: 'sidebar',
  },
  variants: {
    variant: {
      floating:
        'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
      inset:
        'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
      sidebar: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
    },
  },
})

const sidebarContainerStyles = tv({
  base: [
    'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width)',
    'transition-[left,right,width] duration-200 ease-linear',
    'data-[side=right]:right-0 data-[side=left]:left-0',
    'data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
    'data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
    'md:flex',
  ],
  defaultVariants: {
    variant: 'sidebar',
  },
  variants: {
    variant: {
      floating:
        'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
      inset:
        'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
      sidebar: [
        'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        'group-data-[side=left]:border-r group-data-[side=right]:border-l',
      ],
    },
  },
})

const sidebarInnerStyles = tv({
  base: [
    'flex size-full flex-col bg-sidebar',
    'group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm',
    'group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border',
  ],
})

const sidebarInsetStyles = tv({
  base: [
    'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background',
    'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
    'md:peer-data-[variant=inset]:overflow-hidden md:peer-data-[variant=inset]:rounded-xl',
    'md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:border-border md:peer-data-[variant=inset]:shadow-sm',
    'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
  ],
  defaultVariants: {
    state: 'expanded',
    variant: 'sidebar',
  },
  variants: {
    state: {
      collapsed: '',
      expanded: '',
    },
    variant: {
      floating: '',
      inset: '',
      sidebar: '',
    },
  },
})

const structureStyles = tv({
  slots: {
    collapsiblePanel: [
      'overflow-hidden transition-[height] duration-200 ease-linear',
      'h-(--collapsible-panel-height)',
      'data-[ending-style]:h-0 data-[starting-style]:h-0',
    ],
    content: [
      'no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto',
      'group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:overflow-hidden',
    ],
    footer:
      'flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    group:
      'relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    groupAction: [
      'absolute top-3.5 right-3 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-md p-0',
      'text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform',
      'group-data-[collapsible=icon]:hidden',
      'after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
    ],
    groupContent:
      'w-full text-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center',
    groupLabel: [
      'flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs',
      'outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear',
      'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
      'focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
    ],
    header:
      'flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
    menu: 'flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:items-center',
    menuBadge: [
      'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center',
      'justify-center rounded-md px-1 font-medium text-sidebar-foreground text-xs tabular-nums',
      'peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden',
      'peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1',
      'peer-data-active/menu-button:text-sidebar-accent-foreground',
    ],
    menuItem: 'group/menu-item relative group-data-[collapsible=icon]:w-auto',
    menuSub: [
      'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 gap-1 border-sidebar-border border-l px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
    ],
    menuSubItem: 'group/menu-sub-item relative',
    separator: 'w-auto bg-sidebar-border',
  },
})

const {
  header: headerClass,
  footer: footerClass,
  content: contentClass,
  separator: separatorClass,
  group: groupClass,
  groupLabel: groupLabelClass,
  groupAction: groupActionClass,
  groupContent: groupContentClass,
  menu: menuClass,
  menuItem: menuItemClass,
  menuBadge: menuBadgeClass,
  menuSub: menuSubClass,
  menuSubItem: menuSubItemClass,
  collapsiblePanel: collapsiblePanelClass,
} = structureStyles()

const menuButtonStyles = tv({
  base: [
    'peer/menu-button group/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm',
    'outline-hidden ring-sidebar-ring transition-[width,height,padding]',
    'group-has-data-[sidebar=menu-action]/menu-item:pr-8',
    'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2! group-has-data-[sidebar=menu-action]/menu-item:group-data-[collapsible=icon]:pr-2!',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
    'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground',
    'data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground',
    '[&>span:last-child]:truncate group-data-[collapsible=icon]:[&>span:last-child]:hidden [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  defaultVariants: {
    isActive: false,
    size: 'default',
    variant: 'default',
  },
  variants: {
    isActive: {
      true: 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
    },
    size: {
      default: 'h-8 text-sm',
      lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      sm: 'h-7 text-xs',
    },
    variant: {
      default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      outline:
        'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
    },
  },
})

const menuActionStyles = tv({
  base: [
    'absolute top-1.5 right-1 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-md p-0',
    'text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform',
    'peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden',
    'peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1',
    'after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    'focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
  ],
  variants: {
    showOnHover: {
      true: [
        'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100',
        'aria-expanded:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground md:opacity-0',
      ],
    },
  },
})

const menuSubButtonStyles = tv({
  base: [
    'flex h-7 min-w-0 -translate-x-px cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2',
    'text-sidebar-foreground outline-hidden ring-sidebar-ring',
    'group-data-[collapsible=icon]:hidden',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
    'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground',
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
  ],
  defaultVariants: {
    isActive: false,
    size: 'md',
  },
  variants: {
    isActive: {
      true: 'bg-sidebar-accent text-sidebar-accent-foreground',
    },
    size: {
      md: 'text-sm',
      sm: 'text-xs',
    },
  },
})

const menuSkeletonStyles = tv({
  slots: {
    icon: 'size-4 rounded-md',
    root: 'flex h-8 items-center gap-2 rounded-md px-2',
    text: 'h-4 max-w-(--skeleton-width) flex-1',
  },
})

const tooltipPopupStyles = tv({
  base: [
    'z-50 w-fit max-w-xs rounded-md',
    'origin-(--transform-origin) bg-foreground px-3 py-1.5 text-background text-xs',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in',
    'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
  ],
})

const collapsibleDropdownStyles = tv({
  slots: {
    groupLabel: [
      'pointer-events-none select-none',
      'px-2 py-1.5 font-medium text-muted-foreground text-xs',
      'mb-1 border-b pb-1.5',
    ],
    item: [
      'flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm',
      'outline-hidden focus:bg-accent focus:text-accent-foreground',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      '[&>svg]:size-4 [&>svg]:shrink-0',
    ],
    popup: [
      'z-50 max-h-(--available-height) min-w-40 origin-(--transform-origin)',
      'overflow-y-auto overflow-x-hidden rounded-lg p-1',
      'bg-popover text-popover-foreground text-sm shadow-md',
      'outline-none ring-1 ring-foreground/10',
      'data-[side=right]:slide-in-from-left-2',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out data-closed:overflow-hidden',
    ],
    positioner: 'isolate z-50 outline-none',
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
      toggleSidebar,
      state,
      variant,
    ],
  )

  return (
    <SidebarSetCollapsibleCtx.Provider value={setCollapsible}>
      <SidebarContext.Provider value={contextValue}>
        <div
          className={wrapperStyles({
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

  // Register this sidebar's collapsible mode into the provider context so that
  // SidebarMenuCollapsible (and useSidebar() consumers) can read it.
  const setCollapsible = React.useContext(SidebarSetCollapsibleCtx)
  React.useLayoutEffect(() => {
    setCollapsible(collapsible)
  }, [collapsible, setCollapsible])

  if (collapsible === 'none') {
    return (
      <SidebarStructureCtx.Provider value={collapsible}>
        <div
          className={sidebarNoneStyles({
            className,
          })}
          data-slot="sidebar"
          {...props}
        >
          {children}
        </div>
      </SidebarStructureCtx.Provider>
    )
  }

  if (isMobile) {
    const { backdrop, popup } = mobileSidebarStyles({
      side: side as 'left' | 'right',
    })
    return (
      <SidebarStructureCtx.Provider value={collapsible}>
        <Dialog.Root onOpenChange={setOpenMobile} open={openMobile}>
          <Dialog.Portal>
            <Dialog.Backdrop className={backdrop()} />
            <Dialog.Popup
              className={popup()}
              data-mobile="true"
              data-sidebar="sidebar"
              data-slot="sidebar"
              style={
                {
                  '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                } as React.CSSProperties
              }
              {...props}
            >
              <div className="flex h-full w-full flex-col">{children}</div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </SidebarStructureCtx.Provider>
    )
  }

  return (
    <SidebarStructureCtx.Provider value={collapsible}>
      <div
        className={sidebarRootStyles()}
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
          })}
          data-slot="sidebar-gap"
        />
        <div
          className={sidebarContainerStyles({
            className,
            variant,
          })}
          data-side={side}
          data-slot="sidebar-container"
          {...props}
        >
          <div
            className={sidebarInnerStyles()}
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

function SidebarTrigger({ onClick }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      size="icon-sm"
      variant="ghost"
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────

function SidebarInset({ className, ...props }: SidebarInsetProps) {
  const { state, variant } = useSidebar()

  return (
    <main
      className={sidebarInsetStyles({
        className,
        state,
        variant,
      })}
      data-slot="sidebar-inset"
      {...props}
    />
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
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={separatorClass({
        className,
      })}
      data-sidebar="separator"
      data-slot="sidebar-separator"
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

function SidebarGroupLabel({
  className,
  asChild: _asChild,
  ...props
}: SidebarGroupLabelProps) {
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

function SidebarGroupAction({
  className,
  asChild: _asChild,
  ...props
}: SidebarGroupActionProps) {
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
  asChild: _asChild,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar()

  // No tooltip or sidebar is not in collapsed icon mode → plain button
  if (!tooltip || state !== 'collapsed' || isMobile) {
    return (
      <button
        className={cn(
          menuButtonStyles({
            className,
            isActive,
            size,
            variant,
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

  return (
    <TooltipPrimitive.Provider delay={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger
          className={menuButtonStyles({
            className,
            isActive,
            size,
            variant,
          })}
          data-active={isActive || undefined}
          data-sidebar="menu-button"
          data-size={size}
          data-slot="sidebar-menu-button"
          {...props}
        />
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            className="isolate z-50"
            side={tooltipSide}
            sideOffset={tooltipOffset}
          >
            <TooltipPrimitive.Popup className={tooltipPopupStyles()}>
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
  asChild: _asChild,
  className,
  ...props
}: SidebarMenuActionProps) {
  return (
    <ButtonPrimitive
      className={menuActionStyles({
        className,
        showOnHover,
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
  const { root, icon, text } = menuSkeletonStyles()

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
        <Skeleton className={icon()} data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className={text()}
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
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
  asChild: _asChild,
  className,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  const { isIconMode } = React.useContext(SidebarMenuCollapsibleCtx)
  const { item } = collapsibleDropdownStyles()

  // In icon mode, render as a Menu.Item so keyboard navigation works.
  if (isIconMode) {
    return (
      <Menu.Item
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
      className={menuSubButtonStyles({
        className,
        isActive,
        size,
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

  const triggerClass = menuButtonStyles({
    className,
    isActive,
    size,
    variant,
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
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner
              className="isolate z-50"
              side={tooltipSide}
              sideOffset={tooltipOffset}
            >
              <TooltipPrimitive.Popup className={tooltipPopupStyles()}>
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
        className="ml-auto -rotate-90 transition-transform duration-200 data-[open]:rotate-0"
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
  const { positioner, popup, groupLabel } = collapsibleDropdownStyles()

  if (isIconMode) {
    return (
      <Menu.Portal>
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
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: Object.assign(SidebarGroup, {
    Action: SidebarGroupAction,
    Content: SidebarGroupContent,
    Label: SidebarGroupLabel,
  }),
  Header: SidebarHeader,
  Inset: SidebarInset,
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

export { Sidebar, useSidebar }
