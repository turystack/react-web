import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ColorPicker } from './color-picker'

const meta = {
  component: ColorPicker,
  title: 'Form/ColorPicker',
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDefaultValue: Story = {
  args: {
    defaultValue: '#3b82f6',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <ColorPicker defaultValue="#22c55e" size="sm" />
      <ColorPicker defaultValue="#22c55e" size="md" />
      <ColorPicker defaultValue="#22c55e" size="lg" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    defaultValue: '#ef4444',
    disabled: true,
  },
}

export const WithoutCustomHex: Story = {
  args: {
    allowCustom: false,
    defaultValue: '#8b5cf6',
  },
}

export const WithTransparent: Story = {
  args: {
    allowTransparent: true,
    defaultValue: '#06b6d4',
  },
}

export const CustomColors: Story = {
  args: {
    colors: [
      '#fef3c7',
      '#fde68a',
      '#fcd34d',
      '#f59e0b',
      '#d97706',
      '#b45309',
      '#92400e',
      '#78350f',
    ],
    defaultValue: '#f59e0b',
  },
}

export const Controlled: Story = {
  render: () => {
    const [color, setColor] = useState<string | null>('#ec4899')
    return (
      <div className="flex w-72 flex-col gap-2">
        <ColorPicker onChange={setColor} value={color} />
        <p className="text-muted-foreground text-sm">
          Selected: <span className="font-mono">{color ?? 'none'}</span>
        </p>
      </div>
    )
  },
}

export const Invalid: Story = {
  args: {
    defaultValue: '#ef4444',
    invalid: true,
  },
}
