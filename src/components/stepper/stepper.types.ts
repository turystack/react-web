/**
 * Stepper
 *
 * Sequential, validated step navigation for multi-step flows (wizards, onboarding,
 * checkout). Indicator list + active panel + optional Completed slot, with built-in
 * Previous / Next buttons that respect per-step async validators.
 *
 * Behavior:
 * - `active` is required and controlled by the consumer
 * - Default linear: `allowNextStepsSelect={false}` — only completed indicators are clickable
 * - `Stepper.Next` advances the active index synchronously
 * - `keepMounted` keeps inactive panels in the DOM via `hidden` + `inert` (state preserved)
 * - `Stepper.Completed` renders when `active === stepCount`
 * - Animation via `tw-animate-css` data-state utilities; respects `prefers-reduced-motion`
 *
 * Implementation:
 * - Headless via internal `StepperContext` (no Base UI composition — semantics differ from Tabs)
 * - Compound: `Stepper.Step`, `Stepper.Completed`, `Stepper.Previous`, `Stepper.Next`
 * - `<ol>` semantic root, `aria-current="step"` on active, live region announces changes
 * - Use `useStepper()` hook for custom buttons / consumers
 *
 * Dependencies: tailwind-variants, @turystack/react-icons, @/components/button
 */

import type { ReactNode } from 'react'

import type { ButtonProps } from '@/components/button'

export type StepperOrientation = 'horizontal' | 'vertical'

export type StepperSize = 'sm' | 'md' | 'lg'

export type StepperRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type StepperVariant = 'numbered' | 'dotted' | 'icon'

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
  icon?: StepFragment // default indicator content (default: step + 1)
  iconPosition?: StepperIconPosition // indicator side relative to label (default 'left')
  iconSize?: string | number // override indicator size
  keepMounted?: boolean // keep inactive panels mounted via hidden + inert
  onActiveChange?: (active: number) => void // fires after validate resolves true
  orientation?: StepperOrientation // default 'horizontal'
  progressIcon?: StepFragment // shown when a step is loading
  radius?: StepperRadius // indicator border-radius (default 'xl')
  size?: StepperSize // default 'md'
  variant?: StepperVariant // indicator preset (default 'numbered')
  wrap?: boolean // allow indicator list to wrap (horizontal only, default true)
}

export type StepperStepProps = {
  allowStepClick?: boolean // overrides root allowNextStepsSelect for this step
  allowStepSelect?: boolean // alias of allowStepClick (Mantine parity)
  children?: ReactNode // panel body rendered when this step is active
  completedIcon?: StepFragment // per-step override
  description?: ReactNode // sub-line below label
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
    onClick: () => void
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
    onClick: () => void
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
