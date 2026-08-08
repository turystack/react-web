import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Checkbox } from './checkbox'

const meta = {
  component: Checkbox,
  title: 'Form/Checkbox',
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
}

export const WithDescription: Story = {
  args: {
    description: 'Receive emails about new products and features.',
    label: 'Marketing emails',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Already checked',
  },
}

export const Bordered: Story = {
  args: {
    bordered: true,
    description: 'With a visible container.',
    label: 'Bordered checkbox',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled',
  },
}

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Large',
    size: 'lg',
  },
}

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState(['react'])
    return (
      <Checkbox.Group
        items={[
          {
            label: 'React',
            value: 'react',
          },
          {
            label: 'Vue',
            value: 'vue',
          },
          {
            disabled: true,
            label: 'Svelte',
            value: 'svelte',
          },
        ]}
        onChange={setValue}
        value={value}
      />
    )
  },
}

export const HorizontalGroup: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    return (
      <Checkbox.Group
        items={[
          {
            label: 'Option A',
            value: 'a',
          },
          {
            label: 'Option B',
            value: 'b',
          },
          {
            label: 'Option C',
            value: 'c',
          },
        ]}
        onChange={setValue}
        value={value}
        variant="horizontal"
      />
    )
  },
}
