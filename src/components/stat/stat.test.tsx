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
      screen.getByTestId('stat-trend').querySelector('span')?.className,
    ).toContain('text-green-600')
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
})
