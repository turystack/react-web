/**
 * Stepper
 *
 * Sequential step navigation for multi-step flows (wizards, onboarding,
 * checkout). Indicator list + active panel + optional Completed slot, with built-in
 * Previous / Next buttons.
 *
 * Behavior:
 * - `active` is required and controlled by the consumer
 * - Default linear: `allowNextStepsSelect={false}` — only completed indicators are
 *   clickable; the active indicator stays enabled and does nothing when clicked
 * - `Stepper.Next` advances the active index synchronously, unless `onLastClick`
 *   takes over on the last step
 * - `connector` draws the rule between two steps ('line' by default, 'dashed',
 *   or 'none'); it never follows the last step and it follows the orientation
 * - `variant="path"` is the Salesforce-style path: the steps are a single row of
 *   chevron stages, the current one filled, the completed ones checked, the
 *   rest muted. It is always horizontal, never wraps and draws no connector —
 *   the chevrons are the separators, so `orientation`, `wrap`, `connector`,
 *   `iconPosition`, `radius` and `iconSize` do not apply. A label that does not
 *   fit truncates to one centred line (the full text stays the accessible name,
 *   and a string label is also the tooltip `title`); a description is kept for
 *   assistive technology only. Clicking a stage is the same request as on
 *   every variant, `onActiveChange`, gated by `allowNextStepsSelect` — a
 *   controlled owner that wants to confirm a stage change before moving does
 *   it there
 * - A blocked step says why. `Stepper.Step`'s `disabledReason` blocks it (a
 *   reason implies blocked) and is shown in a tooltip on hover and keyboard
 *   focus; the step stays in the tab order, is described by the reason, and a
 *   click does nothing. Without one, a step ahead held back by the linear
 *   default says `stepper.blocked` ("Finish the current step first"); a step
 *   closed by an explicit `allowStepClick={false}` stays silently disabled
 * - `keepMounted` keeps inactive panels in the DOM via `hidden` + `inert` (state preserved)
 * - The panel area only renders when there is something to show: a step (or a
 *   `Stepper.Completed`) with no children leaves no empty section behind, so a
 *   childless `variant="path"` works as a status bar with no space under it.
 *   With `keepMounted` the area stays mounted while any step has children and
 *   is `hidden` while the active one has none
 * - `Stepper.Completed` renders when `active === stepCount`
 * - Animation via `tw-animate-css` data-state utilities; respects `prefers-reduced-motion`
 *
 * Implementation:
 * - Headless via internal `StepperContext` (no Base UI composition — semantics differ from Tabs)
 * - Compound: `Stepper.Step`, `Stepper.Completed`, `Stepper.Previous`, `Stepper.Next`
 * - `<ol>` semantic root, `aria-current="step"` on active, live region announces changes
 * - Use `useStepper()` hook for custom buttons / consumers
 * - <Stepper.Step disabledReason="Add a payment method first" label="Billing" />
 *
 * Dependencies: tailwind-variants, @turystack/react-icons, @/components/button
 */

import type { ReactNode } from 'react'

import type { ButtonProps } from '@/components/button'

export type StepperOrientation = 'horizontal' | 'vertical'

export type StepperSize = 'sm' | 'md' | 'lg'

export type StepperRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type StepperVariant = 'numbered' | 'dotted' | 'icon' | 'path'

export type StepperConnector = 'none' | 'line' | 'dashed'

export type StepperIconPosition = 'left' | 'right'

export type StepState = 'stepInactive' | 'stepProgress' | 'stepCompleted'

export type StepFragmentProps = {
  step: number // zero-based step index
  state: StepState // visual state of the step
}

export type StepFragmentComponent = React.ComponentType<StepFragmentProps>

export type StepFragment = ReactNode | StepFragmentComponent

export type StepperProps = {
  active: number // required: zero-based index of the active step (controlled)
  allowNextStepsSelect?: boolean // when true, indicators jump to any step (default false: linear)
  autoFocus?: boolean // focus active panel heading on advance (default false)
  completedIcon?: StepFragment // override completed indicator (default: check)
  connector?: StepperConnector // rule drawn between two steps (default 'line')
  icon?: StepFragment // default indicator content (default: step + 1)
  iconPosition?: StepperIconPosition // indicator side relative to label (default 'left')
  iconSize?: string | number // override indicator size
  keepMounted?: boolean // keep inactive panels mounted via hidden + inert
  onActiveChange?: (active: number) => void // fires when the active step changes
  orientation?: StepperOrientation // default 'horizontal'
  progressIcon?: StepFragment // shown when a step is loading
  radius?: StepperRadius // indicator border-radius (default 'xl')
  size?: StepperSize // default 'md'
  variant?: StepperVariant // indicator preset, or 'path' for chevron stages (default 'numbered')
  wrap?: boolean // allow indicator list to wrap (horizontal only, default true)
}

export type StepperStepProps = {
  allowStepClick?: boolean // overrides root allowNextStepsSelect for this step
  allowStepSelect?: boolean // alias of allowStepClick (Mantine parity)
  children?: ReactNode // panel body rendered when this step is active
  completedIcon?: StepFragment // per-step override
  description?: ReactNode // sub-line below label
  disabledReason?: string // blocks the step, stays focusable, says why
  icon?: StepFragment // per-step override
  label?: ReactNode // step title
  loading?: boolean // forces progressIcon
  progressIcon?: StepFragment // per-step override
}

export type StepperCompletedProps = {
  children?: ReactNode
}

export type StepperPreviousProps = Omit<ButtonProps, 'onClick' | 'type'> & {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
    currentStep: number,
  ) => void
  render?: (slotProps: {
    onClick: React.MouseEventHandler<HTMLButtonElement>
    disabled: boolean
  }) => React.ReactElement
}

export type StepperNextProps = Omit<ButtonProps, 'onClick' | 'type'> & {
  lastChildren?: ReactNode // label override on the last step
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
    currentStep: number,
  ) => void
  onLastClick?: () => void // fires on the last step instead of advancing
  render?: (slotProps: {
    disabled: boolean
    isLast: boolean
    onClick: React.MouseEventHandler<HTMLButtonElement>
  }) => React.ReactElement
}

export type UseStepperReturn = {
  active: number
  goTo: (step: number) => void
  isFirst: boolean
  isLast: boolean
  isStepActive: (step: number) => boolean
  isStepCompleted: (step: number) => boolean
  totalSteps: number
}
