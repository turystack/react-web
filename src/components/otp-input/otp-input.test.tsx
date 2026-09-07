import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { OTPInput } from './otp-input'
import type { OTPInputSize } from './otp-input.types'

beforeAll(() => {
  // input-otp resolves the caret position from a timer that calls
  // `document.elementFromPoint`, which jsdom does not implement; without it the
  // very first focus throws asynchronously and fails the whole run.
  document.elementFromPoint = () => null
})

afterEach(async () => {
  // input-otp schedules caret-position timers at 0, 10 and 50ms that call
  // setState. Testing Library unmounts between tests, but a queued timer still
  // fires — and if it fires after the environment is torn down, `window` is
  // gone and vitest reports an unhandled error while every test passed.
  await new Promise((resolve) => setTimeout(resolve, 60))
})

function field() {
  return screen.getByTestId('otp-input-root')
}

describe('OTPInput', () => {
  it('lays out one cell per digit and no separator for a single group', () => {
    render(<OTPInput />)

    expect(screen.getAllByTestId('otp-input-slot')).toHaveLength(6)
    expect(screen.queryByTestId('otp-input-separator')).not.toBeInTheDocument()
    expect(field()).toHaveAttribute('maxlength', '6')
  })

  it('splits the cells into the groups the pattern asks for', () => {
    render(<OTPInput pattern={[3, 3]} />)

    expect(screen.getAllByTestId('otp-input-group')).toHaveLength(2)
    expect(screen.getAllByTestId('otp-input-slot')).toHaveLength(6)
    expect(screen.getAllByTestId('otp-input-separator')).toHaveLength(1)
  })

  it('sizes the code to the sum of the pattern', () => {
    render(<OTPInput pattern={[2, 2, 4]} />)

    expect(screen.getAllByTestId('otp-input-slot')).toHaveLength(8)
    expect(screen.getAllByTestId('otp-input-separator')).toHaveLength(2)
    expect(field()).toHaveAttribute('maxlength', '8')
  })

  it('delivers the whole code as it is typed', async () => {
    const onChange = vi.fn()
    render(<OTPInput onChange={onChange} pattern={[3, 3]} />)

    await userEvent.type(field(), '123')

    expect(onChange).toHaveBeenNthCalledWith(1, '1')
    expect(onChange).toHaveBeenNthCalledWith(2, '12')
    expect(onChange).toHaveBeenLastCalledWith('123')
  })

  it('delivers null once the code is emptied', async () => {
    const onChange = vi.fn()
    render(<OTPInput defaultValue="123" onChange={onChange} />)

    await userEvent.clear(field())

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('starts from defaultValue and changes on its own', async () => {
    render(<OTPInput defaultValue="12" />)

    expect(field()).toHaveValue('12')

    await userEvent.type(field(), '3')

    expect(field()).toHaveValue('123')
  })

  it('holds a controlled value while still reporting what was typed', async () => {
    const onChange = vi.fn()
    render(<OTPInput onChange={onChange} value="12" />)

    expect(field()).toHaveValue('12')

    await userEvent.type(field(), '3')

    expect(onChange).toHaveBeenLastCalledWith('123')
    expect(field()).toHaveValue('12')
  })

  it('reads a null controlled value as an empty code', () => {
    render(<OTPInput value={null} />)

    expect(field()).toHaveValue('')
  })

  it('reads a null defaultValue as an empty code', () => {
    render(<OTPInput defaultValue={null} />)

    expect(field()).toHaveValue('')
  })

  it('shows the caret on the cell being filled', async () => {
    render(<OTPInput />)

    expect(screen.queryByTestId('otp-input-caret')).not.toBeInTheDocument()

    await userEvent.click(field())

    expect(screen.getByTestId('otp-input-caret')).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as OTPInputSize[])(
  'OTPInput size %s',
  (size) => {
    it('keeps every cell and the typed code intact', async () => {
      render(<OTPInput size={size} />)

      await userEvent.type(field(), '42')

      expect(screen.getAllByTestId('otp-input-slot')).toHaveLength(6)
      expect(field()).toHaveValue('42')
    })
  },
)
