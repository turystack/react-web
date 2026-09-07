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
 */

import type { TableColumns } from '@/components/table/table.types'

export type DataTransferFormat = 'csv' | 'xlsx' | 'json'

/** Where the form is shown. A dense config belongs in a sheet; a short one in a modal. */
export type DataTransferSurface = 'modal' | 'sheet'

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
  /** Why this column exists, or why it cannot be turned off. Reaches the reader as a tooltip. */
  hint?: string
  key: keyof T & string
  label: string
  /**
   * Export: always included, and shown ticked and disabled rather than hidden —
   * a column the reader cannot find is a column they think is missing.
   * Import: the mapping cannot be left empty.
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

export type DataTransferFilterOption = {
  label: string
  value: string
}

export type DataTransferFilter = {
  key: string
  label: string
  /** Only for `select`; config rather than domain data, so a plain pair is enough. */
  options?: DataTransferFilterOption[]
  placeholder?: string
  type: DataTransferFilterType
}

/** Every filter's value, keyed by filter. Shapes follow the type: a range is `{ from, to }`. */
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
