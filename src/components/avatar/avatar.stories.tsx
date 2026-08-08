import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar } from './avatar'

const meta = {
  component: Avatar,
  title: 'Feedback/Avatar',
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    alt: 'User avatar',
    src: 'https://i.pravatar.cc/150?u=1',
  },
}

export const Fallback: Story = {
  args: {
    alt: 'John Doe',
    children: 'JD',
  },
}

export const Small: Story = {
  args: {
    alt: 'Small avatar',
    size: 'sm',
    src: 'https://i.pravatar.cc/150?u=2',
  },
}

export const Large: Story = {
  args: {
    alt: 'Large avatar',
    size: 'lg',
    src: 'https://i.pravatar.cc/150?u=3',
  },
}

export const Square: Story = {
  args: {
    alt: 'Square avatar',
    src: 'https://i.pravatar.cc/150?u=4',
    variant: 'square',
  },
}

export const SquareFallback: Story = {
  args: {
    alt: 'Ana Silva',
    children: 'AS',
    variant: 'square',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="Small" size="sm" src="https://i.pravatar.cc/150?u=5" />
      <Avatar alt="Medium" size="md" src="https://i.pravatar.cc/150?u=5" />
      <Avatar alt="Large" size="lg" src="https://i.pravatar.cc/150?u=5" />
    </div>
  ),
}
