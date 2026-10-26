/**
 * DataTransfer
 *
 * The vocabulary the export and the import both speak.
 *
 * One list of columns answers both directions — what may go out, and what may
 * be filled coming in. Two lists would drift the first time a column was added
 * to one and forgotten in the other, and the two screens would disagree about
 * what a booking is.
 *
 * A filter is declared by what it *is*, never by which input draws it. A screen
 * that named `CurrencyInput` in its filter list would be deciding presentation
 * from the outside, and the day money fields gain a currency selector every
 * such list would have to be found and edited.
 *
 * Both directions run on the server and outlive the surface. The request that
 * starts one answers with a job — the record the API keeps of it — and from
 * then on the result is a page of its own: the surface shows it while it is
 * open, and always says where it can be found once it is closed. A thousand
 * rows are not something to hold a modal open for.
 */

import type { DataOutcome } from '@turystack/react-hooks'

import type { PaginationProps } from '@/components/pagination/pagination.types'
import type { TableColumns } from '@/components/table/table.types'

/**
 * The contract below is the one `@turystack/nestjs-file-transfer` and the
 * Data Transfer model speak, in the model's spelling (snake_case). Same names,
 * same shapes: a record the worker wrote reaches this list untouched.
 */

/** `csv` · `json` · `jsonl` — the formats the worker reads and writes. */
export type DataTransferFormat = 'csv' | 'json' | 'jsonl'

/** Where the form is shown. A dense config belongs in a sheet; a short one in a modal. */
export type DataTransferSurface = 'modal' | 'sheet'

/** How wide the surface is, in the Modal's and the Sheet's own scale. */
export type DataTransferSize = 'sm' | 'md' | 'lg' | 'xl'

/** Where a whole job stands. `queued` and `running` are not failures to report. */
export type DataTransferJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'

/** Where one row stands. `pending` = the worker has not reached it yet. */
export type DataTransferRecordStatus = 'pending' | 'succeeded' | 'failed'

/** Why a whole job failed; a row's reasons are its `errors`. */
export type DataTransferFailureCode = 'file_too_large' | 'processing_error'

/**
 * Why a row failed: a code, never a message — the text comes from the labels
 * (`transfer.rowError`) or from the product. `column: null` is the whole row.
 */
export type DataTransferRowError = {
  code: string
  column: string | null
}

/** One value of `row_values`. */
export type DataTransferCell = string | number | boolean | null

/** One row of an import or an export, as the worker recorded it. */
export type DataTransferRecord<T> = {
  errors: DataTransferRowError[] // a failed row's reasons; [] otherwise
  row_number: number // 1 = the first row under the header
  row_values: Partial<Record<keyof T & string, DataTransferCell>> // import: as read; export: as written
  status: DataTransferRecordStatus
}

/**
 * What the API answers when it accepts an import or an export: the job it
 * opened. `data_transfer_job_id` is what the job's page is found by.
 */
export type DataTransferJobAccepted = {
  data_transfer_job_id: string
  status: DataTransferJobStatus
}

/** The rows of a job by status, as the API counts them from the records. */
export type DataTransferJobCounts = {
  failed: number
  pending: number
  succeeded: number
  total: number
}

/** A job as the product's polling query reads it. */
export type DataTransferJobProgress = {
  counts: DataTransferJobCounts
  failure_code: DataTransferFailureCode | null // set once the job failed
  status: DataTransferJobStatus
}

/**
 * What the browser reads from the first 64 KB of the file chosen for an
 * import: the headers, the first rows, and how the bytes were written. Built
 * in the browser only — the worker detects all of it again.
 */
export type DataTransferPreview = {
  delimiter?: string // CSV only
  encoding: string // `utf-8` · `utf-16le` · `windows-1252`
  headers: string[]
  rows: Record<string, string>[]
}

/**
 * What is being moved, in the reader's words — "bookings", "guests". It titles
 * the surface, so the same component says a different, true thing on every
 * screen it appears on.
 */
export type DataTransferEntity = {
  /** Used when the count is one: "Import a booking". */
  singular?: string
  /** Used everywhere else: "Export bookings". */
  plural: string
}

export type DataTransferColumn<T> = {
  /** Shown in the import template and beside the mapping, so a reader knows the shape. */
  example?: string
  /** Why this column exists. Reaches the reader as a tooltip beside the tickbox. */
  hint?: string
  key: keyof T & string
  label: string
  /**
   * Import: the mapping cannot be left empty. An export ignores it — every
   * column can be left out, as long as one goes.
   */
  required?: boolean
}

export type DataTransferFilterType =
  | 'text'
  | 'number'
  | 'money'
  | 'date'
  | 'dateRange'
  | 'boolean'
  | 'select'
  | 'multiSelect'

export type DataTransferFilterOption = {
  label: string
  value: string
}

export type DataTransferFilter = {
  key: string
  label: string
  /** Only for `select` and `multiSelect`; config rather than domain data, so a plain pair is enough. */
  options?: DataTransferFilterOption[]
  placeholder?: string
  type: DataTransferFilterType
}

/**
 * Every filter's value, keyed by filter. Shapes follow the type: a range is
 * `{ from, to }`, a `multiSelect` is `string[]`.
 */
export type DataTransferFilterValues = Record<string, unknown>

/**
 * A table's columns already say what a row holds and what each part is called.
 * Retyping that is how an export quietly stops carrying the column somebody
 * added last week. Columns with no label are dropped: a header nobody sees is
 * not one a reader can choose.
 */
export function columnsFromTable<T>(
  columns: TableColumns<T>,
): DataTransferColumn<T>[] {
  return columns
    .filter((column) => Boolean(column.label))
    .map((column) => ({
      key: column.key as keyof T & string,
      label: column.label as string,
    }))
}

/**
 * DataTransferImport.Records · DataTransferExport.Records
 *
 * The rows of a job as the worker works through them — every row, `succeeded`
 * or `failed`, import and export alike. Always paginated: the file that needs
 * this screen is the one with thousands of lines. The same list serves the
 * Result step and the job's own page, which is why it takes a `DataOutcome`
 * rather than rows — the product's query, polling while the job runs, drops
 * straight in. `job`, when given, heads the list with where the whole job
 * stands: its status, its counts and, once failed, why.
 *
 * A failed row lists its reasons by `code`: `rowErrorLabel` names the
 * product's own codes (`contact_email_taken`), and every other code reads
 * through `transfer.rowError` in the labels. A message never crosses the API.
 *
 * A poll is not a refresh. `refreshing` fades the list under a spinner, which
 * is right while the reader waits for the next page and wrong on every tick of
 * an interval — it would hide the very badges that are changing. Report
 * `isFetching` only for a page change (TanStack Query's `isPlaceholderData`),
 * not for the refetch the interval runs.
 */
export type DataTransferRecordsProps<T> = {
  columns: DataTransferColumn<T>[] // which values to show, and what to call them
  job?: DataTransferJobProgress // heads the list with the job's status and counts
  outcome: DataOutcome<DataTransferRecord<T>[]> // the page being shown
  pagination: PaginationProps // required: the list is never loaded whole
  rowErrorLabel?: (error: DataTransferRowError) => string | undefined // the product's own codes; undefined falls back to the labels
}
