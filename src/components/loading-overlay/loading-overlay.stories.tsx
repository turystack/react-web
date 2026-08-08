import type { Meta, StoryObj } from '@storybook/react-vite'

import { LoadingOverlay } from './loading-overlay'

const meta = {
  component: LoadingOverlay,
  title: 'Feedback/LoadingOverlay',
} satisfies Meta<typeof LoadingOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Hidden: Story = {
  args: {
    visible: false,
  },
}

export const Visible: Story = {
  args: {
    visible: true,
  },
}
