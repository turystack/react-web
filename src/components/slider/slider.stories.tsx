import type { Meta, StoryObj } from '@storybook/react-vite'

import { Slider } from './slider'

const meta = {
  component: Slider,
  title: 'Form/Slider',
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: 50,
    mode: 'single',
    orientation: 'horizontal',
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    mode: 'range',
    orientation: 'horizontal',
  },
}

export const Vertical: Story = {
  args: {
    defaultValue: 50,
    mode: 'single',
    orientation: 'vertical',
  },
}

export const Small: Story = {
  args: {
    defaultValue: 50,
    mode: 'single',
    orientation: 'horizontal',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    defaultValue: 50,
    mode: 'single',
    orientation: 'horizontal',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 50,
    disabled: true,
    mode: 'single',
    orientation: 'horizontal',
  },
}
