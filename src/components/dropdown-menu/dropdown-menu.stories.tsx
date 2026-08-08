import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '@/components/button'
import {
  Cloud,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  Settings,
  User,
  UserPlus,
  Users,
} from '@/internal/icons'

import { DropdownMenu } from './dropdown-menu'

const meta = {
  component: DropdownMenu,
  title: 'Components/DropdownMenu',
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content width={200}>
        <DropdownMenu.Group>
          <DropdownMenu.Label>My Account</DropdownMenu.Label>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          Profile
          <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <CreditCard /> Billing
          <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings /> Settings
          <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Keyboard /> Keyboard Shortcuts
          <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <LifeBuoy /> LifeBuoy
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <LifeBuoy /> Support
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled>
          <Cloud /> API
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">
          <LogOut /> Log out
          <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
}

export const WithCheckboxes: Story = {
  render: () => {
    const [showStatus, setShowStatus] = useState(true)
    const [showActivity, setShowActivity] = useState(false)
    const [showPanel, setShowPanel] = useState(false)

    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">View</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label>Appearance</DropdownMenu.Label>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem
            checked={showStatus}
            onCheckedChange={setShowStatus}
          >
            Status Bar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={showActivity}
            onCheckedChange={setShowActivity}
          >
            Activity Bar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Panel
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    )
  },
}

export const WithRadioGroup: Story = {
  render: () => {
    const [position, setPosition] = useState('bottom')

    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">Panel Position</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label>Panel Position</DropdownMenu.Label>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.RadioGroup onValueChange={setPosition} value={position}>
            <DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="bottom">
              Bottom
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="right">Right</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    )
  },
}

export const WithGroups: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Account</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content width={200}>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Personal</DropdownMenu.Label>
          <DropdownMenu.Item>
            <User /> Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <Settings /> Settings
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Label>Team</DropdownMenu.Label>
          <DropdownMenu.Item>
            <Users /> Members
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <UserPlus /> Invite
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">
          <LogOut /> Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
}
