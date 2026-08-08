import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { Sheet } from '@/components/sheet'

import type { ConfirmSheetProps } from './confirm-sheet.types'

const confirmSheet = tv({
  slots: {
    body: 'confirm-sheet-body flex flex-col gap-2',
    description: 'confirm-sheet-description text-muted-foreground text-sm',
    footer: 'confirm-sheet-footer grid flex-1 grid-cols-1 gap-2',
    title: 'confirm-sheet-title font-heading font-medium text-base',
  },
})

const { body, title, description, footer } = confirmSheet()

function ConfirmSheet({
  open,
  side = 'bottom',
  size,
  title: titleText,
  description: descriptionText,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmProps,
  cancelProps,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmSheetProps) {
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

  return (
    <Sheet
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose?.()
        }
      }}
      open={open}
      side={side}
      size={size}
    >
      <Sheet.Body>
        <div className={body()} data-testid="confirm-sheet-body">
          <Sheet.Header.Title>
            <span className={title()}>{titleText}</span>
          </Sheet.Header.Title>
          <Sheet.Header.Description>
            <span className={description()}>{descriptionText}</span>
          </Sheet.Header.Description>
        </div>
      </Sheet.Body>
      <Sheet.Footer bordered>
        <div className={footer()} data-testid="confirm-sheet-footer">
          <Button
            {...confirmProps}
            block
            loading={confirmLoading}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
          <Button
            variant="outline"
            {...cancelProps}
            block
            loading={cancelLoading}
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
        </div>
      </Sheet.Footer>
    </Sheet>
  )
}

export { ConfirmSheet }
