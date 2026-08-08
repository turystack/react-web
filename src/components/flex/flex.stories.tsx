import type { Meta, StoryObj } from '@storybook/react-vite'

import { Flex } from './flex'

const meta = {
  component: Flex,
  title: 'Layout/Flex',
} satisfies Meta<typeof Flex>

export default meta
type Story = StoryObj<typeof meta>

const items = (
  <>
    <div className="rounded bg-muted p-4">Item 1</div>
    <div className="rounded bg-muted p-4">Item 2</div>
    <div className="rounded bg-muted p-4">Item 3</div>
  </>
)

export const Default: Story = {
  args: {
    children: items,
  },
}

export const Column: Story = {
  args: {
    children: items,
    direction: 'col',
    gap: 'md',
  },
}

export const CenterBoth: Story = {
  args: {
    align: 'center',
    children: items,
    gap: 'md',
    justify: 'center',
    minHeight: 'sm',
  },
}

export const SpaceBetween: Story = {
  args: {
    block: true,
    children: items,
    justify: 'between',
  },
}

export const WithGap: Story = {
  args: {
    children: items,
    gap: 'lg',
  },
}

export const WithWrap: Story = {
  args: {
    children: (
      <>
        {Array.from(
          {
            length: 10,
          },
          (_, i) => (
            <div className="rounded bg-muted p-4" key={i}>
              Item {i + 1}
            </div>
          ),
        )}
      </>
    ),
    gap: 'sm',
    wrap: 'wrap',
  },
}

export const Inline: Story = {
  args: {
    children: items,
    gap: 'sm',
    inline: true,
  },
}
