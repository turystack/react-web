import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DocumentInput } from './document-input'

describe('DocumentInput cpf', () => {
  it('formats the digits and delivers them tagged as a cpf', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} variant="cpf" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, '12345678900')

    expect(field).toHaveValue('123.456.789-00')
    expect(onChange).toHaveBeenLastCalledWith({
      number: '123.456.789-00',
      type: 'cpf',
    })
  })

  it('offers the cpf mask as its placeholder', () => {
    render(<DocumentInput variant="cpf" />)

    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument()
  })

  it('delivers null when the field is emptied', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} variant="cpf" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, '123')
    await userEvent.clear(field)

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('keeps the value it was given when controlled', async () => {
    const onChange = vi.fn()
    render(
      <DocumentInput
        onChange={onChange}
        value={{ number: '123.456.789-00', type: 'cpf' }}
        variant="cpf"
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).toHaveValue('123.456.789-00')

    await userEvent.type(field, '5')
    expect(field).toHaveValue('123.456.789-00')
  })

  it('keeps a placeholder given from outside', () => {
    render(<DocumentInput placeholder="Documento" variant="cpf" />)

    expect(screen.getByPlaceholderText('Documento')).toBeInTheDocument()
  })

  it('blocks typing when disabled', async () => {
    const onChange = vi.fn()
    render(<DocumentInput disabled onChange={onChange} variant="cpf" />)

    const field = screen.getByRole('textbox')
    expect(field).toBeDisabled()

    await userEvent.type(field, '123')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('accepts typing with no onChange attached', async () => {
    render(<DocumentInput variant="cpf" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, '12345678900')

    expect(field).toHaveValue('123.456.789-00')
  })

  it('starts from the defaultValue it was given and changes on its own', async () => {
    render(
      <DocumentInput
        defaultValue={{ number: '123.456.789-00', type: 'cpf' }}
        variant="cpf"
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).toHaveValue('123.456.789-00')

    await userEvent.clear(field)
    await userEvent.type(field, '98765432100')

    expect(field).toHaveValue('987.654.321-00')
  })

  it('reads a controlled null as an empty field, not as the defaultValue', () => {
    render(
      <DocumentInput
        defaultValue={{ number: '123.456.789-00', type: 'cpf' }}
        value={null}
        variant="cpf"
      />,
    )

    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})

describe('DocumentInput cnpj', () => {
  it('formats the digits and delivers them tagged as a cnpj', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} variant="cnpj" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, '12345678000190')

    expect(field).toHaveValue('12.345.678/0001-90')
    expect(onChange).toHaveBeenLastCalledWith({
      number: '12.345.678/0001-90',
      type: 'cnpj',
    })
  })

  it('offers the cnpj mask as its placeholder', () => {
    render(<DocumentInput variant="cnpj" />)

    expect(
      screen.getByPlaceholderText('00.000.000/0000-00'),
    ).toBeInTheDocument()
  })
})

describe('DocumentInput any', () => {
  it('starts on cpf and delivers the cpf tag', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} variant="any" />)

    expect(screen.getByRole('button', { name: 'CPF' })).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox'), '12345678900')

    expect(onChange).toHaveBeenLastCalledWith({
      number: '123.456.789-00',
      type: 'cpf',
    })
  })

  it('swaps the mask and the tag when another type is picked', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} variant="any" />)

    await userEvent.click(screen.getByRole('button', { name: 'CPF' }))
    await userEvent.click(
      await screen.findByRole('menuitemcheckbox', { name: 'CNPJ' }),
    )

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(
      await screen.findByRole('button', { name: 'CNPJ' }),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('00.000.000/0000-00'),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox'), '12345678000190')

    expect(onChange).toHaveBeenLastCalledWith({
      number: '12.345.678/0001-90',
      type: 'cnpj',
    })
  })

  it('marks the type in force inside the menu', async () => {
    render(<DocumentInput variant="any" />)

    await userEvent.click(screen.getByRole('button', { name: 'CPF' }))

    expect(
      await screen.findByRole('menuitemcheckbox', { name: 'CPF' }),
    ).toBeChecked()
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'CNPJ' }),
    ).not.toBeChecked()
  })

  it('starts on the type of the value it was given', () => {
    render(
      <DocumentInput
        value={{ number: '12.345.678/0001-90', type: 'cnpj' }}
        variant="any"
      />,
    )

    expect(screen.getByRole('button', { name: 'CNPJ' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('12.345.678/0001-90')
  })

  it('starts on the type of the defaultValue it was given', () => {
    render(
      <DocumentInput
        defaultValue={{ number: '12.345.678/0001-90', type: 'cnpj' }}
        variant="any"
      />,
    )

    expect(screen.getByRole('button', { name: 'CNPJ' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('12.345.678/0001-90')
  })

  it('moves to the type of a controlled value that changes from outside', () => {
    const { rerender } = render(
      <DocumentInput
        value={{ number: '123.456.789-00', type: 'cpf' }}
        variant="any"
      />,
    )

    expect(screen.getByRole('button', { name: 'CPF' })).toBeInTheDocument()

    rerender(
      <DocumentInput
        value={{ number: '12.345.678/0001-90', type: 'cnpj' }}
        variant="any"
      />,
    )

    expect(screen.getByRole('button', { name: 'CNPJ' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('12.345.678/0001-90')
  })

  it('disables the type trigger together with the field', () => {
    render(<DocumentInput disabled variant="any" />)

    expect(screen.getByRole('button', { name: 'CPF' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('DocumentInput size %s', (size) => {
  it('keeps the field and the type trigger reachable', async () => {
    const onChange = vi.fn()
    render(<DocumentInput onChange={onChange} size={size} variant="any" />)

    expect(screen.getByRole('button', { name: 'CPF' })).toBeEnabled()

    await userEvent.type(screen.getByRole('textbox'), '12345678900')

    expect(onChange).toHaveBeenLastCalledWith({
      number: '123.456.789-00',
      type: 'cpf',
    })
  })
})
