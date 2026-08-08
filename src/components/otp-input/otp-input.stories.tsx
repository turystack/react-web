import type { Meta, StoryObj } from '@storybook/react-vite'

import { OTPInput } from './otp-input'

const meta = {
  component: OTPInput,
  title: 'Form/OTPInput',
} satisfies Meta<typeof OTPInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSeparator: Story = {
  args: {
    pattern: [3, 3],
  },
}

export const FourDigit: Story = {
  args: {
    pattern: [4],
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
