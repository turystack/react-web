import type { Meta, StoryObj } from '@storybook/react-vite'

import { Label } from './label'

const meta = {
  args: {
    children: 'Email address',
  },
  component: Label,
  title: 'Form/Label',
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Required: Story = {
  args: {
    required: true,
  },
}

export const Optional: Story = {
  args: {
    optional: true,
  },
}

export const WithTooltip: Story = {
  args: {
    tooltip: 'We will not share your email with anyone.',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const FullFeatured: Story = {
  args: {
    children: 'Work email',
    required: true,
    tooltip: 'Must be a valid work email.',
  },
}
