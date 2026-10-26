import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('delivers what was typed', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'hi')

    expect(onChange).toHaveBeenLastCalledWith('hi')
  })

  it('delivers null when the field is emptied', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" defaultValue="hi" onChange={onChange} />)

    await userEvent.clear(screen.getByRole('textbox', { name: 'Notes' }))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('changes on its own when uncontrolled', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" defaultValue="hi" onChange={onChange} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi!')
    expect(onChange).toHaveBeenLastCalledWith('hi!')
  })

  it('keeps the value it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" onChange={onChange} value="hi" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi')
    expect(onChange).toHaveBeenLastCalledWith('hi!')
  })

  it('renders an empty field for a null value', () => {
    render(<Textarea ariaLabel="Notes" value={null} />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('')
  })

  it('starts empty when defaultValue is null', () => {
    render(<Textarea ariaLabel="Notes" defaultValue={null} />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('')
  })

  it('accepts typing with no onChange attached', async () => {
    render(<Textarea ariaLabel="Notes" defaultValue="hi" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, '!')

    expect(field).toHaveValue('hi!')
  })

  it('counts the characters of the value against maxLength', () => {
    render(<Textarea ariaLabel="Notes" maxLength={10} value="hi" />)

    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('counts the characters of an uncontrolled value against maxLength', async () => {
    render(<Textarea ariaLabel="Notes" defaultValue="hi" maxLength={10} />)

    expect(screen.getByText('2/10')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), '!')

    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('counts from zero when an uncontrolled field starts empty', () => {
    render(<Textarea ariaLabel="Notes" maxLength={10} />)

    expect(screen.getByText('0/10')).toBeInTheDocument()
  })

  it('shows no counter without a maxLength', () => {
    render(<Textarea ariaLabel="Notes" value="hi" />)

    expect(screen.queryByText('2/10')).not.toBeInTheDocument()
  })

  it('stops the typing at maxLength', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" maxLength={3} onChange={onChange} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, 'abcdef')

    expect(field).toHaveValue('abc')
    expect(onChange).toHaveBeenLastCalledWith('abc')
  })

  it('renders both sections beside the field', () => {
    render(
      <Textarea
        ariaLabel="Notes"
        leftSection={<span>left</span>}
        rightSection={<span>right</span>}
      />,
    )

    expect(screen.getByText('left')).toBeInTheDocument()
    expect(screen.getByText('right')).toBeInTheDocument()
  })

  it('blocks typing when disabled', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" disabled onChange={onChange} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field).toBeDisabled()

    await userEvent.type(field, 'hi')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('carries the invalid state it was given', () => {
    render(<Textarea aria-invalid ariaLabel="Notes" />)

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('shows the placeholder it was given', () => {
    render(<Textarea ariaLabel="Notes" placeholder="Tell us more" />)

    expect(screen.getByPlaceholderText('Tell us more')).toBeInTheDocument()
  })

  it('forwards the form-field attributes of its contract to the field', () => {
    render(
      <Textarea
        aria-describedby="notes-hint"
        autoComplete="off"
        autoFocus
        data-testid="notes-field"
        form="profile"
        id="notes"
        minLength={2}
        name="notes"
        readOnly
        required
        rows={6}
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).toBe(screen.getByTestId('notes-field'))
    expect(field).toHaveAttribute('id', 'notes')
    expect(field).toHaveAttribute('name', 'notes')
    expect(field).toHaveAttribute('form', 'profile')
    expect(field).toHaveAttribute('autocomplete', 'off')
    expect(field).toHaveAttribute('rows', '6')
    expect(field).toHaveAttribute('minlength', '2')
    expect(field).toHaveAttribute('aria-describedby', 'notes-hint')
    expect(field).toBeRequired()
    expect(field).toHaveAttribute('readonly')
    expect(field).toHaveFocus()
  })

  it('leaves the field optional, editable and unfocused unless told otherwise', () => {
    render(<Textarea ariaLabel="Notes" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field).not.toBeRequired()
    expect(field).not.toHaveAttribute('readonly')
    expect(field).not.toHaveFocus()
  })

  it('reports focus, blur and key presses', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const onKeyDown = vi.fn()
    render(
      <Textarea
        ariaLabel="Notes"
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />,
    )

    await userEvent.click(screen.getByRole('textbox', { name: 'Notes' }))
    await userEvent.keyboard('a')
    await userEvent.tab()

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'a',
      }),
    )
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('never lets a class or a style from outside restyle the field', () => {
    render(
      <Textarea
        ariaLabel="Notes"
        // @ts-expect-error — className and style are not part of the contract
        className="outside-class"
        style={{
          color: 'red',
        }}
      />,
    )

    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field).not.toHaveClass('outside-class')
    expect(field).not.toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Textarea size %s', (size) => {
  it('stays a reachable field', async () => {
    const onChange = vi.fn()
    render(<Textarea ariaLabel="Notes" onChange={onChange} size={size} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'a')

    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})

describe('Textarea axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Textarea ariaLabel="Notes" />)

    expect(screen.getByTestId('textarea-root')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<Textarea ariaLabel="Notes" size="sm" />)

    expect(screen.getByTestId('textarea-root')).toHaveAttribute(
      'data-size',
      'sm',
    )
  })
})
