import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { TagsInput } from './tags-input'

const meta = {
  component: TagsInput,
  title: 'Form/TagsInput',
} satisfies Meta<typeof TagsInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Add tag...',
  },
}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: ['react', 'typescript', 'tailwind'],
    placeholder: 'Add tag...',
  },
}

export const Controlled: Story = {
  render: (args) => {
    const [tags, setTags] = useState(['react', 'typescript'])
    return (
      <TagsInput
        {...args}
        onChange={setTags}
        placeholder="Add tag..."
        value={tags}
      />
    )
  },
}

export const MaxTags: Story = {
  args: {
    defaultValue: ['react', 'typescript'],
    maxTags: 3,
    placeholder: 'Max 3 tags',
  },
}

export const NoDuplicates: Story = {
  args: {
    allowDuplicates: false,
    defaultValue: ['react'],
    placeholder: 'No duplicates allowed',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: ['react', 'typescript'],
    disabled: true,
  },
}
