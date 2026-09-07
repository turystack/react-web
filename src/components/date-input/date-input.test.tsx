import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DateInput } from './date-input'

const JAN_15 = new Date(2026, 0, 15)
const JAN_20 = new Date(2026, 0, 20)
const JAN_20_LABEL = 'Tuesday, January 20th, 2026'

// With no value the calendar opens on the current month, so the clock is
// pinned: without it the day this suite clicks would drift out of the grid.
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['Date'],
  })
  vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DateInput', () => {
  it('shows the value in day/month/year', () => {
    render(<DateInput value={JAN_15} />)

    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026')
  })

  it('shows a day/month/year placeholder while empty', () => {
    render(<DateInput value={null} />)

    expect(screen.getByPlaceholderText('dd/mm/yyyy')).toHaveValue('')
  })

  it('honours a custom placeholder', () => {
    render(<DateInput placeholder="Pick a day" value={null} />)

    expect(screen.getByPlaceholderText('Pick a day')).toBeInTheDocument()
  })

  it('keeps the field read-only so the calendar is the only way in', () => {
    render(<DateInput value={JAN_15} />)

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('opens the calendar when the field is clicked', async () => {
    render(<DateInput value={JAN_15} />)

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('textbox'))

    expect(
      screen.getByRole('button', { name: JAN_20_LABEL }),
    ).toBeInTheDocument()
  })

  it('delivers the day the user picked', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(JAN_20)
  })

  it('closes the calendar once a day is picked', async () => {
    render(<DateInput value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('delivers null when the user unpicks the selected day', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Thursday, January 15th, 2026, selected',
      }),
    )

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('picks a day without an onChange listener', async () => {
    render(<DateInput defaultValue={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(screen.getByRole('textbox')).toHaveValue('20/01/2026')
  })
})

describe('DateInput host props', () => {
  it('opens on the month of the date it holds', async () => {
    render(<DateInput value={new Date(2026, 5, 15)} />)

    await userEvent.click(screen.getByRole('textbox'))

    expect(screen.getByRole('grid')).toHaveAccessibleName('June 2026')
  })

  it('opens on the month of the date it started with', async () => {
    render(<DateInput defaultValue={new Date(2025, 8, 3)} />)

    await userEvent.click(screen.getByRole('textbox'))

    expect(screen.getByRole('grid')).toHaveAccessibleName('September 2025')
  })

  it('keeps the class it was handed', () => {
    render(<DateInput className="max-w-40" value={null} />)

    expect(screen.getByRole('textbox')).toHaveClass('max-w-40')
  })

  it('calls the click handler it was handed and still opens', async () => {
    const onClick = vi.fn()
    render(<DateInput onClick={onClick} value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('button', { name: JAN_20_LABEL }),
    ).toBeInTheDocument()
  })

  it('takes the sections it was handed over its own', () => {
    render(
      <DateInput
        leftSection={<span>from</span>}
        rightSection={<span>to</span>}
        value={null}
      />,
    )

    expect(screen.getByText('from')).toBeInTheDocument()
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Clear date' }),
    ).not.toBeInTheDocument()
  })
})

describe('DateInput value ownership', () => {
  it('holds the controlled value after a pick', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(JAN_20)
    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026')
  })

  it('follows the user when it owns the value', async () => {
    render(<DateInput defaultValue={JAN_15} />)

    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026')

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(screen.getByRole('textbox')).toHaveValue('20/01/2026')
  })
})

describe('DateInput clear', () => {
  it('delivers null and leaves the calendar closed', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} value={JAN_15} />)

    const clear = screen.getByRole('button', { name: 'Clear date' })
    expect(clear).toHaveAttribute('tabindex', '0')

    await userEvent.click(clear)

    expect(onChange).toHaveBeenCalledWith(null)
    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('empties the field when it owns the value', async () => {
    render(<DateInput defaultValue={JAN_15} />)

    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }))

    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('stays out of the tab order while there is nothing to clear', () => {
    render(<DateInput value={null} />)

    expect(screen.getByRole('button', { name: 'Clear date' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })
})

describe('DateInput disabled', () => {
  it('blocks the calendar and takes the clear button out of reach', async () => {
    const onChange = vi.fn()
    render(<DateInput disabled onChange={onChange} value={JAN_15} />)

    const field = screen.getByRole('textbox')
    expect(field).toBeDisabled()

    await userEvent.click(field)

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear date' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('DateInput size %s', (size) => {
  it('still opens a calendar the user can pick from', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} size={size} value={JAN_15} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(JAN_20)
  })
})
