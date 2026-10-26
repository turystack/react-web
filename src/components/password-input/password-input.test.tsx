import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('hides the value until the toggle reveals it', async () => {
    render(<PasswordInput ariaLabel="Password" defaultValue="secret" />)

    // A masked password field carries no ARIA role, so the textbox role
    // appearing is what tells us the value became readable.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveValue('secret')

    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('textbox', { name: 'Password' })).toHaveValue(
      'secret',
    )

    await userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('names the toggle by what it will do next', async () => {
    render(<PasswordInput ariaLabel="Password" defaultValue="secret" />)

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show password' }),
    ).not.toBeInTheDocument()
  })

  it('names the toggle with the labels the app provides', async () => {
    render(
      <LabelsProvider
        labels={{ passwordInput: { hide: 'Ocultar', show: 'Mostrar' } }}
      >
        <PasswordInput ariaLabel="Senha" />
      </LabelsProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))

    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeInTheDocument()
  })

  it('reads the strength verdict from the labels the app provides', () => {
    const { rerender } = render(
      <LabelsProvider
        labels={{ passwordInput: { veryStrong: 'Muito forte', weak: 'Fraca' } }}
      >
        <PasswordInput ariaLabel="Senha" showStrength value="Abcdef1!" />
      </LabelsProvider>,
    )

    expect(screen.getByText('Muito forte')).toBeInTheDocument()
    expect(screen.queryByText('Very strong')).not.toBeInTheDocument()

    rerender(
      <LabelsProvider
        labels={{ passwordInput: { veryStrong: 'Muito forte', weak: 'Fraca' } }}
      >
        <PasswordInput ariaLabel="Senha" showStrength value="Abc" />
      </LabelsProvider>,
    )

    expect(screen.getByText('Fraca')).toBeInTheDocument()
  })

  it('keeps the default word for a level the app did not override', () => {
    render(
      <LabelsProvider labels={{ passwordInput: { weak: 'Fraca' } }}>
        <PasswordInput ariaLabel="Senha" showStrength value="ABC12345" />
      </LabelsProvider>,
    )

    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('delivers what was typed', async () => {
    const onChange = vi.fn()
    render(<PasswordInput ariaLabel="Password" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Password'), 'abc')

    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('delivers null when the field is emptied', async () => {
    const onChange = vi.fn()
    render(
      <PasswordInput
        ariaLabel="Password"
        defaultValue="abc"
        onChange={onChange}
      />,
    )

    await userEvent.clear(screen.getByLabelText('Password'))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('changes on its own when uncontrolled', async () => {
    render(<PasswordInput ariaLabel="Password" defaultValue="ab" />)

    const field = screen.getByLabelText('Password')
    await userEvent.type(field, 'c')

    expect(field).toHaveValue('abc')
  })

  it('keeps the value it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(
      <PasswordInput ariaLabel="Password" onChange={onChange} value="ab" />,
    )

    const field = screen.getByLabelText('Password')
    await userEvent.type(field, 'c')

    expect(field).toHaveValue('ab')
    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('blocks typing when disabled', async () => {
    const onChange = vi.fn()
    render(<PasswordInput ariaLabel="Password" disabled onChange={onChange} />)

    const field = screen.getByLabelText('Password')
    expect(field).toBeDisabled()

    await userEvent.type(field, 'abc')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows no strength indicator unless asked for', () => {
    render(<PasswordInput ariaLabel="Password" value="Abcdef1!" />)

    expect(
      screen.queryByTestId('password-input-strength-bars'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Very strong')).not.toBeInTheDocument()
  })

  it('holds the strength name back while the field is empty', () => {
    render(<PasswordInput ariaLabel="Password" showStrength value="" />)

    expect(
      screen.getByTestId('password-input-strength-bars'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Very weak')).not.toBeInTheDocument()
  })

  it('keeps the right section it was given beside the visibility toggle', async () => {
    render(
      <PasswordInput ariaLabel="Password" rightSection={<span>hint</span>} />,
    )

    expect(screen.getByText('hint')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button'))

    expect(
      screen.getByRole('textbox', { name: 'Password' }),
    ).toBeInTheDocument()
    expect(screen.getByText('hint')).toBeInTheDocument()
  })

  it('scores the strength of the defaultValue it started from', () => {
    render(
      <PasswordInput ariaLabel="Password" defaultValue="abc" showStrength />,
    )

    expect(screen.getByText('Very weak')).toBeInTheDocument()
  })

  it('scores the strength of what is typed into an uncontrolled field', async () => {
    render(<PasswordInput ariaLabel="Password" showStrength />)

    await userEvent.type(screen.getByLabelText('Password'), 'Abcdef1!')

    expect(screen.getByText('Very strong')).toBeInTheDocument()
  })

  it('renames the strength as the password gets stronger', async () => {
    const { rerender } = render(
      <PasswordInput ariaLabel="Password" showStrength value="abc" />,
    )

    expect(screen.getByText('Very weak')).toBeInTheDocument()

    rerender(
      <PasswordInput ariaLabel="Password" showStrength value="Abcdef1!" />,
    )

    expect(screen.getByText('Very strong')).toBeInTheDocument()
    expect(screen.queryByText('Very weak')).not.toBeInTheDocument()
  })
})

describe.each([
  ['abc', 'Very weak', 1, 'bg-destructive'],
  ['Abc', 'Weak', 2, 'bg-destructive'],
  ['ABC12345', 'Medium', 3, 'bg-warning'],
  ['Abcdefg1', 'Strong', 4, 'bg-success'],
  ['Abcdef1!', 'Very strong', 5, 'bg-success'],
] as const)(
  'PasswordInput strength of %s',
  (password, level, filled, token) => {
    it('names the level it reached', () => {
      render(
        <PasswordInput ariaLabel="Password" showStrength value={password} />,
      )

      expect(screen.getByText(level)).toBeInTheDocument()
    })

    it('fills as many bars as the level, in its status token', () => {
      render(
        <PasswordInput ariaLabel="Password" showStrength value={password} />,
      )

      const bars = screen.getAllByTestId('password-input-strength-bar')
      expect(bars.filter((bar) => bar.classList.contains(token))).toHaveLength(
        filled,
      )
      expect(
        bars.filter((bar) => bar.classList.contains('bg-muted')),
      ).toHaveLength(5 - filled)
      for (const bar of bars) {
        expect(bar.className).not.toMatch(
          /\b(red|orange|yellow|green|emerald)-\d/,
        )
      }
    })
  },
)
