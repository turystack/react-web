import { Dialog } from '@base-ui/react/dialog'
import type { MouseEvent, PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { X } from '@/internal/icons'

import type {
  ModalBodyProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalProps,
} from './modal.types'

const styles = tv({
  compoundVariants: [
    {
      bordered: true,
      class: {
        footer: 'border-border border-t',
        header: 'border-border border-b',
      },
    },
  ],
  defaultVariants: {
    size: 'md',
  },
  slots: {
    backdrop: [
      'modal-backdrop fixed inset-0 isolate z-50 bg-black/50',
      'data-open:fade-in-0 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out',
    ],
    body: 'modal-body flex-1 overflow-auto p-5',
    description: 'modal-description text-muted-foreground text-sm',
    footer: 'modal-footer flex flex-row-reverse gap-2 p-5',
    header: 'modal-header flex items-start justify-between gap-2 p-5',
    headerContent: 'modal-header-content flex flex-col gap-1',
    popup: [
      'modal-popup fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full',
      '-translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-popover',
      'text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    title: 'modal-title font-heading font-medium text-base leading-none',
  },
  variants: {
    bordered: {
      true: {
        body: 'py-2',
        footer: '',
        header: '',
      },
    },
    size: {
      '2xl': {
        popup: 'max-w-6xl',
      },
      full: {
        popup:
          'top-0 left-0 h-dvh max-h-dvh max-w-none translate-x-0 translate-y-0 rounded-none shadow-none ring-0',
      },
      lg: {
        popup: 'max-w-2xl',
      },
      md: {
        popup: 'max-w-lg',
      },
      sm: {
        popup: 'max-w-md',
      },
      xl: {
        popup: 'max-w-4xl',
      },
    },
  },
})

function ModalRoot({
  open,
  onChange,
  size,
  children,
}: PropsWithChildren<ModalProps>) {
  const { backdrop, popup } = styles({
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
          data-testid="modal-backdrop"
          onClick={handleOverlayClick}
        />
        <Dialog.Popup
          className={popup()}
          data-testid="modal-popup"
          onClick={handleOverlayClick}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ModalHeader({
  children,
  closable,
  bordered,
}: PropsWithChildren<ModalHeaderProps>) {
  const { header, headerContent } = styles({
    bordered,
  })
  return (
    <div className={header()} data-testid="modal-header">
      <div className={headerContent()}>{children}</div>
      {closable && (
        <Dialog.Close
          data-testid="modal-close"
          render={<Button size="icon-sm" variant="ghost" />}
        >
          <X />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      )}
    </div>
  )
}

function ModalHeaderTitle({ children }: PropsWithChildren) {
  const { title } = styles()
  return (
    <Dialog.Title className={title()} data-testid="modal-title">
      {children}
    </Dialog.Title>
  )
}

function ModalHeaderDescription({ children }: PropsWithChildren) {
  const { description } = styles()
  return (
    <Dialog.Description
      className={description()}
      data-testid="modal-description"
    >
      {children}
    </Dialog.Description>
  )
}

function ModalBody({ children }: PropsWithChildren<ModalBodyProps>) {
  const { body } = styles()
  return (
    <div className={body()} data-testid="modal-body">
      {children}
    </div>
  )
}

function ModalFooter({
  children,
  bordered,
}: PropsWithChildren<ModalFooterProps>) {
  const { footer } = styles({
    bordered,
  })
  return (
    <div className={footer()} data-testid="modal-footer">
      {children}
    </div>
  )
}

const Modal = Object.assign(ModalRoot, {
  Body: ModalBody,
  Footer: ModalFooter,
  Header: Object.assign(ModalHeader, {
    Description: ModalHeaderDescription,
    Title: ModalHeaderTitle,
  }),
})

export { Modal }
