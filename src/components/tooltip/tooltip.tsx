import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { type PropsWithChildren, useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import { usePortalContainer } from '@/components/portal-provider'

import type { TooltipProps } from './tooltip.types'

const tooltip = tv({
  slots: {
    arrow: [
      'tooltip-arrow z-50 size-2.5 rotate-45',
      'rounded-[2px]',
      'bg-foreground fill-foreground',
      'translate-y-[calc(-50%-2px)]',
      'data-[side=bottom]:top-1',
      'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
      'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2',
      'data-[side=top]:-bottom-2.5',
    ],
    popup: [
      'tooltip-popup z-50 w-fit max-w-xs rounded-md',
      'origin-(--transform-origin)',
      'bg-foreground px-3 py-1.5 text-background text-xs',
      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
      'data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=delayed-open]:animate-in',
      'data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    trigger: 'tooltip-trigger inline-flex min-w-0 max-w-full',
  },
})

const { trigger, popup, arrow } = tooltip()

function Tooltip({
  children,
  content,
  side = 'top',
  sideOffset = 4,
  delayDuration = 200,
}: PropsWithChildren<TooltipProps>) {
  const popupId = useId()
  const portalContainer = usePortalContainer()
  const [open, setOpen] = useState(false)

  return (
    <TooltipPrimitive.Provider delay={delayDuration}>
      <TooltipPrimitive.Root onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <TooltipPrimitive.Trigger
          aria-describedby={open ? popupId : undefined}
          data-testid="tooltip-trigger"
          render={<span className={trigger()} />}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={portalContainer}>
          <TooltipPrimitive.Positioner
            className="tooltip-positioner isolate z-50"
            side={side}
            sideOffset={sideOffset}
          >
            <TooltipPrimitive.Popup
              className={popup()}
              data-testid="tooltip-popup"
              id={popupId}
              role="tooltip"
            >
              {content}
              <TooltipPrimitive.Arrow
                className={arrow()}
                data-testid="tooltip-arrow"
              />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Tooltip }
