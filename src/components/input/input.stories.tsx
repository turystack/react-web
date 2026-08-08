import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Search } from '@/internal/icons'

import { Input } from './input'

const meta = {
  args: {
    placeholder: 'Type something...',
  },
  component: Input,
  title: 'Form/Input',
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLeftSection: Story = {
  args: {
    leftSection: <Search size={16} />,
  },
}

export const WithRightSection: Story = {
  args: {
    rightSection: <span className="text-muted-foreground text-xs">kg</span>,
  },
}

export const Ghost: Story = {
  args: {
    placeholder: 'Borderless input...',
    variant: 'ghost',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Debounced: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)

    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Input debounce onChange={setValue} placeholder="Type to debounce..." />
        <span className="text-muted-foreground text-xs">
          Debounced value: {value === null ? 'null' : `"${value}"`}
        </span>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled value',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}
