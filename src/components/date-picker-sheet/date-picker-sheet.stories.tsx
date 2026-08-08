import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DatePickerSheet } from './date-picker-sheet'

const meta = {
  component: DatePickerSheet,
  title: 'Form/DatePickerSheet',
} satisfies Meta<typeof DatePickerSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date(2025, 0, 15))
    return <DatePickerSheet onChange={setDate} value={date} />
  },
}

export const WithMinDate: Story = {
  args: {
    description: 'Escolha a data de ida.',
    minDate: new Date(),
    title: 'Data de ida',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: new Date(2025, 5, 1),
  },
}
