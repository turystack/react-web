import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/components/button'

import { Toast, toast } from './toast'

const meta = {
  component: Toast,
  title: 'Feedback/Toast',
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <Toast />
      <Button onClick={() => toast('This is a default toast message')}>
        Default Toast
      </Button>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() => toast.success('Operation completed successfully')}
        variant="default"
      >
        Success Toast
      </Button>
    </div>
  ),
}

export const ErrorToast: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() => toast.error('Something went wrong')}
        variant="destructive"
      >
        Error Toast
      </Button>
    </div>
  ),
}

export const Warning: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() => toast.warning('Please check your input')}
        variant="outline"
      >
        Warning Toast
      </Button>
    </div>
  ),
}

export const Info: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() => toast.info('Here is some information')}
        variant="secondary"
      >
        Info Toast
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() => {
          const id = toast.loading('Loading data...')
          setTimeout(
            () =>
              toast.success('Done!', {
                id,
              }),
            2000,
          )
        }}
        variant="outline"
      >
        Loading Toast (resolves in 2s)
      </Button>
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() =>
          toast.success('Changes saved', {
            description: 'Your changes have been saved successfully.',
          })
        }
      >
        Toast with Description
      </Button>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() =>
          toast('File deleted', {
            action: {
              label: 'Undo',
              onClick: () => toast.success('File restored'),
            },
          })
        }
      >
        Toast with Action
      </Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toast />
      <Button onClick={() => toast('Default message')} variant="outline">
        Default
      </Button>
      <Button
        onClick={() => toast.success('Success message')}
        variant="outline"
      >
        Success
      </Button>
      <Button onClick={() => toast.error('Error message')} variant="outline">
        Error
      </Button>
      <Button
        onClick={() => toast.warning('Warning message')}
        variant="outline"
      >
        Warning
      </Button>
      <Button onClick={() => toast.info('Info message')} variant="outline">
        Info
      </Button>
      <Button onClick={() => toast.loading('Loading...')} variant="outline">
        Loading
      </Button>
    </div>
  ),
}

export const WithPromise: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            error: 'Failed to save',
            loading: 'Saving...',
            success: 'Saved successfully!',
          })
        }
      >
        Toast with Promise
      </Button>
    </div>
  ),
}

export const CustomDuration: Story = {
  render: () => (
    <div>
      <Toast />
      <Button
        onClick={() =>
          toast.info('This stays for 10 seconds', {
            description: 'This is a description',
            duration: 10000,
          })
        }
      >
        Long Duration (10s)
      </Button>
    </div>
  ),
}
