import type { PropsWithChildren } from 'react'

import { Modal } from '@/components/modal'
import { Sheet } from '@/components/sheet'

import type { DataTransferSurface } from './data-transfer.types'

type DataTransferShellProps = PropsWithChildren<{
  description: string
  footer: React.ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  surface: DataTransferSurface
  testId: string
  title: string
}>

/**
 * The casing both directions share.
 *
 * Modal and Sheet have the same compound shape, and which one a product wants
 * is a question about the screen, not about the component — a dense export
 * config wants the height of a sheet, a three-field one reads better centred.
 * Choosing between them here is what lets `surface` be a single prop instead
 * of two components that drift.
 */
export function DataTransferShell({
  children,
  description,
  footer,
  onOpenChange,
  open,
  surface,
  testId,
  title,
}: DataTransferShellProps) {
  if (surface === 'modal') {
    return (
      <Modal onChange={onOpenChange} open={open} size="lg">
        <Modal.Header bordered closable>
          <Modal.Header.Title>{title}</Modal.Header.Title>
          <Modal.Header.Description>{description}</Modal.Header.Description>
        </Modal.Header>
        <Modal.Body>
          <div className="data-transfer-body" data-testid={testId}>
            {children}
          </div>
        </Modal.Body>
        <Modal.Footer bordered>{footer}</Modal.Footer>
      </Modal>
    )
  }

  return (
    <Sheet onChange={onOpenChange} open={open} size="md">
      <Sheet.Header bordered closable>
        <Sheet.Header.Title>{title}</Sheet.Header.Title>
        <Sheet.Header.Description>{description}</Sheet.Header.Description>
      </Sheet.Header>
      <Sheet.Body>
        <div className="data-transfer-body" data-testid={testId}>
          {children}
        </div>
      </Sheet.Body>
      <Sheet.Footer bordered>{footer}</Sheet.Footer>
    </Sheet>
  )
}
