import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import { AlertCircle, Info, Terminal } from '@/internal/icons'

import { Alert } from './alert'

const meta = {
  component: Alert,
  title: 'Feedback/Alert',
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <Alert.Title>Heads up!</Alert.Title>
      <Alert.Description>
        You can add components to your app using the CLI.
      </Alert.Description>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <Alert.Icon>
        <AlertCircle />
      </Alert.Icon>
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>
        Your session has expired. Please log in again.
      </Alert.Description>
    </Alert>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <Alert.Icon>
        <Terminal />
      </Alert.Icon>
      <Alert.Title>Heads up!</Alert.Title>
      <Alert.Description>
        You can add components to your app using the CLI.
      </Alert.Description>
    </Alert>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Alert>
      <Alert.Icon>
        <Info />
      </Alert.Icon>
      <Alert.Title>Update available</Alert.Title>
      <Alert.Description>
        A new version is available. Update now to get the latest features.
      </Alert.Description>
      <Alert.Action>
        <Button size="sm" variant="outline">
          Update
        </Button>
      </Alert.Action>
    </Alert>
  ),
}

export const Closable: Story = {
  render: () => (
    <Alert closable>
      <Alert.Icon>
        <Info />
      </Alert.Icon>
      <Alert.Title>Dismissible alert</Alert.Title>
      <Alert.Description>
        Click the X button to dismiss this alert with a fade animation.
      </Alert.Description>
    </Alert>
  ),
}

export const ClosableDestructive: Story = {
  render: () => (
    <Alert closable variant="destructive">
      <Alert.Icon>
        <AlertCircle />
      </Alert.Icon>
      <Alert.Title>Something went wrong</Alert.Title>
      <Alert.Description>
        There was an error processing your request. Please try again.
      </Alert.Description>
    </Alert>
  ),
}
