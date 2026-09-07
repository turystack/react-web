import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingOverlay } from './loading-overlay'

describe('LoadingOverlay', () => {
  it('exposes a busy state and keeps the indicator reachable when visible', () => {
    render(<LoadingOverlay visible />)

    const overlay = screen.getByTestId('loading-overlay-root')
    expect(overlay).toHaveAttribute('aria-busy', 'true')
    expect(overlay).toHaveAttribute('aria-hidden', 'false')
    expect(overlay).not.toBeEmptyDOMElement()
  })

  it('hides itself from assistive technology when not visible', () => {
    render(<LoadingOverlay visible={false} />)

    const overlay = screen.getByTestId('loading-overlay-root')
    expect(overlay).toHaveAttribute('aria-busy', 'false')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('is not visible when nothing is passed', () => {
    render(<LoadingOverlay />)

    expect(screen.getByTestId('loading-overlay-root')).toHaveAttribute(
      'aria-busy',
      'false',
    )
  })

  it('flips the busy state when visible changes', () => {
    const { rerender } = render(<LoadingOverlay visible={false} />)
    expect(screen.getByTestId('loading-overlay-root')).toHaveAttribute(
      'aria-busy',
      'false',
    )

    rerender(<LoadingOverlay visible />)
    expect(screen.getByTestId('loading-overlay-root')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })
})
