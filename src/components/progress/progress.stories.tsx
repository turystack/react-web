import type { Meta, StoryObj } from '@storybook/react-vite'

import { Progress } from './progress'

const meta = {
  component: Progress,
  title: 'Feedback/Progress',
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 60,
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Upload progress',
    value: 75,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <Progress label="Small" size="sm" value={40} />
      <Progress label="Medium" size="md" value={60} />
      <Progress label="Large" size="lg" value={80} />
    </div>
  ),
}

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const Full: Story = {
  args: {
    value: 100,
  },
}

export const RichLabel: Story = {
  args: {
    label: {
      content: 'Storage used',
      tooltip: '5 GB of 10 GB used',
    },
    value: 50,
  },
}
