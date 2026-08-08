import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { cn } from '@/support/utils'

import type { PopoverProps } from './popover.types'

const popover = tv({
  slots: {
    popup: [
      'popover-popup z-50 w-fit min-w-40 rounded-lg',
      'bg-popover p-4 text-popover-foreground text-sm',
      'shadow-md outline-hidden ring-1 ring-foreground/10',
      'origin-(--transform-origin)',
      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    positioner: 'isolate z-50',
    trigger: [
      'popover-trigger inline-flex',
      'data-popup-open:[&_.input-field]:border-ring data-popup-open:[&_.input-field]:ring-3 data-popup-open:[&_.input-field]:ring-ring/50',
    ],
  },
})

const { trigger, positioner, popup } = popover()

function Popover({
  children,
  content,
  open,
  onOpenChange,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  popupClassName,
}: PropsWithChildren<PopoverProps>) {
  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <PopoverPrimitive.Trigger
        data-testid="popover-trigger"
        render={<span className={trigger()} />}
      >
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          align={align}
          className={positioner()}
          side={side}
          sideOffset={sideOffset}
        >
          <PopoverPrimitive.Popup
            className={cn(popup(), popupClassName)}
            data-testid="popover-popup"
          >
            {content}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { Popover }
