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
import { Checkbox } from '@/components/checkbox'
import {
  DataTransferResult,
  DataTransferShell,
} from '@/components/data-transfer/data-transfer'
import type {
  DataTransferFilterValues,
  DataTransferFormat,
  DataTransferJobAccepted,
} from '@/components/data-transfer/data-transfer.types'
import { useLabels } from '@/components/labels-provider'
import { Search } from '@/components/search'
import { isFilled } from '@/components/search/search.utils'
import { SegmentedControl } from '@/components/segmented-control'
import { Stepper } from '@/components/stepper'
import { Tooltip } from '@/components/tooltip'

import { DataTransferExportDownload } from './data-transfer-export.download'
import { DataTransferFilterField } from './data-transfer-export.filters'
import { DataTransferExportRecords } from './data-transfer-export.records'
import type { DataTransferExportProps } from './data-transfer-export.types'

export const styles = tv({
  slots: {
    columns: 'data-transfer-export-columns flex flex-col gap-2',
    error: 'data-transfer-export-error text-destructive text-sm',
    heading:
      'data-transfer-export-heading flex items-center justify-between gap-2 font-medium text-sm',
    root: 'data-transfer-export flex flex-col gap-6',
    section: 'data-transfer-export-section flex flex-col gap-3',
  },
})

const DEFAULT_FORMATS: DataTransferFormat[] = ['csv', 'json', 'jsonl']

function DataTransferExportRoot<T>({
  columns,
  defaultColumns,
  defaultFormat,
  defaultOpen,
  defaultValues,
  description,
  entity,
  filters,
  formats = DEFAULT_FORMATS,
  onExport,
  onOpenChange,
  open,
  result,
  resultLink,
  size = 'md',
  surface = 'sheet',
  title,
  trigger,
}: DataTransferExportProps<T>) {
  const labels = useLabels()
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  // Null until the reader ticks something: until then the choice is "the
  // defaults", read from the props on every render, so columns that arrive
  // after mount — loaded with the table — come in ticked like the rest.
  const [picked, setPicked] = useState<string[] | null>(defaultColumns ?? null)
  const chosen = picked ?? columns.map((column) => column.key)

  function setChosen(next: string[] | ((current: string[]) => string[])) {
    setPicked((current) => {
      const base = current ?? columns.map((column) => column.key)

      return typeof next === 'function' ? next(base) : next
    })
  }

  const [values, setValues] = useState<DataTransferFilterValues>(
    defaultValues ?? {},
  )
  const [format, setFormat] = useState<DataTransferFormat>(
    defaultFormat ?? formats[0] ?? 'csv',
  )
  const [step, setStep] = useState(0)
  const [job, setJob] = useState<DataTransferJobAccepted | null>(null)
  const [error, setError] = useState<string | null>(null)
  /**
   * Which opening an answer belongs to. A reader can close the surface while
   * the request is in flight and open it again for a new export; the old
   * answer landing then must not put the new flow on the old job's result.
   */
  const attempt = useRef(0)
  // Read at each opening, not only at mount: the list beside the export keeps
  // being filtered while the export sits closed, and `defaultValues` promises
  // the filters the page shows *now*. Latest, so a parent passing a fresh
  // object every render does not reset what the reader is typing.
  const pageFilters = useLatest(defaultValues)
  const {
    columns: columnsSlot,
    error: errorSlot,
    heading,
    root,
    section,
  } = styles()

  const visible = open ?? internalOpen
  const noun = entity?.plural ?? labels.transfer.export.toLowerCase()
  const sending = step === 1 && job === null
  // Counted against the declared columns, not the ticked keys: a
  // `defaultColumns` naming a key that does not exist would otherwise count as
  // one chosen column and send a file with none.
  const kept = columns.filter((column) => chosen.includes(column.key))
  const filtered = (filters ?? []).some((filter) =>
    isFilled(values[filter.key]),
  )

  // Every opening is a new export: the filters are the page's again, the
  // columns and the format keep what the reader chose, the flow starts over.
  // Layout rather than passive, so a surface reopened after a finished export
  // never paints the old result for a frame.
  useLayoutEffect(() => {
    if (visible) {
      attempt.current += 1
      setValues(pageFilters.current ?? {})
      setStep(0)
      setJob(null)
      setError(null)
    }
  }, [pageFilters, visible])

  function setOpen(next: boolean) {
    if (open === undefined) {
      setInternalOpen(next)
    }

    onOpenChange?.(next)
  }

  async function run() {
    const ticket = attempt.current

    setError(null)
    setStep(1)

    try {
      const started = await onExport({
        /** Declared order, not tick order: a file's columns are not a history
         * of what the reader clicked. */
        columns: kept.map((column) => column.key),
        filters: values,
        format,
      })

      if (ticket === attempt.current) {
        setJob(started)
      }
    } catch (reason) {
      if (ticket !== attempt.current) {
        return
      }

      setStep(0)
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.confirm.error,
      )
    }
  }

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
        description={description ?? labels.transfer.exportDescription(noun)}
        footer={
          step === 0 ? (
            <>
              <Button
                data-testid="data-transfer-export-confirm"
                disabled={kept.length === 0}
                onClick={() => void run()}
              >
                {labels.transfer.export}
              </Button>
              <Button
                data-testid="data-transfer-export-cancel"
                onClick={() => setOpen(false)}
                variant="ghost"
              >
                {labels.common.cancel}
              </Button>
            </>
          ) : (
            <Button
              data-testid="data-transfer-export-close"
              disabled={sending}
              onClick={() => setOpen(false)}
            >
              {labels.common.close}
            </Button>
          )
        }
        // Always leaves, even mid-request: the footer's Close waits for the
        // answer so the notice and its link are seen, but a surface that
        // cannot be left at all — a request that never settles — is worse
        // than a link missed. The job exists either way; its page lists it.
        onOpenChange={setOpen}
        open={visible}
        size={size}
        surface={surface}
        testId="data-transfer-export"
        title={title ?? labels.transfer.exportTitle(noun)}
      >
        <Stepper active={step} size="sm">
          <Stepper.Step allowStepClick={false} label={labels.transfer.stepData}>
            <div className={root()} data-size={size}>
              {filters && filters.length > 0 ? (
                <section
                  className={section()}
                  data-testid="data-transfer-export-filters"
                >
                  <span className={heading()}>
                    {labels.transfer.filters}
                    <Button
                      data-testid="data-transfer-export-clear-filters"
                      disabled={!filtered}
                      onClick={() => setValues({})}
                      size="sm"
                      variant="link"
                    >
                      {labels.transfer.clearFilters}
                    </Button>
                  </span>

                  <Search<DataTransferFilterValues>
                    items={filters.map((filter) => ({
                      field: (
                        <DataTransferFilterField
                          filter={filter}
                          onChange={(next) =>
                            setValues((current) => ({
                              ...current,
                              [filter.key]: next,
                            }))
                          }
                          value={values[filter.key]}
                        />
                      ),
                      id: filter.key,
                      label: filter.label,
                    }))}
                    value={values}
                    variant="grid"
                  />
                </section>
              ) : null}

              {formats.length > 1 ? (
                <section className={section()}>
                  <span className={heading()}>{labels.transfer.format}</span>
                  <SegmentedControl
                    ariaLabel={labels.transfer.format}
                    block
                    onChange={setFormat}
                    optionLabel="label"
                    optionValue="value"
                    options={formats.map((value) => ({
                      label: value.toUpperCase(),
                      value,
                    }))}
                    size="sm"
                    value={format}
                  />
                </section>
              ) : null}

              <section className={section()}>
                <span className={heading()}>
                  {labels.transfer.columns}
                  <span className="data-transfer-export-columns-count font-normal text-muted-foreground text-xs">
                    {labels.transfer.columnsChosen(kept.length, columns.length)}
                  </span>
                </span>

                <Checkbox
                  checked={kept.length === columns.length}
                  label={labels.transfer.allColumns}
                  onChange={(checked) =>
                    setChosen(
                      checked ? columns.map((column) => column.key) : [],
                    )
                  }
                />

                <div
                  className={columnsSlot()}
                  data-testid="data-transfer-export-columns"
                >
                  {columns.map((column) => {
                    const box = (
                      <Checkbox
                        checked={chosen.includes(column.key)}
                        key={`${column.key}-box`}
                        label={column.label}
                        onChange={(checked) =>
                          setChosen((current) =>
                            checked
                              ? [...current, column.key]
                              : current.filter((entry) => entry !== column.key),
                          )
                        }
                        value={column.key}
                      />
                    )

                    return column.hint ? (
                      <Tooltip content={column.hint} key={column.key}>
                        <span className="data-transfer-export-column-hint w-fit">
                          {box}
                        </span>
                      </Tooltip>
                    ) : (
                      <span key={column.key}>{box}</span>
                    )
                  })}
                </div>

                {/*
                  Said, not only disabled. A greyed Export with every column
                  cleared looks like the button broke; the sentence is the
                  difference between that and "pick one".
                */}
                {kept.length === 0 ? (
                  <span
                    className={errorSlot()}
                    data-testid="data-transfer-export-columns-none"
                  >
                    {labels.transfer.columnsNone}
                  </span>
                ) : null}
              </section>

              {error ? (
                <span
                  className={errorSlot()}
                  data-testid="data-transfer-export-error"
                >
                  {error}
                </span>
              ) : null}
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
              testId="data-transfer-export"
            >
              {job === null ? null : result?.(job)}
            </DataTransferResult>
          </Stepper.Step>
        </Stepper>
      </DataTransferShell>
    </>
  )
}

const DataTransferExport = Object.assign(DataTransferExportRoot, {
  Download: DataTransferExportDownload,
  Records: DataTransferExportRecords,
})

export { DataTransferExport }
