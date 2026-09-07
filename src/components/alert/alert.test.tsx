import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'

import { Alert } from './alert'

describe('Alert', () => {
  it('announces itself with its title and its message', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
        <Alert.Description>Your changes are stored.</Alert.Description>
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Saved')
    expect(alert).toHaveTextContent('Your changes are stored.')
  })

  it('carries the icon and the action slot beside the message', () => {
    render(
      <Alert>
        <Alert.Icon>
          <span>!</span>
        </Alert.Icon>
        <Alert.Title>Failed</Alert.Title>
        <Alert.Action>
          <button type="button">Retry</button>
        </Alert.Action>
      </Alert>,
    )

    expect(screen.getByText('!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('offers no close button unless it is closable', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })

  it('names its close button and marks itself closing when it is pressed', async () => {
    const onClose = vi.fn()
    render(
      <Alert closable onClose={onClose}>
        <Alert.Title>Saved</Alert.Title>
        <Alert.Action>
          <button type="button">Retry</button>
        </Alert.Action>
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).not.toHaveAttribute('data-closing')

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByRole('alert')).toHaveAttribute('data-closing', 'true')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('leaves the screen and reports the close once the closing ends', async () => {
    const onClose = vi.fn()
    render(
      <Alert closable onClose={onClose}>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).not.toHaveBeenCalled()

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes without an onClose attached', async () => {
    render(
      <Alert closable>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByRole('alert')).toHaveAttribute('data-closing', 'true')
  })
})

describe.each(['default', 'destructive'] as const)(
  'Alert variant %s',
  (variant) => {
    it('still announces every section it was given', () => {
      render(
        <Alert variant={variant}>
          <Alert.Icon>
            <span>!</span>
          </Alert.Icon>
          <Alert.Title>Failed</Alert.Title>
          <Alert.Description>Try again later.</Alert.Description>
          <Alert.Action>
            <span>later</span>
          </Alert.Action>
        </Alert>,
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Failed')
      expect(alert).toHaveTextContent('Try again later.')
      expect(alert).toHaveTextContent('later')
    })
  },
)

describe('Alert layout', () => {
  it('gives the action its own column instead of floating it over the text', () => {
    render(
      <Alert>
        <Alert.Title>Sync paused</Alert.Title>
        <Alert.Description>
          Nothing has been lost — pick it up whenever you like.
        </Alert.Description>
        <Alert.Action>
          <Button size="sm">Resume the synchronisation now</Button>
        </Alert.Action>
      </Alert>,
    )

    const action = screen.getByTestId('alert-action')

    // Absolute + a fixed pr-18 reservation is what let a wide control spill
    // left over the description. A column cannot overlap its neighbour.
    expect(action).not.toHaveClass('absolute')
    expect(action).toHaveClass('col-start-3')
    expect(screen.getByTestId('alert-root')).not.toHaveClass('pr-18')
    expect(screen.getByTestId('alert-description')).toHaveClass('col-start-2')
  })

  it('keeps the close button clear of the action', () => {
    render(
      <Alert closable>
        <Alert.Title>Sync paused</Alert.Title>
        <Alert.Action>
          <Button size="sm">Resume</Button>
        </Alert.Action>
      </Alert>,
    )

    // Both used to be pinned to top-2 right-2, so they stacked on each other.
    expect(screen.getByTestId('alert-action')).toHaveClass('col-start-3')
    expect(screen.getByTestId('alert-close')).toHaveClass('col-start-4')
  })
})
