import type { Meta } from '@storybook/react-vite'
import { useState } from 'react'

import { Calendar } from './calendar'

const meta = {
  component: Calendar,
  title: 'Components/Calendar',
} satisfies Meta<typeof Calendar>

export default meta

export const Default = {
  render: () => <Calendar mode="single" />,
}

export const Controlled = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date())
    return (
      <div className="flex flex-col gap-2">
        <Calendar mode="single" onDateChange={setDate} selected={date} />
        <p className="text-muted-foreground text-sm">
          Selected: {date ? date.toLocaleDateString() : 'none'}
        </p>
      </div>
    )
  },
}

export const Uncontrolled = {
  render: () => <Calendar defaultMonth={new Date()} mode="single" />,
}

export const Range = {
  render: () => {
    const [range, setRange] = useState<{
      from?: Date
      to?: Date
    } | null>(null)
    return (
      <div className="flex flex-col gap-2">
        <Calendar mode="range" onDateChange={setRange} selected={range} />
        <p className="text-muted-foreground text-sm">
          From: {range?.from?.toLocaleDateString() ?? '–'} To:{' '}
          {range?.to?.toLocaleDateString() ?? '–'}
        </p>
      </div>
    )
  },
}

export const RangeControlled = {
  render: () => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    const [range, setRange] = useState<{
      from?: Date
      to?: Date
    } | null>({
      from: today,
      to: nextWeek,
    })
    return <Calendar mode="range" onDateChange={setRange} selected={range} />
  },
}

export const WithMinMax = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 30)
    return (
      <Calendar
        maxDate={maxDate}
        minDate={today}
        mode="single"
        onDateChange={setDate}
        selected={date}
      />
    )
  },
}

export const WithExcludeDate = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)
    return (
      <Calendar
        excludeDate={(d) => d.getDay() === 0 || d.getDay() === 6}
        mode="single"
        onDateChange={setDate}
        selected={date}
      />
    )
  },
}

export const Sizes = {
  render: () => (
    <div className="flex gap-4">
      <Calendar mode="single" size="sm" />
      <Calendar mode="single" size="md" />
      <Calendar mode="single" size="lg" />
    </div>
  ),
}

export const FullWidth = {
  render: () => <Calendar fullWidth mode="single" />,
}

export const NoTodayHighlight = {
  render: () => <Calendar highlightToday={false} mode="single" />,
}
