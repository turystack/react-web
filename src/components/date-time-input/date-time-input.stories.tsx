import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DateTimeInput } from './date-time-input'

const meta = {
  component: DateTimeInput,
  title: 'Form/DateTimeInput',
} satisfies Meta<typeof DateTimeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(
      new Date(2026, 3, 29, 14, 30),
    )
    return <DateTimeInput onChange={setValue} value={value} />
  },
}

export const WithSeconds: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(
      new Date(2026, 3, 29, 14, 30, 45),
    )
    return <DateTimeInput onChange={setValue} value={value} withSeconds />
  },
}

export const CustomDefaultTime: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null)
    return (
      <DateTimeInput defaultTime="09:00" onChange={setValue} value={value} />
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: new Date(2026, 5, 1, 10, 0),
  },
}
