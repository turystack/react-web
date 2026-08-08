import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DateInput } from './date-input'

const meta = {
  component: DateInput,
  title: 'Form/DateInput',
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date(2025, 0, 15))
    return <DateInput onChange={setDate} value={date} />
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: new Date(2025, 5, 1),
  },
}
