import type { Meta, StoryObj } from '@storybook/react-vite'

import { Box } from './box'

const meta = {
  component: Box,
  title: 'Layout/Box',
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default box',
  },
}

export const WithBackground: Story = {
  args: {
    bg: 'muted',
    children: 'Muted background',
    padding: 'md',
    rounded: 'md',
  },
}

export const WithPadding: Story = {
  args: {
    bg: 'card',
    children: 'Padded content',
    padding: 'lg',
    rounded: 'lg',
  },
}

export const WithRounded: Story = {
  args: {
    bg: 'muted',
    children: 'Rounded box',
    padding: 'md',
    rounded: 'xl',
  },
}

export const Grow: Story = {
  args: {
    bg: 'muted',
    children: 'I grow to fill available space',
    grow: true,
    padding: 'md',
  },
  decorators: [
    (Story) => (
      <div className="flex gap-4">
        <Story />
      </div>
    ),
  ],
}
