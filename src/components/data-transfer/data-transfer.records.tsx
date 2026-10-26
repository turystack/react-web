import { Badge } from '@/components/badge'
import type { BadgeVariant } from '@/components/badge/badge.types'
import { useLabels } from '@/components/labels-provider'
import { Table } from '@/components/table'
import type { TableColumns } from '@/components/table/table.types'
import { Clock } from '@/internal/icons'

import { styles } from './data-transfer.records.styles'

import type {
  DataTransferJobProgress,
  DataTransferJobStatus,
  DataTransferRecord,
  DataTransferRecordStatus,
  DataTransferRecordsProps,
  DataTransferRowError,
} from './data-transfer.types'

const RECORD_VARIANT: Record<DataTransferRecordStatus, BadgeVariant> = {
  failed: 'destructive',
  pending: 'secondary',
  succeeded: 'success',
}

const JOB_VARIANT: Record<DataTransferJobStatus, BadgeVariant> = {
  failed: 'destructive',
  queued: 'secondary',
  running: 'info',
  succeeded: 'success',
}

/**
 * Column widths in pixels. The value and result columns are shares of the row
 * (Table splits the row in their proportion) and their sum is the table's
 * `layoutWidth`, so below it the list scrolls sideways instead of crushing a
 * column to a few pixels. The result column is wide enough for its badge on
 * one line; the reasons under it wrap.
 */
const ROW_WIDTH = 64
const VALUE_WIDTH = 120
const RESULT_WIDTH = 160

/** Which way the rows went: it names what a `succeeded` row became. */
type DataTransferDirection = 'export' | 'import'

type DataTransferRecordsListProps<T> = DataTransferRecordsProps<T> & {
  direction: DataTransferDirection
}

/** The job's own line above its rows: status, counts and, once failed, why. */
function DataTransferJobLine({ job }: { job: DataTransferJobProgress }) {
  const labels = useLabels()
  const { failure, job: jobSlot, jobCounts, jobLine } = styles()
  const said: Record<DataTransferJobStatus, string> = {
    failed: labels.transfer.jobFailed,
    queued: labels.transfer.jobQueued,
    running: labels.transfer.jobRunning,
    succeeded: labels.transfer.jobSucceeded,
  }

  return (
    <div
      className={jobSlot()}
      data-status={job.status}
      data-testid="data-transfer-job"
    >
      <div className={jobLine()}>
        <Badge size="sm" variant={JOB_VARIANT[job.status]}>
          {job.status === 'queued' ? <Clock /> : null}
          {said[job.status]}
        </Badge>
        <span className={jobCounts()} role="status">
          {labels.transfer.jobCounts({
            failed: job.counts.failed,
            processed: job.counts.succeeded + job.counts.failed,
            total: job.counts.total,
          })}
        </span>
      </div>

      {job.status === 'failed' ? (
        <span className={failure()} data-testid="data-transfer-job-failure">
          {job.failure_code === 'file_too_large'
            ? labels.transfer.failureFileTooLarge
            : labels.transfer.failureProcessing}
        </span>
      ) : null}
    </div>
  )
}

/**
 * The rows of an import or an export, as the worker recorded them. One list
 * for both directions — `DataTransferImport.Records` and
 * `DataTransferExport.Records` only say which way the rows went.
 */
export function DataTransferRecords<T>({
  columns,
  direction,
  job,
  outcome,
  pagination,
  rowErrorLabel,
}: DataTransferRecordsListProps<T>) {
  const labels = useLabels()
  const { error: errorSlot, errors, records, status, value } = styles()
  const said: Record<DataTransferRecordStatus, string> = {
    failed: labels.transfer.recordFailed,
    pending: labels.transfer.recordPending,
    succeeded:
      direction === 'import'
        ? labels.transfer.recordImported
        : labels.transfer.recordExported,
  }

  /**
   * A code becomes a sentence here, never on the server: the product's own
   * codes first, then the labels', which still read an unknown code as one.
   * The column is named by its label, the way the reader knows it.
   */
  function reason(error: DataTransferRowError) {
    const message =
      rowErrorLabel?.(error) ?? labels.transfer.rowError(error.code)

    if (error.column === null) {
      return message
    }

    const column = columns.find((entry) => entry.key === error.column)

    return `${column?.label ?? error.column}: ${message}`
  }

  const table: TableColumns<DataTransferRecord<T>> = [
    {
      // Keys of their own, not `row_number` and `status`: a booking has a
      // `status` column too, and two columns under one key are two React
      // children under one key.
      // Exact pixels: four digits and the header ("Linha" the longest) fit,
      // and pinned it keeps naming the row while the values scroll under it.
      fixedWidth: true,
      key: '__row',
      label: labels.transfer.recordRow,
      selector: (record) => record.row_number,
      sticky: 'left',
      width: ROW_WIDTH,
    },
    ...columns.map((column) => ({
      key: column.key,
      label: column.label,
      /**
       * Truncated, with the whole value on hover. A table cell does not wrap,
       * so in a 512px modal "Katherine Johnson" painted straight over the
       * price beside it — the row stays readable only if each value keeps to
       * its own column.
       */
      selector: (record: DataTransferRecord<T>) => {
        const cell = record.row_values[column.key]
        const text = cell === null || cell === undefined ? '' : String(cell)

        return (
          <span className={value()} title={text}>
            {text}
          </span>
        )
      },
      width: VALUE_WIDTH,
    })),
    {
      key: '__result',
      label: labels.transfer.recordStatus,
      /**
       * The reasons sit under the badge rather than in a column of their own:
       * most rows have none, and a column that is empty down most of its
       * length takes the width the values need.
       */
      selector: (record) => (
        <div className={status()}>
          {/* Pending says so in words. A loading badge hides its text behind
              the spinner, and a column of bare spinners reads as the list
              still loading rather than as rows the worker has not reached. */}
          <Badge size="sm" variant={RECORD_VARIANT[record.status]}>
            {record.status === 'pending' ? <Clock /> : null}
            {said[record.status]}
          </Badge>
          {record.status === 'failed' && record.errors.length > 0 ? (
            <ul className={errors()}>
              {record.errors.map((error, index) => (
                // Two rules can fail a row with the same code on one column.
                <li
                  className={errorSlot()}
                  key={`${index}-${error.column}-${error.code}`}
                >
                  {reason(error)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ),
      width: RESULT_WIDTH,
    },
  ]

  return (
    <div
      className={records()}
      data-direction={direction}
      data-testid={`data-transfer-${direction}-records`}
    >
      {job ? <DataTransferJobLine job={job} /> : null}

      <Table<DataTransferRecord<T>>
        columns={table}
        itemKey="row_number"
        layoutWidth={ROW_WIDTH + VALUE_WIDTH * columns.length + RESULT_WIDTH}
        outcome={outcome}
        pagination={pagination}
      />
    </div>
  )
}
