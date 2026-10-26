import type {
  DataTransferColumn,
  DataTransferFormat,
  DataTransferPreview,
} from '@/components/data-transfer/data-transfer.types'

import type { DataTransferImportRow } from './data-transfer-import.types'

/**
 * The browser's side of an import: what it reads of the file before the file
 * is anyone else's. Only the head — the first 64 KB, through `File.slice` — so
 * a 1 GB file previews as fast as a 1 KB one, and nothing here ever holds the
 * whole file. The worker reads every row and decides everything again from the
 * bytes; these helpers only have to be right enough to map the columns.
 */

/** How much of the file the preview reads — the worker samples the same. */
export const PREVIEW_BYTES = 64 * 1024

/** Rows the preview keeps: enough to see a wrong mapping, not a report. */
export const PREVIEW_ROWS = 10

/** The encodings the preview tells apart, spelled as the worker spells them. */
export type PreviewEncoding = 'utf-8' | 'utf-16le' | 'windows-1252'

/** Why the preview could not read a file — each one the worker refuses too. */
export type PreviewProblem =
  | 'duplicate_header'
  | 'encoding_not_supported'
  | 'no_rows'
  | 'not_an_array'

/** A file the preview cannot read; `detail` names the header, for `duplicate_header`. */
export class PreviewUnreadableError extends Error {
  readonly detail: string | undefined
  readonly problem: PreviewProblem

  constructor(problem: PreviewProblem, detail?: string) {
    super(problem)
    this.name = 'PreviewUnreadableError'
    this.problem = problem
    this.detail = detail
  }
}

/**
 * The preview, plus the number the worker will give each of its rows. They
 * differ from positions whenever the preview leaves a row out that the worker
 * records (a JSON element that is not an object, a JSONL line that is not
 * JSON), so a warning names the row the records list will show.
 */
export type BrowserPreview = DataTransferPreview & {
  row_numbers: number[]
}

const EXTENSIONS: Record<string, DataTransferFormat> = {
  csv: 'csv',
  json: 'json',
  jsonl: 'jsonl',
  ndjson: 'jsonl',
}

const MIME_TYPES: Record<string, DataTransferFormat> = {
  'application/json': 'json',
  'application/jsonl': 'jsonl',
  'application/x-ndjson': 'jsonl',
  'text/csv': 'csv',
}

/** The format a file is in, by its extension first and its type second. */
export function formatOfFile(file: {
  name: string
  type: string
}): DataTransferFormat | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  return EXTENSIONS[extension] ?? MIME_TYPES[file.type.toLowerCase()] ?? null
}

/** What the picker takes for the formats offered. */
export function acceptOf(formats: DataTransferFormat[]): string {
  return formats
    .flatMap((format) =>
      format === 'jsonl' ? ['.jsonl', '.ndjson'] : [`.${format}`],
    )
    .join(',')
}

const UTF8_BOM = [0xef, 0xbb, 0xbf]

/**
 * The encoding of the bytes, and the length of their BOM — the worker's rule:
 * a UTF-8 or UTF-16LE BOM names it; without one, bytes that decode as UTF-8
 * are UTF-8 and anything else is Windows-1252 (a spreadsheet saved as plain
 * "CSV"). A UTF-16BE file is refused.
 */
export function detectEncoding(bytes: Uint8Array): {
  bomLength: number
  encoding: PreviewEncoding
} {
  if (UTF8_BOM.every((byte, index) => bytes[index] === byte)) {
    return {
      bomLength: 3,
      encoding: 'utf-8',
    }
  }

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return {
      bomLength: 2,
      encoding: 'utf-16le',
    }
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    throw new PreviewUnreadableError('encoding_not_supported')
  }

  return {
    bomLength: 0,
    encoding: isUtf8(bytes) ? 'utf-8' : 'windows-1252',
  }
}

/** Whether the bytes decode as UTF-8; a sequence cut at the 64 KB edge still counts. */
function isUtf8(bytes: Uint8Array): boolean {
  try {
    new TextDecoder('utf-8', {
      fatal: true,
    }).decode(bytes, {
      stream: true,
    })

    return true
  } catch {
    return false
  }
}

/** Windows-1252 at 0x80–0x9F, where it differs from Latin-1. */
const WINDOWS_1252_HIGH = [
  0x20ac, 0x81, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030,
  0x160, 0x2039, 0x152, 0x8d, 0x17d, 0x8f, 0x90, 0x2018, 0x2019, 0x201c, 0x201d,
  0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x9d, 0x17e,
  0x178,
]

/**
 * Decodes the bytes in the encoding detected. Windows-1252 is mapped here
 * rather than through `TextDecoder`, which decodes it as Latin-1 in some
 * runtimes — `€` (0x80) would come out as a control character.
 */
export function decodeBytes(
  bytes: Uint8Array,
  encoding: PreviewEncoding,
): string {
  if (encoding !== 'windows-1252') {
    return new TextDecoder(encoding).decode(bytes, {
      stream: true,
    })
  }

  let text = ''

  for (let at = 0; at < bytes.byteLength; at += 8192) {
    const codes = Array.from(bytes.subarray(at, at + 8192), (byte) =>
      byte >= 0x80 && byte <= 0x9f
        ? (WINDOWS_1252_HIGH[byte - 0x80] as number)
        : byte,
    )

    text += String.fromCharCode(...codes)
  }

  return text
}

/** Delimiters considered, in the order a tie is broken — the worker's. */
const DELIMITERS = [',', ';', '\t', '|']

/**
 * The delimiter of the header row: the candidate seen most often outside
 * quotes before the first line break, `,` when none appears.
 */
export function detectDelimiter(text: string): string {
  const counts = new Map<string, number>()
  let quoted = false

  for (const character of text) {
    if (character === '"') {
      quoted = !quoted
      continue
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      break
    }

    if (!quoted && DELIMITERS.includes(character)) {
      counts.set(character, (counts.get(character) ?? 0) + 1)
    }
  }

  let best = ','
  let bestCount = 0

  for (const candidate of DELIMITERS) {
    const count = counts.get(candidate) ?? 0

    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }

  return best
}

/**
 * The records of a CSV text, every field a string, read the way the worker's
 * `csv-parse` reads them (`relax_quotes`, `skip_empty_lines`):
 * - a quote opens a quoted field only as the field's first character; inside
 *   a field (`55" screen`) it is a quote like any other
 * - a delimiter or a line break inside quotes stays in the value, and a quote
 *   inside quotes is written as two
 * - only an empty line is skipped; a line of empty fields (`,,`) is a row
 * - nothing is trimmed: the worker reads ` email` as ` email`
 */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const records: string[][] = []
  let record: string[] = []
  let value = ''
  let quoted = false
  // Whether the field under way has started: a quote opens only before that.
  let started = false

  const pushValue = () => {
    record.push(value)
    value = ''
    started = false
  }

  const pushRecord = () => {
    const empty = record.length === 0 && !started && value === ''

    pushValue()

    if (!empty) {
      records.push(record)
    }

    record = []
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

    if (character === '"' && !started) {
      quoted = true
      started = true
      continue
    }

    if (character === delimiter) {
      pushValue()
      continue
    }

    if (character === '\n') {
      pushRecord()
      continue
    }

    started = true
    value += character
  }

  if (record.length > 0 || started || value !== '') {
    pushRecord()
  }

  return records
}

/** A JSON value as the text a mapping shows. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The top-level elements of a JSON array, as texts, from a head that may be
 * cut anywhere. An element still open at the cut is left out.
 */
function jsonElements(text: string, limit: number): string[] {
  const start = text.indexOf('[')

  if (start === -1 || text.slice(0, start).trim() !== '') {
    throw new PreviewUnreadableError('not_an_array')
  }

  const elements: string[] = []
  let depth = 0
  let quoted = false
  let escaped = false
  let from = start + 1

  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index]

    if (quoted) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        quoted = false
      }

      continue
    }

    if (character === '"') {
      quoted = true
    } else if (character === '{' || character === '[') {
      depth += 1
    } else if (character === '}') {
      depth -= 1
    } else if (character === ']' && depth > 0) {
      depth -= 1
    } else if (depth === 0 && (character === ',' || character === ']')) {
      const element = text.slice(from, index).trim()

      if (element !== '') {
        elements.push(element)
      }

      if (character === ']' || elements.length >= limit) {
        break
      }

      from = index + 1
    }
  }

  return elements
}

/**
 * Objects from JSON texts, each with the row number the worker gives it — its
 * position among the texts. Anything else is left out of the preview: the
 * worker records it as `invalid_row` or `invalid_json`, and still counts it.
 */
function objectsOf(texts: string[]): {
  numbers: number[]
  objects: Record<string, unknown>[]
} {
  const numbers: number[] = []
  const objects: Record<string, unknown>[] = []

  for (const [index, entry] of texts.entries()) {
    try {
      const value: unknown = JSON.parse(entry)

      if (isObject(value)) {
        numbers.push(index + 1)
        objects.push(value)
      }
    } catch {
      // Not JSON: the worker's `invalid_json`.
    }
  }

  return {
    numbers,
    objects,
  }
}

/** Rows keyed by header, from objects: headers in the order they first appear. */
function fromObjects(
  objects: Record<string, unknown>[],
): Pick<DataTransferPreview, 'headers' | 'rows'> {
  const headers: string[] = []

  for (const object of objects) {
    for (const key of Object.keys(object)) {
      if (!headers.includes(key)) {
        headers.push(key)
      }
    }
  }

  return {
    headers,
    rows: objects.map((object) =>
      headers.reduce<Record<string, string>>((row, header) => {
        row[header] = cellText(object[header])

        return row
      }, {}),
    ),
  }
}

/**
 * The preview of a file's head. `complete` says the bytes are the whole file;
 * otherwise the last row may be cut at the edge, and is dropped.
 */
export function previewFromBytes(
  bytes: Uint8Array,
  format: DataTransferFormat,
  complete: boolean,
): BrowserPreview {
  const { bomLength, encoding } = detectEncoding(bytes)

  if (format !== 'csv' && encoding === 'utf-16le') {
    // JSON and JSONL are UTF-8 by definition; the worker refuses the rest.
    throw new PreviewUnreadableError('encoding_not_supported')
  }

  const text = decodeBytes(bytes.subarray(bomLength), encoding)
  let headers: string[]
  let rows: Record<string, string>[]
  let numbers: number[]
  let delimiter: string | undefined

  if (format === 'csv') {
    delimiter = detectDelimiter(text)

    const [head = [], ...body] = parseCsv(text, delimiter)
    const kept = (complete ? body : body.slice(0, -1)).slice(0, PREVIEW_ROWS)
    // Headers as written, never trimmed: the mapping names a header, and the
    // worker matches it exactly. An empty one — a trailing delimiter — names
    // no column, as in the worker; one named twice fails the file there.
    const named = head.filter((header) => header.trim() !== '')
    const repeated = named.find(
      (header, index) => named.indexOf(header) !== index,
    )

    if (repeated !== undefined) {
      throw new PreviewUnreadableError('duplicate_header', repeated)
    }

    headers = named
    numbers = kept.map((_, index) => index + 1)
    rows = kept.map((entries) =>
      headers.reduce<Record<string, string>>((row, header) => {
        row[header] = entries[head.indexOf(header)] ?? ''

        return row
      }, {}),
    )
  } else {
    const texts =
      format === 'json'
        ? jsonElements(text, PREVIEW_ROWS)
        : (complete ? text.split('\n') : text.split('\n').slice(0, -1))
            .map((line) => line.trim())
            .filter((line) => line !== '')
            .slice(0, PREVIEW_ROWS)
    const { numbers: kept, objects } = objectsOf(texts)
    const read = fromObjects(objects)

    headers = read.headers
    rows = read.rows
    numbers = kept
  }

  // A CSV header with no whole row under it in the head still maps: the
  // first row is longer than 64 KB, and the worker reads it all the same.
  const mappable =
    headers.length > 0 && (rows.length > 0 || (format === 'csv' && !complete))

  if (!mappable) {
    throw new PreviewUnreadableError('no_rows')
  }

  return {
    ...(delimiter === undefined
      ? {}
      : {
          delimiter,
        }),
    encoding,
    headers,
    row_numbers: numbers,
    rows,
  }
}

/** Reads the head of the file — `File.slice`, never the whole of it — and previews it. */
export async function readPreview(
  file: Blob,
  format: DataTransferFormat,
): Promise<BrowserPreview> {
  const head = new Uint8Array(await file.slice(0, PREVIEW_BYTES).arrayBuffer())

  return previewFromBytes(head, format, file.size <= PREVIEW_BYTES)
}

const loose = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Guesses which header feeds which column, by label first and key second,
 * ignoring case, accents and punctuation. It is a guess and the reader can
 * overrule every line of it — which is why guessing is worth doing at all.
 */
export function guessMapping<T>(
  columns: DataTransferColumn<T>[],
  headers: string[],
): Record<string, string | null> {
  const taken = new Set<string>()

  return columns.reduce<Record<string, string | null>>((mapping, column) => {
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

/**
 * Applies the mapping, so every preview row is keyed by column rather than by
 * header. A column nothing feeds is left out, not set to `''`: the worker
 * never reads it, and a schema shown `''` would warn about an optional field
 * the worker leaves alone.
 */
export function applyMapping(
  rows: DataTransferImportRow[],
  mapping: Record<string, string | null>,
): DataTransferImportRow[] {
  return rows.map((row) =>
    Object.entries(mapping).reduce<DataTransferImportRow>(
      (mapped, [key, header]) => {
        if (header !== null) {
          mapped[key] = row[header] ?? ''
        }

        return mapped
      },
      {},
    ),
  )
}

/** The empty CSV with the right headers, and one row of examples if there are any. */
export function templateCsv<T>(columns: DataTransferColumn<T>[]): string {
  const headers = columns.map((column) => column.label).join(',')
  const examples = columns.map((column) => column.example ?? '').join(',')

  return columns.some((column) => column.example)
    ? `${headers}\n${examples}`
    : headers
}
