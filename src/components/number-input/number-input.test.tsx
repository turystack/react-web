import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { InputSize } from '@/components/input/input.types'

import { Form } from '../form'
import { NumberInput } from './number-input'

function field() {
  return screen.getByRole('textbox')
}

function increase() {
  return screen.getByRole('button', {
    name: 'Increase',
  })
}

function decrease() {
  return screen.getByRole('button', {
    name: 'Decrease',
  })
}

describe('NumberInput', () => {
  it('delivers the number the stepper reached', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={5} onChange={onChange} />)

    await userEvent.click(increase())

    expect(onChange).toHaveBeenLastCalledWith(6)
    expect(field()).toHaveValue('6')
  })

  it('steps by the amount it was given', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={10} onChange={onChange} step={5} />)

    await userEvent.click(increase())
    expect(onChange).toHaveBeenLastCalledWith(15)

    await userEvent.click(decrease())
    expect(onChange).toHaveBeenLastCalledWith(10)
  })

  it('delivers the number that was typed', async () => {
    const onChange = vi.fn()
    render(<NumberInput onChange={onChange} />)

    await userEvent.type(field(), '42')
    await userEvent.tab()

    expect(onChange).toHaveBeenLastCalledWith(42)
  })

  it('delivers null once the field is emptied', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={7} onChange={onChange} />)

    await userEvent.clear(field())

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('keeps the field empty after the empty value is committed', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={7} onChange={onChange} />)

    await userEvent.clear(field())
    await userEvent.tab()

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('discards text that is not a number', async () => {
    const onChange = vi.fn()
    render(<NumberInput onChange={onChange} />)

    await userEvent.type(field(), 'abc')
    await userEvent.tab()

    expect(onChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue('')
  })

  it('starts from defaultValue and changes on its own', async () => {
    render(<NumberInput defaultValue={3} />)

    expect(field()).toHaveValue('3')

    await userEvent.click(increase())

    expect(field()).toHaveValue('4')
  })

  it('holds a controlled value while still reporting the next one', async () => {
    const onChange = vi.fn()
    render(<NumberInput onChange={onChange} value={3} />)

    await userEvent.click(increase())

    expect(onChange).toHaveBeenLastCalledWith(4)
    expect(field()).toHaveValue('3')
  })

  it('reads a null controlled value as an empty field', () => {
    render(<NumberInput value={null} />)

    expect(field()).toHaveValue('')
  })

  it('reads a null defaultValue as an empty field', () => {
    render(<NumberInput defaultValue={null} />)

    expect(field()).toHaveValue('')
  })

  it('stops the stepper at the lower bound', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={0} min={0} onChange={onChange} />)

    await userEvent.click(decrease())

    expect(field()).toHaveValue('0')
    expect(onChange).not.toHaveBeenCalledWith(-1)
  })

  it('stops the stepper at the upper bound', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={10} max={10} onChange={onChange} />)

    await userEvent.click(increase())

    expect(field()).toHaveValue('10')
    expect(onChange).not.toHaveBeenCalledWith(11)
  })

  it('groups thousands by default', async () => {
    render(<NumberInput />)

    await userEvent.type(field(), '1234')
    await userEvent.tab()

    expect(field()).toHaveValue('1,234')
  })

  it('drops the thousands separator when grouping is off', async () => {
    render(<NumberInput grouping={false} />)

    await userEvent.type(field(), '1234')
    await userEvent.tab()

    expect(field()).toHaveValue('1234')
  })

  it('shows the placeholder while empty', () => {
    render(<NumberInput placeholder="How many?" />)

    expect(screen.getByPlaceholderText('How many?')).toBeInTheDocument()
  })

  it('blocks typing and stepping while disabled', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={5} disabled onChange={onChange} />)

    expect(field()).toBeDisabled()

    await userEvent.click(increase())
    await userEvent.type(field(), '9')

    expect(onChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue('5')
  })
})

describe('NumberInput form wiring', () => {
  it('is named by a Form.Field label through its id', () => {
    render(
      <Form.Field label="Guests" name="guests">
        <NumberInput id="guests" />
      </Form.Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Guests',
      }),
    ).toBe(field())
  })

  it('is named by a Form.Field label without an id of its own', () => {
    render(
      <Form.Field description="Up to 8" error="Too many" label="Guests">
        <NumberInput />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', {
      name: 'Guests',
    })
    expect(input).toBe(field())
    expect(input).toHaveAccessibleDescription('Up to 8 Too many')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('takes an accessible name from ariaLabel', () => {
    render(<NumberInput ariaLabel="Nights" />)

    expect(field()).toHaveAccessibleName('Nights')
  })

  it('submits its value under its name', () => {
    const { container } = render(
      <form>
        <NumberInput defaultValue={4} name="nights" />
      </form>,
    )

    const form = container.querySelector('form') as HTMLFormElement
    expect(new FormData(form).get('nights')).toBe('4')
  })

  it('marks the field invalid and points at its description', () => {
    render(<NumberInput aria-describedby="nights-error" aria-invalid />)

    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAttribute('aria-describedby', 'nights-error')
  })

  it('leaves aria-invalid off while valid', () => {
    render(<NumberInput aria-invalid={false} />)

    expect(field()).not.toHaveAttribute('aria-invalid')
  })

  it('is required when asked', () => {
    render(<NumberInput required />)

    expect(field()).toBeRequired()
  })

  it('refuses typing while readOnly', async () => {
    const onChange = vi.fn()
    render(<NumberInput defaultValue={2} onChange={onChange} readOnly />)

    await userEvent.type(field(), '9')

    expect(field()).toHaveAttribute('readonly')
    expect(field()).toHaveValue('2')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('NumberInput group naming', () => {
  it('names the stepper group by the Form.Field label', () => {
    render(
      <Form.Field label="Guests">
        <NumberInput />
      </Form.Field>,
    )

    expect(
      screen.getByRole('group', {
        name: 'Guests',
      }),
    ).toBe(screen.getByTestId('number-input-group'))
    expect(field()).toHaveAccessibleName('Guests')
  })

  it('names the stepper group by ariaLabel, which wins over the field label', () => {
    render(
      <Form.Field label="Guests">
        <NumberInput ariaLabel="Adults" />
      </Form.Field>,
    )

    const group = screen.getByRole('group', {
      name: 'Adults',
    })
    expect(group).not.toHaveAttribute('aria-labelledby')
    expect(field()).toHaveAccessibleName('Adults')
  })

  it('names the stepper group by ariaLabel outside a Form.Field', () => {
    render(<NumberInput ariaLabel="Nights" />)

    expect(
      screen.getByRole('group', {
        name: 'Nights',
      }),
    ).toBe(screen.getByTestId('number-input-group'))
  })

  it('renders no unnamed group when nothing names it', () => {
    render(<NumberInput />)

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.getByTestId('number-input-group')).not.toHaveAttribute('role')
  })

  it('renders no unnamed group inside a Form.Field without a label', () => {
    render(
      <Form.Field description="Up to 8">
        <NumberInput />
      </Form.Field>,
    )

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as InputSize[])(
  'NumberInput size %s',
  (size) => {
    it('keeps the field and both steppers usable', async () => {
      render(<NumberInput defaultValue={1} size={size} />)

      await userEvent.click(increase())

      expect(field()).toHaveValue('2')
      expect(decrease()).toBeInTheDocument()
    })
  },
)

describe('NumberInput axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<NumberInput />)

    expect(screen.getByTestId('number-input-root')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<NumberInput size="lg" />)

    expect(screen.getByTestId('number-input-root')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })
})
