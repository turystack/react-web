/**
 * Popconfirm
 *
 * The small confirmation that belongs to one control.
 *
 * Behavior:
 * - Anchored to what it is confirming, not centred over the page. Deleting one
 *   row of forty is not an event worth dimming the screen for, and a modal for
 *   it costs the reader their place in the table
 * - `mode` picks how the decision is gated, and it is the same five Confirm
 *   offers: `simple`, `typed`, `password`, `otp` and `acknowledge`. The rules
 *   for when a challenge unlocks the button live in one place both components
 *   read, so "the typed text matches" cannot come to mean two things
 * - The confirm button stays disabled until the challenge is satisfied, and it
 *   states why it is blocked instead of only looking dead
 * - Challenge modes hand what was collected to `onConfirm` — the consumer
 *   validates it; this component never checks a secret, stores it past the
 *   popover's life, or logs it
 * - `onConfirm` may return a promise: the confirm button spins, the popover
 *   stays open, and a rejection keeps it open with the reason — the same
 *   contract Confirm and EditableText already use
 * - Whatever was collected is dropped the moment the popover closes
 * - Confirm is still the right component when the decision deserves the whole
 *   screen: a blast radius to read, a list of what is about to go. This one is
 *   anchored, and a challenge in it stays small
 *
 * Implementation:
 * - Popover under it, so placement, dismissal and focus are the primitive's
 * - <Popconfirm title="Delete this booking?" onConfirm={remove}>
 *     <Button variant="destructive" size="icon-sm"><Trash2 /></Button>
 *   </Popconfirm>
 * - <Popconfirm mode="typed" confirmationValue="DELETE" title="Delete?"
 *     onConfirm={(typed) => remove(typed)}>…</Popconfirm>
 *
 * Dependencies: Popover, Button, Confirm (challenge), LabelsProvider
 */

import type { ButtonProps } from '@/components/button/button.types'
import type { ConfirmMode } from '@/components/confirm/confirm.types'
import type {
  PopoverAlign,
  PopoverSide,
} from '@/components/popover/popover.types'

export type PopconfirmMode = ConfirmMode

export type PopconfirmBaseProps = {
  align?: PopoverAlign // alignment against the trigger
  cancelProps?: Omit<ButtonProps, 'loading' | 'onClick'> // cancel button style overrides
  cancelText?: string // overrides the label group's wording
  confirmProps?: Omit<ButtonProps, 'loading' | 'onClick'> // style of the confirm button
  confirmText?: string // overrides the label group's wording
  content?: React.ReactNode // a node under the description: a preview, a warning
  description?: string // one line of why, when the title is not enough
  onCancel?: () => void // fires when the reader backs out
  onOpenChange?: (open: boolean) => void // fires when it opens or closes
  open?: boolean // controlled visibility
  side?: PopoverSide // preferred placement
  title: string // the question (required)
}

export type PopconfirmChallengeProps = PopconfirmBaseProps & {
  challengeLabel?: string // overrides the label above the challenge field
  /** Overrides what the empty challenge field says. Typed defaults to the very
   * text that has to be reproduced, which is the one hint worth giving. */
  challengePlaceholder?: string
}

/**
 * The `never`s are what makes `mode` optional and still safe. Without a `mode`
 * to discriminate on, TypeScript accepts any property that exists in some
 * member of the union, so `confirmationValue` with no `mode` would compile and
 * silently render the plain popover. Refusing them here turns that into an
 * error while leaving the plain popover free of a `mode` prop.
 */
export type PopconfirmSimpleProps = PopconfirmBaseProps & {
  mode?: 'simple' // the default: no challenge between question and answer
  acknowledgement?: never
  challengeLabel?: never
  challengePlaceholder?: never
  confirmationValue?: never
  otpPattern?: never
  onConfirm?: () => void // the action; may throw to refuse
}

export type PopconfirmTypedProps = PopconfirmChallengeProps & {
  mode: 'typed' // confirm unlocks once the typed text matches
  confirmationValue: string // the exact text the user has to type
  onConfirm?: (value: string) => void // receives the typed text
}

export type PopconfirmPasswordProps = PopconfirmChallengeProps & {
  mode: 'password' // confirm unlocks once a password has been entered
  onConfirm?: (value: string) => void // receives the password to validate
}

export type PopconfirmOtpProps = PopconfirmChallengeProps & {
  mode: 'otp' // confirm unlocks once the code is complete
  otpPattern?: number[] // digit count per segment, e.g. [3, 3] (default [6])
  onConfirm?: (value: string) => void // receives the code to validate
}

export type PopconfirmAcknowledgeProps = PopconfirmBaseProps & {
  mode: 'acknowledge' // confirm unlocks once the statement is ticked
  acknowledgement: string // the statement the user has to agree with
  challengePlaceholder?: never
  onConfirm?: () => void // the action; may throw to refuse
}

export type PopconfirmProps =
  | PopconfirmSimpleProps
  | PopconfirmTypedProps
  | PopconfirmPasswordProps
  | PopconfirmOtpProps
  | PopconfirmAcknowledgeProps
