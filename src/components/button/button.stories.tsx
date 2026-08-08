import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search, Trash2 } from '@/internal/icons'

import { Button } from './button'

const meta = {
  args: {
    children: 'Button',
  },
  component: Button,
  title: 'Components/Button',
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Dashed: Story = {
  args: {
    variant: 'dashed',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Block: Story = {
  args: {
    block: true,
  },
}

export const WithLeftSection: Story = {
  args: {
    leftSection: <Search size={16} />,
  },
}

export const WithRightSection: Story = {
  args: {
    rightSection: <Trash2 size={16} />,
    variant: 'destructive',
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

export const IconMd: Story = {
  args: {
    children: <Search size={16} />,
    size: 'icon-md',
  },
}
