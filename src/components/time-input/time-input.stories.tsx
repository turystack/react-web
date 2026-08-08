import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Bell } from '@/internal/icons'

import { TimeInput } from './time-input'

const meta = {
  component: TimeInput,
  title: 'Form/TimeInput',
} satisfies Meta<typeof TimeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('08:30')
    return <TimeInput onChange={setTime} value={time} />
  },
}

export const WithSeconds: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('08:30:45')
    return <TimeInput onChange={setTime} value={time} withSeconds />
  },
}

export const WithBounds: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('14:00')
    return (
      <TimeInput
        maxTime="22:00"
        minTime="08:00"
        onChange={setTime}
        value={time}
      />
    )
  },
}

export const WithBoundsAndSeconds: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('12:00:00')
    return (
      <TimeInput
        maxTime="18:30:00"
        minTime="06:15:00"
        onChange={setTime}
        value={time}
        withSeconds
      />
    )
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '09:15',
  },
}

export const CustomLeftSection: Story = {
  args: {
    leftSection: <Bell size={14} />,
  },
}

export const NoLeftSection: Story = {
  args: {
    leftSection: null,
  },
}
