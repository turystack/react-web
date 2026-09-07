/**
 * DataTransferImport
 *
 * Bringing rows in from a file, in the four steps that actually happen.
 *
 * Behavior:
 * - The file never leaves the browser. It is read locally, mapped and
 *   validated, and what reaches the API is `T[]` — not a bucket key. An import
 *   that fails should fail on line 14, column CPF, before anything was stored
 * - Step one offers the template, generated from the columns themselves, and
 *   names the file once it is chosen
 * - Step two maps the file's headers onto the columns, guessing by label and
 *   by key first, and shows the first value of each mapped column so a wrong
 *   guess is visible rather than merely possible
 * - Step three validates and says how many rows are ready against how many the
 *   file held. `schema` is a Standard Schema — the feature's own zod schema
 *   drops in — and `onValidate` catches what a per-row schema cannot see
 * - Step four reports what the API did and offers the refused rows back with
 *   the reason on each
 * - CSV is read here; anything else arrives through `parse`, which is also the
 *   seam for a server-side import
 *
 * Implementation:
 * - Modal or Sheet by `surface`; the title says which entity is arriving
 * - <DataTransferImport columns={columns} entity={{ plural: 'bookings' }} onImport={commit} schema={createBookingSchema} />
 *
 * Dependencies: DataTransfer, Stepper, Select, Table, Stat, FilePicker
 */

import type {
  DataTransferColumn,
  DataTransferEntity,
  DataTransferSurface,
} from '@/components/data-transfer/data-transfer.types'

/** One row as it came out of the file: every value still a string. */
export type DataTransferImportRow = Record<string, string>

/** Column key to the file's header, or null when nothing feeds it. */
export type DataTransferImportMapping = Record<string, string | null>

export type DataTransferImportIssue = {
  /** Which column, when the problem belongs to one. */
  field?: string
  message: string
  /** 1-based, the way the reader counts lines in their spreadsheet. */
  row: number
}

export type DataTransferImportResult = {
  created?: number
  failed?: number
  /** What the API refused, so the reader can take it back and fix it. */
  issues?: DataTransferImportIssue[]
  updated?: number
}

export type DataTransferImportParsed = {
  headers: string[]
  rows: DataTransferImportRow[]
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
  accept?: string // what the picker takes; default CSV
  columns: DataTransferColumn<T>[] // what a row can hold
  defaultOpen?: boolean // uncontrolled initial visibility
  description?: string // overrides what the entity would have said
  entity?: DataTransferEntity // what is arriving, in the reader's words
  maxRows?: number // refuses a file bigger than the screen was built for
  onImport: (
    rows: T[],
    meta: { mapping: DataTransferImportMapping; raw: DataTransferImportRow[] },
  ) => Promise<DataTransferImportResult | undefined> // does the work
  onOpenChange?: (open: boolean) => void // fires when it opens or closes
  onValidate?: (rows: T[]) => DataTransferImportIssue[] // cross-row rules
  open?: boolean // controlled visibility
  parse?: (file: File) => Promise<DataTransferImportParsed> // any format but CSV
  schema?: StandardSchema<T> // per-row validation, usually the feature's schema
  surface?: DataTransferSurface // modal or sheet; default sheet
  templateFileName?: string // what the template downloads as
  title?: string // overrides what the entity would have said
  trigger?: React.ReactElement // what opens it; its own onClick still fires
}
