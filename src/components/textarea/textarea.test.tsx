import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('delivers what was typed', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Notes" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'hi')

    expect(onChange).toHaveBeenLastCalledWith('hi')
  })

  it('delivers null when the field is emptied', async () => {
    const onChange = vi.fn()
    render(
      <Textarea aria-label="Notes" defaultValue="hi" onChange={onChange} />,
    )

    await userEvent.clear(screen.getByRole('textbox', { name: 'Notes' }))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('changes on its own when uncontrolled', async () => {
    const onChange = vi.fn()
    render(
      <Textarea aria-label="Notes" defaultValue="hi" onChange={onChange} />,
    )

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi!')
    expect(onChange).toHaveBeenLastCalledWith('hi!')
  })

  it('keeps the value it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Notes" onChange={onChange} value="hi" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi')
    expect(onChange).toHaveBeenLastCalledWith('hi!')
  })

  it('renders an empty field for a null value', () => {
    render(<Textarea aria-label="Notes" value={null} />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('')
  })

  it('starts empty when defaultValue is null', () => {
    render(<Textarea aria-label="Notes" defaultValue={null} />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('')
  })

  it('accepts typing with no onChange attached', async () => {
    render(<Textarea aria-label="Notes" defaultValue="hi" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi!')
  })

  it('counts the characters of the value against maxLength', () => {
    render(<Textarea aria-label="Notes" maxLength={10} value="hi" />)

    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('counts the characters of an uncontrolled value against maxLength', async () => {
    render(<Textarea aria-label="Notes" defaultValue="hi" maxLength={10} />)

    expect(screen.getByText('2/10')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), '!')

    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('counts from zero when an uncontrolled field starts empty', () => {
    render(<Textarea aria-label="Notes" maxLength={10} />)

    expect(screen.getByText('0/10')).toBeInTheDocument()
  })

  it('shows no counter without a maxLength', () => {
    render(<Textarea aria-label="Notes" value="hi" />)

    expect(screen.queryByText('2/10')).not.toBeInTheDocument()
  })

  it('stops the typing at maxLength', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Notes" maxLength={3} onChange={onChange} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, 'abcdef')

    expect(field).toHaveValue('abc')
    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('renders both sections beside the field', () => {
    render(
      <Textarea
        aria-label="Notes"
        leftSection={<span>left</span>}
        rightSection={<span>right</span>}
      />,
    )

    expect(screen.getByText('left')).toBeInTheDocument()
    expect(screen.getByText('right')).toBeInTheDocument()
  })

  it('blocks typing when disabled', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Notes" disabled onChange={onChange} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field).toBeDisabled()

    await userEvent.type(field, 'hi')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('carries the invalid state it was given', () => {
    render(<Textarea aria-invalid aria-label="Notes" />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('shows the placeholder it was given', () => {
    render(<Textarea aria-label="Notes" placeholder="Tell us more" />)

    expect(screen.getByPlaceholderText('Tell us more')).toBeInTheDocument()
  })

  // The class the caller hands over is the whole of what `className` promises,
  // so there is nothing else to observe it by; this is not the component's own
  // styling being pinned down.
  it('keeps the class it was given alongside its own', () => {
    render(<Textarea aria-label="Notes" className="notes-field" />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass(
      'notes-field',
    )
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Textarea size %s', (size) => {
  it('stays a reachable field', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Notes" onChange={onChange} size={size} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'a')

    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})
