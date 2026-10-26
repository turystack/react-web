import { render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'

import { FormatProvider } from '@/components/format-provider'

import { MoneyText } from './money-text'

function Brazil({ children }: PropsWithChildren) {
  return (
    <FormatProvider
      format={{
        currency: 'brl',
        locale: 'pt-BR',
      }}
    >
      {children}
    </FormatProvider>
  )
}

describe('MoneyText', () => {
  it('reads the value as cents', () => {
    render(<MoneyText value={123456} />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('$1,234.56')
  })

  it('follows the provider currency and locale', () => {
    render(
      <Brazil>
        <MoneyText value={123456} />
      </Brazil>,
    )

    expect(screen.getByTestId('money-text')).toHaveTextContent('R$ 1.234,56')
  })

  it('lets one instance name another currency', () => {
    render(
      <Brazil>
        <MoneyText currency="eur" value={123456} />
      </Brazil>,
    )

    expect(screen.getByTestId('money-text')).toHaveTextContent('€')
  })

  it('drops the mark for a column that names it once', () => {
    render(
      <Brazil>
        <MoneyText hideSymbol value={123456} />
      </Brazil>,
    )

    const rendered = screen.getByTestId('money-text')

    expect(rendered).toHaveTextContent('1.234,56')
    expect(rendered).not.toHaveTextContent('R$')
  })

  it('writes the code instead of the symbol', () => {
    render(<MoneyText currency="brl" value={123456} variant="code" />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('BRL')
  })

  it('shortens a large amount', () => {
    render(<MoneyText value={123456789} variant="compact" />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('$1.2M')
  })

  it('parenthesises a debit in the accounting variant', () => {
    render(<MoneyText value={-2500} variant="accounting" />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('($25.00)')
  })

  it('writes the sign when asked to', () => {
    render(<MoneyText signDisplay="always" value={2500} />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('+$25.00')
  })

  it('rounds to the decimals it was given', () => {
    render(<MoneyText fractionDigits={0} value={123456} />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('$1,235')
  })

  it('paints the amount by its sign only when asked', () => {
    render(
      <>
        <MoneyText colored value={2500} />
        <MoneyText colored value={-2500} />
        <MoneyText colored value={0} />
        <MoneyText value={-2500} />
      </>,
    )

    const [credit, debit, zero, plain] = screen.getAllByTestId('money-text')

    expect(credit.className).toContain('text-success')
    expect(debit.className).toContain('text-destructive')
    expect(zero.className).not.toContain('text-success')
    expect(plain.className).not.toContain('text-destructive')
  })

  it('renders a trailing note beside the amount', () => {
    render(<MoneyText rightSection={<span>/ night</span>} value={2500} />)

    expect(screen.getByText('/ night')).toBeInTheDocument()
  })

  it('falls back on an absent or unusable amount', () => {
    render(
      <>
        <MoneyText value={null} />
        <MoneyText value={Number.NaN} />
        <MoneyText fallback="free" value={undefined} />
      </>,
    )

    const [empty, broken, custom] = screen.getAllByTestId('money-text')

    expect(empty).toHaveTextContent('—')
    expect(broken).toHaveTextContent('—')
    expect(custom).toHaveTextContent('free')
  })

  it('renders zero as an amount, not as nothing', () => {
    render(<MoneyText value={0} />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('$0.00')
  })
})

describe('MoneyText range', () => {
  it('joins both bounds', () => {
    render(
      <MoneyText
        mode="range"
        value={{
          from: 10000,
          to: 50000,
        }}
      />,
    )

    expect(screen.getByTestId('money-text')).toHaveTextContent(
      '$100.00 – $500.00',
    )
  })

  it('reads a floor and a ceiling in the range wording', () => {
    render(
      <>
        <MoneyText
          mode="range"
          value={{
            from: 10000,
          }}
        />
        <MoneyText
          mode="range"
          value={{
            to: 50000,
          }}
        />
      </>,
    )

    const [floor, ceiling] = screen.getAllByTestId('money-text')

    expect(floor).toHaveTextContent('From $100.00')
    expect(ceiling).toHaveTextContent('Up to $500.00')
  })

  it('falls back when the range holds nothing', () => {
    render(<MoneyText mode="range" value={null} />)

    expect(screen.getByTestId('money-text')).toHaveTextContent('—')
  })
})

describe('MoneyText inline in a sentence', () => {
  it('takes the size, colour and weight of the text around it', () => {
    render(
      <MoneyText inheritColor size="inherit" value={4990} weight="inherit" />,
    )

    const rendered = screen.getByTestId('money-text')
    expect(rendered).toHaveClass('text-[length:inherit]')
    expect(rendered.className).not.toMatch(
      /\btext-(base|foreground|muted-foreground)\b|\bfont-/,
    )
  })

  it('still paints its sign over an inherited colour', () => {
    render(<MoneyText colored inheritColor size="inherit" value={-4990} />)

    expect(screen.getByTestId('money-text')).toHaveClass('text-destructive')
  })

  it('carries the inherited look into a range', () => {
    render(
      <MoneyText
        inheritColor
        mode="range"
        size="inherit"
        value={{ from: 1000, to: 5000 }}
      />,
    )

    const rendered = screen.getByTestId('money-text')
    expect(rendered).toHaveClass('text-[length:inherit]')
    expect(rendered).not.toHaveClass('text-base', 'text-foreground')
  })
})

describe('MoneyText axes', () => {
  it('publishes its default variant for a theme to select', () => {
    render(<MoneyText value={1200} />)

    expect(
      screen.getByTestId('money-text').closest('.formatter-text'),
    ).toHaveAttribute('data-variant', 'standard')
  })

  it('publishes the variant it was given', () => {
    render(<MoneyText value={1200} variant="accounting" />)

    expect(
      screen.getByTestId('money-text').closest('.formatter-text'),
    ).toHaveAttribute('data-variant', 'accounting')
  })

  it('publishes it on a range too', () => {
    render(
      <MoneyText mode="range" value={{ from: 100, to: 200 }} variant="code" />,
    )

    expect(
      screen.getByTestId('money-text').closest('.formatter-text'),
    ).toHaveAttribute('data-variant', 'code')
  })
})

describe('MoneyText axes, one meaning per element', () => {
  it('keeps the format choice off the value, whose variant is its colour', () => {
    render(<MoneyText value={1200} />)

    const value = screen.getByTestId('money-text')
    expect(value.closest('.formatter-text')).toHaveAttribute(
      'data-variant',
      'standard',
    )
    expect(value).toHaveAttribute('data-variant', 'default')
  })
})
