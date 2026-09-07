import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { usePortalContainer } from '@/components/portal-provider'
import { cn } from '@/support/utils'

import type { PopoverProps } from './popover.types'

/**
 * The field the trigger wraps keeps a focus ring for as long as the popup it
 * opened is on screen. It lives beside the slots rather than inside them so the
 * bracketed selector stays one readable rule.
 */
const triggerOpen =
  'data-popup-open:[&_.input-field]:border-ring data-popup-open:[&_.input-field]:ring-3 data-popup-open:[&_.input-field]:ring-ring/50'

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
    positioner: 'popover-positioner isolate z-50',
    trigger: ['popover-trigger inline-flex', triggerOpen],
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
  const portalContainer = usePortalContainer()

  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange} open={open}>
      {/*
        The trigger wraps whatever the consumer nests inside it, which is a
        real control of their own — a Button, an Input. Telling Base UI the
        rendered element is not a native <button> is what gives the wrapper
        `role="button"` and stops it warning; the negative tabIndex keeps the
        nested control as the single tab stop for the pair.
      */}
      <PopoverPrimitive.Trigger
        data-testid="popover-trigger"
        nativeButton={false}
        render={<span className={trigger()} />}
        tabIndex={-1}
      >
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer}>
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
