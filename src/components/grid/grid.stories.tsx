import type { Meta, StoryObj } from '@storybook/react-vite'

import { Grid } from './grid'

const meta = {
  component: Grid,
  title: 'Layout/Grid',
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded bg-muted p-4 text-center text-sm">{children}</div>
)

export const Default: Story = {
  render: () => (
    <Grid>
      <Grid.Item>
        <Box>Item 1</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 2</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 3</Box>
      </Grid.Item>
    </Grid>
  ),
}

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3}>
      <Grid.Item>
        <Box>Col 1</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Col 2</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Col 3</Box>
      </Grid.Item>
    </Grid>
  ),
}

export const WithGap: Story = {
  render: () => (
    <Grid cols={3} gap="md">
      <Grid.Item>
        <Box>Item 1</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 2</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 3</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 4</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 5</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Item 6</Box>
      </Grid.Item>
    </Grid>
  ),
}

export const WithSpan: Story = {
  render: () => (
    <Grid cols={4} gap="md">
      <Grid.Item span={2}>
        <Box>Span 2</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Span 1</Box>
      </Grid.Item>
      <Grid.Item>
        <Box>Span 1</Box>
      </Grid.Item>
      <Grid.Item span="full">
        <Box>Span Full</Box>
      </Grid.Item>
    </Grid>
  ),
}

export const ResponsiveLike: Story = {
  render: () => (
    <Grid cols={6} gap="lg">
      <Grid.Item span={6}>
        <Box>Full Width Header</Box>
      </Grid.Item>
      <Grid.Item span={2}>
        <Box>Sidebar</Box>
      </Grid.Item>
      <Grid.Item span={4}>
        <Box>Main Content</Box>
      </Grid.Item>
      <Grid.Item span={3}>
        <Box>Half Left</Box>
      </Grid.Item>
      <Grid.Item span={3}>
        <Box>Half Right</Box>
      </Grid.Item>
      <Grid.Item span={6}>
        <Box>Full Width Footer</Box>
      </Grid.Item>
    </Grid>
  ),
}
