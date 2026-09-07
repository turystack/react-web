import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/button'

import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('says what is missing with nothing else required', () => {
    render(<EmptyState title="No bookings yet" />)

    expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
      'No bookings yet',
    )
    expect(
      screen.queryByTestId('empty-state-description'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-state-action')).not.toBeInTheDocument()
  })

  it('adds the reason and the way out when it has them', () => {
    render(
      <EmptyState
        action={<Button>New booking</Button>}
        description="Bookings appear here once a guest confirms."
        title="No bookings yet"
      />,
    )

    expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
      'Bookings appear here once a guest confirms.',
    )
    expect(
      screen.getByRole('button', { name: 'New booking' }),
    ).toBeInTheDocument()
  })

  it('hides the icon from assistive technology, which the title already tells', () => {
    render(
      <EmptyState icon={<svg aria-hidden="true" />} title="Nothing here" />,
    )

    expect(
      screen.getByTestId('empty-state').querySelector('[aria-hidden="true"]'),
    ).toBeInTheDocument()
  })

  it('takes less room inside a popup than inside a page', () => {
    const { rerender } = render(<EmptyState size="sm" title="Nothing" />)

    expect(screen.getByTestId('empty-state').className).toContain('py-6')

    rerender(<EmptyState size="lg" title="Nothing" />)

    expect(screen.getByTestId('empty-state').className).toContain('py-16')
  })
})
