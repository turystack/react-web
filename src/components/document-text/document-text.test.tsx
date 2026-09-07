import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DocumentText } from './document-text'

const CPF = '12345678901'

describe('DocumentText', () => {
  it('masks a bare string of digits', () => {
    render(<DocumentText value={CPF} />)

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      '123.456.789-01',
    )
  })

  it('reads the value shape the input writes', () => {
    render(
      <DocumentText
        value={{
          number: CPF,
          type: 'cpf',
        }}
      />,
    )

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      '123.456.789-01',
    )
  })

  it('tells a CNPJ from a CPF on its own', () => {
    render(<DocumentText value="12345678000199" />)

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      '12.345.678/0001-99',
    )
  })

  it('renders a redacted value exactly as the server sent it', () => {
    render(<DocumentText privacy value="***.456.789-**" />)

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      '***.456.789-**',
    )
  })

  it('names the document when asked', () => {
    render(<DocumentText showType value={CPF} />)

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      'CPF 123.456.789-01',
    )
  })

  it('refuses to force a redacted value into a mask', () => {
    render(
      <DocumentText
        privacy
        value={{
          number: '***.***.***-**',
          type: 'cpf',
        }}
      />,
    )

    expect(screen.getByTestId('document-text')).toHaveTextContent(
      '***.***.***-**',
    )
  })

  it('offers no reveal control, because nothing is covered here', () => {
    render(<DocumentText privacy value="***.456.789-**" />)

    expect(screen.queryByTestId('document-text-reveal')).not.toBeInTheDocument()
  })

  it('shows digits it cannot place rather than forcing a mask', () => {
    render(<DocumentText value="12345" />)

    expect(screen.getByTestId('document-text')).toHaveTextContent('12345')
  })

  it('falls back on an absent document', () => {
    render(
      <>
        <DocumentText value={null} />
        <DocumentText fallback="not informed" value="" />
      </>,
    )

    const [empty, custom] = screen.getAllByTestId('document-text')

    expect(empty).toHaveTextContent('—')
    expect(custom).toHaveTextContent('not informed')
  })
})
