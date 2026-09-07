import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Stepper, useStepper } from './stepper'
import type {
  StepFragmentProps,
  StepperConnector,
  StepperOrientation,
} from './stepper.types'

function ThreeSteps({
  active,
  onActiveChange,
}: {
  active: number
  onActiveChange?: (next: number) => void
}) {
  return (
    <Stepper active={active} onActiveChange={onActiveChange}>
      <Stepper.Step label="Account">
        <p>Account panel</p>
      </Stepper.Step>
      <Stepper.Step label="Address">
        <p>Address panel</p>
      </Stepper.Step>
      <Stepper.Step label="Review">
        <p>Review panel</p>
      </Stepper.Step>
    </Stepper>
  )
}

describe('Stepper', () => {
  it('names the indicator list and renders one entry per step', () => {
    render(<ThreeSteps active={0} />)

    expect(
      screen.getByRole('list', {
        name: 'Stepper',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('marks only the active step as current', () => {
    render(<ThreeSteps active={1} />)

    const current = screen.getAllByRole('listitem', {
      current: 'step',
    })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Address')
  })

  it('shows only the active panel', () => {
    render(<ThreeSteps active={1} />)

    expect(screen.getByText('Address panel')).toBeInTheDocument()
    expect(screen.queryByText('Account panel')).not.toBeInTheDocument()
    expect(screen.queryByText('Review panel')).not.toBeInTheDocument()
  })

  it('announces the active step and its label in a live region', () => {
    render(<ThreeSteps active={1} />)

    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3: Address')
  })

  it('announces the position alone when the label is not a plain string', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label={<strong>Account</strong>}>
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label={<strong>Address</strong>}>
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 2')
  })

  it('renders the description beside the label', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step description="Who you are" label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.getByText('Who you are')).toBeInTheDocument()
  })

  it('renders a bare indicator when the step has no label or description', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step>
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: '1',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Account panel')).toBeInTheDocument()
  })
})

describe('Stepper.Completed', () => {
  it('takes over the panel once every step is done', () => {
    render(
      <Stepper active={2}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Completed>
          <p>All done</p>
        </Stepper.Completed>
      </Stepper>,
    )

    expect(screen.getByText('All done')).toBeInTheDocument()
    expect(screen.queryByText('Address panel')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Completed')
  })

  it('stays out of the way while a step is still active', () => {
    render(
      <Stepper active={1}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Completed>
          <p>All done</p>
        </Stepper.Completed>
      </Stepper>,
    )

    expect(screen.queryByText('All done')).not.toBeInTheDocument()
    expect(screen.getByText('Address panel')).toBeInTheDocument()
  })

  it('renders no panel when the flow runs past the last step with no completed slot', () => {
    render(<ThreeSteps active={3} />)

    expect(screen.queryByText('Review panel')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('Stepper indicator navigation', () => {
  it('delivers the index of a completed step when its indicator is clicked', async () => {
    const onActiveChange = vi.fn()
    render(<ThreeSteps active={2} onActiveChange={onActiveChange} />)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Account',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(0)
  })

  it('blocks a step that has not been reached yet', async () => {
    const onActiveChange = vi.fn()
    render(<ThreeSteps active={0} onActiveChange={onActiveChange} />)

    const future = screen.getByRole('button', {
      name: '3Review',
    })
    expect(future).toBeDisabled()
    expect(future).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(future)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('opens every indicator when allowNextStepsSelect is set', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} allowNextStepsSelect onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Step label="Review">
          <p>Review panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '3Review',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(2)
  })

  it('ignores a click on the step that is already active', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} allowNextStepsSelect onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '2Address',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('opens a single future step through allowStepClick', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step allowStepClick label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '2Address',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(1)
  })

  it('opens a single future step through the allowStepSelect alias', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step allowStepSelect label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '2Address',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(1)
  })

  it('closes a completed step when allowStepClick is false', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step allowStepClick={false} label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    const past = screen.getByRole('button', {
      name: 'Account',
    })
    expect(past).toBeDisabled()

    await userEvent.click(past)
    expect(onActiveChange).not.toHaveBeenCalled()
  })
})

describe('Stepper.Next', () => {
  it('delivers the next index', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(1)
  })

  it('passes the current step to onClick', async () => {
    const onClick = vi.fn()
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Step label="Review">
          <p>Review panel</p>
        </Stepper.Step>
        <Stepper.Next onClick={onClick} />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    )

    expect(onClick.mock.calls[0]?.[1]).toBe(1)
  })

  it('closes the flow on the last step', async () => {
    const onActiveChange = vi.fn()
    const onLastClick = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next onLastClick={onLastClick} />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Finish',
      }),
    )

    expect(onLastClick).toHaveBeenCalledTimes(1)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('advances past the last step when no onLastClick is given', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Finish',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(2)
  })

  it('takes lastChildren as its label on the last step', () => {
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next lastChildren="Finish">Continue</Stepper.Next>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Finish',
      }),
    ).toBeInTheDocument()
  })

  it('falls back to children on the last step when lastChildren is absent', () => {
    render(
      <Stepper active={0} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Next>Continue</Stepper.Next>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Continue',
      }),
    ).toBeInTheDocument()
  })

  it('blocks the advance when disabled', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next disabled />
      </Stepper>,
    )

    const next = screen.getByRole('button', {
      name: 'Next',
    })
    expect(next).toBeDisabled()

    await userEvent.click(next)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('shows a busy state and blocks the advance while loading', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next loading />
      </Stepper>,
    )

    const next = screen.getByRole('button', {
      name: 'Next',
    })
    expect(next).toHaveAttribute('aria-busy', 'true')
    expect(next).toBeDisabled()

    await userEvent.click(next)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('hands a custom trigger the slot state and the advance', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next
          render={({ disabled, isLast, onClick }) => (
            <button disabled={disabled} onClick={onClick} type="button">
              {isLast ? 'Last' : 'Go on'}
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go on',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(1)
  })

  it('keeps a custom trigger from advancing while disabled', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next
          disabled
          render={({ onClick }) => (
            <button onClick={onClick} type="button">
              Go on
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go on',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })
})

describe('Stepper.Previous', () => {
  it('delivers the previous index', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Back',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(0)
  })

  it('passes the current step to onClick', async () => {
    const onClick = vi.fn()
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous onClick={onClick} />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Back',
      }),
    )

    expect(onClick.mock.calls[0]?.[1]).toBe(1)
  })

  it('is blocked on the first step', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous />
      </Stepper>,
    )

    const previous = screen.getByRole('button', {
      name: 'Back',
    })
    expect(previous).toBeDisabled()

    await userEvent.click(previous)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('accepts an explicit disabled that overrides the first-step rule', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous disabled />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Back',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('takes its label from children', () => {
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous>Back</Stepper.Previous>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Back',
      }),
    ).toBeInTheDocument()
  })

  it('hands a custom trigger the slot state and the step back', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous
          render={({ disabled, onClick }) => (
            <button disabled={disabled} onClick={onClick} type="button">
              Go back
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go back',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(0)
  })

  it('keeps a custom trigger from stepping back on the first step', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={0} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous
          render={({ onClick }) => (
            <button onClick={onClick} type="button">
              Go back
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go back',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })
})

function StepperProbe() {
  const { active, goTo, isFirst, isLast, isStepActive, isStepCompleted } =
    useStepper()

  return (
    <div>
      <span>
        active {active} first {String(isFirst)} last {String(isLast)} zeroActive{' '}
        {String(isStepActive(0))} zeroDone {String(isStepCompleted(0))}
      </span>
      <button onClick={() => goTo(0)} type="button">
        Jump to first
      </button>
      <button onClick={() => goTo(active)} type="button">
        Jump to self
      </button>
    </div>
  )
}

describe('useStepper', () => {
  it('reports the flow position to a consumer', () => {
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <StepperProbe />
      </Stepper>,
    )

    expect(
      screen.getByText(
        'active 1 first false last true zeroActive false zeroDone true',
      ),
    ).toBeInTheDocument()
  })

  it('delivers the requested step through goTo', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <StepperProbe />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Jump to first',
      }),
    )

    expect(onActiveChange).toHaveBeenCalledWith(0)
  })

  it('stays quiet when goTo targets the active step', async () => {
    const onActiveChange = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <StepperProbe />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Jump to self',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('refuses to work outside a Stepper', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => render(<StepperProbe />)).toThrow(
      'useStepper must be rendered inside <Stepper>.',
    )

    consoleError.mockRestore()
  })

  it('refuses to mount Stepper.Next outside a Stepper', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => render(<Stepper.Next />)).toThrow(
      'Stepper.Next must be rendered inside <Stepper>.',
    )

    consoleError.mockRestore()
  })

  it('refuses to mount Stepper.Previous outside a Stepper', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => render(<Stepper.Previous />)).toThrow(
      'Stepper.Previous must be rendered inside <Stepper>.',
    )

    consoleError.mockRestore()
  })
})

function StateTag({ state, step }: StepFragmentProps) {
  return (
    <span>
      {state}-{step}
    </span>
  )
}

describe('Stepper indicator content', () => {
  it('numbers the indicators when no icon is given', () => {
    render(<ThreeSteps active={0} />)

    expect(
      screen.getByRole('button', {
        name: '2Address',
      }),
    ).toBeInTheDocument()
  })

  it('replaces the number with a root icon node', () => {
    render(
      <Stepper active={0} icon={<span>dot</span>}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'dotAddress',
      }),
    ).toBeInTheDocument()
  })

  it('falls back to the number when the icon is null', () => {
    render(
      <Stepper active={0} icon={null}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: '1Account',
      }),
    ).toBeInTheDocument()
  })

  it('hands a component icon the step index and its state', () => {
    render(
      <Stepper active={0} icon={StateTag}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'stepProgress-0Account',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'stepInactive-1Address',
      }),
    ).toBeInTheDocument()
  })

  it('lets a step override the root icon', () => {
    render(
      <Stepper active={0} icon={<span>dot</span>}>
        <Stepper.Step icon={<span>star</span>} label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'starAccount',
      }),
    ).toBeInTheDocument()
  })

  it('swaps the indicator for completedIcon once the step is behind', () => {
    render(
      <Stepper active={1} completedIcon={<span>ok</span>}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'okAccount',
      }),
    ).toBeInTheDocument()
  })

  it('lets a step override completedIcon', () => {
    render(
      <Stepper active={1} completedIcon={<span>ok</span>}>
        <Stepper.Step completedIcon={StateTag} label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'stepCompleted-0Account',
      }),
    ).toBeInTheDocument()
  })

  it('shows the progress indicator on a loading step', () => {
    render(
      <Stepper active={0} progressIcon={<span>working</span>}>
        <Stepper.Step label="Account" loading>
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'workingAccount',
      }),
    ).toBeInTheDocument()
  })

  it('lets a step override progressIcon', () => {
    render(
      <Stepper active={0} progressIcon={<span>working</span>}>
        <Stepper.Step label="Account" loading progressIcon={StateTag}>
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'stepProgress-0Account',
      }),
    ).toBeInTheDocument()
  })

  it('keeps the default indicator when a loading step has no progressIcon', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label="Account" loading>
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Account',
      }),
    ).toBeInTheDocument()
  })

  it('keeps the indicator reachable when iconSize is overridden', () => {
    render(
      <Stepper active={0} iconSize={40}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: '1Account',
      }),
    ).toBeInTheDocument()
  })
})

describe('Stepper keepMounted', () => {
  it('keeps every panel in the DOM and hides the inactive ones', () => {
    render(
      <Stepper active={0} keepMounted>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.getByText('Account panel')).toBeVisible()
    expect(screen.getByText('Address panel')).toBeInTheDocument()
    expect(screen.getByText('Address panel')).not.toBeVisible()
  })

  it('still gives the completed slot the whole panel area', () => {
    render(
      <Stepper active={2} keepMounted>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Completed>
          <p>All done</p>
        </Stepper.Completed>
      </Stepper>,
    )

    expect(screen.getByText('All done')).toBeInTheDocument()
    expect(screen.queryByText('Account panel')).not.toBeInTheDocument()
  })
})

describe('Stepper transitions', () => {
  it('swaps the panel when the flow moves forward and back again', () => {
    const { rerender } = render(<ThreeSteps active={0} />)
    expect(screen.getByText('Account panel')).toBeInTheDocument()

    rerender(<ThreeSteps active={1} />)
    expect(screen.getByText('Address panel')).toBeInTheDocument()
    expect(screen.queryByText('Account panel')).not.toBeInTheDocument()

    rerender(<ThreeSteps active={0} />)
    expect(screen.getByText('Account panel')).toBeInTheDocument()
    expect(screen.queryByText('Address panel')).not.toBeInTheDocument()
  })

  it('moves focus into the new panel when autoFocus is set', async () => {
    function Flow({ active }: { active: number }) {
      return (
        <Stepper active={active} autoFocus>
          <Stepper.Step label="Account">
            <h2 tabIndex={-1}>Account heading</h2>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <h2 tabIndex={-1}>Address heading</h2>
          </Stepper.Step>
        </Stepper>
      )
    }

    const { rerender } = render(<Flow active={0} />)
    rerender(<Flow active={1} />)

    await waitFor(() => {
      expect(screen.getByText('Address heading')).toHaveFocus()
    })
  })

  it('leaves focus alone when it travels backwards', async () => {
    function Flow({ active }: { active: number }) {
      return (
        <Stepper active={active} autoFocus>
          <Stepper.Step label="Account">
            <h2 tabIndex={-1}>Account heading</h2>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <h2 tabIndex={-1}>Address heading</h2>
          </Stepper.Step>
        </Stepper>
      )
    }

    const { rerender } = render(<Flow active={1} />)
    rerender(<Flow active={0} />)

    expect(screen.getByText('Account heading')).not.toHaveFocus()
  })

  it('does nothing when the panel it should focus holds no heading', async () => {
    function Flow({ active }: { active: number }) {
      return (
        <Stepper active={active} autoFocus>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
        </Stepper>
      )
    }

    const { rerender } = render(<Flow active={0} />)
    rerender(<Flow active={1} />)

    await waitFor(() => {
      expect(screen.getByText('Address panel')).toBeInTheDocument()
    })
    expect(document.body).toHaveFocus()
  })
})

describe.each(['horizontal', 'vertical'] as const)(
  'Stepper orientation %s',
  (orientation) => {
    it('keeps every step reachable', () => {
      render(
        <Stepper active={0} orientation={orientation}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(screen.getByTestId('stepper-root')).toHaveAttribute(
        'data-orientation',
        orientation,
      )
    })
  },
)

describe.each(['sm', 'md', 'lg'] as const)('Stepper size %s', (size) => {
  it('keeps every step reachable', () => {
    render(
      <Stepper active={0} size={size}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: '1Account',
      }),
    ).toBeInTheDocument()
  })
})

describe.each(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
  'Stepper radius %s',
  (radius) => {
    it('keeps every step reachable', () => {
      render(
        <Stepper active={0} radius={radius}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      expect(
        screen.getByRole('button', {
          name: '1Account',
        }),
      ).toBeInTheDocument()
    })
  },
)

describe.each(['numbered', 'dotted', 'icon'] as const)(
  'Stepper variant %s',
  (variant) => {
    it('keeps every step reachable', () => {
      render(
        <Stepper active={0} variant={variant}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })
  },
)

describe.each(['left', 'right'] as const)(
  'Stepper iconPosition %s',
  (iconPosition) => {
    it('keeps every step reachable', () => {
      render(
        <Stepper active={0} iconPosition={iconPosition}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })
  },
)

describe.each([true, false])('Stepper wrap %s', (wrap) => {
  it('keeps every step reachable', () => {
    render(
      <Stepper active={0} wrap={wrap}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })
})

describe('Stepper labels', () => {
  it('announces the position with the sentence the provider carries', () => {
    render(
      <TuryProvider
        labels={{
          stepper: {
            step: (active, total) => `Etapa ${active} de ${total}`,
          },
        }}
      >
        <ThreeSteps active={1} />
      </TuryProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Etapa 2 de 3: Address',
    )
  })

  it('announces the completed state from the provider', () => {
    render(
      <TuryProvider
        labels={{
          stepper: {
            completed: 'Concluído',
          },
        }}
      >
        <Stepper active={1}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Completed>
            <p>All done</p>
          </Stepper.Completed>
        </Stepper>
      </TuryProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Concluído')
  })

  it('takes the navigation actions from the provider', () => {
    render(
      <TuryProvider
        labels={{
          stepper: {
            next: 'Avançar',
            previous: 'Voltar',
          },
        }}
      >
        <Stepper active={0}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
          <Stepper.Previous />
          <Stepper.Next />
        </Stepper>
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Voltar',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Avançar',
      }),
    ).toBeInTheDocument()
  })

  it('takes the last-step action from the provider', () => {
    render(
      <TuryProvider
        labels={{
          stepper: {
            finish: 'Concluir',
          },
        }}
      >
        <Stepper active={1}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
          <Stepper.Next />
        </Stepper>
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Concluir',
      }),
    ).toBeInTheDocument()
  })

  it('keeps children ahead of the provider', () => {
    render(
      <TuryProvider
        labels={{
          stepper: {
            next: 'Avançar',
            previous: 'Voltar',
          },
        }}
      >
        <Stepper active={0}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
          <Stepper.Previous>Go back</Stepper.Previous>
          <Stepper.Next>Carry on</Stepper.Next>
        </Stepper>
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Go back',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Carry on',
      }),
    ).toBeInTheDocument()
  })
})

describe('Stepper panel labelling', () => {
  it('labels the active panel with its own step trigger', () => {
    render(<ThreeSteps active={1} />)

    expect(
      screen.getByRole('region', {
        name: '2Address',
      }),
    ).toBeInTheDocument()
  })

  it('labels every mounted panel when keepMounted is set', () => {
    render(
      <Stepper active={0} keepMounted>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('region', {
        name: '1Account',
      }),
    ).toBeInTheDocument()
  })

  it('names the completed section', () => {
    render(
      <Stepper active={1}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Completed>
          <p>All done</p>
        </Stepper.Completed>
      </Stepper>,
    )

    expect(
      screen.getByRole('region', {
        name: 'Completed',
      }),
    ).toBeInTheDocument()
  })
})

describe('Stepper active indicator', () => {
  it('keeps the active step out of the disabled state', () => {
    render(<ThreeSteps active={1} />)

    const current = screen.getByRole('button', {
      name: '2Address',
    })

    expect(current).toBeEnabled()
    expect(current).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('reports no change when the active indicator is clicked', async () => {
    const onActiveChange = vi.fn()
    render(<ThreeSteps active={1} onActiveChange={onActiveChange} />)

    await userEvent.click(
      screen.getByRole('button', {
        name: '2Address',
      }),
    )

    expect(onActiveChange).not.toHaveBeenCalled()
  })
})

describe('Stepper variant dotted', () => {
  it('leaves the indicator empty so nothing spills out of the dot', () => {
    render(
      <Stepper active={0} variant="dotted">
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Account',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: '1Account',
      }),
    ).not.toBeInTheDocument()
  })
})

describe('Stepper button sections', () => {
  it('keeps the left section given to Previous', () => {
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous leftSection={<span>back-icon</span>} />
      </Stepper>,
    )

    expect(screen.getByText('back-icon')).toBeInTheDocument()
  })

  it('keeps the right section given to Next', () => {
    render(
      <Stepper active={0} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next rightSection={<span>next-icon</span>} />
      </Stepper>,
    )

    expect(screen.getByText('next-icon')).toBeInTheDocument()
  })
})

describe('Stepper render prop callbacks', () => {
  it('reports the current step through a custom Next trigger', async () => {
    const onClick = vi.fn()
    render(
      <Stepper active={0} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next
          onClick={onClick}
          render={({ onClick: advance }) => (
            <button onClick={advance} type="button">
              Go on
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go on',
      }),
    )

    expect(onClick.mock.calls[0]?.[1]).toBe(0)
  })

  it('hands the last step to onLastClick through a custom Next trigger', async () => {
    const onActiveChange = vi.fn()
    const onLastClick = vi.fn()
    render(
      <Stepper active={1} onActiveChange={onActiveChange}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Next
          onLastClick={onLastClick}
          render={({ onClick }) => (
            <button onClick={onClick} type="button">
              Finish it
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Finish it',
      }),
    )

    expect(onLastClick).toHaveBeenCalledTimes(1)
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('reports the current step through a custom Previous trigger', async () => {
    const onClick = vi.fn()
    render(
      <Stepper active={1} onActiveChange={vi.fn()}>
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
        <Stepper.Previous
          onClick={onClick}
          render={({ onClick: goBack }) => (
            <button onClick={goBack} type="button">
              Go back
            </button>
          )}
        />
      </Stepper>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go back',
      }),
    )

    expect(onClick.mock.calls[0]?.[1]).toBe(1)
  })
})

describe.each(['line', 'dashed'] as StepperConnector[])(
  'Stepper connector %s',
  (connector) => {
    it('draws one connector between each pair of steps', () => {
      render(
        <Stepper active={0} connector={connector}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
          <Stepper.Step label="Review">
            <p>Review panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      const connectors = screen.getAllByTestId('stepper-connector')
      expect(connectors).toHaveLength(2)
      for (const rule of connectors) {
        expect(rule).toHaveAttribute('data-connector', connector)
      }
    })

    it.each(['horizontal', 'vertical'] as StepperOrientation[])(
      'draws it in the %s orientation too',
      (orientation) => {
        render(
          <Stepper active={0} connector={connector} orientation={orientation}>
            <Stepper.Step label="Account">
              <p>Account panel</p>
            </Stepper.Step>
            <Stepper.Step label="Address">
              <p>Address panel</p>
            </Stepper.Step>
          </Stepper>,
        )

        expect(screen.getAllByTestId('stepper-connector')).toHaveLength(1)
        expect(screen.getByTestId('stepper-root')).toHaveAttribute(
          'data-orientation',
          orientation,
        )
      },
    )

    it('keeps the connector out of the accessibility tree', () => {
      render(
        <Stepper active={0} connector={connector}>
          <Stepper.Step label="Account">
            <p>Account panel</p>
          </Stepper.Step>
          <Stepper.Step label="Address">
            <p>Address panel</p>
          </Stepper.Step>
        </Stepper>,
      )

      expect(screen.getByTestId('stepper-connector')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
    })
  },
)

describe('Stepper connector', () => {
  it('draws a line between the steps when nothing is asked for', () => {
    render(<ThreeSteps active={0} />)

    const connectors = screen.getAllByTestId('stepper-connector')
    expect(connectors).toHaveLength(2)
    expect(connectors[0]).toHaveAttribute('data-connector', 'line')
  })

  it('draws nothing when the connector is none', () => {
    render(
      <Stepper active={0} connector="none">
        <Stepper.Step label="Account">
          <p>Account panel</p>
        </Stepper.Step>
        <Stepper.Step label="Address">
          <p>Address panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.queryAllByTestId('stepper-connector')).toHaveLength(0)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('never draws a connector after the last step', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label="Only">
          <p>Only panel</p>
        </Stepper.Step>
      </Stepper>,
    )

    expect(screen.queryAllByTestId('stepper-connector')).toHaveLength(0)
  })

  it('marks the connectors the user already walked past as completed', () => {
    render(<ThreeSteps active={2} />)

    const connectors = screen.getAllByTestId('stepper-connector')
    expect(connectors.map((rule) => rule.getAttribute('data-state'))).toEqual([
      'stepCompleted',
      'stepCompleted',
    ])
  })

  it('leaves the connectors ahead of the active step inactive', () => {
    render(<ThreeSteps active={0} />)

    const connectors = screen.getAllByTestId('stepper-connector')
    expect(connectors.map((rule) => rule.getAttribute('data-state'))).toEqual([
      'stepInactive',
      'stepInactive',
    ])
  })
})
