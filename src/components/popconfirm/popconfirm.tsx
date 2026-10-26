import type { FormEvent, PropsWithChildren } from 'react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { ComposedButton } from '@/components/button/button.composed'
import { useConfirmChallenge } from '@/components/confirm/confirm.challenge'
import { useLabels } from '@/components/labels-provider'
import { Popover } from '@/components/popover'

import type { PopconfirmProps } from './popconfirm.types'

export const styles = tv({
  slots: {
    challenge: 'popconfirm-challenge flex flex-col gap-2',
    content: 'popconfirm-content text-sm',
    description: 'popconfirm-description text-muted-foreground text-sm',
    error: 'popconfirm-error text-destructive text-xs',
    footer: 'popconfirm-footer flex justify-end gap-2 pt-1',
    root: 'popconfirm flex max-w-70 flex-col gap-2',
    title: 'popconfirm-title font-medium text-sm',
  },
})

export function Popconfirm(props: PropsWithChildren<PopconfirmProps>) {
  const {
    align,
    cancelProps,
    cancelText,
    children,
    confirmProps,
    confirmText,
    content,
    description,
    onCancel,
    onOpenChange,
    open,
    side,
    title,
  } = props

  const labels = useLabels()
  const [internalOpen, setInternalOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    challenge,
    content: contentSlot,
    description: descriptionSlot,
    error: errorSlot,
    footer,
    root,
    title: titleSlot,
  } = styles()

  const visible = open ?? internalOpen
  const mode = props.mode ?? 'simple'

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
    visible,
  )

  const { blockedReason, collected, hintId } = challengeState

  function setOpen(next: boolean) {
    if (open === undefined) {
      setInternalOpen(next)
    }

    onOpenChange?.(next)
  }

  function close() {
    setError(null)
    setOpen(false)
  }

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

  async function confirm() {
    if (blockedReason) {
      return
    }

    setError(null)
    setRunning(true)

    try {
      await Promise.resolve(runConfirm())
    } catch (reason) {
      setRunning(false)
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : labels.confirm.error,
      )

      return
    }

    setRunning(false)
    close()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await confirm()
  }

  // Blocked by the challenge, the button stays in the tab order (aria-disabled,
  // not the disabled attribute) and is described by the reason: a disabled
  // button takes no focus, so a keyboard reader could never land on it to
  // hear why it will not act. Base UI still refuses its clicks and keys.
  const whyBlocked = blockedReason
    ? {
        'aria-describedby': hintId,
        focusableWhenDisabled: true,
      }
    : {}

  const confirmAction = (
    <ComposedButton
      data-testid="popconfirm-confirm"
      size="sm"
      {...confirmProps}
      {...whyBlocked}
      disabled={confirmProps?.disabled || Boolean(blockedReason)}
      loading={running}
      onClick={() => void confirm()}
    >
      {confirmText ?? labels.confirm.confirm}
    </ComposedButton>
  )

  return (
    // asChild: the consumer's Button is the trigger itself — one control with
    // one name and aria-expanded on it, not a Button inside a span
    // role="button". Text children still fall back to Popover's wrapper.
    <Popover
      align={align}
      asChild
      content={
        <div className={root()} data-testid="popconfirm">
          <span className={titleSlot()} data-testid="popconfirm-title">
            {title}
          </span>
          {description ? (
            <span className={descriptionSlot()}>{description}</span>
          ) : null}
          {content ? (
            <div className={contentSlot()} data-testid="popconfirm-content">
              {content}
            </div>
          ) : null}
          {challengeState.present ? (
            <form
              className={challenge()}
              data-testid="popconfirm-challenge"
              onSubmit={handleSubmit}
            >
              {challengeState.node}
            </form>
          ) : null}
          {error ? (
            <span className={errorSlot()} data-testid="popconfirm-error">
              {error}
            </span>
          ) : null}
          <div className={footer()}>
            <Button
              data-testid="popconfirm-cancel"
              size="sm"
              variant="ghost"
              {...cancelProps}
              disabled={running}
              onClick={() => {
                onCancel?.()
                close()
              }}
            >
              {cancelText ?? labels.common.cancel}
            </Button>
            {confirmAction}
          </div>
        </div>
      }
      onOpenChange={setOpen}
      open={visible}
      side={side}
    >
      {children}
    </Popover>
  )
}
