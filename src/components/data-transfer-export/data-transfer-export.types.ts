/**
 * DataTransferExport
 *
 * Two steps: what leaves — which rows, in which shape, with which columns —
 * and then where the file will be.
 *
 * Behavior:
 * - **Filters** are declared by type, not by component. A screen says
 *   `type: 'money'` and this draws the money input — so the day a money filter
 *   gains a currency selector, no screen has to be found and edited. They are
 *   laid out by `Search` in its grid variant, so a filter section looks the
 *   same here as anywhere else a form filters. The values the page is already
 *   filtered by arrive through `defaultValues`, read again at every opening,
 *   because an export nobody adjusted should carry exactly what the reader is
 *   looking at now — not what the page showed when the export mounted
 * - **Format** is CSV, JSON or JSONL, and which of those a product offers is
 *   its own business
 * - **Columns** are ticked, and every one of them can be left out. The one
 *   rule is that something goes: with nothing ticked, Export is disabled and
 *   the section says why
 * - It never builds a file and never talks to the network: `onExport` receives
 *   the three answers and returns the job the API opened for them. It may
 *   throw to refuse — the first step comes back with the reason
 * - The Result step waits for that job, then says the export keeps running
 *   after the surface closes and links to its page through `resultLink`.
 *   Under that it renders `result(job)` — usually `DataTransferExport.Download`
 *   over the product's own query, which keeps Download disabled until the
 *   file exists, and `DataTransferExport.Records`: every row the worker read,
 *   written or `failed` with its codes, the same list an import shows
 *
 * Implementation:
 * - Modal or Sheet, by `surface`; the title says which entity is leaving
 * - <DataTransferExport columns={columns} entity={{ plural: 'bookings' }} filters={filters} onExport={start} result={(job) => <ExportFile id={job.data_transfer_job_id} />} resultLink={(job) => <Link to={`/exports/${job.data_transfer_job_id}`}>Open the export</Link>} />
 *
 * Dependencies: DataTransfer, Modal, Sheet, Stepper, Search, SegmentedControl,
 * Checkbox, Tooltip, Loader, the filter inputs
 */

import type { ReactNode } from 'react'

import type {
  DataTransferColumn,
  DataTransferEntity,
  DataTransferFailureCode,
  DataTransferFilter,
  DataTransferFilterValues,
  DataTransferFormat,
  DataTransferJobAccepted,
  DataTransferJobStatus,
  DataTransferSize,
  DataTransferSurface,
} from '@/components/data-transfer/data-transfer.types'

export type DataTransferExportConfig<T> = {
  columns: (keyof T & string)[] // what the reader kept, in the declared order
  filters: DataTransferFilterValues // what the filter section holds now
  format: DataTransferFormat
}

export type DataTransferExportProps<T> = {
  columns: DataTransferColumn<T>[] // every column that could go out
  defaultColumns?: (keyof T & string)[] // ticked to begin with; default all
  defaultFormat?: DataTransferFormat // default: the first offered
  defaultOpen?: boolean // uncontrolled initial visibility
  /** What the page is already filtered by. The export opens showing it. */
  defaultValues?: DataTransferFilterValues
  description?: string // overrides what the entity would have said
  entity?: DataTransferEntity // what is leaving, in the reader's words
  filters?: DataTransferFilter[] // the filter section, declared by type
  formats?: DataTransferFormat[] // which shapes to offer; default csv, json, jsonl
  onExport: (
    config: DataTransferExportConfig<T>,
  ) => Promise<DataTransferJobAccepted> // starts it; answers with the job
  onOpenChange?: (open: boolean) => void // fires when it opens or closes
  open?: boolean // controlled visibility
  result?: (job: DataTransferJobAccepted) => ReactNode // what the Result step shows under the notice
  resultLink: (job: DataTransferJobAccepted) => ReactNode // the page the export can be found on later
  size?: DataTransferSize // how wide the surface is; default md
  surface?: DataTransferSurface // modal or sheet; default sheet
  title?: string // overrides what the entity would have said
  trigger?: React.ReactElement // what opens it; its own onClick still fires
}

/**
 * DataTransferExport.Download
 *
 * The export's file, from the moment the API accepted the job until it can be
 * taken. While a file can still come (`queued`, `running`), Download is on
 * screen and enabled once it exists — a button that appears late moves
 * everything under it, and one that is missing reads as "there is nothing to
 * download". A failed export has nothing to take, so there the button goes and
 * the reason — its `failure_code`, read through the labels — takes its place.
 *
 * `href` is the usual case, a signed URL. It opens in a new tab: a browser
 * ignores `download` for another origin, so the server's own headers decide
 * whether the file is saved or shown — never over the app. `onDownload` is for
 * a file that must be fetched with the session.
 */
export type DataTransferExportDownloadProps = {
  failureCode?: DataTransferFailureCode | null // why the job failed; the text comes from the labels
  fileName?: string // shown once ready; names the saved file for a same-origin `href`
  href?: string // where the file is, once it exists
  onDownload?: () => void // takes the file when `href` cannot
  status: DataTransferJobStatus // the export job's status
}
