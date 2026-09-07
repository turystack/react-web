import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { InputSize } from '@/components/input/input.types'

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
