import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormatProvider } from './format-provider'
import { defaultFormat } from './format-provider.data'
import { useFormat } from './use-format'

function Probe() {
  const format = useFormat()

  return (
    <span data-testid="probe">
      {format.locale}|{format.currency}|{format.timeZone ?? 'runtime'}
    </span>
  )
}

describe('FormatProvider', () => {
  it('falls back to the package defaults with no provider above it', () => {
    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('en-US|usd|runtime')
  })

  it('keeps the untouched defaults when an app sets a single value', () => {
    render(
      <FormatProvider
        format={{
          locale: 'pt-BR',
        }}
      >
        <Probe />
      </FormatProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('pt-BR|usd|runtime')
  })

  it('carries every value it is given', () => {
    render(
      <FormatProvider
        format={{
          currency: 'brl',
          locale: 'pt-BR',
          timeZone: 'America/Sao_Paulo',
        }}
      >
        <Probe />
      </FormatProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent(
      'pt-BR|brl|America/Sao_Paulo',
    )
  })

  it('states its defaults in one place', () => {
    expect(defaultFormat).toEqual({
      currency: 'usd',
      locale: 'en-US',
    })
  })
})
