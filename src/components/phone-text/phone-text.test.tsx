import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PhoneText } from './phone-text'

const BR = {
  ddi: '55',
  iso: 'BR',
  number: '11987654321',
}

describe('PhoneText', () => {
  it('writes a number the way its own country writes it', () => {
    render(<PhoneText value={BR} />)

    expect(screen.getByTestId('phone-text')).toHaveTextContent(
      '(11) 98765-4321',
    )
  })

  it('reads an E.164 string as well as the input value', () => {
    render(<PhoneText value="+5511987654321" />)

    expect(screen.getByTestId('phone-text')).toHaveTextContent(
      '(11) 98765-4321',
    )
  })

  it('writes the international and raw shapes on request', () => {
    render(
      <>
        <PhoneText value={BR} variant="international" />
        <PhoneText value={BR} variant="e164" />
      </>,
    )

    const [international, e164] = screen.getAllByTestId('phone-text')

    expect(international).toHaveTextContent('+55 11 98765 4321')
    expect(e164).toHaveTextContent('+5511987654321')
  })

  it('renders a redacted value exactly as the server sent it', () => {
    render(<PhoneText privacy value="(**) *****-4321" />)

    expect(screen.getByTestId('phone-text')).toHaveTextContent(
      '(**) *****-4321',
    )
  })

  it('does not run a redacted value through the parser', () => {
    render(
      <PhoneText
        privacy
        value={{
          ddi: '55',
          iso: 'BR',
          number: '(**) *****-****',
        }}
      />,
    )

    expect(screen.getByTestId('phone-text')).toHaveTextContent(
      '(**) *****-****',
    )
  })

  it('offers no reveal control, because nothing is covered here', () => {
    render(<PhoneText privacy value="(**) *****-4321" />)

    expect(screen.queryByTestId('phone-text-reveal')).not.toBeInTheDocument()
  })

  it('dials the number when it is callable', () => {
    render(<PhoneText callable value={BR} />)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'tel:+5511987654321',
    )
  })

  it('offers no link on a redacted number, which has no digits to dial', () => {
    render(<PhoneText callable privacy value="(**) *****-4321" whatsapp />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('phone-text-whatsapp')).not.toBeInTheDocument()
  })

  it('links to the WhatsApp conversation', () => {
    render(<PhoneText value={BR} whatsapp />)

    expect(screen.getByTestId('phone-text-whatsapp')).toHaveAttribute(
      'href',
      'https://wa.me/5511987654321',
    )
  })

  it('shows what it has when the number cannot be parsed', () => {
    render(<PhoneText value="12345" />)

    expect(screen.getByTestId('phone-text')).toHaveTextContent('12345')
  })

  it('falls back on an absent number', () => {
    render(
      <>
        <PhoneText value={null} />
        <PhoneText fallback="no phone" value="" />
      </>,
    )

    const [empty, custom] = screen.getAllByTestId('phone-text')

    expect(empty).toHaveTextContent('—')
    expect(custom).toHaveTextContent('no phone')
  })
})
