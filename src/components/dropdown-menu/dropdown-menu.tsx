import { Menu } from '@base-ui/react/menu'
import { isValidElement, type PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { CheckIcon } from '@/internal/icons'

import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  // DropdownMenuSubContentProps,
  // DropdownMenuSubProps,
  // DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
} from './dropdown-menu.types'

const styles = tv({
  defaultVariants: {
    variant: 'default',
  },
  slots: {
    checkboxItem:
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pr-8 pl-2.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    indicator:
      'pointer-events-none absolute right-2 flex items-center justify-center',
    item: 'group/dropdown-menu-item relative flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    label: 'px-2.5 py-1.5 font-medium text-muted-foreground text-xs',
    popup:
      'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) w-(--anchor-width) min-w-40 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in data-closed:overflow-hidden',
    positioner: 'isolate z-50 outline-none',
    radioItem:
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pr-8 pl-2.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    separator: '-mx-1.5 my-1.5 h-px bg-border',
    shortcut:
      'ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground',
    subPopup:
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) w-auto min-w-24 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in',
    subTrigger:
      'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    subTriggerIcon: 'ml-auto size-4',
  },
  variants: {
    inset: {
      true: {
        label: 'pl-7',
        subTrigger: 'pl-7',
      },
    },
    variant: {
      default: {
        item: 'focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground',
      },
      destructive: {
        item: 'text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 [&_svg]:text-destructive',
      },
    },
  },
})

function DropdownMenuRoot({
  children,
  onOpenChange,
  open,
}: PropsWithChildren<DropdownMenuProps>) {
  return (
    <Menu.Root onOpenChange={onOpenChange} open={open}>
      {children}
    </Menu.Root>
  )
}

function DropdownMenuTrigger({
  asChild,
  children,
}: PropsWithChildren<DropdownMenuTriggerProps>) {
  if (asChild && isValidElement(children)) {
    return <Menu.Trigger render={children} />
  }
  return <Menu.Trigger>{children}</Menu.Trigger>
}

function DropdownMenuContent({
  align = 'start',
  children,
  side = 'bottom',
  sideOffset = 4,
  width,
}: PropsWithChildren<DropdownMenuContentProps>) {
  const s = styles()
  return (
    <Menu.Portal>
      <Menu.Positioner
        align={align}
        className={s.positioner()}
        side={side}
        sideOffset={sideOffset}
      >
        <Menu.Popup
          className={s.popup()}
          style={
            width
              ? {
                  width,
                }
              : undefined
          }
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({
  asChild,
  children,
  disabled,
  onClick,
  variant = 'default',
}: PropsWithChildren<DropdownMenuItemProps>) {
  const s = styles({
    variant,
  })

  if (asChild && isValidElement(children)) {
    return (
      <Menu.Item
        className={s.item()}
        disabled={disabled}
        onClick={onClick}
        render={children}
      />
    )
  }

  return (
    <Menu.Item className={s.item()} disabled={disabled} onClick={onClick}>
      {children}
    </Menu.Item>
  )
}

function DropdownMenuCheckboxItem({
  checked,
  children,
  disabled,
  onCheckedChange,
}: PropsWithChildren<DropdownMenuCheckboxItemProps>) {
  const s = styles()
  return (
    <Menu.CheckboxItem
      checked={checked}
      className={s.checkboxItem()}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    >
      <span className={s.indicator()}>
        <Menu.CheckboxItemIndicator>
          <CheckIcon />
        </Menu.CheckboxItemIndicator>
      </span>
      {children}
    </Menu.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  children,
  onValueChange,
  value,
}: PropsWithChildren<DropdownMenuRadioGroupProps>) {
  return (
    <Menu.RadioGroup onValueChange={onValueChange} value={value}>
      {children}
    </Menu.RadioGroup>
  )
}

function DropdownMenuRadioItem({
  children,
  disabled,
  value,
}: PropsWithChildren<DropdownMenuRadioItemProps>) {
  const s = styles()
  return (
    <Menu.RadioItem className={s.radioItem()} disabled={disabled} value={value}>
      <span className={s.indicator()}>
        <Menu.RadioItemIndicator>
          <CheckIcon />
        </Menu.RadioItemIndicator>
      </span>
      {children}
    </Menu.RadioItem>
  )
}

function DropdownMenuLabel({
  children,
  inset,
}: PropsWithChildren<DropdownMenuLabelProps>) {
  const s = styles({
    inset,
  })
  return <Menu.GroupLabel className={s.label()}>{children}</Menu.GroupLabel>
}

function DropdownMenuSeparator() {
  const s = styles()
  return <Menu.Separator className={s.separator()} />
}

function DropdownMenuShortcut({ children }: PropsWithChildren) {
  const s = styles()
  return <span className={s.shortcut()}>{children}</span>
}

function DropdownMenuGroup({ children }: PropsWithChildren) {
  return <Menu.Group>{children}</Menu.Group>
}

// function _DropdownMenuSub({
//   children,
// }: PropsWithChildren<DropdownMenuSubProps>) {
//   return <Menu.SubmenuRoot>{children}</Menu.SubmenuRoot>
// }

// function _DropdownMenuSubTrigger({
//   children,
//   inset,
// }: PropsWithChildren<DropdownMenuSubTriggerProps>) {
//   const s = styles({
//     inset,
//   })
//   return (
//     <Menu.SubmenuTrigger className={s.subTrigger()}>
//       {children}
//       <ChevronRightIcon className={s.subTriggerIcon()} />
//     </Menu.SubmenuTrigger>
//   )
// }

// function _DropdownMenuSubContent({
//   children,
// }: PropsWithChildren<DropdownMenuSubContentProps>) {
//   const s = styles()
//   return (
//     <Menu.Portal>
//       <Menu.Positioner
//         align="start"
//         alignOffset={-3}
//         className={s.positioner()}
//         side="right"
//         sideOffset={0}
//       >
//         <Menu.Popup className={s.subPopup()}>{children}</Menu.Popup>
//       </Menu.Positioner>
//     </Menu.Portal>
//   )
// }

const DropdownMenu = Object.assign(DropdownMenuRoot, {
  CheckboxItem: DropdownMenuCheckboxItem,
  Content: DropdownMenuContent,
  Group: DropdownMenuGroup,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Trigger: DropdownMenuTrigger,
})

export { DropdownMenu }
