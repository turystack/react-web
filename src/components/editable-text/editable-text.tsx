import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { CopyButton } from '@/components/copy-button'
import { FormatterText } from '@/components/formatter-text/formatter-text'
import { Input } from '@/components/input'
import { inputShared } from '@/components/input/input.shared'
import { useLabels } from '@/components/labels-provider'
import { Loader } from '@/components/loader'
import { Textarea } from '@/components/textarea'
import { typographyStyles } from '@/components/typography'
import { Check, Pencil, X } from '@/internal/icons'
import { axes } from '@/support/utils'

import type {
  EditableTextFlowProps,
  EditableTextProps,
  EditableTextStableProps,
} from './editable-text.types'
import { type EditableTextMachine, useEditableText } from './use-editable-text'

export const styles = tv({
  slots: {
    // The copy control sits beside the display button, never inside it: a
    // button in a button is invalid, and a click on copy would bubble into the
    // one that opens the editor.
    copy: 'editable-text-copy inline-flex shrink-0 items-center',
    box: 'editable-text-box flex w-full cursor-text items-center text-left outline-none hover:border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    editor: 'editable-text-editor flex items-start gap-1',
    row: 'editable-text-row inline-flex max-w-full items-center gap-1',
    error: 'editable-text-error text-destructive text-xs',
    overlay:
      'editable-text-overlay absolute inset-x-0 top-0 z-20 flex items-start gap-1',
    root: 'editable-text inline-flex max-w-full flex-col gap-1',
    section:
      'editable-text-section absolute top-1/2 right-0 flex w-9 -translate-y-1/2 items-center justify-center',
    trigger:
      'editable-text-trigger inline-flex max-w-full items-center gap-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  },
  variants: {
    disabled: {
      true: {
        box: 'cursor-not-allowed opacity-50',
        trigger: 'cursor-not-allowed opacity-50',
      },
    },
    hasSection: {
      true: {
        box: 'pr-9',
      },
    },
    /**
     * In stable layout the copy control is drawn over the right edge of the
     * box, like the pencil: left of the pencil when there is one, so the box
     * reserves room for both.
     */
    stableCopy: {
      alone: {
        box: 'pr-9',
        copy: 'absolute top-1/2 right-0 w-9 -translate-y-1/2 justify-center',
      },
      beforePencil: {
        box: 'pr-18',
        copy: 'absolute top-1/2 right-9 w-9 -translate-y-1/2 justify-center',
      },
    },
    hidden: {
      true: {
        box: 'invisible',
      },
    },
    stable: {
      true: {
        error: 'absolute top-full left-0 z-10 mt-1',
        root: 'relative flex w-full max-w-none gap-0',
      },
    },
  },
})

function Actions<T>({
  machine,
  size,
}: {
  machine: EditableTextMachine<T>
  size: 'icon-xs' | 'icon-sm'
}) {
  const labels = useLabels()

  return (
    <>
      <Button
        ariaLabel={labels.editableText.save}
        data-testid="editable-text-save"
        loading={machine.saving}
        onClick={machine.commit}
        size={size}
        variant="ghost"
      >
        <Check />
      </Button>
      <Button
        ariaLabel={labels.common.cancel}
        data-testid="editable-text-cancel"
        disabled={machine.saving}
        onClick={machine.cancel}
        size={size}
        variant="ghost"
      >
        <X />
      </Button>
    </>
  )
}

function EditableTextFlow<T>(props: EditableTextFlowProps<T>) {
  const {
    align,
    ariaLabel,
    children,
    component,
    copyable,
    destructive,
    disabled,
    loading,
    multiline,
    muted,
    renderValue,
    size,
    tooltip,
    trigger = 'click',
    truncate,
    weight,
  } = props
  const labels = useLabels()
  const machine = useEditableText(props, 'md')
  const {
    copy: copySlot,
    editor,
    error: errorSlot,
    root,
    row,
    trigger: triggerSlot,
  } = styles({
    disabled,
  })
  // The value's type scale: Typography's own default when left out.
  const published = axes(typographyStyles, {
    size,
  })
  const errorNode = machine.error ? (
    <span
      className={errorSlot()}
      data-testid="editable-text-error"
      role="alert"
    >
      {machine.error}
    </span>
  ) : null

  if (machine.open) {
    return (
      <div className={root()} {...published} data-testid="editable-text">
        <div
          className={editor()}
          onBlur={machine.handleBlur}
          onKeyDown={machine.handleKeyDown}
        >
          {children ? (
            children(machine.editorState)
          ) : multiline ? (
            <Textarea
              ariaLabel={ariaLabel}
              autoFocus
              data-testid="editable-text-input"
              disabled={machine.saving}
              onChange={(next) => machine.setDraft(next as T | null)}
              value={
                machine.editorState.value === null
                  ? null
                  : String(machine.editorState.value)
              }
            />
          ) : (
            <Input
              ariaLabel={ariaLabel}
              autoFocus
              data-testid="editable-text-input"
              disabled={machine.saving}
              onChange={(next) => machine.setDraft(next as T | null)}
              value={
                machine.editorState.value === null
                  ? null
                  : String(machine.editorState.value)
              }
            />
          )}
          {machine.showActions ? (
            <Actions machine={machine} size="icon-sm" />
          ) : null}
          {machine.saving && !machine.showActions ? <Loader size="sm" /> : null}
        </div>
        {errorNode}
      </div>
    )
  }

  // The pencil variant's value is plain text, so its copy control may live
  // inside it; the other two make the value a button, and copy moves out.
  const displayIsButton = trigger !== 'icon'
  const display = (
    <FormatterText
      align={align}
      component={component}
      copyable={copyable && !displayIsButton}
      destructive={destructive}
      muted={muted || machine.empty}
      rightSection={loading ? <Loader size="sm" /> : undefined}
      size={size}
      testId="editable-text-value"
      text={machine.text}
      tooltip={tooltip}
      truncate={truncate}
      weight={weight}
    >
      {!machine.empty && renderValue ? renderValue(machine.current) : undefined}
    </FormatterText>
  )

  /**
   * The pencil variant leaves the value as plain text: it is the button beside
   * it that is the control, and announcing both would name the same action
   * twice.
   */
  if (trigger === 'icon') {
    return (
      <span className={root()} {...published} data-testid="editable-text">
        <span className={triggerSlot()} data-testid="editable-text-display">
          {display}
        </span>
        <Button
          ariaLabel={ariaLabel ?? labels.editableText.edit}
          data-testid="editable-text-edit"
          disabled={disabled || loading}
          onClick={machine.openEditor}
          size="icon-xs"
          variant="ghost"
        >
          <Pencil />
        </Button>
        {errorNode}
      </span>
    )
  }

  const displayButton = (
    <button
      aria-label={ariaLabel}
      className={triggerSlot()}
      data-testid="editable-text-display"
      disabled={disabled}
      onClick={trigger === 'click' ? machine.openEditor : undefined}
      onDoubleClick={trigger === 'doubleClick' ? machine.openEditor : undefined}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return
        }

        event.preventDefault()
        machine.openEditor()
      }}
      ref={machine.triggerRef}
      type="button"
    >
      {display}
    </button>
  )

  return (
    <span className={root()} {...published} data-testid="editable-text">
      {copyable ? (
        <span className={row()}>
          {displayButton}
          <span className={copySlot()}>
            <CopyButton
              data-testid="editable-text-copy"
              size="xs"
              value={machine.text}
            />
          </span>
        </span>
      ) : (
        displayButton
      )}
      {errorNode}
    </span>
  )
}

/**
 * The layout that never moves.
 *
 * The value rests inside the field's own box — same height, padding, border
 * and type scale, taken from `inputShared` rather than copied — so opening the
 * editor changes colours and nothing else. Anything whose height this component
 * cannot dictate, a growing Textarea or a control the caller rendered, is drawn
 * over that box instead of inside it, which is why a Select can be 300px tall
 * without the page below it moving a pixel.
 */
function EditableTextStable<T>(props: EditableTextStableProps<T>) {
  const {
    ariaLabel,
    children,
    copyable,
    destructive,
    disabled,
    loading,
    multiline,
    muted,
    renderValue,
    size = 'md',
    tooltip,
    trigger = 'click',
    truncate,
  } = props
  const labels = useLabels()
  const machine = useEditableText(props, size)
  const { field } = inputShared({
    size,
    variant: 'ghost',
  })
  const {
    box,
    copy: copySlot,
    error: errorSlot,
    overlay,
    root,
    section,
  } = styles({
    disabled,
    hasSection: machine.hasEditorSection,
    hidden: machine.open,
    stable: true,
    stableCopy: copyable
      ? trigger === 'icon'
        ? 'beforePencil'
        : 'alone'
      : undefined,
  })
  const fitsTheBox = !children && !multiline
  const editorSection = machine.showActions ? (
    <Actions machine={machine} size="icon-xs" />
  ) : machine.saving ? (
    <Loader size="sm" />
  ) : (
    <span />
  )

  return (
    <div className={root()} data-size={size} data-testid="editable-text">
      <button
        aria-label={ariaLabel}
        className={field({
          className: box(),
        })}
        data-testid="editable-text-display"
        disabled={disabled}
        onClick={trigger === 'click' ? machine.openEditor : undefined}
        onDoubleClick={
          trigger === 'doubleClick' ? machine.openEditor : undefined
        }
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return
          }

          event.preventDefault()
          machine.openEditor()
        }}
        ref={machine.triggerRef}
        type="button"
      >
        <FormatterText
          destructive={destructive}
          muted={muted || machine.empty}
          rightSection={loading ? <Loader size="sm" /> : undefined}
          testId="editable-text-value"
          text={machine.text}
          tooltip={tooltip}
          truncate={truncate}
        >
          {!machine.empty && renderValue
            ? renderValue(machine.current)
            : undefined}
        </FormatterText>
      </button>

      {!machine.open && copyable ? (
        <span className={copySlot()}>
          <CopyButton
            data-testid="editable-text-copy"
            size="xs"
            value={machine.text}
          />
        </span>
      ) : null}

      {!machine.open && trigger === 'icon' ? (
        <span className={section()}>
          <Button
            ariaLabel={ariaLabel ?? labels.editableText.edit}
            data-testid="editable-text-edit"
            disabled={disabled || loading}
            onClick={machine.openEditor}
            size="icon-xs"
            variant="ghost"
          >
            <Pencil />
          </Button>
        </span>
      ) : null}

      {machine.open ? (
        <div
          className={overlay()}
          data-testid="editable-text-overlay"
          onBlur={machine.handleBlur}
          onKeyDown={machine.handleKeyDown}
        >
          {fitsTheBox ? (
            <Input
              ariaLabel={ariaLabel}
              autoFocus
              data-testid="editable-text-input"
              disabled={machine.saving}
              onChange={(next) => machine.setDraft(next as T | null)}
              rightSection={
                machine.hasEditorSection ? editorSection : undefined
              }
              size={size}
              value={
                machine.editorState.value === null
                  ? null
                  : String(machine.editorState.value)
              }
            />
          ) : (
            <>
              {children ? (
                children(machine.editorState)
              ) : (
                <Textarea
                  ariaLabel={ariaLabel}
                  autoFocus
                  data-testid="editable-text-input"
                  disabled={machine.saving}
                  onChange={(next) => machine.setDraft(next as T | null)}
                  size={size}
                  value={
                    machine.editorState.value === null
                      ? null
                      : String(machine.editorState.value)
                  }
                />
              )}
              {machine.showActions ? (
                <Actions machine={machine} size="icon-sm" />
              ) : null}
              {machine.saving && !machine.showActions ? (
                <Loader size="sm" />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {machine.error ? (
        <span
          className={errorSlot()}
          data-testid="editable-text-error"
          role="alert"
        >
          {machine.error}
        </span>
      ) : null}
    </div>
  )
}

export function EditableText<T = string>(props: EditableTextProps<T>) {
  if (props.layout === 'stable') {
    return <EditableTextStable<T> {...props} />
  }

  return <EditableTextFlow<T> {...props} />
}
