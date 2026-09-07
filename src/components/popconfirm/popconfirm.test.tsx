import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'

import { Popconfirm } from './popconfirm'
import type { PopconfirmSimpleProps } from './popconfirm.types'

function Example(props: Partial<PopconfirmSimpleProps> = {}) {
  return (
    <Popconfirm title="Delete this booking?" {...props}>
      <Button>Delete</Button>
    </Popconfirm>
  )
}

describe('Popconfirm', () => {
  it('asks only once the control is pressed', async () => {
    render(<Example />)

    expect(screen.queryByTestId('popconfirm')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(await screen.findByTestId('popconfirm-title')).toHaveTextContent(
      'Delete this booking?',
    )
  })

  it('runs the action and closes on confirm', async () => {
    const onConfirm = vi.fn()

    render(<Example onConfirm={onConfirm} />)

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await userEvent.click(await screen.findByTestId('popconfirm-confirm'))

    expect(onConfirm).toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.queryByTestId('popconfirm')).not.toBeInTheDocument(),
    )
  })

  it('runs nothing when the reader backs out', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(<Example onCancel={onCancel} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await userEvent.click(await screen.findByTestId('popconfirm-cancel'))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('stays open with the reason when the action is refused', async () => {
    render(
      <Example
        onConfirm={() => Promise.reject(new Error('Already invoiced'))}
      />,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await userEvent.click(await screen.findByTestId('popconfirm-confirm'))

    expect(await screen.findByTestId('popconfirm-error')).toHaveTextContent(
      'Already invoiced',
    )
    expect(screen.getByTestId('popconfirm')).toBeInTheDocument()
  })

  it('takes the wording and the button style from the caller', async () => {
    render(
      <Example
        cancelText="Keep"
        confirmProps={{
          variant: 'destructive',
        }}
        confirmText="Delete it"
      />,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(await screen.findByTestId('popconfirm-confirm')).toHaveTextContent(
      'Delete it',
    )
    expect(screen.getByTestId('popconfirm-cancel')).toHaveTextContent('Keep')
  })

  it('blocks the confirm until the typed text matches, then hands it over', async () => {
    const onConfirm = vi.fn()

    render(
      <Popconfirm
        confirmationValue="acme-prod"
        mode="typed"
        onConfirm={onConfirm}
        title="Delete this project?"
      >
        <Button>Delete</Button>
      </Popconfirm>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    const field = await screen.findByTestId('confirm-typed-field')

    expect(screen.getByTestId('popconfirm-confirm')).toBeDisabled()
    expect(field).toHaveAttribute('placeholder', 'acme-prod')

    await userEvent.type(field, 'acme-prod')

    expect(screen.getByTestId('popconfirm-confirm')).toBeEnabled()

    await userEvent.click(screen.getByTestId('popconfirm-confirm'))

    expect(onConfirm).toHaveBeenCalledWith('acme-prod')
  })

  it('places a placeholder on the password field', async () => {
    render(
      <Popconfirm mode="password" title="Confirm with your password">
        <Button>Delete</Button>
      </Popconfirm>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(await screen.findByTestId('confirm-password-field')).toHaveAttribute(
      'placeholder',
      'Your password',
    )
  })

  it('blocks the confirm until the statement is ticked', async () => {
    const onConfirm = vi.fn()

    render(
      <Popconfirm
        acknowledgement="I understand this cannot be undone"
        mode="acknowledge"
        onConfirm={onConfirm}
        title="Delete this booking?"
      >
        <Button>Delete</Button>
      </Popconfirm>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await screen.findByTestId('popconfirm-challenge')

    expect(screen.getByTestId('popconfirm-confirm')).toBeDisabled()

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'I understand this cannot be undone',
      }),
    )

    expect(screen.getByTestId('popconfirm-confirm')).toBeEnabled()

    await userEvent.click(screen.getByTestId('popconfirm-confirm'))

    expect(onConfirm).toHaveBeenCalled()
  })

  it('drops what a challenge collected when it closes', async () => {
    render(
      <Popconfirm
        confirmationValue="acme-prod"
        mode="typed"
        title="Delete this project?"
      >
        <Button>Delete</Button>
      </Popconfirm>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await userEvent.type(
      await screen.findByTestId('confirm-typed-field'),
      'acme',
    )
    await userEvent.click(screen.getByTestId('popconfirm-cancel'))

    await waitFor(() =>
      expect(screen.queryByTestId('popconfirm')).not.toBeInTheDocument(),
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(await screen.findByTestId('confirm-typed-field')).toHaveValue('')
  })

  it('keeps itself open with the reason when the action refuses', async () => {
    render(
      <Example
        onConfirm={() => {
          throw new Error('The booking is already paid')
        }}
      />,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))
    await userEvent.click(await screen.findByTestId('popconfirm-confirm'))

    expect(await screen.findByTestId('popconfirm-error')).toHaveTextContent(
      'The booking is already paid',
    )
    expect(screen.getByTestId('popconfirm')).toBeInTheDocument()
  })

  it('spins and stays open until the promise settles, then closes', async () => {
    let settle: (() => void) | undefined
    const user = userEvent.setup()

    render(
      <Example
        onConfirm={() =>
          new Promise<void>((resolve) => {
            settle = resolve
          })
        }
      />,
    )

    await user.click(screen.getByTestId('popover-trigger'))
    await user.click(await screen.findByTestId('popconfirm-confirm'))

    // In flight: the button reports busy and the popover is still up.
    expect(screen.getByTestId('popconfirm-confirm')).toBeDisabled()
    expect(screen.getByTestId('popconfirm')).toBeInTheDocument()

    settle?.()

    await waitFor(() =>
      expect(screen.queryByTestId('popconfirm')).not.toBeInTheDocument(),
    )
  })

  it('refuses a second press while the first is still running', async () => {
    const onConfirm = vi.fn(() => new Promise<void>(() => undefined))
    const user = userEvent.setup()

    render(<Example onConfirm={onConfirm} />)

    await user.click(screen.getByTestId('popover-trigger'))

    const confirm = await screen.findByTestId('popconfirm-confirm')

    await user.click(confirm)
    await user.click(confirm)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
