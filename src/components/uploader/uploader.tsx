import { useCallback, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { FilePicker } from '@/components/file-picker'
import { AlertCircle, CheckCircle, Clock, Loader2, X } from '@/internal/icons'

import type { UploaderHandlerResponse, UploaderProps } from './uploader.types'

type FileEntry = {
  file: File
  id: string
  progress: number
  response?: UploaderHandlerResponse
  status: 'done' | 'error' | 'pending' | 'uploading'
}

const uploader = tv({
  slots: {
    fileItem:
      'uploader-file-item flex items-center gap-3 rounded-lg border border-border p-3',
    fileList: 'uploader-file-list flex flex-col gap-2',
    progress:
      'uploader-progress relative h-2 w-full overflow-hidden rounded-full bg-muted',
    removeButton: 'uploader-remove-button shrink-0',
    root: 'uploader-root flex w-full flex-col gap-3',
  },
})

function Uploader({
  accept,
  disabled,
  handler,
  maxFileSize,
  maxFiles,
  onReject,
  onUpload,
}: UploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const nextIdRef = useRef(0)

  // Every write goes through this mirror so an upload that finishes late still
  // finds its own row by identity, whatever the list looks like by then.
  const filesRef = useRef<FileEntry[]>([])
  const updateFiles = useCallback(
    (updater: (prev: FileEntry[]) => FileEntry[]) => {
      filesRef.current = updater(filesRef.current)
      setFiles(filesRef.current)
    },
    [],
  )

  const { fileItem, fileList, progress, removeButton, root } = uploader()

  const uploadFile = useCallback(
    async (entry: FileEntry) => {
      const patch = (changes: Partial<FileEntry>) => {
        updateFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  ...changes,
                }
              : f,
          ),
        )
      }

      try {
        const response = await handler(entry.file.name)

        const formData = new FormData()

        for (const [key, value] of Object.entries(response.upload.fields)) {
          formData.append(key, value)
        }
        formData.append('file', entry.file)

        patch({
          status: 'uploading',
        })

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100)
              patch({
                progress: percent,
              })
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }

          xhr.onerror = () => reject(new Error('Upload failed'))

          xhr.open('POST', response.upload.url)
          xhr.send(formData)
        })

        patch({
          progress: 100,
          response,
          status: 'done',
        })

        const position = filesRef.current.findIndex((f) => f.id === entry.id)

        if (onUpload && position !== -1) {
          onUpload(response, position)
        }
      } catch {
        patch({
          status: 'error',
        })
      }
    },
    [handler, onUpload, updateFiles],
  )

  const addFiles = useCallback(
    (accepted: File[]) => {
      const entries: FileEntry[] = accepted.map((file) => {
        nextIdRef.current += 1

        return {
          file,
          id: `uploader-file-${nextIdRef.current}`,
          progress: 0,
          status: 'pending' as const,
        }
      })

      updateFiles((prev) => [...prev, ...entries])

      for (const entry of entries) {
        uploadFile(entry)
      }
    },
    [updateFiles, uploadFile],
  )

  const removeFile = useCallback(
    (id: string) => {
      if (disabled) {
        return
      }
      updateFiles((prev) => prev.filter((f) => f.id !== id))
    },
    [disabled, updateFiles],
  )

  const statusIcon = (status: FileEntry['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Clock
            className="uploader-icon-pending size-4 text-muted-foreground"
            data-testid="uploader-icon-pending"
          />
        )
      case 'uploading':
        return (
          <Loader2
            className="uploader-icon-uploading size-4 animate-spin text-muted-foreground"
            data-testid="uploader-icon-uploading"
          />
        )
      case 'done':
        return (
          <CheckCircle
            className="uploader-icon-done size-4 text-emerald-500"
            data-testid="uploader-icon-done"
          />
        )
      case 'error':
        return (
          <AlertCircle
            className="uploader-icon-error size-4 text-destructive"
            data-testid="uploader-icon-error"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={root()} data-testid="uploader-root">
      <FilePicker
        accept={accept}
        count={files.length}
        disabled={disabled}
        maxFileSize={maxFileSize}
        maxFiles={maxFiles}
        onReject={onReject}
        onSelect={addFiles}
        testId="uploader"
      />

      {files.length > 0 && (
        <div className={fileList()} data-testid="uploader-file-list">
          {files.map((entry) => (
            <div
              className={fileItem()}
              data-status={entry.status}
              data-testid="uploader-file-item"
              key={entry.id}
            >
              <div className="uploader-file-body flex min-w-0 flex-1 flex-col gap-1">
                <div className="uploader-file-header flex items-center justify-between gap-2">
                  <span
                    className="uploader-file-name truncate text-sm"
                    data-testid="uploader-file-name"
                  >
                    {entry.file.name}
                  </span>
                  <div className="uploader-file-status flex items-center gap-2">
                    {statusIcon(entry.status)}
                    {entry.status === 'uploading' && (
                      <span
                        className="uploader-file-percent text-muted-foreground text-xs"
                        data-testid="uploader-file-percent"
                      >
                        {entry.progress}%
                      </span>
                    )}
                  </div>
                </div>
                {(entry.status === 'uploading' || entry.status === 'done') && (
                  <div className={progress()} data-testid="uploader-progress">
                    <div
                      className="uploader-progress-indicator h-full bg-primary transition-all duration-300"
                      data-testid="uploader-progress-indicator"
                      style={{
                        width: `${entry.progress}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                className={removeButton()}
                data-testid="uploader-remove-button"
              >
                <Button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(entry.id)
                  }}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="uploader-remove-icon size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { Uploader }
