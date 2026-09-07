import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Label } from './label'

describe('Label', () => {
  it('names the input it points at', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('adds the required indicator to the name it gives the input', () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email*')).toBeInTheDocument()
  })

  it('adds the optional hint to the name it gives the input', () => {
    render(
      <>
        <Label htmlFor="email" optional>
          Email
        </Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email(optional)')).toBeInTheDocument()
  })

  it('shows neither indicator by default', () => {
    render(<Label>Email</Label>)

    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()
  })

  it('exposes the disabled state on the label', () => {
    render(<Label disabled>Email</Label>)

    expect(screen.getByTestId('label-root')).toHaveAttribute('data-disabled')
  })

  it('leaves the disabled state off when enabled', () => {
    render(<Label>Email</Label>)

    expect(screen.getByTestId('label-root')).not.toHaveAttribute(
      'data-disabled',
    )
  })

  it('reveals the tooltip content on hover when given a tooltip', async () => {
    render(<Label tooltip="We will not share it">Email</Label>)

    await userEvent.hover(screen.getByTestId('tooltip-trigger'))

    expect(await screen.findByText('We will not share it')).toBeInTheDocument()
  })

  it('reaches the tooltip icon by the handle the label gives it', () => {
    render(<Label tooltip="We will not share it">Email</Label>)

    expect(screen.getByTestId('label-tooltip-icon')).toBeInTheDocument()
  })

  it('renders no tooltip trigger without a tooltip', () => {
    render(<Label>Email</Label>)

    expect(screen.queryByTestId('tooltip-trigger')).not.toBeInTheDocument()
  })

  it('keeps the label reachable when every option is on at once', () => {
    render(
      <>
        <Label htmlFor="email" optional required tooltip="Hint">
          Email
        </Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email*(optional)')).toBeInTheDocument()
  })
})

describe('Label labels', () => {
  it('takes the optional hint from the provider', () => {
    render(
      <TuryProvider
        labels={{
          common: {
            optional: '(opcional)',
          },
        }}
      >
        <Label htmlFor="email" optional>
          Email
        </Label>
        <input id="email" />
      </TuryProvider>,
    )

    expect(screen.getByLabelText('Email(opcional)')).toBeInTheDocument()
  })
})
