import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ptBR } from 'date-fns/locale'
import { describe, expect, it, vi } from 'vitest'

import { Calendar } from './calendar'

const JUNE_2024 = new Date(2024, 5, 1)

function day(name: RegExp) {
  return screen.getByRole('button', {
    name,
  })
}

describe('Calendar mode single', () => {
  it('delivers the clicked date', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="single"
        onDateChange={onDateChange}
      />,
    )

    await userEvent.click(day(/June 15th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith(new Date(2024, 5, 15))
  })

  it('delivers null when the selected date is clicked again', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="single"
        onDateChange={onDateChange}
        selected={new Date(2024, 5, 15)}
      />,
    )

    await userEvent.click(day(/June 15th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith(null)
  })

  it('marks the selected date as selected', () => {
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="single"
        selected={new Date(2024, 5, 15)}
      />,
    )

    const selected = screen.getAllByRole('gridcell', {
      selected: true,
    })
    expect(selected).toHaveLength(1)
    expect(selected[0]).toHaveTextContent('15')
  })

  it('holds the controlled selection against a click', async () => {
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="single"
        onDateChange={vi.fn()}
        selected={new Date(2024, 5, 15)}
      />,
    )

    await userEvent.click(day(/June 20th, 2024/))

    expect(
      screen.getAllByRole('gridcell', { selected: true })[0],
    ).toHaveTextContent('15')
  })

  it('selects nothing when selected is null', () => {
    render(<Calendar defaultMonth={JUNE_2024} mode="single" selected={null} />)

    expect(
      screen.queryAllByRole('gridcell', {
        selected: true,
      }),
    ).toHaveLength(0)
  })

  it('shows a single month', () => {
    render(<Calendar defaultMonth={JUNE_2024} mode="single" />)

    expect(screen.getAllByRole('grid')).toHaveLength(1)
  })

  it('selects nothing on its own when nobody owns the selection', async () => {
    render(<Calendar defaultMonth={JUNE_2024} mode="single" />)

    await userEvent.click(day(/June 15th, 2024/))

    expect(
      screen.queryAllByRole('gridcell', {
        selected: true,
      }),
    ).toHaveLength(0)
  })
})

describe('Calendar mode range', () => {
  it('delivers a one-day range on the first click', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="range"
        onDateChange={onDateChange}
      />,
    )

    await userEvent.click(day(/June 10th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith({
      from: new Date(2024, 5, 10),
      to: new Date(2024, 5, 10),
    })
  })

  it('delivers both edges once the open range is closed', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="range"
        onDateChange={onDateChange}
        selected={{
          from: new Date(2024, 5, 10),
        }}
      />,
    )

    await userEvent.click(day(/June 14th, 2024/))

    expect(onDateChange).toHaveBeenLastCalledWith({
      from: new Date(2024, 5, 10),
      to: new Date(2024, 5, 14),
    })
  })

  it('delivers null when the one-day range is clicked again', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="range"
        onDateChange={onDateChange}
        selected={{
          from: new Date(2024, 5, 10),
          to: new Date(2024, 5, 10),
        }}
      />,
    )

    await userEvent.click(day(/June 10th, 2024/))

    expect(onDateChange).toHaveBeenLastCalledWith(null)
  })

  it('marks every day of the selected range', () => {
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="range"
        selected={{
          from: new Date(2024, 5, 10),
          to: new Date(2024, 5, 12),
        }}
      />,
    )

    expect(
      screen.getAllByRole('gridcell', {
        selected: true,
      }),
    ).toHaveLength(3)
  })

  it('selects nothing when the range is null', () => {
    render(<Calendar defaultMonth={JUNE_2024} mode="range" selected={null} />)

    expect(
      screen.queryAllByRole('gridcell', {
        selected: true,
      }),
    ).toHaveLength(0)
  })

  it('shows two months', () => {
    render(<Calendar defaultMonth={JUNE_2024} mode="range" />)

    expect(screen.getAllByRole('grid')).toHaveLength(2)
  })
})

describe('Calendar months', () => {
  it('shows as many months as it was asked for', () => {
    render(
      <Calendar defaultMonth={JUNE_2024} mode="single" numberOfMonths={3} />,
    )

    expect(
      screen
        .getAllByRole('grid')
        .map((grid) => grid.getAttribute('aria-label')),
    ).toEqual(['June 2024', 'July 2024', 'August 2024'])
  })

  it('moves on its own from a defaultMonth', async () => {
    const onMonthChange = vi.fn()
    render(
      <Calendar
        defaultMonth={JUNE_2024}
        mode="single"
        onMonthChange={onMonthChange}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to the Next Month' }),
    )

    expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 6, 1))
    expect(screen.getByRole('grid')).toHaveAccessibleName('July 2024')
  })

  it('holds the controlled month against navigation', async () => {
    const onMonthChange = vi.fn()
    render(
      <Calendar
        mode="single"
        month={JUNE_2024}
        onMonthChange={onMonthChange}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to the Next Month' }),
    )

    expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 6, 1))
    expect(screen.getByRole('grid')).toHaveAccessibleName('June 2024')
  })

  it('names the months in the locale it was given', () => {
    render(<Calendar locale={ptBR} mode="single" month={JUNE_2024} />)

    expect(screen.getByRole('grid')).toHaveAccessibleName(/junho/i)
  })
})

describe('Calendar bounds', () => {
  it('disables the days before minDate and after maxDate', () => {
    render(
      <Calendar
        maxDate={new Date(2024, 5, 20)}
        minDate={new Date(2024, 5, 10)}
        mode="single"
        month={JUNE_2024}
      />,
    )

    expect(day(/June 9th, 2024/)).toBeDisabled()
    expect(day(/June 10th, 2024/)).toBeEnabled()
    expect(day(/June 20th, 2024/)).toBeEnabled()
    expect(day(/June 21st, 2024/)).toBeDisabled()
  })

  it('blocks navigation past the bounds', () => {
    render(
      <Calendar
        maxDate={new Date(2024, 5, 20)}
        minDate={new Date(2024, 5, 10)}
        mode="single"
        month={JUNE_2024}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Go to the Previous Month' }),
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByRole('button', { name: 'Go to the Next Month' }),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('never delivers a date the bounds forbid', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        minDate={new Date(2024, 5, 10)}
        mode="single"
        month={JUNE_2024}
        onDateChange={onDateChange}
      />,
    )

    await userEvent.click(day(/June 5th, 2024/))

    expect(onDateChange).not.toHaveBeenCalled()
  })

  it('disables every date the exclusion rejects', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        excludeDate={(date) => date.getDay() === 0}
        mode="single"
        month={JUNE_2024}
        onDateChange={onDateChange}
      />,
    )

    expect(day(/Sunday, June 16th, 2024/)).toBeDisabled()
    expect(day(/Monday, June 17th, 2024/)).toBeEnabled()

    await userEvent.click(day(/Sunday, June 16th, 2024/))
    expect(onDateChange).not.toHaveBeenCalled()
  })
})

describe('Calendar outside days', () => {
  it('shows the neighbouring days by default', () => {
    render(<Calendar mode="single" month={JUNE_2024} />)

    expect(day(/May 26th, 2024/)).toBeInTheDocument()
  })

  it('hides the neighbouring days when asked to', () => {
    render(<Calendar mode="single" month={JUNE_2024} showOutsideDays={false} />)

    expect(
      screen.queryByRole('button', {
        name: /May 26th, 2024/,
      }),
    ).not.toBeInTheDocument()
  })
})

describe('Calendar today', () => {
  it('marks today as today', () => {
    render(<Calendar mode="single" />)

    expect(screen.getByRole('button', { name: /^Today,/ })).toBeInTheDocument()
    expect(document.querySelector('[data-today]')).toBeInTheDocument()
  })

  it('leaves today unmarked when it is not highlighted', () => {
    render(<Calendar highlightToday={false} mode="single" />)

    expect(document.querySelector('[data-today]')).toBeNull()
  })

  it('still renders a usable month when today is not highlighted', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        highlightToday={false}
        mode="single"
        month={JUNE_2024}
        onDateChange={onDateChange}
      />,
    )

    await userEvent.click(day(/June 15th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith(new Date(2024, 5, 15))
  })
})

describe('Calendar week start', () => {
  it('opens the week on Sunday by default', () => {
    render(<Calendar mode="single" month={JUNE_2024} />)

    expect(day(/May 26th, 2024/)).toBeInTheDocument()
  })

  it('opens the week on the weekday it was given', () => {
    render(<Calendar mode="single" month={JUNE_2024} weekStartsOn={1} />)

    expect(day(/May 27th, 2024/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: /May 26th, 2024/,
      }),
    ).not.toBeInTheDocument()
  })
})

describe('Calendar keyboard', () => {
  it('walks the days with the arrow keys', async () => {
    render(<Calendar mode="single" month={JUNE_2024} />)

    await userEvent.click(day(/June 15th, 2024/))
    await userEvent.keyboard('{ArrowRight}')

    expect(day(/June 16th, 2024/)).toHaveFocus()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Calendar size %s', (size) => {
  it('stays a usable calendar', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        mode="single"
        month={JUNE_2024}
        onDateChange={onDateChange}
        size={size}
      />,
    )

    await userEvent.click(day(/June 15th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith(new Date(2024, 5, 15))
  })
})

describe('Calendar layout', () => {
  it('stays a usable calendar at full width', async () => {
    const onDateChange = vi.fn()
    render(
      <Calendar
        className="border"
        fullWidth
        mode="single"
        month={JUNE_2024}
        onDateChange={onDateChange}
      />,
    )

    await userEvent.click(day(/June 15th, 2024/))

    expect(onDateChange).toHaveBeenCalledWith(new Date(2024, 5, 15))
  })
})
