/**
 * FilePicker
 *
 * The part of picking a file that has nothing to do with what happens next.
 *
 * Behavior:
 * - Click or drop. The same rules apply either way
 * - `maxFileSize` and `maxFiles` refuse before the owner ever sees the file,
 *   and everything refused is reported together through `onReject` — one
 *   rejection per file, with the reason, so a caller can say which and why
 * - It holds nothing. The owner says how many files it already has through
 *   `count`, so the `maxFiles` rule can be applied here without this knowing
 *   what a file list is
 * - `onSelect` never fires with an empty list
 *
 * Implementation:
 * - It was inside Uploader, where it could only ever end in an upload. Import
 *   needs the same drop zone and the same limits, and needs the File itself —
 *   it reads the rows in the browser and never touches a bucket. Extracting
 *   the picker is what let both exist without one of them lying about its
 *   name: this one only picks, `Uploader` uploads, `Import` imports
 * - <FilePicker accept=".csv" maxFiles={1} onSelect={take} />
 *
 * Dependencies: LabelsProvider
 */

export type FileRejectionReason = 'maxFiles' | 'maxFileSize'

export type FileRejection = {
  file: File
  reason: FileRejectionReason
}

export type FilePickerProps = {
  accept?: string // the native picker's filter, e.g. `.csv`
  count?: number // files the owner already holds, for the maxFiles rule
  disabled?: boolean
  maxFileSize?: number // in bytes
  maxFiles?: number
  onReject?: (rejections: FileRejection[]) => void // everything refused, at once
  onSelect: (files: File[]) => void // never called with an empty list
  testId?: string
}
