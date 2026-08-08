import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card } from './card'

const meta = {
  component: Card,
  title: 'Feedback/Card',
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>Card description goes here.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Card content body.</p>
      </Card.Content>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Settings</Card.Title>
        <Card.Description>Manage your account settings.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Content area with form fields or other content.</p>
      </Card.Content>
      <Card.Footer>
        <button className="font-medium text-sm" type="button">
          Save changes
        </button>
      </Card.Footer>
    </Card>
  ),
}

export const Bordered: Story = {
  render: () => (
    <Card>
      <Card.Header bordered>
        <Card.Title>Bordered Header</Card.Title>
        <Card.Description>Header has a bottom border.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>Main content area.</p>
      </Card.Content>
      <Card.Footer bordered>
        <button className="font-medium text-sm" type="button">
          Action
        </button>
      </Card.Footer>
    </Card>
  ),
}

export const Clickable: Story = {
  render: () => (
    <Card onClick={() => console.log('card clicked')}>
      <Card.Header>
        <Card.Title>Clickable Card</Card.Title>
        <Card.Description>Click anywhere on this card.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>The entire card is interactive.</p>
      </Card.Content>
    </Card>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Sections</Card.Title>
      </Card.Header>
      <Card.Content>
        <p>First section content.</p>
      </Card.Content>
      <Card.Separator />
      <Card.Content>
        <p>Second section content.</p>
      </Card.Content>
    </Card>
  ),
}
