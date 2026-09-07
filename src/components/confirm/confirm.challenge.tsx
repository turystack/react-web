import { useEffect, useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Checkbox } from '@/components/checkbox'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { useLabels } from '@/components/labels-provider'
import { OTPInput } from '@/components/otp-input'
import { PasswordInput } from '@/components/password-input'

import type { ConfirmMode } from './confirm.types'

const DEFAULT_OTP_PATTERN = [6]

export const challengeStyles = tv({
  slots: {
    challenge: 'confirm-challenge flex flex-col gap-2',
    hint: 'confirm-hint text-muted-foreground text-xs',
  },
})

/**
 * What a challenge needs to know about itself.
 *
 * Confirm and Popconfirm ask the same five questions with the same rules for
 * when the answer unlocks the button. Keeping the rules here is what stops the
 * two from drifting into two different definitions of "the typed text matches".
 */
export type ChallengeConfig = {
  acknowledgement?: string
  challengeLabel?: string
  challengePlaceholder?: string
  confirmationValue?: string
  mode: ConfirmMode
  otpPattern?: number[]
}

export type Challenge = {
  /** Why the confirm button is blocked, or undefined once it is not. */
  blockedReason: string | undefined
  /** What the challenge collected, to hand to `onConfirm`. */
  collected: string
  /** Names the hint, for `aria-describedby` on the blocked button. */
  hintId: string
  /** The rendered field, label and hint — or null for `simple`. */
  node: React.ReactNode
  /** Drops whatever was collected. */
  reset: () => void
  /** True unless the mode is `simple`. */
  present: boolean
}

/**
 * Collects the answer to a challenge and says whether it unlocks the button.
 *
 * Nothing collected here outlives the surface that asked: `open` going false
 * clears it, because closing is the reader withdrawing the answer and reopening
 * has to start from nothing rather than from whatever the last attempt left.
 */
export function useConfirmChallenge(
  config: ChallengeConfig,
  open: boolean | undefined,
): Challenge {
  const labels = useLabels()
  const fieldId = useId()
  const labelId = `${fieldId}-label`
  const hintId = `${fieldId}-hint`

  const [collected, setCollected] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  const { hint } = challengeStyles()
  const { mode } = config

  const reset = () => {
    setCollected('')
    setAcknowledged(false)
  }

  useEffect(() => {
    if (!open) {
      setCollected('')
      setAcknowledged(false)
    }
  }, [open])

  function otpLength() {
    return (config.otpPattern ?? DEFAULT_OTP_PATTERN).reduce(
      (total, count) => total + count,
      0,
    )
  }

  function reasonToBlock() {
    if (mode === 'typed') {
      return collected === config.confirmationValue
        ? undefined
        : labels.confirm.typedBlocked(config.confirmationValue ?? '')
    }
    if (mode === 'password') {
      return collected ? undefined : labels.confirm.passwordBlocked
    }
    if (mode === 'otp') {
      return collected.length === otpLength()
        ? undefined
        : labels.confirm.otpBlocked
    }
    if (mode === 'acknowledge') {
      return acknowledged ? undefined : labels.confirm.acknowledgeBlocked
    }

    return undefined
  }

  function fieldLabel() {
    if (mode === 'typed') {
      return (
        config.challengeLabel ??
        labels.confirm.typedLabel(config.confirmationValue ?? '')
      )
    }
    if (mode === 'password') {
      return config.challengeLabel ?? labels.confirm.passwordLabel
    }
    if (mode === 'otp') {
      return config.challengeLabel ?? labels.confirm.otpLabel
    }

    return undefined
  }

  /**
   * `typed` shows the value itself: the reader is being asked to reproduce a
   * string, and hiding it while they do turns a deliberate pause into a memory
   * test. Nothing secret passes through here — the text is already on screen in
   * the label above the field.
   */
  function fieldPlaceholder() {
    if (mode === 'typed') {
      return config.challengePlaceholder ?? config.confirmationValue
    }
    if (mode === 'password') {
      return config.challengePlaceholder ?? labels.confirm.passwordPlaceholder
    }

    return undefined
  }

  const blockedReason = reasonToBlock()
  const describedBy = blockedReason ? hintId : undefined
  const labelText = fieldLabel()
  const placeholderText = fieldPlaceholder()

  const handleValueChange = (value: string | null) => {
    setCollected(value ?? '')
  }

  function renderField() {
    if (mode === 'typed') {
      return (
        <Input
          aria-describedby={describedBy}
          autoComplete="off"
          data-testid="confirm-typed-field"
          id={fieldId}
          onChange={handleValueChange}
          placeholder={placeholderText}
          value={collected}
        />
      )
    }
    if (mode === 'password') {
      return (
        <PasswordInput
          aria-describedby={describedBy}
          autoComplete="current-password"
          data-testid="confirm-password-field"
          id={fieldId}
          onChange={handleValueChange}
          placeholder={placeholderText}
          value={collected}
        />
      )
    }
    if (mode === 'otp') {
      return (
        <fieldset
          aria-describedby={describedBy}
          aria-labelledby={labelId}
          data-testid="confirm-otp-field"
        >
          <OTPInput
            onChange={handleValueChange}
            pattern={config.otpPattern}
            value={collected}
          />
        </fieldset>
      )
    }
    if (mode === 'acknowledge') {
      return (
        <Checkbox
          checked={acknowledged}
          label={config.acknowledgement ?? ''}
          onChange={setAcknowledged}
        />
      )
    }

    return null
  }

  const present = mode !== 'simple'

  return {
    blockedReason,
    collected,
    hintId,
    node: present ? (
      <>
        {labelText && (
          <span id={labelId}>
            <Label htmlFor={mode === 'otp' ? undefined : fieldId}>
              {labelText}
            </Label>
          </span>
        )}
        {renderField()}
        {blockedReason && (
          <p className={hint()} data-testid="confirm-hint" id={hintId}>
            {blockedReason}
          </p>
        )}
      </>
    ) : null,
    present,
    reset,
  }
}

export { DEFAULT_OTP_PATTERN }
