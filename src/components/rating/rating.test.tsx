import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Rating } from './rating'

describe('Rating', () => {
  it('renders five stars when no maximum is asked for', () => {
    render(<Rating value={0} />)

    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('renders as many stars as max asks for', () => {
    render(<Rating max={3} value={0} />)

    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('marks every star up to the value as filled', () => {
    render(<Rating onChange={vi.fn()} value={3} />)

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('draws a solid star up to the value and a hollow one past it', () => {
    render(<Rating value={3} />)

    const solid = within(screen.getByRole('button', { name: '3' }))
    expect(solid.getByTestId('icon-star-filled')).toBeInTheDocument()
    expect(solid.queryByTestId('icon-star')).not.toBeInTheDocument()

    const hollow = within(screen.getByRole('button', { name: '4' }))
    expect(hollow.getByTestId('icon-star')).toBeInTheDocument()
    expect(hollow.queryByTestId('icon-star-filled')).not.toBeInTheDocument()
  })

  it('fills the star the moment the value reaches it', () => {
    const { rerender } = render(<Rating value={1} />)

    const second = () => within(screen.getByRole('button', { name: '2' }))
    expect(second().getByTestId('icon-star')).toBeInTheDocument()

    rerender(<Rating value={2} />)
    expect(second().getByTestId('icon-star-filled')).toBeInTheDocument()
  })

  it('delivers the clicked position to onChange', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={1} />)

    await userEvent.click(screen.getByRole('button', { name: '4' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('delivers the first position when the first star is clicked', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={5} />)

    await userEvent.click(screen.getByRole('button', { name: '1' }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('disables every star and blocks onChange when readOnly', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} readOnly value={2} />)

    const star = screen.getByRole('button', { name: '4' })
    expect(star).toBeDisabled()

    await userEvent.click(star)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables every star when there is nothing to report the change to', () => {
    render(<Rating value={2} />)

    for (const star of screen.getAllByRole('button')) {
      expect(star).toBeDisabled()
    }
  })

  it('stays interactive at a custom star size', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} size={16} value={0} />)

    await userEvent.click(screen.getByRole('button', { name: '2' }))

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('marks no star as filled at value zero', () => {
    render(<Rating value={0} />)

    for (const star of screen.getAllByRole('button')) {
      expect(star).toHaveAttribute('aria-pressed', 'false')
    }
  })
})
