import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { InputSize, InputVariant } from '@/components/input/input.types'

import { MaskInput } from './mask-input'

function field() {
  return screen.getByRole('textbox')
}

describe('MaskInput', () => {
  it('delivers the masked value as it is typed', async () => {
    const onChange = vi.fn()
    render(<MaskInput mask="000.000" onChange={onChange} />)

    await userEvent.type(field(), '123456')

    expect(onChange).toHaveBeenLastCalledWith('123.456')
    expect(field()).toHaveValue('123.456')
  })

  it('refuses the characters the mask does not accept', async () => {
    const onChange = vi.fn()
    render(<MaskInput mask="000.000" onChange={onChange} />)

    await userEvent.type(field(), 'ab12')

    expect(field()).toHaveValue('12')
    expect(onChange).toHaveBeenLastCalledWith('12')
  })

  it('picks the pattern that fits the length from an array of masks', async () => {
    const onChange = vi.fn()
    render(<MaskInput mask={['00-00', '00-00-00']} onChange={onChange} />)

    await userEvent.type(field(), '1234')
    expect(onChange).toHaveBeenLastCalledWith('12-34')

    await userEvent.type(field(), '56')
    expect(onChange).toHaveBeenLastCalledWith('12-34-56')
  })

  it('delivers null once the field is emptied', async () => {
    const onChange = vi.fn()
    render(<MaskInput mask="000.000" onChange={onChange} />)

    await userEvent.type(field(), '123')
    await userEvent.clear(field())

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('starts from defaultValue and changes on its own when nothing controls it', async () => {
    render(<MaskInput defaultValue="123" mask="000.000" />)

    expect(field()).toHaveValue('123')

    await userEvent.type(field(), '456')

    expect(field()).toHaveValue('123.456')
  })

  it('reads a null defaultValue as an empty field', () => {
    render(<MaskInput defaultValue={null} mask="000.000" />)

    expect(field()).toHaveValue('')
  })

  it('shows the controlled value it was handed', () => {
    render(<MaskInput mask="000.000" value="123.456" />)

    expect(field()).toHaveValue('123.456')
  })

  it('reports what was typed without adopting it while controlled', async () => {
    const onChange = vi.fn()
    render(<MaskInput mask="000.000" onChange={onChange} value="123.456" />)

    await userEvent.type(field(), '7')

    expect(onChange).not.toHaveBeenCalledWith('123.4567')
    expect(field()).toHaveValue('123.456')
  })

  it('reads a null controlled value as an empty field', () => {
    render(<MaskInput mask="000.000" value={null} />)

    expect(field()).toHaveValue('')
  })

  it('renders the section content on each side of the field', () => {
    render(
      <MaskInput
        leftSection={<span>R$</span>}
        mask="000.000"
        rightSection={<span>,00</span>}
      />,
    )

    expect(screen.getByTestId('mask-input-section-left')).toHaveTextContent(
      'R$',
    )
    expect(screen.getByTestId('mask-input-section-right')).toHaveTextContent(
      ',00',
    )
  })

  it('renders no section wrapper when nothing was given for it', () => {
    render(<MaskInput mask="000.000" />)

    expect(
      screen.queryByTestId('mask-input-section-left'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mask-input-section-right'),
    ).not.toBeInTheDocument()
  })

  it('announces the loading state and takes over the right section', () => {
    render(
      <MaskInput loading mask="000.000" rightSection={<span>clear</span>} />,
    )

    expect(field()).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()
    expect(screen.queryByText('clear')).not.toBeInTheDocument()
  })

  it('blocks typing while loading', async () => {
    const onChange = vi.fn()
    render(<MaskInput loading mask="000.000" onChange={onChange} />)

    expect(field()).toBeDisabled()

    await userEvent.type(field(), '123')

    expect(field()).toHaveValue('')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows no indicator and no busy state when idle', () => {
    render(<MaskInput mask="000.000" />)

    expect(field()).not.toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument()
  })

  it('accepts a custom width for each section', () => {
    render(
      <MaskInput
        leftSection={<span>R$</span>}
        leftSectionWidth={48}
        mask="000.000"
        rightSection={<span>,00</span>}
        rightSectionWidth={64}
      />,
    )

    expect(screen.getByTestId('mask-input-section-left')).toHaveStyle({
      width: '48px',
    })
    expect(screen.getByTestId('mask-input-section-right')).toHaveStyle({
      width: '64px',
    })
  })

  it('blocks typing while disabled', async () => {
    const onChange = vi.fn()
    render(<MaskInput disabled mask="000.000" onChange={onChange} />)

    expect(field()).toBeDisabled()

    await userEvent.type(field(), '123')

    expect(field()).toHaveValue('')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the placeholder while empty', () => {
    render(<MaskInput mask="000.000" placeholder="000.000" />)

    expect(screen.getByPlaceholderText('000.000')).toBeInTheDocument()
  })

  it('carries the invalid state through to assistive technology', () => {
    render(<MaskInput aria-invalid mask="000.000" />)

    expect(field()).toHaveAttribute('aria-invalid', 'true')
  })
})

describe.each(['sm', 'md', 'lg'] as InputSize[])(
  'MaskInput size %s',
  (size) => {
    it('keeps masking what is typed', async () => {
      render(<MaskInput mask="000.000" size={size} />)

      await userEvent.type(field(), '123456')

      expect(field()).toHaveValue('123.456')
    })
  },
)

describe.each(['default', 'ghost'] as InputVariant[])(
  'MaskInput variant %s',
  (variant) => {
    it('keeps masking what is typed', async () => {
      render(<MaskInput mask="000.000" variant={variant} />)

      await userEvent.type(field(), '123456')

      expect(field()).toHaveValue('123.456')
    })
  },
)

describe('MaskInput contract', () => {
  it('is named by ariaLabel and carries the form-field attributes', () => {
    render(
      <MaskInput
        aria-describedby="cpf-hint"
        aria-invalid
        ariaLabel="CPF"
        id="cpf"
        mask="000.000.000-00"
        name="cpf"
        required
      />,
    )

    const field = screen.getByRole('textbox', { name: 'CPF' })
    expect(field).toHaveAttribute('id', 'cpf')
    expect(field).toHaveAttribute('name', 'cpf')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-describedby', 'cpf-hint')
    expect(field).toBeRequired()
  })

  it('never lets a class from outside restyle the field', () => {
    render(
      <MaskInput
        ariaLabel="CPF"
        // @ts-expect-error — className is not part of the contract
        className="outside-class"
        mask="000.000.000-00"
      />,
    )

    const field = screen.getByRole('textbox', { name: 'CPF' })
    expect(field).toHaveClass('input-field')
    expect(field).not.toHaveClass('outside-class')
  })
})

describe('MaskInput data-testid', () => {
  it('uses the testing handle the consumer gave the field', () => {
    render(<MaskInput ariaLabel="Code" data-testid="code-field" mask="000" />)

    expect(screen.getByTestId('code-field')).toBe(
      screen.getByRole('textbox', { name: 'Code' }),
    )
    expect(screen.queryByTestId('mask-input-field')).not.toBeInTheDocument()
  })

  it('keeps its own handle when none is given', () => {
    render(<MaskInput ariaLabel="Code" mask="000" />)

    expect(screen.getByTestId('mask-input-field')).toBe(
      screen.getByRole('textbox', { name: 'Code' }),
    )
  })
})

describe('MaskInput axes', () => {
  it('publishes the resolved defaults on its root', () => {
    render(<MaskInput mask="000" />)
    const root = screen.getByTestId('mask-input-root')

    expect(root).toHaveAttribute('data-size', 'md')
    expect(root).toHaveAttribute('data-variant', 'default')
  })

  it('publishes an explicit size and variant on its root', () => {
    render(<MaskInput mask="000" size="sm" variant="ghost" />)
    const root = screen.getByTestId('mask-input-root')

    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveAttribute('data-variant', 'ghost')
  })
})
