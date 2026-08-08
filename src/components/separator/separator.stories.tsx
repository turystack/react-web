import type { Meta, StoryObj } from '@storybook/react-vite'

import { Separator } from './separator'

const meta = {
  component: Separator,
  title: 'Components/Separator',
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="flex h-8 items-center gap-4">
        <span className="text-sm">Left</span>
        <Story />
        <span className="text-sm">Right</span>
      </div>
    ),
  ],
}
