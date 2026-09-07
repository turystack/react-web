/**
 * Confirm
 *
 * Alert dialog that asks for one decision before a destructive or otherwise
 * irreversible action runs. It renders no trigger — `open` is the only way in.
 *
 * Behavior:
 * - Modal alert dialog with title, description, an optional blast radius slot
 *   below the description, and two actions
 * - `mode` picks how the decision is gated: `simple` (the default) asks and
 *   nothing more, while `typed`, `password`, `otp` and `acknowledge` each put a
 *   challenge between the question and the confirm button
 * - The confirm button stays disabled until the challenge is satisfied, and it
 *   states why it is blocked instead of only looking dead
 * - Every field the challenge renders carries a placeholder. `typed` shows the
 *   exact text that has to be reproduced, because a field asking you to retype
 *   a name you cannot see while typing it is a puzzle, not a safeguard
 * - Challenge modes hand what was collected to `onConfirm` — the consumer is
 *   the one that validates it; this component never checks a secret, stores it
 *   past the dialog's life, or logs it
 * - Both handlers may return a promise: the button that started it spins and
 *   refuses a second run until it settles
 * - A rejected `onConfirm` keeps the dialog open and shows the rejection's
 *   message; anything else closes it through `onClose`
 * - Whatever was collected is dropped the moment the dialog closes
 * - Both handlers are typed `=> void` on purpose: TypeScript lets a handler
 *   returning a promise through that gate, while `void | Promise<void>` would
 *   reject any arrow whose body happens to end in a value
 *
 * Implementation:
 * - Base UI AlertDialog (Portal > Backdrop > Popup): it blocks the page behind
 *   it and traps focus, and initial focus lands on the challenge field because
 *   that field is the first tabbable element inside the popup
 * - Fields are the library's own Input, PasswordInput, OTPInput and Checkbox
 * - Every string the dialog renders on its own comes from the provider's
 *   `confirm` label group
 * - <Confirm confirmationValue="acme-prod" description="This cannot be undone."
 *     mode="typed" onClose={close} onConfirm={(typed) => remove(typed)}
 *     open={show} title="Delete project?" />
 *
 * Dependencies: @base-ui/react/alert-dialog, Button, Input, PasswordInput,
 * OTPInput, Checkbox, Label components
 */

import type { ButtonProps } from '@/components/button/button.types'

export type ConfirmMode =
  | 'simple'
  | 'typed'
  | 'password'
  | 'otp'
  | 'acknowledge'

export type ConfirmBaseProps = {
  open?: boolean // controlled visibility
  title: string // confirm dialog title (required)
  description: string // confirm dialog message (required)
  content?: React.ReactNode // a node under the description: what the action affects, a preview, a warning
  confirmText?: string // custom confirm button text
  cancelText?: string // custom cancel button text
  confirmProps?: Omit<ButtonProps, 'loading' | 'onClick'> // confirm button style overrides
  cancelProps?: Omit<ButtonProps, 'loading' | 'onClick'> // cancel button style overrides
  onCancel?: () => void // fires when cancel is clicked
  onClose?: () => void // fires when dialog is closed (any method)
}

export type ConfirmChallengeProps = ConfirmBaseProps & {
  challengeLabel?: string // overrides the label above the challenge field
  /** Overrides what the empty challenge field says. Typed defaults to the very
   * text that has to be reproduced, which is the one hint worth giving. */
  challengePlaceholder?: string
}

/**
 * The `never`s are what makes `mode` optional and still safe. Without a `mode`
 * to discriminate on, TypeScript accepts any property that exists in some
 * member of the union, so `confirmationValue` with no `mode` would compile and
 * silently render the plain dialog. Refusing them here turns that into an
 * error while leaving the plain dialog free of a `mode` prop.
 */
export type ConfirmSimpleProps = ConfirmBaseProps & {
  mode?: 'simple' // the default: no challenge between question and answer
  acknowledgement?: never
  challengeLabel?: never
  challengePlaceholder?: never
  confirmationValue?: never
  otpPattern?: never
  onConfirm?: () => void // fires when confirm is clicked
}

export type ConfirmTypedProps = ConfirmChallengeProps & {
  mode: 'typed' // confirm unlocks once the typed text matches
  confirmationValue: string // the exact text the user has to type
  onConfirm?: (value: string) => void // receives the typed text
}

export type ConfirmPasswordProps = ConfirmChallengeProps & {
  mode: 'password' // confirm unlocks once a password has been entered
  onConfirm?: (value: string) => void // receives the password to validate
}

export type ConfirmOtpProps = ConfirmChallengeProps & {
  mode: 'otp' // confirm unlocks once the code is complete
  otpPattern?: number[] // digit count per segment, e.g. [3, 3] (default [6])
  onConfirm?: (value: string) => void // receives the code to validate
}

export type ConfirmAcknowledgeProps = ConfirmBaseProps & {
  mode: 'acknowledge' // confirm unlocks once the statement is ticked
  challengePlaceholder?: never
  acknowledgement: string // the statement the user has to agree with
  onConfirm?: () => void // fires when confirm is clicked
}

export type ConfirmProps =
  | ConfirmSimpleProps
  | ConfirmTypedProps
  | ConfirmPasswordProps
  | ConfirmOtpProps
  | ConfirmAcknowledgeProps
