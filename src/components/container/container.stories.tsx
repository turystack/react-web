import type { Meta, StoryObj } from '@storybook/react-vite'

import { Container } from './container'

const meta = {
  component: Container,
  title: 'Layout/Container',
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="rounded bg-muted p-4">Default container content</div>
    ),
  },
}

export const Centered: Story = {
  args: {
    centered: true,
    children: <div className="rounded bg-muted p-4">Centered container</div>,
    maxWidth: 'md',
  },
}

export const WithMaxWidth: Story = {
  args: {
    children: (
      <div className="rounded bg-muted p-4">
        Container with max-width constraint
      </div>
    ),
    maxWidth: 'sm',
  },
}

export const FullWidth: Story = {
  args: {
    children: <div className="rounded bg-muted p-4">Full width container</div>,
    maxWidth: 'full',
  },
}
