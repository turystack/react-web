import type { Meta, StoryObj } from '@storybook/react-vite'

import { ColorSchemeSwitcher } from './color-scheme-switcher'

const meta = {
  component: ColorSchemeSwitcher,
  title: 'Components/ColorSchemeSwitcher',
} satisfies Meta<typeof ColorSchemeSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const Sizes: Story = {
  render: () => (
    <>
      <ColorSchemeSwitcher size="sm" />
      <ColorSchemeSwitcher size="md" />
      <ColorSchemeSwitcher size="lg" />
    </>
  ),
}
