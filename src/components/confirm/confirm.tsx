import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'

import type { ConfirmProps } from './confirm.types'

const confirm = tv({
  slots: {
    backdrop: [
      'confirm-backdrop fixed inset-0 isolate z-50 bg-black/50',
      'data-open:fade-in-0 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out',
    ],
    description: 'confirm-description text-muted-foreground text-sm',
    footer:
      'confirm-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
    header: 'confirm-header flex flex-col gap-1.5',
    popup: [
      'confirm-popup fixed top-1/2 left-1/2 z-50 grid w-full max-w-sm',
      '-translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-5',
      'text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    title: 'confirm-title font-heading font-medium text-base',
  },
})

const { backdrop, popup, header, title, description, footer } = confirm()

function Confirm({
  open,
  title: titleText,
  description: descriptionText,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmProps,
  cancelProps,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const handleConfirm = async () => {
    setConfirmLoading(true)
    try {
      await Promise.resolve(onConfirm?.())
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      await Promise.resolve(onCancel?.())
    } finally {
      setCancelLoading(false)
    }
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <AlertDialog.Root
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose?.()
        }
      }}
      open={open}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={backdrop()}
          data-testid="confirm-backdrop"
          onClick={handleOverlayClick}
        />
        <AlertDialog.Popup
          className={popup()}
          data-testid="confirm-popup"
          onClick={handleOverlayClick}
        >
          <div className={header()} data-testid="confirm-header">
            <AlertDialog.Title className={title()} data-testid="confirm-title">
              {titleText}
            </AlertDialog.Title>
            <AlertDialog.Description
              className={description()}
              data-testid="confirm-description"
            >
              {descriptionText}
            </AlertDialog.Description>
          </div>
          <div className={footer()} data-testid="confirm-footer">
            <AlertDialog.Close
              data-testid="confirm-cancel"
              render={
                <Button
                  variant="outline"
                  {...cancelProps}
                  loading={cancelLoading}
                  onClick={handleCancel}
                />
              }
            >
              {cancelText}
            </AlertDialog.Close>
            <Button
              data-testid="confirm-action"
              {...confirmProps}
              loading={confirmLoading}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export { Confirm }
