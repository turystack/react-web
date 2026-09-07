import type { DataOutcome } from '@turystack/react-hooks'

import type { TableColumns, TableItems } from './table.types'

const SELECTION_COLUMN_WIDTH = 40

/**
 * Every column shares one scale, so the width a column declares and the width
 * the selection column takes have to be measured in the same unit. A column
 * with no width of its own used to count as 1, which put a 40 next to a 1 and
 * handed the checkbox column almost the whole table.
 */
const DEFAULT_COLUMN_WIDTH = 100

export type TableColumnShare = {
  key: string
  percentage: number
}

export type TableLayout = {
  columns: TableColumnShare[]
  hasSpacer: boolean
  selectionPercentage: number
  spacerIndex?: number
  spacerPercentage: number
  totalColumns: number
  totalWidth: number
}

export function getTableLayout<T>(
  visibleColumns: TableColumns<T>,
  hasSelection: boolean,
  layoutWidth?: number,
): TableLayout {
  const selectionWidth = hasSelection ? SELECTION_COLUMN_WIDTH : 0
  const columnWidth = visibleColumns.reduce(
    (total, column) => total + (column.width ?? DEFAULT_COLUMN_WIDTH),
    selectionWidth,
  )
  const totalWidth = Math.max(columnWidth, layoutWidth ?? columnWidth)
  const spacerWidth = totalWidth - columnWidth
  const spacerIndex =
    visibleColumns.length > 1 ? visibleColumns.length - 1 : undefined
  const hasSpacer = spacerWidth > 0 && spacerIndex !== undefined

  return {
    columns: visibleColumns.map((column) => ({
      key: column.key,
      percentage: ((column.width ?? DEFAULT_COLUMN_WIDTH) / totalWidth) * 100,
    })),
    hasSpacer,
    selectionPercentage: (selectionWidth / totalWidth) * 100,
    spacerIndex,
    spacerPercentage: (spacerWidth / totalWidth) * 100,
    totalColumns:
      visibleColumns.length + (hasSelection ? 1 : 0) + (hasSpacer ? 1 : 0),
    totalWidth,
  }
}

/** What the body draws, once the outcome and the static props are reconciled. */
export type TableBodyKind = 'denied' | 'empty' | 'error' | 'pending' | 'rows'

export type TableBody<T> = {
  items: TableItems<T>
  kind: TableBodyKind
  loading: boolean
  reason?: string
  retry?: () => void
}

/**
 * The five states collapse into what the body has to draw.
 *
 * `pending` and `rows` are the only two that are not a message, and
 * `refreshing` is deliberately not one of the five: valid rows stay on screen
 * under an overlay rather than being replaced by a skeleton.
 */
export function getTableBody<T>(
  outcome: DataOutcome<TableItems<T>> | undefined,
  items: TableItems<T> | undefined,
  loading: boolean | undefined,
): TableBody<T> {
  if (!outcome) {
    return {
      items: items ?? [],
      kind: items && items.length > 0 ? 'rows' : 'empty',
      loading: Boolean(loading),
    }
  }

  if (outcome.status === 'success') {
    return {
      items: outcome.data,
      kind: outcome.data.length > 0 ? 'rows' : 'empty',
      loading: outcome.refreshing,
    }
  }

  if (outcome.status === 'denied') {
    return {
      items: [],
      kind: 'denied',
      loading: false,
      reason: outcome.reason,
    }
  }

  if (outcome.status === 'error') {
    return {
      items: [],
      kind: 'error',
      loading: false,
      retry: outcome.retry,
    }
  }

  return {
    items: [],
    kind: 'pending',
    loading: false,
  }
}
