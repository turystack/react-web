import type { PropsWithChildren } from 'react'

import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { Modal } from '@/components/modal'
import { Sheet } from '@/components/sheet'
import { Info } from '@/internal/icons'

import type {
  DataTransferJobAccepted,
  DataTransferSize,
  DataTransferSurface,
} from './data-transfer.types'

type DataTransferShellProps = PropsWithChildren<{
  description: string
  footer: React.ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  size: DataTransferSize
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
  size,
  surface,
  testId,
  title,
}: DataTransferShellProps) {
  if (surface === 'modal') {
    return (
      <Modal onChange={onOpenChange} open={open} size={size}>
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
    <Sheet onChange={onOpenChange} open={open} size={size}>
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

type DataTransferResultProps = PropsWithChildren<{
  /** Null while the request that starts the work is still in flight. */
  job: DataTransferJobAccepted | null
  link: (job: DataTransferJobAccepted) => React.ReactNode
  testId: string
}>

/**
 * The last step both directions share: waiting for the API to accept the
 * work, then where its result lives.
 *
 * The notice comes before anything the result shows, because it is the one
 * thing true in every state — pending rows, a file still being built, or a
 * reader who closes the surface now and never sees either. The link is the
 * product's own element, so a router's `<Link>` keeps the navigation inside the
 * app instead of reloading it.
 */
export function DataTransferResult({
  children,
  job,
  link,
  testId,
}: DataTransferResultProps) {
  const labels = useLabels()

  if (job === null) {
    return (
      <div
        className="data-transfer-sending flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm"
        data-testid={`${testId}-sending`}
        role="status"
      >
        <Loader size="sm" />
        {labels.transfer.sending}
      </div>
    )
  }

  return (
    <div
      className="data-transfer-result flex flex-col gap-4"
      data-testid={`${testId}-result`}
    >
      <div
        className="data-transfer-notice flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-muted-foreground text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0"
        data-testid={`${testId}-notice`}
      >
        <Info />
        {/* A div, not a paragraph: the link is the product's element, and
            one that arrives wrapped in a div would be invalid inside a <p>. */}
        <div className="data-transfer-notice-text">
          {labels.transfer.resultLater}{' '}
          <span className="data-transfer-link font-medium text-foreground [&_a]:underline [&_a]:underline-offset-4">
            {link(job)}
          </span>
        </div>
      </div>

      {children}
    </div>
  )
}
