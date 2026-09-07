import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormatProvider } from '@/components/format-provider'

import { NumberText } from './number-text'

describe('NumberText', () => {
  it('groups the number the way the locale groups numbers', () => {
    render(<NumberText value={1234567.5} />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('1,234,567.5')
  })

  it('follows the provider into another locale', () => {
    render(
      <FormatProvider
        format={{
          locale: 'pt-BR',
        }}
      >
        <NumberText value={1234.5} />
      </FormatProvider>,
    )

    expect(screen.getByTestId('number-text')).toHaveTextContent('1.234,5')
  })

  it('reads a percent as the ratio it is', () => {
    render(<NumberText fractionDigits={1} value={0.153} variant="percent" />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('15.3%')
  })

  it('shortens a large number', () => {
    render(<NumberText value={1234567} variant="compact" />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('1.2M')
  })

  it('fixes the decimals it was given', () => {
    render(<NumberText fractionDigits={2} value={7} />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('7.00')
  })

  it('writes the unit after the number', () => {
    render(<NumberText unit="km" value={480} />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('480 km')
  })

  it('writes the sign when asked to', () => {
    render(<NumberText signDisplay="always" value={12} />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('+12')
  })

  it('paints the number by its sign only when asked', () => {
    render(
      <>
        <NumberText colored value={12} />
        <NumberText colored value={-12} />
        <NumberText value={-12} />
      </>,
    )

    const [up, down, plain] = screen.getAllByTestId('number-text')

    expect(up.className).toContain('text-green-600')
    expect(down.className).toContain('text-destructive')
    expect(plain.className).not.toContain('text-destructive')
  })

  it('falls back on an absent or unusable number', () => {
    render(
      <>
        <NumberText value={null} />
        <NumberText value={Number.POSITIVE_INFINITY} />
        <NumberText fallback="n/a" value={undefined} />
      </>,
    )

    const [empty, broken, custom] = screen.getAllByTestId('number-text')

    expect(empty).toHaveTextContent('—')
    expect(broken).toHaveTextContent('—')
    expect(custom).toHaveTextContent('n/a')
  })

  it('renders zero as a number', () => {
    render(<NumberText value={0} />)

    expect(screen.getByTestId('number-text')).toHaveTextContent('0')
  })
})
