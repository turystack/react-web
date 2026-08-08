import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MessageSquare, Search } from '@/internal/icons'

import { Textarea } from './textarea'

const meta = {
  component: Textarea,
  title: 'Form/Textarea',
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type something...',
  },
}

export const Uncontrolled: Story = {
  args: {
    defaultValue: 'This is an uncontrolled textarea with a default value.',
    placeholder: 'Type something...',
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('Edit this text...')
    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Textarea
          onChange={setValue}
          placeholder="Type here..."
          value={value}
        />
        <span className="text-muted-foreground text-xs">
          Value: {value === null ? 'null' : `"${value}"`}
        </span>
      </div>
    )
  },
}

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('Hello, world!')
    return (
      <div className="w-full max-w-md">
        <Textarea
          maxLength={200}
          onChange={setValue}
          placeholder="Max 200 characters..."
          value={value}
        />
      </div>
    )
  },
}

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Write your message here...',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'This textarea is disabled',
    disabled: true,
  },
}

export const WithSections: Story = {
  args: {
    leftSection: <MessageSquare className="size-4" />,
    placeholder: 'Write a message...',
    rightSection: <Search className="size-4" />,
  },
}

export const Small: Story = {
  args: {
    placeholder: 'Small textarea',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    placeholder: 'Large textarea',
    size: 'lg',
  },
}

export const EmptyToNull: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('Clear me to see null')
    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Textarea
          onChange={setValue}
          placeholder="Clear the text..."
          value={value}
        />
        <span className="text-muted-foreground text-xs">
          onChange value: {value === null ? 'null' : `"${value}"`}
        </span>
      </div>
    )
  },
}

export const WithMaxLengthUncontrolled: Story = {
  args: {
    defaultValue: 'Uncontrolled with max length',
    maxLength: 100,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Textarea placeholder="Small" size="sm" />
      <Textarea placeholder="Medium (default)" size="md" />
      <Textarea placeholder="Large" size="lg" />
    </div>
  ),
}
