import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DateNativeInput } from './date-native-input'

const meta = {
  component: DateNativeInput,
  title: 'Mobile/DateNativeInput',
} satisfies Meta<typeof DateNativeInput>

export default meta
type Story = StoryObj<typeof meta>

export const DateOnly: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 4, 22))

    return (
      <DateNativeInput
        aria-label="Travel date"
        onChange={setValue}
        value={value}
      />
    )
  },
}

export const DateTime: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(
      new Date(2026, 4, 22, 14, 30),
    )

    return (
      <DateNativeInput
        aria-label="Departure date and time"
        mode="date-time"
        onChange={setValue}
        value={value}
      />
    )
  },
}

export const WithBounds: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null)

    return (
      <DateNativeInput
        aria-label="Date with bounds"
        maxDate={new Date(2026, 4, 31)}
        minDate={new Date(2026, 4, 1)}
        onChange={setValue}
        value={value}
      />
    )
  },
}

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled date',
    disabled: true,
    value: new Date(2026, 4, 22),
  },
}
