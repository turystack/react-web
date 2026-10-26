/**
 * DataTransferImport
 *
 * Bringing rows in from a file, in the steps that actually happen. The file
 * goes to storage; the browser reads only its head; the worker reads every
 * row.
 *
 * Behavior:
 * - Step one picks the file. `maxFileSize` and the offered `formats` (`csv` ·
 *   `json` · `jsonl`, by extension) refuse it before anything is uploaded —
 *   the size is the only limit, as the presigned upload enforces it too. A
 *   file taken goes up through `onUpload`, which answers with its
 *   `storage_key`. The template, generated from the columns, is offered while
 *   CSV is
 * - At the same time the browser previews the file: the first 64 KB through
 *   `File.slice`, with the encoding (BOM, UTF-8, UTF-16LE, Windows-1252), the
 *   CSV delimiter, the headers and the first rows detected here. Nothing goes
 *   to the server for it
 * - Step two maps the file's headers onto the columns, guessing by label and
 *   by key first, and shows the first value of each mapped column so a wrong
 *   guess is visible rather than merely possible. It does not wait for the
 *   upload: Import does
 * - Step three shows the preview rows as mapped. `schema`, a Standard Schema
 *   (the feature's zod schema drops in), runs on those rows only, as a
 *   warning — the worker validates every row, and a row that fails becomes a
 *   `failed` record with its code, never a row that silently disappears
 * - Import hands `onImport` the `{ storage_key, mapping, format }` the API
 *   opens a job with, and it answers with the job. The Result step says the
 *   import keeps running after the surface closes and links to its page
 *   through `resultLink`; under that it renders `result(job)` — usually
 *   `DataTransferImport.Records` over the product's polling query. The
 *   product polls; this component never does
 * - A refused upload returns to the file step, a refused import to the
 *   preview, each with the reason
 *
 * Implementation:
 * - Modal or Sheet by `surface`; the title says which entity is arriving
 * - <DataTransferImport columns={columns} entity={{ plural: 'bookings' }} maxFileSize={50_000_000} onImport={start} onUpload={upload} result={(job) => <ImportRecords id={job.data_transfer_job_id} />} resultLink={(job) => <Link to={`/imports/${job.data_transfer_job_id}`}>Open the import</Link>} schema={createBookingSchema} />
 *
 * Dependencies: DataTransfer, Stepper, Select, Table, Stat, Badge, Loader,
 * FilePicker, @turystack/react-hooks (DataOutcome)
 */

import type { ReactNode } from 'react'

import type {
  DataTransferColumn,
  DataTransferEntity,
  DataTransferFormat,
  DataTransferJobAccepted,
  DataTransferSize,
  DataTransferSurface,
} from '@/components/data-transfer/data-transfer.types'

/** One preview row as it came out of the file: every value still a string. */
export type DataTransferImportRow = Record<string, string>

/** Column key to the file's header that feeds it; a column left out is not mapped. */
export type DataTransferImportMapping<T> = Partial<
  Record<keyof T & string, string>
>

/** What `onUpload` answers: where the file now is. */
export type DataTransferImportUpload = {
  storage_key: string
}

/** What `onImport` receives: everything the API needs to open the job. */
export type DataTransferImportRequest<T> = {
  format: DataTransferFormat
  mapping: DataTransferImportMapping<T> // column key to the file's header
  storage_key: string // what `onUpload` answered
}

/**
 * The Standard Schema surface, declared rather than depended on: any zod
 * schema already satisfies it, and the package stays free of a validation
 * library it would only ever use for this.
 */
export type StandardSchema<T> = {
  '~standard': {
    validate: (value: unknown) =>
      | { value: T; issues?: undefined }
      | { issues: readonly { message: string; path?: readonly unknown[] }[] }
      | Promise<
          | { value: T; issues?: undefined }
          | {
              issues: readonly { message: string; path?: readonly unknown[] }[]
            }
        >
  }
}

export type DataTransferImportProps<T> = {
  columns: DataTransferColumn<T>[] // what a row can hold
  defaultOpen?: boolean // uncontrolled initial visibility
  description?: string // overrides what the entity would have said
  entity?: DataTransferEntity // what is arriving, in the reader's words
  formats?: DataTransferFormat[] // which files the picker takes; default all three
  maxFileSize?: number // in bytes; a bigger file is refused before the upload
  onImport: (
    request: DataTransferImportRequest<T>,
  ) => Promise<DataTransferJobAccepted> // starts it; answers with the job
  onOpenChange?: (open: boolean) => void // fires when it opens or closes
  onUpload: (file: File) => Promise<DataTransferImportUpload> // puts the file in storage
  open?: boolean // controlled visibility
  result?: (job: DataTransferJobAccepted) => ReactNode // what the Result step shows under the notice
  resultLink: (job: DataTransferJobAccepted) => ReactNode // the page the import can be found on later
  schema?: StandardSchema<T> // warns on the preview rows; the worker decides
  size?: DataTransferSize // how wide the surface is; default md
  surface?: DataTransferSurface // modal or sheet; default sheet
  templateFileName?: string // what the CSV template downloads as
  title?: string // overrides what the entity would have said
  trigger?: React.ReactElement // what opens it; its own onClick still fires
}
