import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@/components/button'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useUnsaved } from '@/hooks/use-unsaved'

import { Confirm } from './confirm'

const meta = {
  args: {
    description:
      'This action cannot be undone. The item will be permanently deleted.',
    onCancel: () => {},
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete item?',
  },
  component: Confirm,
  title: 'Components/Confirm',
} satisfies Meta<typeof Confirm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Confirm</Button>
        <Confirm
          description="This action cannot be undone. The item will be permanently deleted."
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

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)} variant="destructive">
          Delete Account
        </Button>
        <Confirm
          cancelText="Keep account"
          confirmProps={{
            variant: 'destructive',
          }}
          confirmText="Delete account"
          description="All your data will be permanently deleted. This cannot be undone."
          onCancel={() => setOpen(false)}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          open={open}
          title="Delete your account?"
        />
      </>
    )
  },
}

export const WithUnsaved: Story = {
  render: () => {
    const changes = useDisclosure(false)
    const [proceeded, setProceeded] = useState(false)

    const [handleLeave, UnsavedDialog] = useUnsaved({
      leaving: true,
      onProceed: () => setProceeded(true),
      unsaved: changes.value,
    })

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button onClick={changes.toggle} variant="outline">
            {changes.value ? 'Clear changes' : 'Simulate unsaved changes'}
          </Button>
          <span className="text-muted-foreground text-sm">
            {changes.value ? 'You have unsaved changes' : 'No changes'}
          </span>
        </div>
        <Button onClick={handleLeave}>Leave page</Button>
        {proceeded && (
          <p className="text-muted-foreground text-sm">
            Proceeded without saving.
          </p>
        )}
        <UnsavedDialog />
      </div>
    )
  },
}

export const Async: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirm with async</Button>
        <Confirm
          confirmText="Submit"
          description="Your data will be sent to the server."
          onClose={() => setOpen(false)}
          onConfirm={() =>
            new Promise<void>((resolve) => setTimeout(resolve, 2000))
          }
          open={open}
          title="Submit form?"
        />
      </>
    )
  },
}
