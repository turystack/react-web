import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '@/components/button'
import { Eye, MoreHorizontal, Pencil, Trash2 } from '@/internal/icons'

import { ActionSheet } from './action-sheet'

const meta = {
  component: ActionSheet,
  title: 'Mobile/ActionSheet',
} satisfies Meta<typeof ActionSheet>

export default meta
type Story = StoryObj<typeof meta>

export const RowActions: Story = {
  render: () => {
    const [message, setMessage] = useState('No action selected.')

    return (
      <div className="flex max-w-sm items-center justify-between rounded-lg border p-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">Vehicle inspection</p>
          <p className="text-muted-foreground text-xs">{message}</p>
        </div>

        <ActionSheet>
          <ActionSheet.Trigger asChild>
            <Button size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </ActionSheet.Trigger>
          <ActionSheet.Content
            description="Choose what to do with this row."
            title="Actions"
          >
            <ActionSheet.Item
              icon={<Eye />}
              onClick={() => setMessage('Details opened.')}
            >
              Details
            </ActionSheet.Item>
            <ActionSheet.Item
              icon={<Pencil />}
              onClick={() => setMessage('Edit opened.')}
            >
              Edit
            </ActionSheet.Item>
            <ActionSheet.Separator />
            <ActionSheet.Item
              confirm={{
                confirmProps: {
                  variant: 'destructive',
                },
                confirmText: 'Delete',
                description: 'This row will be permanently deleted.',
                onConfirm: () => setMessage('Deleted after confirmation.'),
                title: 'Delete row?',
              }}
              icon={<Trash2 />}
              variant="destructive"
            >
              Delete
            </ActionSheet.Item>
          </ActionSheet.Content>
        </ActionSheet>
      </div>
    )
  },
}

export const Grouped: Story = {
  render: () => (
    <ActionSheet>
      <ActionSheet.Trigger asChild>
        <Button>Open action sheet</Button>
      </ActionSheet.Trigger>
      <ActionSheet.Content title="Record actions">
        <ActionSheet.Group>
          <ActionSheet.Item icon={<Eye />}>Details</ActionSheet.Item>
          <ActionSheet.Item icon={<Pencil />}>Edit</ActionSheet.Item>
        </ActionSheet.Group>
        <ActionSheet.Separator />
        <ActionSheet.Group>
          <ActionSheet.Item
            confirm={{
              confirmProps: {
                variant: 'destructive',
              },
              confirmText: 'Delete',
              description: 'This action cannot be undone.',
              title: 'Delete record?',
            }}
            icon={<Trash2 />}
            variant="destructive"
          >
            Delete
          </ActionSheet.Item>
        </ActionSheet.Group>
      </ActionSheet.Content>
    </ActionSheet>
  ),
}
