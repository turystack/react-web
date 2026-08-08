import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import type { BadgeVariant } from './badge.types'

const meta = {
  args: {
    children: 'Badge',
  },
  component: Badge,
  title: 'Components/Badge',
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
}

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
}

export const Solid: Story = {
  args: {
    children: 'Solid',
    variant: 'solid',
  },
}

export const SolidDestructive: Story = {
  args: {
    children: 'Error',
    variant: 'solid-destructive',
  },
}

export const SolidSuccess: Story = {
  args: {
    children: 'Done',
    variant: 'solid-success',
  },
}

export const SolidInfo: Story = {
  args: {
    children: 'Info',
    variant: 'solid-info',
  },
}

export const Purple: Story = {
  args: {
    children: 'Purple',
    variant: 'purple',
  },
}

export const Pink: Story = {
  args: {
    children: 'Pink',
    variant: 'pink',
  },
}

export const Teal: Story = {
  args: {
    children: 'Teal',
    variant: 'teal',
  },
}

export const Orange: Story = {
  args: {
    children: 'Orange',
    variant: 'orange',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Block: Story = {
  args: {
    block: true,
  },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
}

export const AlignStart: Story = {
  args: {
    align: 'start',
    block: true,
  },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
}

const allVariants: BadgeVariant[] = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
  'solid',
  'solid-destructive',
  'solid-success',
  'solid-info',
  'purple',
  'pink',
  'teal',
  'orange',
]

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {allVariants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
}
