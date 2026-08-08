import type { Meta, StoryObj } from '@storybook/react-vite'

import { Brand } from './brand'

const meta = {
  component: Brand,
  title: 'Layout/Brand',
} satisfies Meta<typeof Brand>

export default meta
type Story = StoryObj<typeof meta>

export const Sidebar: Story = {
  args: {
    alt: 'OABus',
    subtitle: 'Backoffice',
    text: 'visible',
    title: 'OABus',
    variant: 'sidebar',
  },
}

export const SidebarResponsive: Story = {
  args: {
    ...Sidebar.args,
    text: 'responsive',
  },
}

export const IconOnly: Story = {
  args: {
    alt: 'OABus',
    text: 'hidden',
    title: 'OABus',
    variant: 'sidebar',
  },
}

export const Auth: Story = {
  args: {
    alt: 'OABus',
    size: 'lg',
    title: 'OABus Backoffice',
    variant: 'auth',
  },
}

export const Sizes: Story = {
  args: {
    alt: 'OABus',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {['sm', 'md', 'lg'].map((size) => (
        <Brand
          alt="OABus"
          key={size}
          size={size as 'sm' | 'md' | 'lg'}
          subtitle="Backoffice"
          title="OABus"
          variant="sidebar"
        />
      ))}
    </div>
  ),
}
