import { useCallback, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import { useLabels } from '@/components/labels-provider'
import { Upload } from '@/internal/icons'

import type { FilePickerProps, FileRejection } from './file-picker.types'

const styles = tv({
  slots: {
    accepted: 'file-picker-accepted text-muted-foreground text-xs',
    hint: 'file-picker-hint text-sm',
    icon: 'file-picker-icon size-8 text-muted-foreground',
    root: [
      'file-picker-root flex cursor-pointer flex-col items-center justify-center gap-2',
      'rounded-lg border-2 border-border border-dashed p-8 text-muted-foreground',
      'transition-colors hover:border-primary/50 hover:bg-muted/50',
    ],
  },
  variants: {
    disabled: {
      true: {
        root: 'pointer-events-none cursor-not-allowed opacity-50',
      },
    },
    dragOver: {
      true: {
        root: 'border-primary bg-muted/50',
      },
    },
  },
})

export function FilePicker({
  accept,
  count = 0,
  disabled,
  maxFileSize,
  maxFiles,
  onReject,
  onSelect,
  testId = 'file-picker',
}: FilePickerProps) {
  const labels = useLabels()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const { accepted, hint, icon, root } = styles({
    disabled,
    dragOver,
  })

  const take = useCallback(
    (incoming: File[]) => {
      if (disabled) {
        return
      }

      const rejections: FileRejection[] = []
      let allowed = incoming

      if (maxFileSize) {
        allowed = allowed.filter((file) => {
          if (file.size <= maxFileSize) {
            return true
          }

          rejections.push({
            file,
            reason: 'maxFileSize',
          })

          return false
        })
      }

      if (maxFiles) {
        const remaining = Math.max(0, maxFiles - count)

        for (const file of allowed.slice(remaining)) {
          rejections.push({
            file,
            reason: 'maxFiles',
          })
        }

        allowed = allowed.slice(0, remaining)
      }

      if (rejections.length > 0) {
        onReject?.(rejections)
      }

      if (allowed.length === 0) {
        return
      }

      onSelect(allowed)
    },
    [count, disabled, maxFileSize, maxFiles, onReject, onSelect],
  )

  return (
    <div
      className={root()}
      data-testid={`${testId}-dropzone`}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click()
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDragOver={(event) => {
        event.preventDefault()

        if (!disabled) {
          setDragOver(true)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragOver(false)
        take(Array.from(event.dataTransfer.files))
      }}
    >
      <Upload className={icon()} />
      <span className={hint()}>{labels.filePicker.hint}</span>
      {accept && (
        <span className={accepted()}>{labels.filePicker.accepted(accept)}</span>
      )}
      <input
        accept={accept}
        data-testid={`${testId}-input`}
        hidden
        multiple={!maxFiles || maxFiles > 1}
        onChange={(event) => {
          take(Array.from(event.target.files ?? []))

          if (inputRef.current) {
            inputRef.current.value = ''
          }
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}
