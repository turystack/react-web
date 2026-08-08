import type { Meta, StoryObj } from '@storybook/react-vite'

import { Loader } from './loader'

const meta = {
  component: Loader,
  title: 'Feedback/Loader',
} satisfies Meta<typeof Loader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

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
