/**
 * Uploader
 *
 * File upload component with drag-and-drop, progress tracking, and file list.
 * Handles the upload lifecycle via a handler function that returns signed URLs.
 *
 * Behavior:
 * - Drag-and-drop area with dashed border (highlights on drag-over)
 * - Click to open native file picker
 * - accept: MIME type filter (e.g. "image/*,.pdf")
 * - maxFiles: limits number of files
 * - maxFileSize: limits individual file size in bytes
 * - onReject reports every file turned away by maxFiles or maxFileSize
 * - File list shows: filename, progress bar, remove button, status icon
 * - States per file: pending (waiting for its signed destination) → uploading
 *   (with progress %) → done / error
 * - handler(fileName) returns a signed POST payload, then uploads FormData
 * - onUpload fires per file with the handler response and the file's position;
 *   a file removed while in flight reports nothing
 *
 * Implementation:
 * - HTML5 File API + drag-and-drop events (onDragOver, onDrop)
 * - XMLHttpRequest + FormData for upload progress via xhr.upload.onprogress
 * - File state tracked in array: { file, id, progress, status, response }
 * - Rows are matched by id, never by position, so a removal mid-upload cannot
 *   write one file's result onto its neighbour
 * - <Uploader accept="image/*" maxFiles={5} maxFileSize={5_000_000}
 *     handler={getSignedUrl} onUpload={handleUploaded} />
 *
 * Dependencies: none (uses native File API + XMLHttpRequest)
 */

export type Upload = {
  url: string
  fields: Record<string, string>
}

export type UploaderHandlerResponse = {
  key: string
  cdnUrl: string
  upload: Upload
  expiresIn: number
}

export type UploaderRejectionReason = 'maxFiles' | 'maxFileSize'

export type UploaderRejection = {
  file: File // the file that was turned away
  reason: UploaderRejectionReason // which limit turned it away
}

export type UploaderProps = {
  accept?: string // accepted MIME types (e.g. 'image/*,.pdf')
  maxFiles?: number // maximum number of files
  maxFileSize?: number // max file size in bytes
  disabled?: boolean // prevents interaction
  handler: (fileName: string) => Promise<UploaderHandlerResponse> // upload handler (required)
  onReject?: (rejections: UploaderRejection[]) => void // fires with every file a limit turned away
  onUpload?: (response: UploaderHandlerResponse, index: number) => void // fires per file upload
}
