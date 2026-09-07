import { Button as ButtonPrimitive } from '@base-ui/react/button'
import {
  Children,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Check, ChevronLeft, ChevronRight, Loader2 } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  StepFragment,
  StepFragmentProps,
  StepperCompletedProps,
  StepperNextProps,
  StepperPreviousProps,
  StepperProps,
  StepperStepProps,
  StepState,
  UseStepperReturn,
} from './stepper.types'

const stepper = tv({
  // Two entries can set the vertical offset that centres the connector under
  // the indicator, and tailwind-variants keeps the last conflicting utility, so
  // the dotted entry has to stay after the size entries to win that margin.
  // The min size on each connector is what guarantees the rule is drawn at all:
  // its flex-1 only wins space once the step grows, and a step with no free
  // space around it would otherwise resolve that flex-1 to zero.
  compoundVariants: [
    {
      class: {
        connector: 'h-0.5 min-w-4',
      },
      connector: 'line',
      orientation: 'horizontal',
    },
    {
      class: {
        connector: 'h-0 min-w-4 border-t-2 border-dashed',
      },
      connector: 'dashed',
      orientation: 'horizontal',
    },
    {
      class: {
        connector: 'min-h-4 w-0.5',
      },
      connector: 'line',
      orientation: 'vertical',
    },
    {
      class: {
        connector: 'min-h-4 w-0 border-l-2 border-dashed',
      },
      connector: 'dashed',
      orientation: 'vertical',
    },
    {
      class: {
        connector: 'ms-6',
      },
      orientation: 'vertical',
      size: 'lg',
    },
    {
      class: {
        connector: 'ms-5',
      },
      orientation: 'vertical',
      size: 'md',
    },
    {
      class: {
        connector: 'ms-4',
      },
      orientation: 'vertical',
      size: 'sm',
    },
    {
      class: {
        connector: 'ms-2',
      },
      orientation: 'vertical',
      variant: 'dotted',
    },
  ],
  defaultVariants: {
    connector: 'line',
    iconPosition: 'left',
    orientation: 'horizontal',
    radius: 'xl',
    size: 'md',
    variant: 'numbered',
    wrap: true,
  },
  slots: {
    completed: 'stepper-completed mt-4 flex-1 outline-none',
    connector: 'stepper-connector flex-1 transition-colors',
    content:
      'stepper-content mt-4 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    description: 'stepper-description text-muted-foreground text-xs',
    indicator:
      'stepper-indicator inline-flex shrink-0 items-center justify-center bg-muted font-medium text-muted-foreground transition-colors data-[state=stepCompleted]:bg-primary data-[state=stepProgress]:bg-primary data-[state=stepCompleted]:text-primary-foreground data-[state=stepProgress]:text-primary-foreground',
    label: 'stepper-label font-medium text-foreground text-sm',
    list: 'stepper-list flex w-full items-center justify-between gap-2',
    panels: 'stepper-panels flex min-h-0 flex-1 flex-col',
    root: 'stepper-root flex min-h-0 w-full',
    step: 'stepper-step flex min-w-0 items-center gap-2',
    trigger:
      'stepper-trigger inline-flex cursor-pointer items-center gap-2 rounded-md p-1 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    triggerBody: 'stepper-trigger-body flex min-w-0 flex-col text-left',
  },
  variants: {
    connector: {
      dashed: {
        connector: 'border-border data-[state=stepCompleted]:border-primary',
        step: 'grow last:grow-0',
      },
      line: {
        connector: 'bg-border data-[state=stepCompleted]:bg-primary',
        step: 'grow last:grow-0',
      },
      none: {},
    },
    iconPosition: {
      left: {
        trigger: 'flex-row',
      },
      right: {
        trigger: 'flex-row-reverse',
      },
    },
    orientation: {
      horizontal: {
        list: 'flex-row',
        root: 'flex-col gap-4',
      },
      vertical: {
        list: 'h-full flex-col items-stretch',
        root: 'flex-row gap-6',
        step: 'flex-col items-start',
      },
    },
    radius: {
      full: {
        indicator: 'rounded-full',
      },
      lg: {
        indicator: 'rounded-lg',
      },
      md: {
        indicator: 'rounded-md',
      },
      none: {
        indicator: 'rounded-none',
      },
      sm: {
        indicator: 'rounded-sm',
      },
      xl: {
        indicator: 'rounded-xl',
      },
    },
    size: {
      lg: {
        description: 'text-sm',
        indicator: 'size-10 text-base [&>svg]:size-5',
        label: 'text-base',
      },
      md: {
        description: 'text-xs',
        indicator: 'size-8 text-sm [&>svg]:size-4',
        label: 'text-sm',
      },
      sm: {
        description: 'text-[0.7rem]',
        indicator: 'size-6 text-xs [&>svg]:size-3.5',
        label: 'text-xs',
      },
    },
    variant: {
      dotted: {
        indicator: 'size-2.5',
      },
      icon: {},
      numbered: {},
    },
    wrap: {
      true: {
        list: 'flex-wrap',
      },
    },
  },
})

type StepperContextValue = {
  active: number
  allowNextStepsSelect: boolean
  goTo: (step: number) => void
  isFirst: boolean
  isLast: boolean
  isStepActive: (step: number) => boolean
  isStepCompleted: (step: number) => boolean
  next: () => void
  prev: () => void
  totalSteps: number
}

const StepperContext = createContext<StepperContextValue | null>(null)

function useStepperContext(componentName: string): StepperContextValue {
  const ctx = useContext(StepperContext)
  if (!ctx) {
    throw new Error(`${componentName} must be rendered inside <Stepper>.`)
  }
  return ctx
}

function useStepper(): UseStepperReturn {
  const {
    active,
    goTo,
    isFirst,
    isLast,
    isStepActive,
    isStepCompleted,
    totalSteps,
  } = useStepperContext('useStepper')
  return {
    active,
    goTo,
    isFirst,
    isLast,
    isStepActive,
    isStepCompleted,
    totalSteps,
  }
}

function isStepperStep(
  child: ReactNode,
): child is ReactElement<StepperStepProps> {
  return isValidElement(child) && child.type === StepperStep
}

function isStepperCompleted(
  child: ReactNode,
): child is ReactElement<StepperCompletedProps> {
  return isValidElement(child) && child.type === StepperCompleted
}

function resolveStepState(stepIndex: number, active: number): StepState {
  if (stepIndex === active) {
    return 'stepProgress'
  }
  if (stepIndex < active) {
    return 'stepCompleted'
  }
  return 'stepInactive'
}

function renderFragment(
  fragment: StepFragment | undefined,
  fallback: ReactNode,
  props: StepFragmentProps,
): ReactNode {
  if (fragment === undefined || fragment === null) {
    return fallback
  }
  if (typeof fragment === 'function') {
    const Component = fragment
    return <Component {...props} />
  }
  return fragment
}

function focusFirstHeading(container: HTMLElement | null) {
  if (!container) {
    return
  }
  const heading = container.querySelector<HTMLElement>(
    'h1, h2, h3, h4, h5, h6, [data-stepper-focus]',
  )
  heading?.focus?.()
}

function StepperRoot({
  active,
  allowNextStepsSelect = false,
  autoFocus = false,
  children,
  completedIcon,
  connector = 'line',
  icon,
  iconPosition = 'left',
  iconSize,
  keepMounted = false,
  onActiveChange,
  orientation = 'horizontal',
  progressIcon,
  radius = 'xl',
  size = 'md',
  variant = 'numbered',
  wrap = true,
}: React.PropsWithChildren<StepperProps>) {
  const labels = useLabels()
  const styles = stepper({
    connector,
    iconPosition,
    orientation,
    radius,
    size,
    variant,
    wrap,
  })

  const childArray = useMemo(() => Children.toArray(children), [children])
  const stepElements = useMemo(
    () => childArray.filter(isStepperStep),
    [childArray],
  )
  const completedElement = useMemo(
    () => childArray.find(isStepperCompleted),
    [childArray],
  )
  const restElements = useMemo(
    () => childArray.filter((c) => !isStepperStep(c) && !isStepperCompleted(c)),
    [childArray],
  )

  const totalSteps = stepElements.length
  const isFirst = active <= 0
  const isLast = active >= totalSteps - 1

  const prevActiveRef = useRef(active)
  const directionRef = useRef<'forward' | 'back' | 'none'>('none')
  const panelsRef = useRef<HTMLDivElement | null>(null)
  const liveMessageId = useId()
  const baseId = useId()

  if (active !== prevActiveRef.current) {
    directionRef.current = active > prevActiveRef.current ? 'forward' : 'back'
  } else {
    directionRef.current = 'none'
  }

  useEffect(() => {
    if (active === prevActiveRef.current) {
      return
    }
    const previous = prevActiveRef.current
    prevActiveRef.current = active
    if (autoFocus && active > previous) {
      const id = window.setTimeout(
        () => focusFirstHeading(panelsRef.current),
        0,
      )
      return () => window.clearTimeout(id)
    }
    return
  }, [active, autoFocus])

  const goTo = useCallback(
    (step: number) => {
      if (step === active) {
        return
      }
      onActiveChange?.(step)
    },
    [active, onActiveChange],
  )

  const next = useCallback(() => {
    onActiveChange?.(Math.min(active + 1, totalSteps))
  }, [active, onActiveChange, totalSteps])

  const prev = useCallback(() => {
    if (active > 0) {
      onActiveChange?.(active - 1)
    }
  }, [active, onActiveChange])

  const isStepActive = useCallback((step: number) => step === active, [active])
  const isStepCompleted = useCallback((step: number) => step < active, [active])

  const ctx: StepperContextValue = useMemo(
    () => ({
      active,
      allowNextStepsSelect,
      goTo,
      isFirst,
      isLast,
      isStepActive,
      isStepCompleted,
      next,
      prev,
      totalSteps,
    }),
    [
      active,
      allowNextStepsSelect,
      goTo,
      isFirst,
      isLast,
      isStepActive,
      isStepCompleted,
      next,
      prev,
      totalSteps,
    ],
  )

  const showCompleted = active >= totalSteps && completedElement
  const indicatorIconStyle =
    iconSize !== undefined
      ? {
          height: iconSize,
          width: iconSize,
        }
      : undefined

  const liveLabel = (() => {
    if (showCompleted) {
      return labels.stepper.completed
    }
    const current = stepElements[active]
    const labelNode = current?.props.label
    const label = typeof labelNode === 'string' ? labelNode : ''
    const step = labels.stepper.step(active + 1, totalSteps)
    return label ? `${step}: ${label}` : step
  })()

  return (
    <StepperContext.Provider value={ctx}>
      <div
        aria-describedby={liveMessageId}
        className={cn(styles.root())}
        data-orientation={orientation}
        data-slot="stepper-root"
        data-testid="stepper-root"
      >
        <ol
          aria-label="Stepper"
          className={styles.list()}
          data-slot="stepper-list"
        >
          {stepElements.map((stepEl, index) => {
            const stepProps = stepEl.props
            const stepKey = `${baseId}-step-${index}`
            const state: StepState = stepProps.loading
              ? 'stepProgress'
              : resolveStepState(index, active)
            const allowClick =
              stepProps.allowStepClick ??
              stepProps.allowStepSelect ??
              (allowNextStepsSelect || index < active)
            const isCurrent = index === active
            const isBlocked = !allowClick && !isCurrent
            const fragmentProps: StepFragmentProps = {
              state,
              step: index,
            }
            const indicatorContent =
              variant === 'dotted'
                ? null
                : state === 'stepCompleted'
                  ? renderFragment(
                      stepProps.completedIcon ?? completedIcon,
                      <Check />,
                      fragmentProps,
                    )
                  : state === 'stepProgress' && stepProps.loading
                    ? renderFragment(
                        stepProps.progressIcon ?? progressIcon,
                        <Loader2 className="stepper-progress-icon animate-spin" />,
                        fragmentProps,
                      )
                    : renderFragment(
                        stepProps.icon ?? icon,
                        index + 1,
                        fragmentProps,
                      )

            const handleClick = () => {
              if (!allowClick || isCurrent) {
                return
              }
              goTo(index)
            }

            return (
              <li
                aria-current={isCurrent ? 'step' : undefined}
                className={styles.step()}
                data-slot="stepper-step"
                data-state={state}
                key={stepKey}
              >
                <ButtonPrimitive
                  aria-disabled={isBlocked}
                  className={styles.trigger()}
                  data-slot="stepper-trigger"
                  data-state={state}
                  disabled={isBlocked}
                  id={`${baseId}-label-${index}`}
                  onClick={handleClick}
                  type="button"
                >
                  <span
                    className={styles.indicator()}
                    data-slot="stepper-indicator"
                    data-state={state}
                    style={{
                      ...indicatorIconStyle,
                    }}
                  >
                    {indicatorContent}
                  </span>
                  {(stepProps.label || stepProps.description) && (
                    <span
                      className={styles.triggerBody()}
                      data-slot="stepper-trigger-body"
                    >
                      {stepProps.label && (
                        <span
                          className={styles.label()}
                          data-slot="stepper-label"
                        >
                          {stepProps.label}
                        </span>
                      )}
                      {stepProps.description && (
                        <span
                          className={styles.description()}
                          data-slot="stepper-description"
                        >
                          {stepProps.description}
                        </span>
                      )}
                    </span>
                  )}
                </ButtonPrimitive>
                {connector !== 'none' && index < totalSteps - 1 && (
                  <span
                    aria-hidden
                    className={styles.connector()}
                    data-connector={connector}
                    data-slot="stepper-connector"
                    data-state={
                      index < active ? 'stepCompleted' : 'stepInactive'
                    }
                    data-testid="stepper-connector"
                  />
                )}
              </li>
            )
          })}
        </ol>

        <div
          className={styles.panels()}
          data-slot="stepper-panels"
          ref={panelsRef}
        >
          {showCompleted ? (
            <section
              aria-label={labels.stepper.completed}
              className={cn(styles.completed())}
              data-slot="stepper-completed"
              id={`${baseId}-completed`}
            >
              {completedElement?.props.children}
            </section>
          ) : keepMounted ? (
            stepElements.map((stepEl, index) => {
              const isActiveStep = index === active
              return (
                <section
                  aria-labelledby={`${baseId}-label-${index}`}
                  className={cn(
                    styles.content(),
                    isActiveStep
                      ? 'fade-in-0 animate-in'
                      : 'pointer-events-none',
                  )}
                  data-direction={directionRef.current}
                  data-slot="stepper-content"
                  data-state={isActiveStep ? 'active' : 'inactive'}
                  hidden={!isActiveStep}
                  // biome-ignore lint/suspicious/noExplicitAny: inert is a valid HTML attribute typed loosely
                  inert={!isActiveStep ? ('' as any) : undefined}
                  key={`${baseId}-panel-${index}`}
                >
                  {stepEl.props.children}
                </section>
              )
            })
          ) : (
            stepElements[active] && (
              <section
                aria-labelledby={`${baseId}-label-${active}`}
                className={cn(
                  styles.content(),
                  'fade-in-0 animate-in',
                  directionRef.current === 'forward' &&
                    'motion-safe:slide-in-from-right-2',
                  directionRef.current === 'back' &&
                    'motion-safe:slide-in-from-left-2',
                )}
                data-direction={directionRef.current}
                data-slot="stepper-content"
                data-state="active"
                key={`${baseId}-panel-${active}`}
              >
                {stepElements[active]?.props.children}
              </section>
            )
          )}
        </div>

        {restElements.length > 0 && (
          <div
            className="stepper-actions flex items-center gap-2"
            data-slot="stepper-actions"
          >
            {restElements}
          </div>
        )}

        <span
          aria-atomic="true"
          aria-live="polite"
          className="stepper-live-region sr-only"
          id={liveMessageId}
          role="status"
        >
          {liveLabel}
        </span>
      </div>
    </StepperContext.Provider>
  )
}

function StepperStep(_props: React.PropsWithChildren<StepperStepProps>) {
  return null
}

function StepperCompleted(
  _props: React.PropsWithChildren<StepperCompletedProps>,
) {
  return null
}

function StepperPrevious({
  children,
  disabled,
  leftSection,
  loading,
  onClick,
  render,
  size,
  variant,
  ...props
}: React.PropsWithChildren<StepperPreviousProps>) {
  const labels = useLabels()
  const { active, isFirst, prev } = useStepperContext('Stepper.Previous')
  const isDisabled = disabled ?? isFirst

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (isDisabled) {
        return
      }
      onClick?.(event, active)
      prev()
    },
    [active, isDisabled, onClick, prev],
  )

  if (render) {
    return render({
      disabled: isDisabled,
      onClick: handleClick,
    })
  }

  return (
    <Button
      {...props}
      disabled={isDisabled}
      leftSection={leftSection ?? <ChevronLeft />}
      loading={loading}
      onClick={handleClick}
      size={size ?? 'md'}
      variant={variant ?? 'outline'}
    >
      {children ?? labels.stepper.previous}
    </Button>
  )
}

function StepperNext({
  children,
  disabled,
  lastChildren,
  loading,
  onClick,
  onLastClick,
  render,
  rightSection,
  size,
  variant,
  ...props
}: React.PropsWithChildren<StepperNextProps>) {
  const labels = useLabels()
  const { active, isLast, next } = useStepperContext('Stepper.Next')
  const isDisabled = disabled ?? false

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (isDisabled) {
        return
      }
      onClick?.(event, active)
      if (isLast && onLastClick) {
        onLastClick()
        return
      }
      next()
    },
    [active, isDisabled, isLast, next, onClick, onLastClick],
  )

  if (render) {
    return render({
      disabled: isDisabled,
      isLast,
      onClick: handleClick,
    })
  }

  return (
    <Button
      {...props}
      disabled={isDisabled}
      loading={loading}
      onClick={handleClick}
      rightSection={rightSection ?? (isLast ? undefined : <ChevronRight />)}
      size={size ?? 'md'}
      variant={variant ?? 'default'}
    >
      {isLast
        ? (lastChildren ?? children ?? labels.stepper.finish)
        : (children ?? labels.stepper.next)}
    </Button>
  )
}

const Stepper = Object.assign(StepperRoot, {
  Completed: StepperCompleted,
  Next: StepperNext,
  Previous: StepperPrevious,
  Step: StepperStep,
})

export { Stepper, useStepper }
