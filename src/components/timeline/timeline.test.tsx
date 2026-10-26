import { render, screen, within } from '@testing-library/react'
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
    // The filled surface's own foreground token: white failed on the light
    // destructive of the dark theme.
    expect(error).toHaveClass('text-destructive-foreground')
    expect(error).not.toHaveClass('text-white')
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

  describe('Group', () => {
    it('puts the entries of a period under a heading that names the group', () => {
      render(
        <Timeline>
          <Timeline.Group label="September 2026">
            <Timeline.Item title="Booked" />
            <Timeline.Item title="Paid" />
          </Timeline.Group>
          <Timeline.Group label="August 2026">
            <Timeline.Item title="Quoted" />
          </Timeline.Group>
        </Timeline>,
      )

      const september = screen.getByRole('group', {
        name: 'September 2026',
      })
      expect(september.tagName).toBe('FIELDSET')
      expect(september).not.toHaveAttribute('role')

      expect(
        within(september).getByRole('heading', {
          level: 3,
          name: 'September 2026',
        }),
      ).toBeInTheDocument()
      expect(
        within(september)
          .getAllByTestId('timeline-title')
          .map((title) => title.textContent),
      ).toEqual(['Booked', 'Paid'])
      expect(
        within(
          screen.getByRole('group', {
            name: 'August 2026',
          }),
        ).getByText('Quoted'),
      ).toBeInTheDocument()
      expect(
        screen.getAllByRole('heading').map((heading) => heading.textContent),
      ).toEqual(['September 2026', 'August 2026'])
    })

    it('renders the heading level it is given', () => {
      render(
        <Timeline>
          <Timeline.Group headingLevel={2} label="Today">
            <Timeline.Item title="Booked" />
          </Timeline.Group>
        </Timeline>,
      )

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Today',
        }),
      ).toBeInTheDocument()
    })

    it('tightens the group spacing under compact', () => {
      const { rerender } = render(
        <Timeline>
          <Timeline.Group label="Today">
            <Timeline.Item title="Booked" />
          </Timeline.Group>
        </Timeline>,
      )

      expect(screen.getByTestId('timeline-group')).toHaveClass('pb-6')

      rerender(
        <Timeline compact>
          <Timeline.Group label="Today">
            <Timeline.Item title="Booked" />
          </Timeline.Group>
        </Timeline>,
      )

      expect(screen.getByTestId('timeline-group')).toHaveClass('pb-3')
      expect(screen.getByTestId('timeline-group')).not.toHaveClass('pb-6')
    })
  })
})
