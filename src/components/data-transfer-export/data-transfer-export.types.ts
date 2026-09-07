/**
 * DataTransferExport
 *
 * The form that decides what leaves the screen, in three sections: which rows,
 * in which shape, with which columns.
 *
 * Behavior:
 * - **Filters** are declared by type, not by component. A screen says
 *   `type: 'money'` and this draws the money input — so the day a money filter
 *   gains a currency selector, no screen has to be found and edited. The values
 *   the page is already filtered by arrive through `defaultValues`, because an
 *   export nobody adjusted should carry exactly what the reader is looking at
 * - **Format** is CSV, XLSX or JSON, and which of those a product offers is
 *   its own business
 * - **Columns** are ticked. A required column shows ticked and disabled with a
 *   tooltip saying why, rather than hidden — a column the reader cannot find is
 *   a column they think is missing
 * - It never builds a file and never talks to the network: `onExport` receives
 *   the three answers, and the API does the work
 * - `onExport` may return a promise, and may throw to refuse — the surface
 *   stays open with the reason
 *
 * Implementation:
 * - Modal or Sheet, by `surface`; the title says which entity is leaving
 * - <DataTransferExport columns={columns} entity={{ plural: 'bookings' }} filters={filters} onExport={run} />
 *
 * Dependencies: DataTransfer, Modal, Sheet, SegmentedControl, Checkbox,
 * Tooltip, the filter inputs
 */

import type {
  DataTransferColumn,
  DataTransferEntity,
  DataTransferFilter,
  DataTransferFilterValues,
  DataTransferFormat,
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
  formats?: DataTransferFormat[] // which shapes to offer; default all three
  onExport: (config: DataTransferExportConfig<T>) => void | Promise<void>
  onOpenChange?: (open: boolean) => void // fires when it opens or closes
  open?: boolean // controlled visibility
  surface?: DataTransferSurface // modal or sheet; default sheet
  title?: string // overrides what the entity would have said
  trigger?: React.ReactElement // what opens it; its own onClick still fires
}
