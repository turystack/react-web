import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Confirm } from './confirm'

beforeAll(() => {
  // input-otp resolves the caret position from a timer that calls
  // `document.elementFromPoint`, which jsdom does not implement; without it the
  // very first focus throws asynchronously and fails the whole run.
  document.elementFromPoint = () => null
})

function deferred() {
  let settle = () => {}
  const promise = new Promise<void>((resolve) => {
    settle = resolve
  })

  return {
    promise,
    settle,
  }
}

function confirmButton(name = 'Confirm') {
  return screen.getByRole('button', {
    name,
  })
}

describe('Confirm', () => {
  it('presents the question as an alert dialog', () => {
    render(
      <Confirm description="This cannot be undone." open title="Delete?" />,
    )

    const dialog = screen.getByRole('alertdialog', {
      name: 'Delete?',
      description: 'This cannot be undone.',
    })

    expect(dialog).toBeInTheDocument()
  })

  it('offers a confirm and a cancel action by default', () => {
    render(<Confirm description="d" open title="t" />)

    expect(confirmButton()).toBeInTheDocument()
    expect(confirmButton('Cancel')).toBeInTheDocument()
  })

  it('renders nothing while it is closed', () => {
    render(<Confirm description="d" open={false} title="t" />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('takes the wording it is given for both actions', () => {
    render(
      <Confirm
        cancelText="Keep it"
        confirmText="Delete it"
        description="d"
        open
        title="t"
      />,
    )

    expect(confirmButton('Delete it')).toBeInTheDocument()
    expect(confirmButton('Keep it')).toBeInTheDocument()
  })

  it('runs onConfirm and closes on the confirm action', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <Confirm
        description="d"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('waits for an async confirm to settle before it closes', async () => {
    const { promise, settle } = deferred()
    const onConfirm = vi.fn(() => promise)
    const onClose = vi.fn()
    render(
      <Confirm
        description="d"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.click(confirmButton())
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => {
      settle()
      await promise
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('reaches each action by the handle the dialog gives it', () => {
    render(<Confirm description="d" open title="t" />)

    expect(screen.getByTestId('confirm-action')).toBe(confirmButton())
    expect(screen.getByTestId('confirm-cancel')).toBe(confirmButton('Cancel'))
  })

  it('runs onCancel and closes on the cancel action', async () => {
    const onCancel = vi.fn()
    const onClose = vi.fn()
    render(
      <Confirm
        description="d"
        onCancel={onCancel}
        onClose={onClose}
        open
        title="t"
      />,
    )

    await userEvent.click(confirmButton('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes even when nothing is listening for the cancel', async () => {
    render(<Confirm description="d" open title="t" />)

    await userEvent.click(confirmButton('Cancel'))

    expect(confirmButton('Cancel')).toBeInTheDocument()
  })

  it('confirms even when nothing is listening', async () => {
    render(<Confirm description="d" open title="t" />)

    await userEvent.click(confirmButton())

    expect(confirmButton()).not.toBeDisabled()
  })

  it('shows the confirm action working and blocks a second run', async () => {
    const { promise, settle } = deferred()
    const onConfirm = vi.fn(() => promise)
    render(<Confirm description="d" onConfirm={onConfirm} open title="t" />)

    await userEvent.click(confirmButton())

    expect(confirmButton()).toHaveAttribute('aria-busy', 'true')
    expect(confirmButton()).toBeDisabled()

    await userEvent.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await act(async () => {
      settle()
      await promise
    })

    expect(confirmButton()).toHaveAttribute('aria-busy', 'false')
    expect(confirmButton()).toBeEnabled()
  })

  it('shows the cancel action working and blocks a second run', async () => {
    const { promise, settle } = deferred()
    const onCancel = vi.fn(() => promise)
    render(<Confirm description="d" onCancel={onCancel} open title="t" />)

    await userEvent.click(confirmButton('Cancel'))

    expect(confirmButton('Cancel')).toHaveAttribute('aria-busy', 'true')
    expect(confirmButton('Cancel')).toBeDisabled()

    await userEvent.click(confirmButton('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await act(async () => {
      settle()
      await promise
    })

    expect(confirmButton('Cancel')).toBeEnabled()
  })

  it('lets the confirm action be renamed for assistive technology', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        confirmProps={{
          ariaLabel: 'Delete this booking',
          variant: 'destructive',
        }}
        description="d"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.click(confirmButton('Delete this booking'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('lets the cancel action be renamed for assistive technology', async () => {
    const onCancel = vi.fn()
    render(
      <Confirm
        cancelProps={{
          ariaLabel: 'Keep this booking',
          variant: 'ghost',
        }}
        description="d"
        onCancel={onCancel}
        open
        title="t"
      />,
    )

    await userEvent.click(confirmButton('Keep this booking'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not report a close when the caller opens it', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Confirm description="d" onClose={onClose} open={false} title="t" />,
    )

    rerender(<Confirm description="d" onClose={onClose} open title="t" />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('reports the close when the dialog is dismissed with Escape', async () => {
    const onClose = vi.fn()
    render(<Confirm description="d" onClose={onClose} open title="t" />)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays open when the surface behind the actions is clicked', async () => {
    const onClose = vi.fn()
    render(<Confirm description="d" onClose={onClose} open title="t" />)

    await userEvent.click(screen.getByTestId('confirm-popup'))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on an overlay click', async () => {
    const onClose = vi.fn()
    render(<Confirm description="d" onClose={onClose} open title="t" />)

    await userEvent.click(screen.getByTestId('confirm-backdrop'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on an overlay click with nothing listening', async () => {
    render(<Confirm description="d" open title="t" />)

    await userEvent.click(screen.getByTestId('confirm-backdrop'))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})

describe('Confirm inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the alert dialog inside the named container', () => {
    render(
      <TuryProvider portalContainer={container}>
        <Confirm
          description="This cannot be undone"
          open
          title="Delete order"
        />
      </TuryProvider>,
    )

    expect(container).toContainElement(screen.getByRole('alertdialog'))
  })

  it('leaves the alert dialog on the body when no container is named', () => {
    render(
      <TuryProvider>
        <Confirm
          description="This cannot be undone"
          open
          title="Delete order"
        />
      </TuryProvider>,
    )

    expect(container).not.toContainElement(screen.getByRole('alertdialog'))
  })
})

describe('Confirm with a blast radius', () => {
  it('renders what the action will hit under the description', () => {
    render(
      <Confirm
        content={
          <ul>
            <li>3 bookings</li>
            <li>1 payout</li>
          </ul>
        }
        description="This cannot be undone."
        open
        title="Delete?"
      />,
    )

    const slot = screen.getByTestId('confirm-content')
    expect(slot).toHaveTextContent('3 bookings')
    expect(slot).toHaveTextContent('1 payout')

    const position = screen
      .getByTestId('confirm-description')
      .compareDocumentPosition(slot)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('leaves the slot out when the caller names no blast radius', () => {
    render(<Confirm description="d" open title="t" />)

    expect(screen.queryByTestId('confirm-content')).not.toBeInTheDocument()
  })
})

describe('Confirm in simple mode', () => {
  it('asks for nothing beyond the answer', () => {
    render(<Confirm description="d" open title="t" />)

    expect(screen.queryByTestId('confirm-challenge')).not.toBeInTheDocument()
    expect(screen.queryByTestId('confirm-blocked')).not.toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()
  })

  it('hands nothing to onConfirm', async () => {
    const onConfirm = vi.fn()
    render(<Confirm description="d" onConfirm={onConfirm} open title="t" />)

    await userEvent.click(confirmButton())

    expect(onConfirm.mock.calls[0]).toEqual([])
  })

  it('still honours a confirm button the caller disabled itself', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        confirmProps={{
          disabled: true,
        }}
        description="d"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    expect(confirmButton()).toBeDisabled()

    await userEvent.click(confirmButton())
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe('Confirm in typed mode', () => {
  function typedField() {
    return screen.getByLabelText('Type acme-prod to confirm')
  }

  it('blocks the confirm action until the text matches exactly', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    expect(confirmButton()).toBeDisabled()

    await userEvent.click(confirmButton())
    expect(onConfirm).not.toHaveBeenCalled()

    await userEvent.type(typedField(), 'acme')
    expect(confirmButton()).toBeDisabled()

    await userEvent.type(typedField(), '-prod')
    expect(confirmButton()).toBeEnabled()
  })

  it('hands the typed text to onConfirm as a string', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(typedField(), 'acme-prod')
    await userEvent.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith('acme-prod')
    expect(typeof onConfirm.mock.calls[0][0]).toBe('string')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('cancels without confirming even once the text matches', async () => {
    const onCancel = vi.fn()
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        onCancel={onCancel}
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(typedField(), 'acme-prod')
    await userEvent.click(confirmButton('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('opens with the focus already in the field', async () => {
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        open
        title="t"
      />,
    )

    await waitFor(() => expect(typedField()).toHaveFocus())
  })

  it('says why the confirm action is blocked, within keyboard reach', () => {
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        open
        title="t"
      />,
    )

    const reason = 'Type acme-prod exactly to continue.'
    expect(screen.getByTestId('confirm-hint')).toHaveTextContent(reason)
    expect(typedField()).toHaveAccessibleDescription(reason)

    const host = screen.getByTestId('confirm-blocked')
    expect(host).toHaveAttribute('tabindex', '0')
    expect(host).toHaveAccessibleDescription(reason)
  })

  it('drops the reason once the challenge is satisfied', async () => {
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        open
        title="t"
      />,
    )

    await userEvent.type(typedField(), 'acme-prod')

    expect(screen.queryByTestId('confirm-hint')).not.toBeInTheDocument()
    expect(screen.queryByTestId('confirm-blocked')).not.toBeInTheDocument()
    expect(typedField()).not.toHaveAccessibleDescription()
  })

  it('confirms on Enter once the text matches, and not before', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        confirmationValue="acme-prod"
        description="d"
        mode="typed"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(typedField(), 'acme{Enter}')
    expect(onConfirm).not.toHaveBeenCalled()

    await userEvent.type(typedField(), '-prod{Enter}')
    expect(onConfirm).toHaveBeenCalledWith('acme-prod')
  })
})

describe('Confirm in password mode', () => {
  function passwordField() {
    return screen.getByLabelText('Password')
  }

  it('blocks the confirm action until a password is entered', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="password"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    expect(confirmButton()).toBeDisabled()
    expect(screen.getByTestId('confirm-hint')).toHaveTextContent(
      'Enter your password to continue.',
    )

    await userEvent.click(confirmButton())
    expect(onConfirm).not.toHaveBeenCalled()

    await userEvent.type(passwordField(), 'hunter2')
    expect(confirmButton()).toBeEnabled()
  })

  it('hands the password to onConfirm as a string', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="password"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(passwordField(), 'hunter2')
    await userEvent.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith('hunter2')
    expect(typeof onConfirm.mock.calls[0][0]).toBe('string')
  })

  it('cancels without handing the password anywhere', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="password"
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(passwordField(), 'hunter2')
    await userEvent.click(confirmButton('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('forgets the password when the dialog closes', async () => {
    const { rerender } = render(
      <Confirm description="d" mode="password" open title="t" />,
    )

    await userEvent.type(passwordField(), 'hunter2')
    expect(confirmButton()).toBeEnabled()

    rerender(<Confirm description="d" mode="password" open={false} title="t" />)
    rerender(<Confirm description="d" mode="password" open title="t" />)

    expect(passwordField()).toHaveValue('')
    expect(confirmButton()).toBeDisabled()
  })

  it('takes a label of its own for the field', () => {
    render(
      <Confirm
        challengeLabel="Your account password"
        description="d"
        mode="password"
        open
        title="t"
      />,
    )

    expect(screen.getByLabelText('Your account password')).toBeInTheDocument()
  })
})

describe('Confirm in otp mode', () => {
  function codeField() {
    return screen.getByTestId('otp-input-root')
  }

  it('blocks the confirm action until the code is complete', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="otp"
        onConfirm={onConfirm}
        open
        otpPattern={[3, 3]}
        title="t"
      />,
    )

    expect(confirmButton()).toBeDisabled()
    expect(screen.getByTestId('confirm-hint')).toHaveTextContent(
      'Enter the whole code to continue.',
    )

    await userEvent.type(codeField(), '12345')
    expect(confirmButton()).toBeDisabled()

    await userEvent.type(codeField(), '6')
    expect(confirmButton()).toBeEnabled()
  })

  it('hands the code to onConfirm as a string', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="otp"
        onConfirm={onConfirm}
        open
        otpPattern={[3, 3]}
        title="t"
      />,
    )

    await userEvent.type(codeField(), '123456')
    await userEvent.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith('123456')
    expect(typeof onConfirm.mock.calls[0][0]).toBe('string')
  })

  it('asks for six digits when no pattern is named', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="otp"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(codeField(), '12345')
    expect(confirmButton()).toBeDisabled()

    await userEvent.type(codeField(), '6')
    expect(confirmButton()).toBeEnabled()
  })

  it('cancels without handing the code anywhere', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <Confirm
        description="d"
        mode="otp"
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(codeField(), '123456')
    await userEvent.click(confirmButton('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('names the group of cells for assistive technology', () => {
    render(<Confirm description="d" mode="otp" open title="t" />)

    expect(
      screen.getByRole('group', {
        description: 'Enter the whole code to continue.',
        name: 'One-time code',
      }),
    ).toBeInTheDocument()
  })
})

describe('Confirm in acknowledge mode', () => {
  const statement = 'I understand this cannot be undone'

  function statementBox() {
    return screen.getByRole('checkbox', {
      name: statement,
    })
  }

  it('blocks the confirm action until the statement is ticked', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    expect(confirmButton()).toBeDisabled()
    expect(screen.getByTestId('confirm-blocked')).toHaveAccessibleDescription(
      'Tick the statement above to continue.',
    )

    await userEvent.click(confirmButton())
    expect(onConfirm).not.toHaveBeenCalled()

    await userEvent.click(statementBox())
    expect(confirmButton()).toBeEnabled()
  })

  it('hands nothing to onConfirm — there is nothing to hand over', async () => {
    const onConfirm = vi.fn()
    render(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.click(statementBox())
    await userEvent.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm.mock.calls[0]).toEqual([])
  })

  it('cancels with the statement ticked and confirms nothing', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.click(statementBox())
    await userEvent.click(confirmButton('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('unticks the statement when the dialog closes', async () => {
    const { rerender } = render(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        open
        title="t"
      />,
    )

    await userEvent.click(statementBox())
    expect(confirmButton()).toBeEnabled()

    rerender(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        open={false}
        title="t"
      />,
    )
    rerender(
      <Confirm
        acknowledgement={statement}
        description="d"
        mode="acknowledge"
        open
        title="t"
      />,
    )

    expect(statementBox()).not.toBeChecked()
    expect(confirmButton()).toBeDisabled()
  })
})

describe('Confirm when the caller rejects the answer', () => {
  it('stays open, says what went wrong and lets the user try again', async () => {
    const onClose = vi.fn()
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('That password is wrong'))
    render(
      <Confirm
        description="d"
        mode="password"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="t"
      />,
    )

    await userEvent.type(screen.getByLabelText('Password'), 'hunter2')
    await userEvent.click(confirmButton())

    expect(screen.getByRole('alert')).toHaveTextContent(
      'That password is wrong',
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(confirmButton()).toBeEnabled()

    await userEvent.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('falls back to its own wording when the rejection carries none', async () => {
    const onConfirm = vi.fn().mockRejectedValue('nope')
    render(<Confirm description="d" onConfirm={onConfirm} open title="t" />)

    await userEvent.click(confirmButton())

    expect(screen.getByRole('alert')).toHaveTextContent(
      'That did not work. Try again.',
    )
  })
})

describe('Confirm inside a provider that names its own wording', () => {
  it('takes every string it renders from the labels', async () => {
    render(
      <TuryProvider
        labels={{
          confirm: {
            cancel: 'Voltar',
            confirm: 'Excluir',
            passwordBlocked: 'Digite a senha para continuar.',
            passwordLabel: 'Senha',
          },
        }}
      >
        <Confirm description="d" mode="password" open title="t" />
      </TuryProvider>,
    )

    expect(confirmButton('Excluir')).toBeInTheDocument()
    expect(confirmButton('Voltar')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-hint')).toHaveTextContent(
      'Digite a senha para continuar.',
    )
  })
})
