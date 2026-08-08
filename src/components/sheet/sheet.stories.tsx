import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@/components/button'
import { Form } from '@/components/form'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Switch } from '@/components/switch'

import { Sheet } from './sheet'

const meta = {
  component: Sheet,
  title: 'Components/Sheet',
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <Sheet onChange={setOpen} open={open}>
          <Sheet.Header closable>
            <Sheet.Header.Title>Edit Profile</Sheet.Header.Title>
            <Sheet.Header.Description>
              Make changes to your profile here.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <Form>
              <Form.Field
                label={{
                  content: 'Full name',
                  required: true,
                }}
                name="name"
              >
                <Input placeholder="John Doe" />
              </Form.Field>
              <Form.Field
                label={{
                  content: 'Email',
                  required: true,
                }}
                name="email"
              >
                <Input placeholder="john@example.com" />
              </Form.Field>
              <Form.Field
                description="This determines the user's permissions."
                label="Role"
                name="role"
              >
                <Select
                  mode="single"
                  optionLabel="label"
                  options={[
                    {
                      label: 'Admin',
                      value: 'admin',
                    },
                    {
                      label: 'Editor',
                      value: 'editor',
                    },
                    {
                      label: 'Viewer',
                      value: 'viewer',
                    },
                  ]}
                  optionValue="value"
                  placeholder="Select a role"
                />
              </Form.Field>
              <Form.Field name="notifications">
                <Switch label="Email notifications" />
              </Form.Field>
            </Form>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Left Sheet</Button>
        <Sheet onChange={setOpen} open={open} side="left">
          <Sheet.Header bordered closable>
            <Sheet.Header.Title>Navigation</Sheet.Header.Title>
          </Sheet.Header>
          <Sheet.Body>
            <div className="flex flex-col gap-2">
              {['Dashboard', 'Settings', 'Profile', 'Help'].map((item) => (
                <p className="rounded-md p-2 text-sm hover:bg-muted" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </Sheet.Body>
        </Sheet>
      </>
    )
  },
}

export const Bordered: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Bordered Sheet</Button>
        <Sheet onChange={setOpen} open={open}>
          <Sheet.Header bordered closable>
            <Sheet.Header.Title>Filters</Sheet.Header.Title>
            <Sheet.Header.Description>
              Adjust your search filters.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <p className="text-muted-foreground text-sm">
              Filter controls go here.
            </p>
          </Sheet.Body>
          <Sheet.Footer bordered>
            <Button onClick={() => setOpen(false)}>Apply</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Reset
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const Scrollable: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Scrollable Sheet</Button>
        <Sheet onChange={setOpen} open={open}>
          <Sheet.Header bordered closable>
            <Sheet.Header.Title>Terms & Conditions</Sheet.Header.Title>
            <Sheet.Header.Description>
              Please read all sections before accepting.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            {Array.from(
              {
                length: 12,
              },
              (_, i) => (
                <div className="mb-4" key={i}>
                  <p className="mb-1 font-medium text-sm">Section {i + 1}</p>
                  <p className="text-muted-foreground text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Pellentesque habitant morbi tristique senectus et netus et
                    malesuada fames ac turpis egestas. Vestibulum tortor quam,
                    feugiat vitae, ultricies eget, tempor sit amet, ante.
                  </p>
                </div>
              ),
            )}
          </Sheet.Body>
          <Sheet.Footer bordered>
            <Button onClick={() => setOpen(false)}>Accept</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Decline
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
        <Sheet onChange={setOpen} open={open} side="bottom">
          <Sheet.Header closable>
            <Sheet.Header.Title>Actions</Sheet.Header.Title>
          </Sheet.Header>
          <Sheet.Body>
            <div className="flex flex-col gap-2 pb-4">
              {['Share', 'Copy link', 'Edit', 'Delete'].map((action) => (
                <Button key={action} variant="ghost">
                  {action}
                </Button>
              ))}
            </div>
          </Sheet.Body>
        </Sheet>
      </>
    )
  },
}

export const BottomScrollable: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Tall Bottom Sheet</Button>
        <Sheet onChange={setOpen} open={open} side="bottom">
          <Sheet.Header bordered closable>
            <Sheet.Header.Title>Scrollable Bottom Sheet</Sheet.Header.Title>
            <Sheet.Header.Description>
              Header and footer stay visible while the body scrolls.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <div className="flex flex-col gap-2">
              {Array.from(
                {
                  length: 24,
                },
                (_, index) => (
                  <div
                    className="rounded-lg border border-border p-3"
                    key={index}
                  >
                    <p className="font-medium text-sm">Item {index + 1}</p>
                    <p className="text-muted-foreground text-sm">
                      Content that should remain inside the viewport instead of
                      pushing the sheet off screen.
                    </p>
                  </div>
                ),
              )}
            </div>
          </Sheet.Body>
          <Sheet.Footer bordered>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const SizeSmall: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Small Sheet</Button>
        <Sheet onChange={setOpen} open={open} size="sm">
          <Sheet.Header closable>
            <Sheet.Header.Title>Small (sm:max-w-md)</Sheet.Header.Title>
            <Sheet.Header.Description>
              Narrow drawers, quick actions.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <p className="text-muted-foreground text-sm">
              Popup is capped at 448px on desktop (75% on mobile).
            </p>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setOpen(false)}>Ok</Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const SizeLarge: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Large Sheet</Button>
        <Sheet onChange={setOpen} open={open} size="lg">
          <Sheet.Header closable>
            <Sheet.Header.Title>Large (sm:max-w-2xl)</Sheet.Header.Title>
            <Sheet.Header.Description>
              Detailed forms, record editors.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <p className="text-muted-foreground text-sm">
              Popup is capped at 672px on desktop (75% on mobile).
            </p>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const SizeExtraLarge: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open XL Sheet</Button>
        <Sheet onChange={setOpen} open={open} size="xl">
          <Sheet.Header closable>
            <Sheet.Header.Title>Extra Large (sm:max-w-4xl)</Sheet.Header.Title>
            <Sheet.Header.Description>
              Multi-column layouts, side-by-side comparison.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <p className="text-muted-foreground text-sm">
              Popup is capped at 896px on desktop (75% on mobile).
            </p>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}

export const SizeTwoExtraLarge: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open 2XL Sheet</Button>
        <Sheet onChange={setOpen} open={open} size="2xl">
          <Sheet.Header closable>
            <Sheet.Header.Title>
              Two Extra Large (sm:max-w-6xl)
            </Sheet.Header.Title>
            <Sheet.Header.Description>
              Dense editors, tables, or dashboards.
            </Sheet.Header.Description>
          </Sheet.Header>
          <Sheet.Body>
            <p className="text-muted-foreground text-sm">
              Popup is capped at 1152px on desktop (75% on mobile).
            </p>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
          </Sheet.Footer>
        </Sheet>
      </>
    )
  },
}
