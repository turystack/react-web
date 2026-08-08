import type { Meta, StoryObj } from '@storybook/react-vite'

import { PhoneInput } from './phone-input'

const meta = {
  component: PhoneInput,
  title: 'Form/PhoneInput',
} satisfies Meta<typeof PhoneInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultCountry: 'BR',
    onChange: (e) => {
      console.log({
        e,
      })
    },
    placeholder: 'Enter your phone number',
    size: 'md',
  },
}

export const Sizes: Story = {
  args: {
    defaultCountry: 'BR',
  },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <PhoneInput {...args} placeholder="Small" size="sm" />
      <PhoneInput {...args} placeholder="Medium" size="md" />
      <PhoneInput {...args} placeholder="Large" size="lg" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    defaultCountry: 'BR',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    defaultCountry: 'BR',
    loading: true,
  },
}
