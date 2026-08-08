import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Radio } from './radio'

const meta = {
  component: Radio,
  title: 'Form/Radio',
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Radio
        checked={checked}
        label="Accept terms and conditions"
        onChange={setChecked}
        value="accept"
      />
    )
  },
}

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Radio
        checked={checked}
        description="Receive emails about new products and features."
        label="Marketing emails"
        onChange={setChecked}
        value="marketing"
      />
    )
  },
}

export const Bordered: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Radio
        bordered
        checked={checked}
        description="With a visible container."
        label="Bordered radio"
        onChange={setChecked}
        value="bordered"
      />
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled',
    value: 'disabled',
  },
}

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('react')
    return (
      <Radio.Group
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
            label: 'Svelte',
            value: 'svelte',
          },
        ]}
        onChange={setValue}
        value={value}
        variant="horizontal"
      />
    )
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('a')
    return (
      <Radio.Group
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
            description: 'This option is not available.',
            disabled: true,
            label: 'Option C',
            value: 'c',
          },
        ]}
        onChange={setValue}
        value={value}
      />
    )
  },
}
