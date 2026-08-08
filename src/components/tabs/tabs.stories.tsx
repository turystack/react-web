import type { Meta, StoryObj } from '@storybook/react-vite'
import { Settings, User } from '@/internal/icons'

import { Tabs } from './tabs'

const meta = {
  component: Tabs,
  title: 'Feedback/Tabs',
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <p>Account settings and preferences.</p>
      </Tabs.Content>
      <Tabs.Content value="password">
        <p>Change your password here.</p>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <p>General application settings.</p>
      </Tabs.Content>
    </Tabs>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="profile">
      <Tabs.List>
        <Tabs.Trigger icon={<User />} value="profile">
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger icon={<Settings />} value="settings">
          Settings
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile">
        <p>Your profile information.</p>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <p>Application settings.</p>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Compact: Story = {
  render: () => (
    <Tabs defaultValue="account" justified={false}>
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <p>Account settings and preferences.</p>
      </Tabs.Content>
      <Tabs.Content value="password">
        <p>Change your password here.</p>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <p>General application settings.</p>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="tab1" variant="pill">
      <Tabs.List>
        <Tabs.Trigger value="tab1">First</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Second</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Third</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <p>First panel with the previous segmented visual style.</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <p>Second panel.</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <p>Third panel.</p>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger disabled value="password">
          Password
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <p>Account settings and preferences.</p>
      </Tabs.Content>
      <Tabs.Content value="password">
        <p>Change your password here.</p>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <p>General application settings.</p>
      </Tabs.Content>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical">
      <Tabs.List>
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="security">Security</Tabs.Trigger>
        <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="general">
        <p>General settings panel.</p>
      </Tabs.Content>
      <Tabs.Content value="security">
        <p>Security settings panel.</p>
      </Tabs.Content>
      <Tabs.Content value="notifications">
        <p>Notification preferences.</p>
      </Tabs.Content>
    </Tabs>
  ),
}
