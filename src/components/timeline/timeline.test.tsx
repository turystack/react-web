import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Timeline } from './timeline'

describe('Timeline', () => {
  it('renders one entry per event, in order', () => {
    render(
      <Timeline>
        <Timeline.Item status="done" title="Booking confirmed" />
        <Timeline.Item status="current" title="Awaiting payment" />
      </Timeline>,
    )

    const items = screen.getAllByTestId('timeline-item')

    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Booking confirmed')
  })

  it('keeps the status as data, not only as a colour', () => {
    render(
      <Timeline>
        <Timeline.Item status="error" title="Payment refused" />
      </Timeline>,
    )

    expect(screen.getByTestId('timeline-item')).toHaveAttribute(
      'data-status',
      'error',
    )
  })

  it('paints an error entry apart from a pending one', () => {
    render(
      <Timeline>
        <Timeline.Item status="error" title="Refused" />
        <Timeline.Item title="Waiting" />
      </Timeline>,
    )

    const [error, pending] = screen.getAllByTestId('timeline-marker')

    expect(error.className).toContain('border-destructive')
    expect(pending.className).toContain('border-border')
  })

  it('carries when it happened and whatever else the event was', () => {
    render(
      <Timeline>
        <Timeline.Item meta="2 hours ago" title="Confirmed">
          <span>R$ 1.280,00 charged</span>
        </Timeline.Item>
      </Timeline>,
    )

    expect(screen.getByTestId('timeline-meta')).toHaveTextContent('2 hours ago')
    expect(screen.getByText('R$ 1.280,00 charged')).toBeInTheDocument()
  })

  it('takes an icon in place of the dot', () => {
    render(
      <Timeline>
        <Timeline.Item icon={<svg data-testid="event-icon" />} title="Sent" />
      </Timeline>,
    )

    expect(screen.getByTestId('event-icon')).toBeInTheDocument()
  })

  it('tightens every entry when the root asks for compact', () => {
    const { rerender } = render(
      <Timeline>
        <Timeline.Item title="Booked" />
        <Timeline.Item title="Paid" />
      </Timeline>,
    )

    const roomy = screen
      .getAllByTestId('timeline-item')[0]
      .querySelector('.timeline-body')
    expect(roomy).toHaveClass('pb-6')
    expect(roomy).not.toHaveClass('pb-3')

    rerender(
      <Timeline compact>
        <Timeline.Item title="Booked" />
        <Timeline.Item title="Paid" />
      </Timeline>,
    )

    expect(
      screen.getAllByTestId('timeline-item')[0].querySelector('.timeline-body'),
    ).toHaveClass('pb-3')
  })
})
