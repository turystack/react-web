import { useCallback, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { AlertCircle, CheckCircle, Loader2, Upload, X } from '@/internal/icons'

import type { UploaderHandlerResponse, UploaderProps } from './uploader.types'

type FileEntry = {
  file: File
  progress: number
  response?: UploaderHandlerResponse
  status: 'done' | 'error' | 'pending' | 'uploading'
}

const uploader = tv({
  slots: {
    dropzone: [
      'uploader-dropzone flex cursor-pointer flex-col items-center justify-center gap-2',
      'rounded-lg border-2 border-border border-dashed p-8 text-muted-foreground',
      'transition-colors hover:border-primary/50 hover:bg-muted/50',
    ],
    fileItem:
      'uploader-file-item flex items-center gap-3 rounded-lg border border-border p-3',
    fileList: 'uploader-file-list flex flex-col gap-2',
    progress:
      'uploader-progress relative h-2 w-full overflow-hidden rounded-full bg-muted',
    removeButton: 'uploader-remove-button shrink-0',
    root: 'uploader-root flex w-full flex-col gap-3',
  },
  variants: {
    disabled: {
      true: {
        dropzone: 'pointer-events-none cursor-not-allowed opacity-50',
      },
    },
    dragOver: {
      true: {
        dropzone: 'border-primary bg-muted/50',
      },
    },
  },
})

function Uploader({
  accept,
  disabled,
  handler,
  maxFileSize,
  maxFiles,
  onUpload,
}: UploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { dropzone, fileItem, fileList, progress, removeButton, root } =
    uploader({
      disabled,
      dragOver,
    })

  const uploadFile = useCallback(
    async (entry: FileEntry, index: number) => {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'uploading' as const,
              }
            : f,
        ),
      )

      try {
        const response = await handler(entry.file.name)

        const formData = new FormData()

        for (const [key, value] of Object.entries(response.upload.fields)) {
          formData.append(key, value)
        }
        formData.append('file', entry.file)

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100)
              setFiles((prev) =>
                prev.map((f, i) =>
                  i === index
                    ? {
                        ...f,
                        progress: percent,
                      }
                    : f,
                ),
              )
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

        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  progress: 100,
                  response,
                  status: 'done' as const,
                }
              : f,
          ),
        )

        if (onUpload) {
          ;(onUpload as (resp: UploaderHandlerResponse, idx: number) => void)(
            response,
            index,
          )
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  status: 'error' as const,
                }
              : f,
          ),
        )
      }
    },
    [handler, onUpload],
  )

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (disabled) {
        return
      }

      let filesToAdd = newFiles

      if (maxFileSize) {
        filesToAdd = filesToAdd.filter((f) => f.size <= maxFileSize)
      }

      if (maxFiles) {
        const remaining = maxFiles - files.length
        filesToAdd = filesToAdd.slice(0, Math.max(0, remaining))
      }

      if (filesToAdd.length === 0) {
        return
      }

      const entries: FileEntry[] = filesToAdd.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }))

      setFiles((prev) => {
        const updated = [...prev, ...entries]
        return updated
      })

      const startIndex = files.length
      for (let i = 0; i < entries.length; i++) {
        uploadFile(entries[i], startIndex + i)
      }
    },
    [disabled, files.length, maxFileSize, maxFiles, uploadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) {
        return
      }
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    [addFiles, disabled],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? [])
      addFiles(selected)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [addFiles],
  )

  const removeFile = useCallback(
    (index: number) => {
      if (disabled) {
        return
      }
      setFiles((prev) => prev.filter((_, i) => i !== index))
    },
    [disabled],
  )

  const statusIcon = (status: FileEntry['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            data-testid="uploader-icon-uploading"
          />
        )
      case 'done':
        return (
          <CheckCircle
            className="size-4 text-emerald-500"
            data-testid="uploader-icon-done"
          />
        )
      case 'error':
        return (
          <AlertCircle
            className="size-4 text-destructive"
            data-testid="uploader-icon-error"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={root()} data-testid="uploader-root">
      <div
        className={dropzone()}
        data-testid="uploader-dropzone"
        onClick={handleClick}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="size-8 text-muted-foreground" />
        <span className="text-sm">
          Drag & drop files here, or click to select
        </span>
        {accept && (
          <span className="text-muted-foreground text-xs">
            Accepted: {accept}
          </span>
        )}
        <input
          accept={accept}
          data-testid="uploader-input"
          hidden
          multiple={!maxFiles || maxFiles > 1}
          onChange={handleInputChange}
          ref={inputRef}
          type="file"
        />
      </div>

      {files.length > 0 && (
        <div className={fileList()} data-testid="uploader-file-list">
          {files.map((entry, index) => (
            <div
              className={fileItem()}
              data-testid="uploader-file-item"
              key={`${entry.file.name}-${index}`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="truncate text-sm"
                    data-testid="uploader-file-name"
                  >
                    {entry.file.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {statusIcon(entry.status)}
                    {entry.status === 'uploading' && (
                      <span
                        className="text-muted-foreground text-xs"
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
                      className="h-full bg-primary transition-all duration-300"
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
                    removeFile(index)
                  }}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-4" />
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
