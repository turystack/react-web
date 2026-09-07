import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('hides the value until the toggle reveals it', async () => {
    render(<PasswordInput aria-label="Password" defaultValue="secret" />)

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

  it('delivers what was typed', async () => {
    const onChange = vi.fn()
    render(<PasswordInput aria-label="Password" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Password'), 'abc')

    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('delivers null when the field is emptied', async () => {
    const onChange = vi.fn()
    render(
      <PasswordInput
        aria-label="Password"
        defaultValue="abc"
        onChange={onChange}
      />,
    )

    await userEvent.clear(screen.getByLabelText('Password'))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('changes on its own when uncontrolled', async () => {
    render(<PasswordInput aria-label="Password" defaultValue="ab" />)

    const field = screen.getByLabelText('Password')
    await userEvent.type(field, 'c')

    expect(field).toHaveValue('abc')
  })

  it('keeps the value it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(
      <PasswordInput aria-label="Password" onChange={onChange} value="ab" />,
    )

    const field = screen.getByLabelText('Password')
    await userEvent.type(field, 'c')

    expect(field).toHaveValue('ab')
    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('blocks typing when disabled', async () => {
    const onChange = vi.fn()
    render(<PasswordInput aria-label="Password" disabled onChange={onChange} />)

    const field = screen.getByLabelText('Password')
    expect(field).toBeDisabled()

    await userEvent.type(field, 'abc')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows no strength indicator unless asked for', () => {
    render(<PasswordInput aria-label="Password" value="Abcdef1!" />)

    expect(
      screen.queryByTestId('password-input-strength-bars'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Very strong')).not.toBeInTheDocument()
  })

  it('holds the strength name back while the field is empty', () => {
    render(<PasswordInput aria-label="Password" showStrength value="" />)

    expect(
      screen.getByTestId('password-input-strength-bars'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Very weak')).not.toBeInTheDocument()
  })

  it('keeps the right section it was given beside the visibility toggle', async () => {
    render(
      <PasswordInput aria-label="Password" rightSection={<span>hint</span>} />,
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
      <PasswordInput aria-label="Password" defaultValue="abc" showStrength />,
    )

    expect(screen.getByText('Very weak')).toBeInTheDocument()
  })

  it('scores the strength of what is typed into an uncontrolled field', async () => {
    render(<PasswordInput aria-label="Password" showStrength />)

    await userEvent.type(screen.getByLabelText('Password'), 'Abcdef1!')

    expect(screen.getByText('Very strong')).toBeInTheDocument()
  })

  it('renames the strength as the password gets stronger', async () => {
    const { rerender } = render(
      <PasswordInput aria-label="Password" showStrength value="abc" />,
    )

    expect(screen.getByText('Very weak')).toBeInTheDocument()

    rerender(
      <PasswordInput aria-label="Password" showStrength value="Abcdef1!" />,
    )

    expect(screen.getByText('Very strong')).toBeInTheDocument()
    expect(screen.queryByText('Very weak')).not.toBeInTheDocument()
  })
})

describe.each([
  ['abc', 'Very weak'],
  ['Abc', 'Weak'],
  ['ABC12345', 'Medium'],
  ['Abcdefg1', 'Strong'],
  ['Abcdef1!', 'Very strong'],
])('PasswordInput strength of %s', (password, level) => {
  it('names the level it reached', () => {
    render(
      <PasswordInput aria-label="Password" showStrength value={password} />,
    )

    expect(screen.getByText(level)).toBeInTheDocument()
  })
})
