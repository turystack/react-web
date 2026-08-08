import type { Meta, StoryObj } from '@storybook/react-vite'

import { Switch } from './switch'

const meta = {
  component: Switch,
  title: 'Form/Switch',
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Dark mode',
  },
}

export const WithDescription: Story = {
  args: {
    description: 'Receive email notifications when someone mentions you.',
    label: 'Notifications',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Small" size="sm" />
      <Switch label="Medium" size="md" />
      <Switch label="Large" size="lg" />
    </div>
  ),
}

export const Bordered: Story = {
  args: {
    bordered: true,
    description: 'Disable all wireless connections.',
    label: 'Airplane mode',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Dark mode',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled',
  },
}

export const RichLabel: Story = {
  args: {
    description: 'Receive updates about new features and promotions.',
    label: {
      content: 'Marketing emails',
      required: true,
      tooltip: 'You can unsubscribe anytime.',
    },
  },
}
