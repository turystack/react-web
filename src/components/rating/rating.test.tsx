import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Form } from '@/components/form'

import { Rating } from './rating'

function Controlled({
  initial = 0,
  onChange,
}: {
  initial?: number
  onChange?: (value: number) => void
}) {
  const [value, setValue] = useState(initial)

  return (
    <Rating
      ariaLabel="Your rating"
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      value={value}
    />
  )
}

/** The star drawn for a position: the label around its radio. */
function option(name: string) {
  const label = screen.getByRole('radio', { name }).closest('label')
  if (!label) {
    throw new Error(`no label around star ${name}`)
  }
  return label
}

describe('Rating', () => {
  it('renders five stars when no maximum is asked for', () => {
    render(<Rating value={0} />)

    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('renders as many stars as max asks for', () => {
    render(<Rating max={3} value={0} />)

    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('checks only the star that is the value', () => {
    render(<Rating onChange={vi.fn()} value={3} />)

    expect(screen.getByRole('radio', { name: '3' })).toBeChecked()
    for (const name of ['1', '2', '4', '5']) {
      expect(screen.getByRole('radio', { name })).not.toBeChecked()
    }
  })

  it('draws a solid star up to the value and a hollow one past it', () => {
    render(<Rating value={3} />)

    const below = within(option('2'))
    expect(below.getByTestId('icon-star-filled')).toBeInTheDocument()

    const solid = within(option('3'))
    expect(solid.getByTestId('icon-star-filled')).toBeInTheDocument()
    expect(solid.queryByTestId('icon-star')).not.toBeInTheDocument()

    const hollow = within(option('4'))
    expect(hollow.getByTestId('icon-star')).toBeInTheDocument()
    expect(hollow.queryByTestId('icon-star-filled')).not.toBeInTheDocument()
  })

  it('fills the star the moment the value reaches it', () => {
    const { rerender } = render(<Rating value={1} />)

    const second = () => within(option('2'))
    expect(second().getByTestId('icon-star')).toBeInTheDocument()

    rerender(<Rating value={2} />)
    expect(second().getByTestId('icon-star-filled')).toBeInTheDocument()
  })

  it('delivers the clicked position to onChange', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={1} />)

    await userEvent.click(screen.getByRole('radio', { name: '4' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('delivers the first position when the first star is clicked', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={5} />)

    await userEvent.click(screen.getByRole('radio', { name: '1' }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('disables every star, blocks onChange and marks the group read-only when readOnly', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} readOnly value={2} />)

    const star = screen.getByRole('radio', { name: '4' })
    expect(star).toBeDisabled()
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-readonly',
      'true',
    )

    await userEvent.click(star)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables every star when there is nothing to report the change to', () => {
    render(<Rating value={2} />)

    for (const star of screen.getAllByRole('radio')) {
      expect(star).toBeDisabled()
    }
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-readonly')
  })

  it('stays interactive at a custom star size', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} size={16} value={0} />)

    await userEvent.click(screen.getByRole('radio', { name: '2' }))

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('checks no star at value zero', () => {
    render(<Rating value={0} />)

    for (const star of screen.getAllByRole('radio')) {
      expect(star).not.toBeChecked()
    }
  })
})

describe('Rating as a radio group', () => {
  it('is built from native radios sharing one name', () => {
    render(<Rating onChange={vi.fn()} value={2} />)

    const stars = screen.getAllByRole('radio')
    expect(stars.every((star) => star.tagName === 'INPUT')).toBe(true)
    expect(stars.every((star) => !star.hasAttribute('role'))).toBe(true)
    expect(new Set(stars.map((star) => star.getAttribute('name'))).size).toBe(1)
    expect(stars[0]?.getAttribute('name')).toBeTruthy()
  })

  it('keeps two ratings on one page apart', () => {
    render(
      <>
        <Rating ariaLabel="Food" onChange={vi.fn()} value={2} />
        <Rating ariaLabel="Service" onChange={vi.fn()} value={4} />
      </>,
    )

    const food = screen.getByRole('radiogroup', { name: 'Food' })
    const service = screen.getByRole('radiogroup', { name: 'Service' })
    expect(within(food).getByRole('radio', { name: '2' })).toBeChecked()
    expect(within(service).getByRole('radio', { name: '4' })).toBeChecked()
    // One radio group each: a shared name would make them one group to the
    // browser, with one tab stop and one checked star between them.
    expect(
      within(food).getByRole('radio', { name: '1' }).getAttribute('name'),
    ).not.toBe(
      within(service).getByRole('radio', { name: '1' }).getAttribute('name'),
    )
  })

  it('reports nothing when the chosen star is chosen again', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={3} />)

    await userEvent.click(screen.getByRole('radio', { name: '3' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('chooses a star from a click on its drawing', async () => {
    const onChange = vi.fn()
    render(<Rating onChange={onChange} value={1} />)

    await userEvent.click(within(option('3')).getByTestId('icon-star'))

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('is a radio group named by ariaLabel', () => {
    render(<Rating ariaLabel="Your rating" value={0} />)

    const group = screen.getByRole('radiogroup', { name: 'Your rating' })
    expect(group).toHaveClass('rating-root')
    expect(within(group).getAllByRole('radio')).toHaveLength(5)
  })

  it('has one tab stop: the chosen star', () => {
    render(<Rating onChange={vi.fn()} value={3} />)

    expect(screen.getAllByRole('radio').map((star) => star.tabIndex)).toEqual([
      -1, -1, 0, -1, -1,
    ])
  })

  it('has one tab stop on the first star while nothing is chosen', async () => {
    render(
      <>
        <button type="button">before</button>
        <Rating onChange={vi.fn()} value={0} />
        <button type="button">after</button>
      </>,
    )

    screen.getByRole('button', { name: 'before' }).focus()
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: '1' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
  })

  it('moves the choice and the focus with Right and Down', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={2} onChange={onChange} />)

    screen.getByRole('radio', { name: '2' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(3)
    expect(screen.getByRole('radio', { name: '3' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: '3' })).toBeChecked()

    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith(4)
    expect(screen.getByRole('radio', { name: '4' })).toHaveFocus()
  })

  it('moves the choice back with Left and Up', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={4} onChange={onChange} />)

    screen.getByRole('radio', { name: '4' }).focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith(3)
    await userEvent.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith(2)
    expect(screen.getByRole('radio', { name: '2' })).toHaveFocus()
  })

  it('jumps to the ends with Home and End', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={3} onChange={onChange} />)

    screen.getByRole('radio', { name: '3' }).focus()
    await userEvent.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith(5)
    expect(screen.getByRole('radio', { name: '5' })).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('radio', { name: '1' })).toHaveFocus()
  })

  it('stops at the ends instead of wrapping', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={5} onChange={onChange} />)

    screen.getByRole('radio', { name: '5' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: '5' })).toHaveFocus()

    await userEvent.keyboard('{Home}{ArrowLeft}')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('radio', { name: '1' })).toHaveFocus()
  })

  it('ignores other keys', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={2} onChange={onChange} />)

    screen.getByRole('radio', { name: '2' }).focus()
    await userEvent.keyboard('a')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('chooses the focused star from Space', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={0} onChange={onChange} />)

    screen.getByRole('radio', { name: '1' }).focus()
    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('is named by the Form.Field label and described by its error', () => {
    render(
      <Form.Field error="Pick a rating" label="How was your stay?">
        <Rating onChange={vi.fn()} value={0} />
      </Form.Field>,
    )

    const group = screen.getByRole('radiogroup', {
      name: 'How was your stay?',
    })
    expect(group).toHaveAttribute(
      'aria-labelledby',
      screen.getByText('How was your stay?').id,
    )
    expect(group).toHaveAccessibleDescription(/Pick a rating/)
    expect(group).toHaveAttribute('aria-invalid', 'true')
  })

  it('lets ariaLabel win over the Form.Field label', () => {
    render(
      <Form.Field label="How was your stay?">
        <Rating ariaLabel="Stay rating" onChange={vi.fn()} value={0} />
      </Form.Field>,
    )

    const group = screen.getByRole('radiogroup', { name: 'Stay rating' })
    expect(group).not.toHaveAttribute('aria-labelledby')
  })

  it('is named by a Form.FieldSet legend', () => {
    render(
      <Form.FieldSet legend="Service">
        <Rating onChange={vi.fn()} value={0} />
      </Form.FieldSet>,
    )

    expect(
      screen.getByRole('radiogroup', { name: 'Service' }),
    ).toBeInTheDocument()
  })

  it('carries no field wiring outside a form', () => {
    render(<Rating value={0} />)

    const group = screen.getByRole('radiogroup')
    expect(group).not.toHaveAttribute('aria-labelledby')
    expect(group).not.toHaveAttribute('aria-describedby')
    expect(group).not.toHaveAttribute('aria-invalid')
  })
})
