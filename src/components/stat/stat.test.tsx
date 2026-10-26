import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MoneyText } from '@/components/money-text'
import { NumberText } from '@/components/number-text'

import { Stat } from './stat'

describe('Stat', () => {
  it('shows the label and whatever rendered the figure', () => {
    render(<Stat label="Revenue" value={<MoneyText value={128000} />} />)

    expect(screen.getByTestId('stat-label')).toHaveTextContent('Revenue')
    expect(screen.getByTestId('stat-value')).toHaveTextContent('$1,280.00')
  })

  it('puts the trend beside the figure, already coloured by its own formatter', () => {
    render(
      <Stat
        label="Occupancy"
        trend={
          <NumberText
            colored
            signDisplay="always"
            value={0.12}
            variant="percent"
          />
        }
        value={<NumberText value={0.87} variant="percent" />}
      />,
    )

    expect(screen.getByTestId('stat-trend')).toHaveTextContent('+12%')
    expect(
      screen.getByTestId('stat-trend').querySelector('.formatter-text-value')
        ?.className,
    ).toContain('text-success')
  })

  it('holds the shape while the number is on its way', () => {
    render(
      <Stat hint="Last 30 days" label="Revenue" loading value="—" trend="+1" />,
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('stat-trend')).not.toBeInTheDocument()
    expect(screen.queryByTestId('stat-hint')).not.toBeInTheDocument()
  })

  it('writes the small print when there is any', () => {
    render(<Stat hint="Last 30 days" label="Revenue" value="R$ 1.280,00" />)

    expect(screen.getByTestId('stat-hint')).toHaveTextContent('Last 30 days')
  })

  it('keeps the trend on the figure line by default, free to wrap under it', () => {
    render(<Stat label="Revenue" trend="+12%" value="R$ 1.280.000,00" />)

    const figure = screen.getByTestId('stat-value')
    const trend = screen.getByTestId('stat-trend')

    expect(figure).toContainElement(trend)
    expect(trend).toHaveAttribute('data-placement', 'inline')
    // A long value in a narrow tile sends the delta to the next line instead
    // of running it past the edge.
    expect(figure.className).toContain('flex-wrap')
    expect(figure.className).toContain('min-w-0')
  })

  it('puts the trend on its own line under the figure when asked', () => {
    render(
      <Stat
        hint="Last 30 days"
        label="Revenue"
        trend="+12%"
        trendPlacement="below"
        value="R$ 1.280.000,00"
      />,
    )

    const figure = screen.getByTestId('stat-value')
    const trend = screen.getByTestId('stat-trend')

    expect(figure).not.toContainElement(trend)
    expect(trend).toHaveAttribute('data-placement', 'below')
    // Label, figure, trend, hint — the reading order the tile paints.
    expect(
      Array.from(screen.getByTestId('stat').children).map((node) =>
        node.getAttribute('data-testid'),
      ),
    ).toEqual(['stat-label', 'stat-value', 'stat-trend', 'stat-hint'])
  })

  it('renders no trend below while loading', () => {
    render(
      <Stat
        label="Revenue"
        loading
        trend="+12%"
        trendPlacement="below"
        value="—"
      />,
    )

    expect(screen.queryByTestId('stat-trend')).not.toBeInTheDocument()
  })

  it('shrinks with its cell instead of forcing the track wider', () => {
    render(<Stat label="Revenue" value="R$ 1.280,00" />)

    expect(screen.getByTestId('stat').className).toContain('min-w-0')
  })
})
