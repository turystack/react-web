import type { DataTransferColumn } from '@/components/data-transfer/data-transfer.types'

import type {
  DataTransferImportMapping,
  DataTransferImportParsed,
  DataTransferImportRow,
} from './data-transfer-import.types'

/**
 * A CSV reader, rather than a dependency.
 *
 * It handles the two things that make hand-rolled splitting wrong: a comma
 * inside quotes, and a quote inside quotes written as two. Anything beyond
 * that — a semicolon delimiter, an XLSX — belongs to the `parse` prop, because
 * guessing a dialect silently is worse than being told which one it is.
 */
export function parseCsv(text: string): DataTransferImportParsed {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  const pushValue = () => {
    row.push(value)
    value = ''
  }

  const pushRow = () => {
    pushValue()

    if (row.some((entry) => entry.trim() !== '')) {
      rows.push(row)
    }

    row = []
  }

  const clean = text.replace(/\r\n?/g, '\n')

  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index]

    if (quoted) {
      if (character === '"') {
        if (clean[index + 1] === '"') {
          value += '"'
          index += 1
          continue
        }

        quoted = false
        continue
      }

      value += character
      continue
    }

    if (character === '"') {
      quoted = true
      continue
    }

    if (character === ',') {
      pushValue()
      continue
    }

    if (character === '\n') {
      pushRow()
      continue
    }

    value += character
  }

  pushRow()

  const [headerRow = [], ...bodyRows] = rows
  const headers = headerRow.map((header) => header.trim())

  return {
    headers,
    rows: bodyRows.map((entries) =>
      headers.reduce<DataTransferImportRow>((accumulator, header, position) => {
        accumulator[header] = (entries[position] ?? '').trim()

        return accumulator
      }, {}),
    ),
  }
}

const loose = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Guesses which column feeds which field, by label first and key second,
 * ignoring case, accents and punctuation. It is a guess and the reader can
 * overrule every line of it — which is why guessing is worth doing at all.
 */
export function guessMapping<T>(
  columns: DataTransferColumn<T>[],
  headers: string[],
): DataTransferImportMapping {
  const taken = new Set<string>()

  return columns.reduce<DataTransferImportMapping>((mapping, column) => {
    const match = headers.find(
      (header) =>
        !taken.has(header) &&
        (loose(header) === loose(column.label) ||
          loose(header) === loose(column.key)),
    )

    if (match) {
      taken.add(match)
    }

    mapping[column.key] = match ?? null

    return mapping
  }, {})
}

/** Applies the mapping, so every row is keyed by column rather than by header. */
export function applyMapping(
  rows: DataTransferImportRow[],
  mapping: DataTransferImportMapping,
): DataTransferImportRow[] {
  return rows.map((row) =>
    Object.entries(mapping).reduce<DataTransferImportRow>(
      (mapped, [key, header]) => {
        mapped[key] = header === null ? '' : (row[header] ?? '')

        return mapped
      },
      {},
    ),
  )
}

/** Turns issues into the file the reader takes away and fixes. */
export function issuesToCsv(
  rows: DataTransferImportRow[],
  issues: { field?: string; message: string; row: number }[],
): string {
  const headers = Object.keys(rows[0] ?? {})
  const quote = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

  const lines = [[...headers, 'error'].map(quote).join(',')]

  for (const issue of issues) {
    const row = rows[issue.row - 1] ?? {}

    lines.push(
      [
        ...headers.map((header) => quote(row[header] ?? '')),
        quote(issue.field ? `${issue.field}: ${issue.message}` : issue.message),
      ].join(','),
    )
  }

  return lines.join('\n')
}

/** The empty file with the right headers, and one row of examples if there are any. */
export function templateCsv<T>(columns: DataTransferColumn<T>[]): string {
  const headers = columns.map((column) => column.label).join(',')
  const examples = columns.map((column) => column.example ?? '').join(',')

  return columns.some((column) => column.example)
    ? `${headers}\n${examples}`
    : headers
}
