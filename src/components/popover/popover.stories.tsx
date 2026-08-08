import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/components/button'

import { Popover } from './popover'

const meta = {
  args: {
    children: <Button variant="outline">Open popover</Button>,
    content: <p>This is the popover content.</p>,
  },
  component: Popover,
  title: 'Components/Popover',
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Top: Story = {
  args: {
    side: 'top',
  },
}

export const Left: Story = {
  args: {
    side: 'left',
  },
}

export const Right: Story = {
  args: {
    side: 'right',
  },
}

export const AlignStart: Story = {
  args: {
    align: 'start',
  },
}

export const AlignEnd: Story = {
  args: {
    align: 'end',
  },
}

export const RichContent: Story = {
  args: {
    content: (
      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm">Dimensions</p>
        <p className="text-muted-foreground text-xs">
          Set the dimensions for the layer you want to add.
        </p>
      </div>
    ),
  },
}
