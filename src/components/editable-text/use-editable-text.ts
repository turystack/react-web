import { type KeyboardEvent, useRef, useState } from 'react'

import type { InputSize } from '@/components/input/input.types'
import { useLabels } from '@/components/labels-provider'

import type {
  EditableTextEditorState,
  EditableTextProps,
  EditableTextSubmitOn,
} from './editable-text.types'

const DEFAULT_SUBMIT_ON: EditableTextSubmitOn[] = ['enter', 'blur']

export type EditableTextMachine<T> = {
  cancel: () => void
  commit: () => void
  current: T | null
  empty: boolean
  error: React.ReactNode
  editorState: EditableTextEditorState<T | null>
  handleBlur: (event: React.FocusEvent<HTMLElement>) => void
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  hasEditorSection: boolean
  open: boolean
  openEditor: () => void
  saving: boolean
  setDraft: (value: T | null) => void
  showActions: boolean
  text: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

/**
 * The state machine both layouts run on.
 *
 * It is a hook rather than a shared parent because the two layouts render
 * nothing in common — one swaps text for a field, the other keeps a reserved
 * box and draws over it — while agreeing on every rule that matters: what
 * commits, what cancels, what a rejected save leaves behind.
 */
export function useEditableText<T>(
  props: EditableTextProps<T>,
  fieldSize: InputSize,
): EditableTextMachine<T> {
  const labels = useLabels()
  const {
    actions,
    defaultEditing,
    defaultValue,
    disabled,
    editing,
    loading,
    multiline,
    onChange,
    onEditingChange,
    error: externalError,
    onSave,
    placeholder,
    submitOn,
    value,
  } = props
  const [internalValue, setInternalValue] = useState<T | null>(
    defaultValue ?? null,
  )
  const [internalEditing, setInternalEditing] = useState(
    defaultEditing ?? false,
  )
  const [draft, setDraft] = useState<T | null>(null)
  const [refusal, setRefusal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const current = value === undefined ? internalValue : value
  const open = editing === undefined ? internalEditing : editing
  const commits = submitOn ?? DEFAULT_SUBMIT_ON
  const showActions = actions ?? commits.includes('action')
  const empty = current === null || current === undefined || current === ''
  const visibleError = externalError ?? refusal

  function setOpen(next: boolean) {
    if (editing === undefined) {
      setInternalEditing(next)
    }

    onEditingChange?.(next)
  }

  function openEditor() {
    if (disabled || loading || open) {
      return
    }

    setDraft(current)
    setRefusal(null)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function cancel() {
    setDraft(current)
    setRefusal(null)
    close()
  }

  async function commit() {
    /**
     * One way to refuse a value: throw from `onSave`. Sync or async, the
     * message is the one the reader sees and the editor stays open holding
     * what they typed. Validation rules themselves belong to the feature's
     * schema, not to a prop here.
     */
    try {
      const saved = onSave?.(draft)

      /**
       * The value only becomes the value once the save has landed. Committing
       * first reads better in the happy path and lies in the other one: a
       * rejected save would leave the new value on screen, and cancelling out
       * of the still-open editor would then keep the value the server refused.
       */
      if (saved instanceof Promise) {
        setSaving(true)
        await saved
        setSaving(false)
      }
    } catch (reason) {
      setSaving(false)
      setRefusal(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.editableText.error,
      )

      return
    }

    if (value === undefined) {
      setInternalValue(draft)
    }

    onChange?.(draft)
    setRefusal(null)
    close()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()

      return
    }

    if (event.key !== 'Enter' || !commits.includes('enter')) {
      return
    }

    if (multiline && !event.metaKey && !event.ctrlKey) {
      return
    }

    event.preventDefault()
    void commit()
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    if (
      !commits.includes('blur') ||
      saving ||
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    void commit()
  }

  return {
    cancel,
    commit: () => void commit(),
    current,
    editorState: {
      autoFocus: true,
      disabled: saving,
      error: visibleError,
      invalid: Boolean(visibleError),
      onCancel: cancel,
      onChange: (next) => setDraft(next),
      onCommit: () => void commit(),
      size: fieldSize,
      value: draft,
    },
    empty,
    error: visibleError,
    handleBlur,
    handleKeyDown,
    hasEditorSection:
      showActions || Boolean(onSave) || props.trigger === 'icon',
    open,
    openEditor,
    saving,
    setDraft,
    showActions,
    text: empty ? (placeholder ?? labels.editableText.empty) : String(current),
    triggerRef,
  }
}
