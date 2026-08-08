import { Dialog } from '@base-ui/react/dialog'
import type { MouseEvent, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { X } from '@/internal/icons'

import type {
  SheetBodyProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetProps,
} from './sheet.types'

const styles = tv({
  compoundVariants: [
    {
      bordered: true,
      class: {
        footer: 'border-border border-t',
        header: 'border-border border-b',
      },
    },
    {
      class: {
        popup: 'sm:max-w-md',
      },
      side: ['left', 'right'],
      size: 'sm',
    },
    {
      class: {
        popup: 'sm:max-w-lg',
      },
      side: ['left', 'right'],
      size: 'md',
    },
    {
      class: {
        popup: 'sm:max-w-2xl',
      },
      side: ['left', 'right'],
      size: 'lg',
    },
    {
      class: {
        popup: 'sm:max-w-4xl',
      },
      side: ['left', 'right'],
      size: 'xl',
    },
    {
      class: {
        popup: 'sm:max-w-6xl',
      },
      side: ['left', 'right'],
      size: '2xl',
    },
  ],
  defaultVariants: {
    side: 'right',
  },
  slots: {
    backdrop: [
      'sheet-backdrop fixed inset-0 z-50 bg-black/50',
      'transition-opacity duration-200 ease-in-out',
      'data-ending-style:opacity-0 data-starting-style:opacity-0',
    ],
    body: 'sheet-body min-h-0 flex-1 overflow-y-auto p-5',
    close: 'sheet-close absolute top-4 right-4',
    description: 'sheet-description text-muted-foreground text-sm',
    footer: 'sheet-footer flex flex-row-reverse gap-3 p-5',
    header: [
      'sheet-header relative flex items-start justify-between gap-4 p-5',
      '[&:has(.sheet-close)_.sheet-header-content]:pr-10',
      '[&:not(:has(.sheet-description))_.sheet-close]:top-1/2',
      '[&:not(:has(.sheet-description))_.sheet-close]:-translate-y-1/2',
    ],
    headerContent: 'sheet-header-content flex min-w-0 flex-1 flex-col gap-2',
    popup: [
      'sheet-popup fixed z-50 flex min-h-0 flex-col overflow-hidden bg-popover text-popover-foreground shadow-xl outline-none',
      'transition duration-200 ease-in-out',
      'data-ending-style:opacity-0 data-starting-style:opacity-0',
    ],
    title: 'sheet-title font-heading font-medium text-base leading-none',
  },
  variants: {
    bordered: {
      true: {
        body: '',
        footer: '',
        header: '',
      },
    },
    side: {
      bottom: {
        popup: [
          'inset-x-0 bottom-0 h-auto max-h-[calc(100dvh-1rem)] border-t',
          'data-ending-style:translate-y-full data-starting-style:translate-y-full',
        ],
      },
      left: {
        popup: [
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          'data-ending-style:-translate-x-full data-starting-style:-translate-x-full',
        ],
      },
      right: {
        popup: [
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          'data-ending-style:translate-x-full data-starting-style:translate-x-full',
        ],
      },
      top: {
        popup: [
          'inset-x-0 top-0 h-auto max-h-[calc(100dvh-1rem)] border-b',
          'data-ending-style:-translate-y-full data-starting-style:-translate-y-full',
        ],
      },
    },
    size: {
      '2xl': {},
      lg: {},
      md: {},
      sm: {},
      xl: {},
    },
  },
})

function SheetRoot({
  open,
  side = 'right',
  size,
  onChange,
  children,
}: PropsWithChildren<SheetProps>) {
  const { backdrop, popup } = styles({
    side,
    size,
  })

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <Dialog.Root onOpenChange={onChange} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={backdrop()}
          data-testid="sheet-backdrop"
          onClick={handleOverlayClick}
        />
        <Dialog.Popup
          className={popup()}
          data-side={side}
          data-testid="sheet-popup"
          onClick={handleOverlayClick}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SheetHeader({
  children,
  closable,
  bordered,
}: PropsWithChildren<SheetHeaderProps>) {
  const { header, headerContent } = styles({
    bordered,
  })
  const { close } = styles()

  return (
    <div className={header()} data-testid="sheet-header">
      <div className={headerContent()}>{children}</div>
      {closable && (
        <div className={close()}>
          <Dialog.Close
            data-testid="sheet-close"
            render={<Button size="icon-sm" variant="ghost" />}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </div>
      )}
    </div>
  )
}

function SheetTitle({ children }: PropsWithChildren) {
  const { title } = styles()

  return (
    <Dialog.Title className={title()} data-testid="sheet-title">
      {children}
    </Dialog.Title>
  )
}

function SheetDescription({ children }: PropsWithChildren) {
  const { description } = styles()

  return (
    <Dialog.Description
      className={description()}
      data-testid="sheet-description"
    >
      {children}
    </Dialog.Description>
  )
}

function SheetBody({ children, minHeight }: PropsWithChildren<SheetBodyProps>) {
  const { body } = styles()

  return (
    <div
      className={body()}
      data-testid="sheet-body"
      style={
        minHeight === undefined
          ? undefined
          : {
              minHeight,
            }
      }
    >
      {children}
    </div>
  )
}

function SheetFooter({
  children,
  bordered,
}: PropsWithChildren<SheetFooterProps>) {
  const { footer } = styles({
    bordered,
  })

  return (
    <div className={footer()} data-testid="sheet-footer">
      {children}
    </div>
  )
}

const Sheet = Object.assign(SheetRoot, {
  Body: SheetBody,
  Footer: SheetFooter,
  Header: Object.assign(SheetHeader, {
    Description: SheetDescription,
    Title: SheetTitle,
  }),
})

export { Sheet }
