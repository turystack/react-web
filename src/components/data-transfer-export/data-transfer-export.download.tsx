import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { AlertCircle, ArrowDownToLine, CheckCircle } from '@/internal/icons'

import type { DataTransferExportDownloadProps } from './data-transfer-export.types'

const styles = tv({
  slots: {
    download:
      'data-transfer-export-download flex flex-col items-center gap-3 rounded-lg border border-border px-4 py-6 text-center',
    downloadFile:
      'data-transfer-export-download-file max-w-full truncate text-muted-foreground text-xs',
    downloadIcon:
      'data-transfer-export-download-icon flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5',
    downloadStatus:
      'data-transfer-export-download-status font-medium text-foreground text-sm',
  },
  variants: {
    status: {
      failed: {
        downloadIcon: 'bg-destructive/10 text-destructive',
      },
      queued: {},
      running: {},
      succeeded: {
        downloadIcon: 'bg-primary/10 text-primary',
      },
    },
  },
})

export function DataTransferExportDownload({
  failureCode,
  fileName,
  href,
  onDownload,
  status,
}: DataTransferExportDownloadProps) {
  const labels = useLabels()
  const { download, downloadFile, downloadIcon, downloadStatus } = styles({
    status,
  })
  const ready = status === 'succeeded'
  const failed = status === 'failed'
  // Queued or running: the file can still come.
  const coming = !ready && !failed
  const failure =
    failureCode === 'file_too_large'
      ? labels.transfer.failureFileTooLarge
      : failureCode === 'processing_error'
        ? labels.transfer.failureProcessing
        : labels.transfer.fileFailed

  return (
    <div
      className={download()}
      data-status={status}
      data-testid="data-transfer-export-download"
    >
      <span aria-hidden="true" className={downloadIcon()}>
        {coming ? <Loader size="sm" /> : null}
        {ready ? <CheckCircle /> : null}
        {failed ? <AlertCircle /> : null}
      </span>

      <p className={downloadStatus()} role="status">
        {coming ? labels.transfer.filePending : null}
        {ready ? labels.transfer.fileReady : null}
        {failed ? failure : null}
      </p>

      {ready && fileName ? <p className={downloadFile()}>{fileName}</p> : null}

      {/*
        On screen from the first moment, and only enabled once there is a
        file. A failed export has nothing to take, so there the button goes.
      */}
      {failed ? null : ready && href ? (
        <Button
          asChild
          data-testid="data-transfer-export-download-button"
          leftSection={<ArrowDownToLine />}
        >
          {/*
            A new tab, because `download` is a request the browser drops for
            another origin — and a signed URL is another origin. Served inline,
            a JSON or a PDF would otherwise replace the app the reader is in.
          */}
          <a
            download={fileName ?? true}
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {labels.transfer.download}
          </a>
        </Button>
      ) : (
        <Button
          data-testid="data-transfer-export-download-button"
          disabled={!ready || onDownload === undefined}
          leftSection={<ArrowDownToLine />}
          onClick={onDownload}
        >
          {labels.transfer.download}
        </Button>
      )}
    </div>
  )
}
