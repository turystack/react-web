import { cloneElement, isValidElement, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { DataTransferShell } from '@/components/data-transfer/data-transfer'
import { FilePicker } from '@/components/file-picker'
import { useLabels } from '@/components/labels-provider'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Stepper } from '@/components/stepper'
import { Table } from '@/components/table'
import { AlertCircle, CheckCircle } from '@/internal/icons'

import type {
  DataTransferImportIssue,
  DataTransferImportMapping,
  DataTransferImportParsed,
  DataTransferImportProps,
  DataTransferImportResult,
  DataTransferImportRow,
} from './data-transfer-import.types'
import {
  applyMapping,
  guessMapping,
  issuesToCsv,
  parseCsv,
  templateCsv,
} from './data-transfer-import.utils'

export const styles = tv({
  slots: {
    error: 'data-transfer-import-error text-destructive text-sm',
    file: 'data-transfer-import-file flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm',
    issue:
      'data-transfer-import-issue flex items-start gap-2 rounded-md bg-destructive/5 px-2 py-1.5',
    issues:
      'data-transfer-import-issues flex max-h-44 flex-col gap-1 overflow-y-auto text-destructive text-xs',
    mapping:
      'data-transfer-import-mapping flex flex-col divide-y divide-border',
    root: 'data-transfer-import flex flex-col gap-5',
    row: 'data-transfer-import-row grid grid-cols-[1fr_auto] items-center gap-3 py-2.5',
    sample:
      'data-transfer-import-sample truncate text-muted-foreground text-xs',
    summary: 'data-transfer-import-summary flex items-center gap-6',
  },
})

const PREVIEW_ROWS = 5

/** The file the reader takes away — a template to fill, or the rows that failed. */
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

export function DataTransferImport<T>({
  accept = '.csv,text/csv',
  columns,
  defaultOpen,
  description,
  entity,
  maxRows,
  onImport,
  onOpenChange,
  onValidate,
  open,
  parse,
  schema,
  surface = 'sheet',
  templateFileName = 'template.csv',
  title,
  trigger,
}: DataTransferImportProps<T>) {
  const labels = useLabels()
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [step, setStep] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsed, setParsed] = useState<DataTransferImportParsed | null>(null)
  const [mapping, setMapping] = useState<DataTransferImportMapping>({})
  const [issues, setIssues] = useState<DataTransferImportIssue[]>([])
  const [ready, setReady] = useState(0)
  const [result, setResult] = useState<DataTransferImportResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    error: errorSlot,
    file: fileSlot,
    issue: issueSlot,
    issues: issuesSlot,
    mapping: mappingSlot,
    root,
    row: rowSlot,
    sample,
    summary,
  } = styles()

  const visible = open ?? internalOpen
  const noun = entity?.plural ?? labels.transfer.import.toLowerCase()

  function setOpen(next: boolean) {
    if (open === undefined) {
      setInternalOpen(next)
    }

    onOpenChange?.(next)
  }

  function reset() {
    setStep(0)
    setFileName(null)
    setParsed(null)
    setMapping({})
    setIssues([])
    setReady(0)
    setResult(null)
    setError(null)
  }

  async function take(files: File[]) {
    const file = files[0]

    if (!file) {
      return
    }

    setError(null)

    try {
      const next = parse ? await parse(file) : parseCsv(await file.text())

      if (maxRows !== undefined && next.rows.length > maxRows) {
        setError(labels.transfer.rowsTooMany(maxRows))

        return
      }

      setFileName(file.name)
      setParsed(next)
      setMapping(guessMapping(columns, next.headers))
      setStep(1)
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.confirm.error,
      )
    }
  }

  const missing = columns.filter(
    (column) => column.required && !mapping[column.key],
  )

  /** Runs the schema row by row, so an error can name the line it came from. */
  async function validate() {
    const mapped = applyMapping(parsed?.rows ?? [], mapping)
    const found: DataTransferImportIssue[] = []
    const rows: T[] = []

    for (const [index, row] of mapped.entries()) {
      if (!schema) {
        rows.push(row as T)
        continue
      }

      const outcome = await schema['~standard'].validate(row)

      if ('issues' in outcome && outcome.issues) {
        for (const issue of outcome.issues) {
          found.push({
            field: issue.path?.[0] ? String(issue.path[0]) : undefined,
            message: issue.message,
            row: index + 1,
          })
        }

        continue
      }

      rows.push(outcome.value)
    }

    return {
      issues: [...found, ...(onValidate?.(rows) ?? [])],
      rows,
    }
  }

  async function review() {
    const outcome = await validate()

    setIssues(outcome.issues)
    setReady(outcome.rows.length)
    setStep(2)
  }

  async function commit() {
    const outcome = await validate()

    setError(null)
    setRunning(true)

    try {
      const done = await onImport(outcome.rows, {
        mapping,
        raw: parsed?.rows ?? [],
      })

      setResult(done ?? {})
      setStep(3)
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.confirm.error,
      )
    } finally {
      setRunning(false)
    }
  }

  const mapped = parsed ? applyMapping(parsed.rows, mapping) : []
  const chosen = columns.filter((column) => mapping[column.key])
  const refused = result?.failed ?? result?.issues?.length ?? 0

  return (
    <>
      {isValidElement<{ onClick?: () => void }>(trigger)
        ? cloneElement(trigger, {
            onClick: () => {
              trigger.props.onClick?.()
              reset()
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
                onClick={() => void review()}
              >
                {labels.stepper.next}
              </Button>
            ) : null}

            {step === 2 ? (
              <Button
                data-testid="data-transfer-import-confirm"
                loading={running}
                onClick={() => void commit()}
              >
                {labels.transfer.import}
              </Button>
            ) : null}

            {step === 3 ? (
              <Button
                data-testid="data-transfer-import-close"
                onClick={() => setOpen(false)}
              >
                {labels.common.close}
              </Button>
            ) : null}

            {step > 0 && step < 3 ? (
              <Button
                data-testid="data-transfer-import-back"
                disabled={running}
                onClick={() => setStep((current) => current - 1)}
                variant="ghost"
              >
                {labels.stepper.previous}
              </Button>
            ) : null}
          </>
        }
        onOpenChange={setOpen}
        open={visible}
        surface={surface}
        testId="data-transfer-import"
        title={title ?? labels.transfer.importTitle(noun)}
      >
        <div className={root()}>
          <Stepper active={step} size="sm">
            <Stepper.Step label={labels.transfer.stepFile}>
              <div className={root()}>
                <FilePicker
                  accept={accept}
                  maxFiles={1}
                  onSelect={(files) => void take(files)}
                  testId="data-transfer-import"
                />
                <Button
                  data-testid="data-transfer-import-template"
                  onClick={() =>
                    download(templateFileName, templateCsv(columns))
                  }
                  variant="link"
                >
                  {labels.transfer.downloadTemplate}
                </Button>
              </div>
            </Stepper.Step>

            <Stepper.Step label={labels.transfer.stepMap}>
              <div
                className={root()}
                data-testid="data-transfer-import-mapping"
              >
                {fileName ? (
                  <div className={fileSlot()}>
                    <span>{labels.transfer.fileChosen(fileName)}</span>
                    <span className="data-transfer-import-file-rows text-muted-foreground text-xs">
                      {labels.transfer.rowsFound(parsed?.rows.length ?? 0)}
                    </span>
                  </div>
                ) : null}

                <div className={mappingSlot()}>
                  {columns.map((column) => {
                    const header = mapping[column.key]
                    const preview = header
                      ? (parsed?.rows[0]?.[header] ?? '')
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
                            {preview || labels.transfer.fileColumn}
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
                              ...(parsed?.headers ?? []).map((entry) => ({
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

            <Stepper.Step label={labels.transfer.stepReview}>
              <div className={root()} data-testid="data-transfer-import-review">
                <div className={summary()}>
                  <Stat
                    icon={<CheckCircle />}
                    label={labels.transfer.rowsReady(ready, mapped.length)}
                    value={ready}
                  />
                  {issues.length > 0 ? (
                    <Stat
                      icon={<AlertCircle />}
                      label={labels.transfer.rowsRefused(issues.length)}
                      value={issues.length}
                    />
                  ) : null}
                </div>

                <Table
                  columns={chosen.map((column) => ({
                    key: column.key,
                    label: column.label,
                  }))}
                  itemKey={
                    chosen[0]?.key ?? ('' as keyof DataTransferImportRow)
                  }
                  items={mapped.slice(0, PREVIEW_ROWS)}
                />

                {issues.length > 0 ? (
                  <div
                    className={issuesSlot()}
                    data-testid="data-transfer-import-issues"
                  >
                    {issues.map((issue) => (
                      <span
                        className={issueSlot()}
                        key={`${issue.row}-${issue.field}-${issue.message}`}
                      >
                        <strong className="data-transfer-import-issue-row shrink-0">
                          #{issue.row}
                        </strong>
                        <span className="data-transfer-import-issue-message truncate">
                          {issue.field ? `${issue.field} — ` : ''}
                          {issue.message}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Stepper.Step>

            <Stepper.Step label={labels.transfer.stepDone}>
              <div className={root()} data-testid="data-transfer-import-result">
                <div className={summary()}>
                  <Stat
                    icon={<CheckCircle />}
                    label={labels.transfer.import}
                    value={result?.created ?? 0}
                  />
                  {refused > 0 ? (
                    <Stat
                      icon={<AlertCircle />}
                      label={labels.transfer.rowsRefused(refused)}
                      value={refused}
                    />
                  ) : null}
                </div>

                <span className="data-transfer-import-outcome text-muted-foreground text-sm">
                  {labels.transfer.imported(result?.created ?? 0, refused)}
                </span>

                {result?.issues?.length ? (
                  <Button
                    data-testid="data-transfer-import-download-errors"
                    onClick={() =>
                      download(
                        `errors-${templateFileName}`,
                        issuesToCsv(mapped, result.issues ?? []),
                      )
                    }
                    variant="outline"
                  >
                    {labels.transfer.downloadErrors}
                  </Button>
                ) : null}
              </div>
            </Stepper.Step>
          </Stepper>

          {error ? (
            <span
              className={errorSlot()}
              data-testid="data-transfer-import-error"
            >
              {error}
            </span>
          ) : null}
        </div>
      </DataTransferShell>
    </>
  )
}
