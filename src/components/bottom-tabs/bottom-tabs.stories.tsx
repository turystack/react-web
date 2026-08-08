import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Bell, Home, Search, Settings } from '@/internal/icons'

import { BottomTabs } from './bottom-tabs'

const meta = {
  component: BottomTabs,
  title: 'Mobile/BottomTabs',
} satisfies Meta<typeof BottomTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('home')

    return (
      <div className="min-h-72 pb-20">
        <p className="text-muted-foreground text-sm">
          Selected tab: <strong>{value}</strong>
        </p>
        <BottomTabs
          onChange={(_, nextValue) => setValue(nextValue)}
          value={value}
        >
          <BottomTabs.Item icon={<Home />} label="Home" value="home" />
          <BottomTabs.Item icon={<Search />} label="Search" value="search" />
          <BottomTabs.Item icon={<Bell />} label="Alerts" value="alerts" />
          <BottomTabs.Item
            icon={<Settings />}
            label="Settings"
            value="settings"
          />
        </BottomTabs>
      </div>
    )
  },
}

export const IconsOnly: Story = {
  render: () => {
    const [value, setValue] = useState('home')

    return (
      <div className="min-h-72 pb-20">
        <BottomTabs
          onChange={(_, nextValue) => setValue(nextValue)}
          showLabels={false}
          value={value}
        >
          <BottomTabs.Item icon={<Home />} label="Home" value="home" />
          <BottomTabs.Item icon={<Search />} label="Search" value="search" />
          <BottomTabs.Item
            disabled
            icon={<Bell />}
            label="Alerts"
            value="alerts"
          />
          <BottomTabs.Item
            icon={<Settings />}
            label="Settings"
            value="settings"
          />
        </BottomTabs>
      </div>
    )
  },
}
