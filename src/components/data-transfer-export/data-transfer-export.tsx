import { cloneElement, isValidElement, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { DataTransferShell } from '@/components/data-transfer/data-transfer'
import type {
  DataTransferFilterValues,
  DataTransferFormat,
} from '@/components/data-transfer/data-transfer.types'
import { useLabels } from '@/components/labels-provider'
import { SegmentedControl } from '@/components/segmented-control'
import { Tooltip } from '@/components/tooltip'

import { DataTransferFilterField } from './data-transfer-export.filters'
import type { DataTransferExportProps } from './data-transfer-export.types'

export const styles = tv({
  slots: {
    columns: 'data-transfer-export-columns flex flex-col gap-2',
    error: 'data-transfer-export-error text-destructive text-sm',
    filter: 'data-transfer-export-filter flex flex-col gap-1.5',
    filters: 'data-transfer-export-filters grid gap-3 sm:grid-cols-2',
    heading:
      'data-transfer-export-heading flex items-center justify-between gap-2 font-medium text-sm',
    label: 'data-transfer-export-label text-muted-foreground text-xs',
    root: 'data-transfer-export flex flex-col gap-6',
    section: 'data-transfer-export-section flex flex-col gap-3',
  },
})

const DEFAULT_FORMATS: DataTransferFormat[] = ['csv', 'xlsx', 'json']

export function DataTransferExport<T>({
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
  surface = 'sheet',
  title,
  trigger,
}: DataTransferExportProps<T>) {
  const labels = useLabels()
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const [chosen, setChosen] = useState<string[]>(
    defaultColumns ?? columns.map((column) => column.key),
  )
  const [values, setValues] = useState<DataTransferFilterValues>(
    defaultValues ?? {},
  )
  const [format, setFormat] = useState<DataTransferFormat>(
    defaultFormat ?? formats[0] ?? 'csv',
  )
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    columns: columnsSlot,
    error: errorSlot,
    filter: filterSlot,
    filters: filtersSlot,
    heading,
    label: labelSlot,
    root,
    section,
  } = styles()

  const visible = open ?? internalOpen
  const noun = entity?.plural ?? labels.transfer.export.toLowerCase()
  const requiredKeys = columns
    .filter((column) => column.required)
    .map((column) => column.key)

  function setOpen(next: boolean) {
    if (open === undefined) {
      setInternalOpen(next)
    }

    onOpenChange?.(next)
  }

  async function run() {
    setError(null)
    setRunning(true)

    try {
      await onExport({
        /** Declared order, not tick order: a file's columns are not a history
         * of what the reader clicked. */
        columns: columns
          .filter((column) => chosen.includes(column.key))
          .map((column) => column.key),
        filters: values,
        format,
      })
    } catch (reason) {
      setRunning(false)
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.confirm.error,
      )

      return
    }

    setRunning(false)
    setOpen(false)
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
          <>
            <Button
              data-testid="data-transfer-export-confirm"
              disabled={chosen.length === 0}
              loading={running}
              onClick={() => void run()}
            >
              {labels.transfer.export}
            </Button>
            <Button
              data-testid="data-transfer-export-cancel"
              disabled={running}
              onClick={() => setOpen(false)}
              variant="ghost"
            >
              {labels.common.cancel}
            </Button>
          </>
        }
        onOpenChange={setOpen}
        open={visible}
        surface={surface}
        testId="data-transfer-export"
        title={title ?? labels.transfer.exportTitle(noun)}
      >
        <div className={root()}>
          {filters && filters.length > 0 ? (
            <section
              className={section()}
              data-testid="data-transfer-export-filters"
            >
              <span className={heading()}>
                {labels.transfer.filters}
                <Button
                  data-testid="data-transfer-export-clear-filters"
                  onClick={() => setValues({})}
                  size="sm"
                  variant="link"
                >
                  {labels.transfer.clearFilters}
                </Button>
              </span>

              <div className={filtersSlot()}>
                {filters.map((filter) => (
                  <div className={filterSlot()} key={filter.key}>
                    <span className={labelSlot()}>{filter.label}</span>
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
                  </div>
                ))}
              </div>
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
                {labels.transfer.columnsChosen(chosen.length, columns.length)}
              </span>
            </span>

            <Checkbox
              checked={chosen.length === columns.length}
              label={labels.transfer.allColumns}
              onChange={(checked) =>
                setChosen(
                  checked ? columns.map((column) => column.key) : requiredKeys,
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
                    key={`${column.key}-box`}
                    checked={chosen.includes(column.key)}
                    disabled={column.required}
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

                /**
                 * A disabled tick with no explanation reads as a bug. The
                 * tooltip is the difference between "this is broken" and "this
                 * one always goes".
                 */
                return column.required || column.hint ? (
                  <Tooltip
                    content={column.hint ?? labels.transfer.alwaysIncluded}
                    key={column.key}
                  >
                    <span className="data-transfer-export-column-hint w-fit">
                      {box}
                    </span>
                  </Tooltip>
                ) : (
                  <span key={column.key}>{box}</span>
                )
              })}
            </div>
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
      </DataTransferShell>
    </>
  )
}
