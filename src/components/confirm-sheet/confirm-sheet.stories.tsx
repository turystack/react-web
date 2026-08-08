import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@/components/button'

import { ConfirmSheet } from './confirm-sheet'

const meta = {
  args: {
    description:
      'This action cannot be undone. The item will be permanently deleted.',
    onCancel: () => {},
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete item?',
  },
  component: ConfirmSheet,
  title: 'Mobile/ConfirmSheet',
} satisfies Meta<typeof ConfirmSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Confirm Sheet</Button>
        <ConfirmSheet
          description="This will apply the selected action to the current row."
          onCancel={() => setOpen(false)}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          open={open}
          title="Continue?"
        />
      </>
    )
  },
}

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="destructive">
          Delete
        </Button>
        <ConfirmSheet
          cancelText="Keep item"
          confirmProps={{
            variant: 'destructive',
          }}
          confirmText="Delete item"
          description="The selected item and its history will be permanently removed."
          onCancel={() => setOpen(false)}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          open={open}
          title="Delete item?"
        />
      </>
    )
  },
}

export const Async: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirm async action</Button>
        <ConfirmSheet
          confirmText="Submit"
          description="The confirm button stays loading while the operation runs."
          onClose={() => setOpen(false)}
          onConfirm={() =>
            new Promise<void>((resolve) => {
              setTimeout(() => {
                setOpen(false)
                resolve()
              }, 1200)
            })
          }
          open={open}
          title="Submit request?"
        />
      </>
    )
  },
}
