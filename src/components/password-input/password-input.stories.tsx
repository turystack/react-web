import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { PasswordInput } from './password-input'

const meta = {
  component: PasswordInput,
  title: 'Form/PasswordInput',
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter password',
  },
}

export const WithStrength: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <PasswordInput
        {...args}
        onChange={(v) => setValue(v ?? '')}
        placeholder="Enter password"
        showStrength
        value={value}
      />
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Enter password',
  },
}

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    placeholder: 'Enter password',
  },
}
