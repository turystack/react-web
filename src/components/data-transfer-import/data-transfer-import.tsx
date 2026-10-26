import { useLatest } from '@turystack/react-hooks'
import {
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import {
  DataTransferResult,
  DataTransferShell,
} from '@/components/data-transfer/data-transfer'
import type {
  DataTransferFormat,
  DataTransferJobAccepted,
} from '@/components/data-transfer/data-transfer.types'
import { FilePicker } from '@/components/file-picker'
import type { FileRejection } from '@/components/file-picker/file-picker.types'
import { scaleBytes } from '@/components/file-size-text/file-size-text.utils'
import { useFormat } from '@/components/format-provider/use-format'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Stepper } from '@/components/stepper'
import { Table } from '@/components/table'
import { AlertCircle, CheckCircle, Info } from '@/internal/icons'
import { DataTransferImportRecords } from './data-transfer-import.records'
import type {
  DataTransferImportMapping,
  DataTransferImportProps,
  DataTransferImportRow,
} from './data-transfer-import.types'
import {
  acceptOf,
  applyMapping,
  type BrowserPreview,
  formatOfFile,
  guessMapping,
  PreviewUnreadableError,
  readPreview,
  templateCsv,
} from './data-transfer-import.utils'

export const styles = tv({
  slots: {
    error: 'data-transfer-import-error text-destructive text-sm',
    file: 'data-transfer-import-file flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm',
    fileDetails:
      'data-transfer-import-file-details truncate text-muted-foreground text-xs',
    fileName: 'data-transfer-import-file-name flex min-w-0 flex-col',
    fileUpload:
      'data-transfer-import-file-upload flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs',
    mapping:
      'data-transfer-import-mapping flex flex-col divide-y divide-border',
    notice:
      'data-transfer-import-notice flex items-start gap-2 text-muted-foreground text-xs [&>svg]:mt-0.5 [&>svg]:size-3.5 [&>svg]:shrink-0',
    root: 'data-transfer-import flex flex-col gap-5',
    row: 'data-transfer-import-row grid grid-cols-[1fr_auto] items-center gap-3 py-2.5',
    sample:
      'data-transfer-import-sample truncate text-muted-foreground text-xs',
    summary: 'data-transfer-import-summary flex items-center gap-6',
    value: 'data-transfer-import-value block truncate',
    warning:
      'data-transfer-import-warning flex items-start gap-2 rounded-md bg-warning/10 px-2 py-1.5',
    warnings:
      'data-transfer-import-warnings flex max-h-44 flex-col gap-1 overflow-y-auto text-xs',
  },
})

const ALL_FORMATS: DataTransferFormat[] = ['csv', 'json', 'jsonl']

/** A preview row the schema would refuse: a warning, never a verdict. */
type PreviewWarning = {
  column: string | null
  message: string
  row_number: number
}

/** The file taken, as the steps after the picker name it. */
type ChosenFile = {
  format: DataTransferFormat
  name: string
  size: number
}

/** The file the reader takes away: the template to fill. */
function download(fileName: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], {
      type: 'text/csv;charset=utf-8',
    }),
  )
  const anchor = document.createElement('a')

  anchor.download = fileName
  anchor.href = url
  anchor.click()
  URL.revokeObjectURL(url)
}

/** `52428800` → `52.4 MB`, in the reader's locale. */
function readableSize(bytes: number, locale: string | undefined) {
  const { amount, unit } = scaleBytes(bytes, 'decimal')

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === 'B' ? 0 : 1,
  }).format(amount)} ${unit}`
}

function reasonOf(reason: unknown, fallback: string) {
  return reason instanceof Error && reason.message ? reason.message : fallback
}

function DataTransferImportRoot<T>({
  columns,
  defaultOpen,
  description,
  entity,
  formats = ALL_FORMATS,
  maxFileSize,
  onImport,
  onOpenChange,
  onUpload,
  open,
  result,
  resultLink,
  schema,
  size = 'md',
  surface = 'sheet',
  templateFileName = 'template.csv',
  title,
  trigger,
}: DataTransferImportProps<T>) {
  const labels = useLabels()
  const { locale } = useFormat()
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<ChosenFile | null>(null)
  const [preview, setPreview] = useState<BrowserPreview | null>(null)
  const [mapping, setMapping] = useState<Record<string, string | null>>({})
  const [warnings, setWarnings] = useState<PreviewWarning[]>([])
  /**
   * The upload runs beside the mapping rather than before it: the preview
   * needs only the head of the file, and a reader mapping columns has no
   * reason to watch a 1 GB file go up first. Only Import waits for the key.
   */
  const [storageKey, setStorageKey] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [reading, setReading] = useState(false)
  const [checking, setChecking] = useState(false)
  const currentMapping = useLatest(mapping)
  const [job, setJob] = useState<DataTransferJobAccepted | null>(null)
  const [error, setError] = useState<string | null>(null)
  /**
   * Which file an answer belongs to. Every await here — the upload, the
   * preview, an async schema, the request itself — can outlast the opening
   * (or the pick) that asked for it; an answer landing after the reader
   * closed and reopened, or chose another file, must not write the old one's
   * key, preview or job into the new flow.
   */
  const attempt = useRef(0)
  const {
    error: errorSlot,
    file: fileSlot,
    fileDetails,
    fileName,
    fileUpload,
    mapping: mappingSlot,
    notice,
    root,
    row: rowSlot,
    sample,
    summary,
    value,
    warning: warningSlot,
    warnings: warningsSlot,
  } = styles()

  const visible = open ?? internalOpen
  const noun = entity?.plural ?? labels.transfer.import.toLowerCase()
  const sending = step === 3 && job === null
  const offered = formats.map((format) => format.toUpperCase()).join(', ')

  // Every opening is a new import, whichever way it was opened — the trigger or
  // a controlled `open`. Layout rather than passive, so a surface reopened
  // after a finished import never paints the old result for a frame.
  useLayoutEffect(() => {
    if (visible) {
      attempt.current += 1
      setStep(0)
      setFile(null)
      setPreview(null)
      setMapping({})
      setWarnings([])
      setStorageKey(null)
      setUploading(false)
      setReading(false)
      setChecking(false)
      setJob(null)
      setError(null)
    }
  }, [visible])

  function setOpen(next: boolean) {
    if (open === undefined) {
      setInternalOpen(next)
    }

    onOpenChange?.(next)
  }

  function reject(rejections: FileRejection[]) {
    if (
      maxFileSize !== undefined &&
      rejections.some((rejection) => rejection.reason === 'maxFileSize')
    ) {
      setError(labels.transfer.fileTooLarge(readableSize(maxFileSize, locale)))
    }
  }

  async function take(files: File[]) {
    const picked = files[0]

    if (!picked) {
      return
    }

    attempt.current += 1

    const ticket = attempt.current
    const format = formatOfFile(picked)

    setError(null)
    setStorageKey(null)

    if (format === null || !formats.includes(format)) {
      setError(labels.transfer.formatUnsupported(offered))

      return
    }

    // The picker already refused it; said again for a file that reached here
    // some other way, because the presigned upload would refuse it anyway.
    if (maxFileSize !== undefined && picked.size > maxFileSize) {
      setError(labels.transfer.fileTooLarge(readableSize(maxFileSize, locale)))

      return
    }

    setFile({
      format,
      name: picked.name,
      size: picked.size,
    })
    setUploading(true)
    setReading(true)

    onUpload(picked).then(
      (uploaded) => {
        if (ticket === attempt.current) {
          setStorageKey(uploaded.storage_key)
          setUploading(false)
        }
      },
      (reason: unknown) => {
        if (ticket !== attempt.current) {
          return
        }

        // Nothing can be imported without the file in storage: back to the
        // picker, with the reason.
        attempt.current += 1
        setUploading(false)
        setReading(false)
        setFile(null)
        setPreview(null)
        setStep(0)
        setError(reasonOf(reason, labels.confirm.error))
      },
    )

    try {
      const next = await readPreview(picked, format)

      if (ticket !== attempt.current) {
        return
      }

      setReading(false)
      setPreview(next)
      setMapping(guessMapping(columns, next.headers))
      setStep(1)
    } catch (reason) {
      if (ticket !== attempt.current) {
        return
      }

      // The upload of a file nobody can map is dropped with it.
      attempt.current += 1
      setReading(false)
      setUploading(false)
      setFile(null)
      setError(unreadable(reason))
    }
  }

  /** Why the preview gave up, in the words the worker would have failed it with. */
  function unreadable(reason: unknown) {
    if (!(reason instanceof PreviewUnreadableError)) {
      return labels.transfer.previewUnreadable
    }

    if (reason.problem === 'duplicate_header') {
      return labels.transfer.previewDuplicateHeader(reason.detail ?? '')
    }

    if (reason.problem === 'encoding_not_supported') {
      return labels.transfer.previewEncoding
    }

    if (reason.problem === 'not_an_array') {
      return labels.transfer.previewNotArray
    }

    return labels.transfer.previewUnreadable
  }

  const missing = columns.filter(
    (column) => column.required && !mapping[column.key],
  )
  const mapped = preview ? applyMapping(preview.rows, mapping) : []
  const chosen = columns.filter((column) => mapping[column.key])
  // Rows, not issues: one row can break three rules.
  const warned = new Set(warnings.map((entry) => entry.row_number)).size

  /**
   * The schema on the preview rows only, as a warning: the worker validates
   * every row and records the ones that fail. A row here is numbered as the
   * worker numbers it — 1 is the first row under the header.
   */
  async function check() {
    const found: PreviewWarning[] = []

    if (!schema) {
      return found
    }

    for (const [index, row] of mapped.entries()) {
      const outcome = await schema['~standard'].validate(row)

      if ('issues' in outcome && outcome.issues) {
        for (const issue of outcome.issues) {
          found.push({
            column: issue.path?.[0] ? String(issue.path[0]) : null,
            message: issue.message,
            row_number: preview?.row_numbers[index] ?? index + 1,
          })
        }
      }
    }

    return found
  }

  async function review() {
    const ticket = attempt.current
    const under = mapping

    setChecking(true)

    const found = await check()

    // Another file, another opening, or the reader remapped while an async
    // schema ran: the answer is for a question nobody is asking any more.
    if (ticket !== attempt.current || currentMapping.current !== under) {
      if (ticket === attempt.current) {
        setChecking(false)
      }

      return
    }

    setChecking(false)
    setWarnings(found)
    setStep(2)
  }

  async function commit() {
    const ticket = attempt.current

    if (storageKey === null || file === null) {
      return
    }

    setError(null)
    setStep(3)

    try {
      const started = await onImport({
        format: file.format,
        mapping: Object.fromEntries(
          Object.entries(mapping).filter(
            (entry): entry is [string, string] => entry[1] !== null,
          ),
        ) as DataTransferImportMapping<T>,
        storage_key: storageKey,
      })

      if (ticket === attempt.current) {
        setJob(started)
      }
    } catch (reason) {
      if (ticket !== attempt.current) {
        return
      }

      setStep(2)
      setError(reasonOf(reason, labels.confirm.error))
    }
  }

  function columnLabel(key: string | null) {
    return columns.find((column) => column.key === key)?.label ?? key
  }

  const chip =
    file && preview ? (
      <div className={fileSlot()} data-testid="data-transfer-import-file">
        <div className={fileName()}>
          <span className="data-transfer-import-file-label truncate">
            {labels.transfer.fileChosen(file.name)}
          </span>
          <span className={fileDetails()}>
            {readableSize(file.size, locale)} ·{' '}
            {labels.transfer.fileDetails(
              preview.encoding,
              preview.delimiter ?? null,
            )}
          </span>
        </div>
        {uploading ? (
          <span
            className={fileUpload()}
            data-testid="data-transfer-import-uploading"
            role="status"
          >
            <Loader size="sm" />
            {labels.transfer.uploading}
          </span>
        ) : null}
      </div>
    ) : null

  return (
    <>
      {isValidElement<{ onClick?: () => void }>(trigger)
        ? cloneElement(trigger, {
            onClick: () => {
              trigger.props.onClick?.()
              setOpen(true)
            },
          })
        : null}

      <DataTransferShell
        description={description ?? labels.transfer.importDescription(noun)}
        footer={
          <>
            {step === 1 ? (
              <Button
                data-testid="data-transfer-import-next"
                disabled={missing.length > 0}
                loading={checking}
                onClick={() => void review()}
              >
                {labels.stepper.next}
              </Button>
            ) : null}

            {step === 2 ? (
              <Button
                data-testid="data-transfer-import-confirm"
                // Waits for the key, not for the reader: the mapping was
                // done while the file went up.
                loading={uploading}
                onClick={() => void commit()}
              >
                {labels.transfer.import}
              </Button>
            ) : null}

            {step === 3 ? (
              <Button
                data-testid="data-transfer-import-close"
                disabled={sending}
                onClick={() => setOpen(false)}
              >
                {labels.common.close}
              </Button>
            ) : null}

            {step > 0 && step < 3 ? (
              <Button
                data-testid="data-transfer-import-back"
                // Not while the schema runs: its answer would land on the
                // step the reader went back to.
                disabled={checking}
                onClick={() => setStep((current) => current - 1)}
                variant="ghost"
              >
                {labels.stepper.previous}
              </Button>
            ) : null}
          </>
        }
        // Always leaves, even mid-request: the footer's Close waits for the
        // answer so the notice and its link are seen, but a surface that
        // cannot be left at all — a request that never settles — is worse
        // than a link missed. The job exists either way; its page lists it.
        onOpenChange={setOpen}
        open={visible}
        size={size}
        surface={surface}
        testId="data-transfer-import"
        title={title ?? labels.transfer.importTitle(noun)}
      >
        <div className={root()} data-size={size}>
          <Stepper active={step} size="sm">
            <Stepper.Step
              allowStepClick={false}
              label={labels.transfer.stepFile}
              loading={reading}
            >
              <div className={root()}>
                <FilePicker
                  accept={acceptOf(formats)}
                  disabled={reading}
                  maxFileSize={maxFileSize}
                  maxFiles={1}
                  onReject={reject}
                  onSelect={(files) => void take(files)}
                  testId="data-transfer-import"
                />
                {formats.includes('csv') ? (
                  <Button
                    data-testid="data-transfer-import-template"
                    onClick={() =>
                      download(templateFileName, templateCsv(columns))
                    }
                    variant="link"
                  >
                    {labels.transfer.downloadTemplate}
                  </Button>
                ) : null}
              </div>
            </Stepper.Step>

            <Stepper.Step
              allowStepClick={false}
              label={labels.transfer.stepMap}
            >
              <div
                className={root()}
                data-testid="data-transfer-import-mapping"
              >
                {chip}

                <div className={mappingSlot()}>
                  {columns.map((column) => {
                    const header = mapping[column.key]
                    const first = header
                      ? (preview?.rows[0]?.[header] ?? '')
                      : ''

                    return (
                      <div className={rowSlot()} key={column.key}>
                        <div className="data-transfer-import-column flex min-w-0 flex-col">
                          <span className="data-transfer-import-label text-sm">
                            {column.label}
                            {column.required ? ' *' : ''}
                          </span>
                          {/*
                            The first value of the column the reader mapped.
                            A wrong guess is invisible until something shows
                            what it actually pulled in.
                          */}
                          <span className={sample()}>
                            {first || labels.transfer.fileColumn}
                          </span>
                        </div>

                        <div className="data-transfer-import-source w-44">
                          <Select
                            clearable={false}
                            mode="single"
                            onChange={(next) =>
                              setMapping((current) => ({
                                ...current,
                                [column.key]: (next as string) || null,
                              }))
                            }
                            optionLabel="label"
                            optionValue="value"
                            options={[
                              {
                                label: labels.transfer.ignore,
                                value: '',
                              },
                              ...(preview?.headers ?? []).map((entry) => ({
                                label: entry,
                                value: entry,
                              })),
                            ]}
                            size="sm"
                            value={mapping[column.key] ?? ''}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {missing.length > 0 ? (
                  <span
                    className={errorSlot()}
                    data-testid="data-transfer-import-missing"
                  >
                    {labels.transfer.mappingRequired(missing[0]?.label ?? '')}
                  </span>
                ) : null}
              </div>
            </Stepper.Step>

            <Stepper.Step
              allowStepClick={false}
              label={labels.transfer.stepPreview}
            >
              <div
                className={root()}
                data-testid="data-transfer-import-preview"
              >
                {chip}

                <div className={summary()}>
                  <Stat
                    icon={<CheckCircle />}
                    label={labels.transfer.previewRows(mapped.length)}
                    value={mapped.length}
                  />
                  {warned > 0 ? (
                    <Stat
                      icon={<AlertCircle />}
                      label={labels.transfer.previewWarnings(warned)}
                      value={warned}
                    />
                  ) : null}
                </div>

                <Table
                  // Keyed by the row's number, never by a value: a file can
                  // hold the same code twice, and that is what the worker is
                  // there to report, not what the preview may choke on.
                  // Pixels, as in the records: a cell does not wrap, so a
                  // long name would paint over the price beside it unless
                  // each value keeps to its column, whole on hover.
                  columns={[
                    {
                      key: '__row',
                      label: labels.transfer.recordRow,
                      width: 56,
                    },
                    ...chosen.map((column) => ({
                      key: column.key,
                      label: column.label,
                      selector: (row: DataTransferImportRow) => (
                        <span className={value()} title={row[column.key]}>
                          {row[column.key]}
                        </span>
                      ),
                      width: 140,
                    })),
                  ]}
                  itemKey="__row"
                  items={mapped.map(
                    (row, index): DataTransferImportRow => ({
                      ...row,
                      __row: String(preview?.row_numbers[index] ?? index + 1),
                    }),
                  )}
                />

                {warnings.length > 0 ? (
                  <div
                    className={warningsSlot()}
                    data-testid="data-transfer-import-warnings"
                  >
                    {warnings.map((entry) => (
                      <span
                        className={warningSlot()}
                        key={`${entry.row_number}-${entry.column}-${entry.message}`}
                      >
                        <strong className="data-transfer-import-warning-row shrink-0">
                          #{entry.row_number}
                        </strong>
                        <span className="data-transfer-import-warning-message truncate">
                          {entry.column
                            ? `${columnLabel(entry.column)} — `
                            : ''}
                          {entry.message}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className={notice()}>
                  <Info />
                  {labels.transfer.previewNotice}
                </p>
              </div>
            </Stepper.Step>

            <Stepper.Step
              allowStepClick={false}
              label={labels.transfer.stepDone}
              loading={sending}
            >
              <DataTransferResult
                job={job}
                link={resultLink}
                testId="data-transfer-import"
              >
                {job === null ? null : result?.(job)}
              </DataTransferResult>
            </Stepper.Step>
          </Stepper>

          {error ? (
            <span
              className={errorSlot()}
              data-testid="data-transfer-import-error"
              role="alert"
            >
              {error}
            </span>
          ) : null}
        </div>
      </DataTransferShell>
    </>
  )
}

const DataTransferImport = Object.assign(DataTransferImportRoot, {
  Records: DataTransferImportRecords,
})

export { DataTransferImport }
