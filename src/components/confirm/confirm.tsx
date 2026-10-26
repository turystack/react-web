import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { FormEvent, MouseEvent } from 'react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { ComposedButton } from '@/components/button/button.composed'
import { useLabels } from '@/components/labels-provider'
import { usePortalContainer } from '@/components/portal-provider'

import { useConfirmChallenge } from './confirm.challenge'
import type { ConfirmProps } from './confirm.types'

const confirm = tv({
  slots: {
    backdrop: [
      'confirm-backdrop fixed inset-0 isolate z-50 bg-overlay backdrop-blur-overlay',
      'data-open:fade-in-0 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:animate-out',
    ],
    content: 'confirm-content text-sm',
    challenge: 'confirm-challenge flex flex-col gap-2',
    description: 'confirm-description text-muted-foreground text-sm',
    error: 'confirm-error text-destructive text-sm',
    footer:
      'confirm-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
    header: 'confirm-header flex flex-col gap-1.5',
    popup: [
      'confirm-popup fixed top-1/2 left-1/2 z-50 grid w-full max-w-sm',
      '-translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-5',
      'text-popover-foreground shadow-xl outline-none ring-1 ring-foreground/10',
      'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
      'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
    ],
    title: 'confirm-title font-heading font-medium text-base',
  },
})

const {
  backdrop,
  challenge,
  content: contentSlot,
  description,
  error,
  footer,
  header,
  popup,
  title,
} = confirm()

function causeMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback
}

function Confirm(props: ConfirmProps) {
  const {
    open,
    title: titleText,
    description: descriptionText,
    content,
    confirmText,
    cancelText,
    confirmProps,
    cancelProps,
    onCancel,
    onClose,
  } = props

  const labels = useLabels()
  const portalContainer = usePortalContainer()

  const mode = props.mode ?? 'simple'
  const [failure, setFailure] = useState<string>()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const challengeState = useConfirmChallenge(
    {
      acknowledgement:
        props.mode === 'acknowledge' ? props.acknowledgement : undefined,
      challengeLabel:
        props.mode === 'typed' ||
        props.mode === 'password' ||
        props.mode === 'otp'
          ? props.challengeLabel
          : undefined,
      challengePlaceholder:
        props.mode === 'typed' ||
        props.mode === 'password' ||
        props.mode === 'otp'
          ? props.challengePlaceholder
          : undefined,
      confirmationValue:
        props.mode === 'typed' ? props.confirmationValue : undefined,
      mode,
      otpPattern: props.mode === 'otp' ? props.otpPattern : undefined,
    },
    open,
  )

  const { blockedReason, collected, hintId } = challengeState

  function runConfirm() {
    if (
      props.mode === 'typed' ||
      props.mode === 'password' ||
      props.mode === 'otp'
    ) {
      return props.onConfirm?.(collected)
    }

    return props.onConfirm?.()
  }

  const handleConfirm = async () => {
    if (blockedReason) {
      return
    }

    setFailure(undefined)
    setConfirmLoading(true)
    try {
      await Promise.resolve(runConfirm())
    } catch (cause) {
      setFailure(causeMessage(cause, labels.confirm.error))

      return
    } finally {
      setConfirmLoading(false)
    }
    onClose?.()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await handleConfirm()
  }

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      await Promise.resolve(onCancel?.())
    } finally {
      setCancelLoading(false)
    }
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  function handleBackdropClick() {
    onClose?.()
  }

  /**
   * Base UI forces `disablePointerDismissal` on an alert dialog and this
   * component renders no trigger, so the primitive can only ever report a
   * close. Guarding on the reported state would be a branch nothing can take.
   */
  function handleOpenChange() {
    onClose?.()
  }

  /**
   * A blocked action stays in the tab order, disabled through aria-disabled
   * rather than the native attribute (Base UI's `focusableWhenDisabled`), and
   * describes itself with the reason — so the keyboard lands on the button
   * itself and hears why it will not act, instead of on a wrapper around a
   * dead one. Only while blocked: a caller's own `disabled` and the loading
   * state still take the button out of the tab order.
   */
  const blockedProps = blockedReason
    ? {
        'aria-describedby': hintId,
        focusableWhenDisabled: true,
      }
    : {}

  return (
    <AlertDialog.Root onOpenChange={handleOpenChange} open={open}>
      <AlertDialog.Portal container={portalContainer}>
        <AlertDialog.Backdrop
          className={backdrop()}
          data-testid="confirm-backdrop"
          onClick={handleBackdropClick}
        />
        <AlertDialog.Popup
          className={popup()}
          data-testid="confirm-popup"
          onClick={handleOverlayClick}
        >
          <div className={header()} data-testid="confirm-header">
            <AlertDialog.Title className={title()} data-testid="confirm-title">
              {titleText}
            </AlertDialog.Title>
            <AlertDialog.Description
              className={description()}
              data-testid="confirm-description"
            >
              {descriptionText}
            </AlertDialog.Description>
          </div>
          {content && (
            <div className={contentSlot()} data-testid="confirm-content">
              {content}
            </div>
          )}
          {challengeState.present && (
            <form
              className={challenge()}
              data-testid="confirm-challenge"
              onSubmit={handleSubmit}
            >
              {challengeState.node}
            </form>
          )}
          {failure && (
            <p className={error()} data-testid="confirm-error" role="alert">
              {failure}
            </p>
          )}
          <div className={footer()} data-testid="confirm-footer">
            <AlertDialog.Close
              data-testid="confirm-cancel"
              render={
                <Button
                  variant="outline"
                  {...cancelProps}
                  loading={cancelLoading}
                  onClick={handleCancel}
                />
              }
            >
              {cancelText ?? labels.confirm.cancel}
            </AlertDialog.Close>
            <ComposedButton
              data-testid="confirm-action"
              {...confirmProps}
              {...blockedProps}
              disabled={confirmProps?.disabled || Boolean(blockedReason)}
              loading={confirmLoading}
              onClick={handleConfirm}
            >
              {confirmText ?? labels.confirm.confirm}
            </ComposedButton>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export { Confirm }
