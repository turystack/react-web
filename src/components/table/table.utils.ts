import type { DataOutcome } from '@turystack/react-hooks'
import type { CSSProperties } from 'react'

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
  /** Exact pixels for a `fixedWidth` column; its percentage is then 0. */
  pixels?: number
}

export type TableLayout = {
  columns: TableColumnShare[]
  hasSpacer: boolean
  /** Exact pixels of the checkbox column, 0 without selection. */
  selectionPixels: number
  spacerIndex?: number
  spacerPercentage: number
  totalColumns: number
  totalWidth: number
}

function getFixedPixels<T>(column: TableColumns<T>[number]) {
  return column.fixedWidth && column.width ? column.width : undefined
}

/**
 * The width a cell's content may take. Only a `fixedWidth` column is measured
 * in pixels: a plain `width` is a share of the row (`width: 2` next to
 * `width: 1` means "twice as wide"), so capping the content at that many
 * pixels clipped a share column's content to a sliver.
 */
export function getColumnContentStyle<T>(
  column: TableColumns<T>[number],
): CSSProperties | undefined {
  const pixels = getFixedPixels(column)

  return pixels === undefined
    ? undefined
    : {
        maxWidth: `min(100%, ${pixels}px)`,
        width: '100%',
      }
}

/**
 * A fixed column keeps its pixels and stays out of the shares — the checkbox
 * column always is one: the flexible columns and the spacer split 100%
 * between them. A
 * fixed-layout table honours the pixel columns first and lays the
 * percentages over what is left, so the percentages have to add up to 100
 * without the fixed columns rather than be computed against the whole width.
 */
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
  // The checkbox column is fixed like any `fixedWidth` column: as a share it
  // shrank with the table and, squeezed, the box painted over the first
  // column's label.
  const fixedWidth = visibleColumns.reduce(
    (total, column) => total + (getFixedPixels(column) ?? 0),
    selectionWidth,
  )
  const totalWidth = Math.max(columnWidth, layoutWidth ?? columnWidth)
  const spacerWidth = totalWidth - columnWidth
  const spacerIndex =
    visibleColumns.length > 1 ? visibleColumns.length - 1 : undefined
  const hasSpacer = spacerWidth > 0 && spacerIndex !== undefined
  const shareWidth = totalWidth - fixedWidth
  const toPercentage = (width: number) =>
    shareWidth > 0 ? (width / shareWidth) * 100 : 0

  return {
    columns: visibleColumns.map((column) => {
      const pixels = getFixedPixels(column)

      if (pixels !== undefined) {
        return {
          key: column.key,
          percentage: 0,
          pixels,
        }
      }

      return {
        key: column.key,
        percentage: toPercentage(column.width ?? DEFAULT_COLUMN_WIDTH),
      }
    }),
    hasSpacer,
    selectionPixels: selectionWidth,
    spacerIndex,
    spacerPercentage: toPercentage(spacerWidth),
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

  // Its own state, not the fallthrough to pending below: an empty read that
  // landed there drew skeleton rows forever — a table that says "loading"
  // about a query that finished and found nothing.
  if (outcome.status === 'empty') {
    return {
      items: [],
      kind: 'empty',
      loading: false,
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
