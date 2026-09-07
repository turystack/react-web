import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DateTimeInput } from './date-time-input'

const JAN_15_1430 = new Date(2026, 0, 15, 14, 30)
const JAN_15_LABEL = 'Thursday, January 15th, 2026, selected'
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

async function open() {
  await userEvent.click(screen.getByRole('textbox'))
}

describe('DateTimeInput display', () => {
  it('shows the committed value with hours and minutes', () => {
    render(<DateTimeInput value={JAN_15_1430} />)

    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026 14:30')
  })

  it('shows the seconds when asked for them', () => {
    render(
      <DateTimeInput value={new Date(2026, 0, 15, 14, 30, 45)} withSeconds />,
    )

    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026 14:30:45')
  })

  it('honours a custom display format', () => {
    render(<DateTimeInput value={JAN_15_1430} valueFormat="yyyy-MM-dd HH'h'" />)

    expect(screen.getByRole('textbox')).toHaveValue('2026-01-15 14h')
  })

  it('offers a placeholder that matches the precision', () => {
    const { rerender } = render(<DateTimeInput value={null} />)
    expect(screen.getByPlaceholderText('dd/mm/yyyy hh:mm')).toBeInTheDocument()

    rerender(<DateTimeInput value={null} withSeconds />)
    expect(
      screen.getByPlaceholderText('dd/mm/yyyy hh:mm:ss'),
    ).toBeInTheDocument()
  })

  it('honours a custom placeholder', () => {
    render(<DateTimeInput placeholder="When?" value={null} />)

    expect(screen.getByPlaceholderText('When?')).toBeInTheDocument()
  })

  it('keeps the field read-only so the popover is the only way in', () => {
    render(<DateTimeInput value={JAN_15_1430} />)

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })
})

describe('DateTimeInput picking a date', () => {
  it('opens a calendar and a time control together', async () => {
    render(<DateTimeInput value={JAN_15_1430} />)

    await open()

    expect(
      screen.getByRole('button', { name: JAN_20_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('hours')).toHaveValue('14')
    expect(screen.getByLabelText('minutes')).toHaveValue('30')
  })

  it('keeps the time already committed', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 14, 30, 0))
  })

  it('applies midnight when nothing has been committed yet', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={null} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 0, 0, 0))
  })

  it('applies the default time it was given', async () => {
    const onChange = vi.fn()
    render(
      <DateTimeInput defaultTime="09:15" onChange={onChange} value={null} />,
    )

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 9, 15, 0))
  })

  it('accepts a default time that is not zero padded', async () => {
    const onChange = vi.fn()
    render(
      <DateTimeInput defaultTime="9:15" onChange={onChange} value={null} />,
    )

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 9, 15, 0))
  })

  it('applies a seconds-aware midnight when seconds are shown', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={null} withSeconds />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 0, 0, 0))
  })

  it('leaves the popover open and hands focus to the hours', async () => {
    render(<DateTimeInput value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(
      screen.getByRole('button', { name: JAN_20_LABEL }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText('hours')).toHaveFocus()
    })
  })

  it('delivers null when the selected day is unpicked', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_15_LABEL }))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('refuses days outside the given bounds', async () => {
    render(
      <DateTimeInput
        maxDate={new Date(2026, 0, 20)}
        minDate={new Date(2026, 0, 12)}
        value={JAN_15_1430}
      />,
    )

    await open()

    expect(
      screen.getByRole('button', { name: 'Sunday, January 11th, 2026' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Wednesday, January 21st, 2026' }),
    ).toBeDisabled()
  })
})

describe('DateTimeInput picking a time', () => {
  it('merges every complete time into the committed date', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByLabelText('hours'))
    await userEvent.keyboard('09')

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 0, 15, 9, 30, 0))
  })

  it('merges the seconds when they are shown', async () => {
    const onChange = vi.fn()
    render(
      <DateTimeInput
        onChange={onChange}
        value={new Date(2026, 0, 15, 14, 30, 45)}
        withSeconds
      />,
    )

    await open()
    await userEvent.click(screen.getByLabelText('seconds'))
    await userEvent.keyboard('07')

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 0, 15, 14, 30, 7))
  })

  it('absorbs an incomplete time instead of nulling the value', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByLabelText('hours'))
    await userEvent.keyboard('{Backspace}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026 14:30')
  })

  it('commits nothing while no date has been chosen', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={null} />)

    await open()
    await userEvent.click(screen.getByLabelText('hours'))
    await userEvent.keyboard('0915')

    expect(screen.getByLabelText('hours')).toHaveValue('09')
    expect(screen.getByLabelText('minutes')).toHaveValue('15')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})

describe('DateTimeInput closing', () => {
  it('closes on the confirm button without changing the value', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes on Enter inside the time control without changing the value', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByLabelText('hours'))
    await userEvent.keyboard('{Enter}')

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('stays open on any other key inside the time control', async () => {
    render(<DateTimeInput value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByLabelText('hours'))
    await userEvent.keyboard('{Tab}')

    expect(
      screen.getByRole('button', { name: JAN_20_LABEL }),
    ).toBeInTheDocument()
  })

  it('closes on Escape without changing the value', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.keyboard('{Escape}')

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('DateTimeInput value ownership', () => {
  it('holds the controlled value after a pick', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput onChange={onChange} value={JAN_15_1430} />)

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 14, 30, 0))
    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026 14:30')
  })

  it('follows the user when it owns the value', async () => {
    render(<DateTimeInput defaultValue={JAN_15_1430} />)

    expect(screen.getByRole('textbox')).toHaveValue('15/01/2026 14:30')

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(screen.getByRole('textbox')).toHaveValue('20/01/2026 14:30')
  })
})

describe('DateTimeInput clear', () => {
  it('delivers null and empties the field', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput defaultValue={JAN_15_1430} onChange={onChange} />)

    const clear = screen.getByRole('button', { name: 'Clear date' })
    expect(clear).toHaveAttribute('tabindex', '0')

    await userEvent.click(clear)

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('stays out of the tab order while there is nothing to clear', () => {
    render(<DateTimeInput value={null} />)

    expect(screen.getByRole('button', { name: 'Clear date' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })
})

describe('DateTimeInput host props', () => {
  it('opens on the month of the date it holds', async () => {
    render(<DateTimeInput value={new Date(2026, 5, 15, 9, 0)} />)

    await open()

    expect(screen.getByRole('grid')).toHaveAccessibleName('June 2026')
  })

  it('opens on the month of the date it started with', async () => {
    render(<DateTimeInput defaultValue={new Date(2025, 8, 3, 9, 0)} />)

    await open()

    expect(screen.getByRole('grid')).toHaveAccessibleName('September 2025')
  })

  it('keeps the class it was handed', () => {
    render(<DateTimeInput className="max-w-40" value={null} />)

    expect(screen.getByRole('textbox')).toHaveClass('max-w-40')
  })

  it('takes the sections it was handed over its own', () => {
    render(
      <DateTimeInput
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

describe('DateTimeInput disabled', () => {
  it('blocks the popover and the clear button', async () => {
    const onChange = vi.fn()
    render(<DateTimeInput disabled onChange={onChange} value={JAN_15_1430} />)

    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeDisabled()

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(
      screen.queryByRole('button', { name: JAN_20_LABEL }),
    ).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('DateTimeInput size %s', (size) => {
  it('still commits a picked day', async () => {
    const onChange = vi.fn()
    render(
      <DateTimeInput onChange={onChange} size={size} value={JAN_15_1430} />,
    )

    await open()
    await userEvent.click(screen.getByRole('button', { name: JAN_20_LABEL }))

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 20, 14, 30, 0))
  })
})
