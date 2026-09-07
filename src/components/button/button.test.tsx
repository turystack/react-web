import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('fires onClick with the label as its accessible name', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('takes its accessible name from ariaLabel when it has no label', () => {
    render(<Button ariaLabel="Close" size="icon-md" />)

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders type button unless another type is asked for', () => {
    const { rerender } = render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

    rerender(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('shows the loading state and blocks interaction while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders both sections beside the label', () => {
    render(
      <Button leftSection={<span>left</span>} rightSection={<span>right</span>}>
        Save
      </Button>,
    )

    expect(
      screen.getByRole('button', { name: 'leftSaveright' }),
    ).toBeInTheDocument()
  })

  it('replaces the left section with the indicator while loading', () => {
    render(
      <Button leftSection={<span>left</span>} loading>
        Save
      </Button>,
    )

    expect(screen.queryByText('left')).not.toBeInTheDocument()
  })

  it('associates the button with a form by id', () => {
    render(<Button form="checkout">Save</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('form', 'checkout')
  })

  it('projects its behavior onto the child under asChild', async () => {
    const onClick = vi.fn()
    render(
      <Button asChild onClick={onClick}>
        <a href="/settings">Settings</a>
      </Button>,
    )

    const trigger = screen.getByRole('button', { name: 'Settings' })
    expect(trigger).toHaveAttribute('href', '/settings')

    await userEvent.click(trigger)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the child once, not nested inside itself', () => {
    render(
      <Button asChild>
        <a href="/settings">Settings</a>
      </Button>,
    )

    expect(
      screen.getByRole('button', { name: 'Settings' }).querySelector('a'),
    ).toBeNull()
  })

  it('keeps the sections when rendering as a child', () => {
    render(
      <Button asChild leftSection={<span>left</span>}>
        <a href="/settings">Settings</a>
      </Button>,
    )

    expect(
      screen.getByRole('button', { name: 'leftSettings' }),
    ).toHaveAttribute('href', '/settings')
  })

  it('falls back to a button when asChild has no element child', () => {
    render(<Button asChild>Settings</Button>)

    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })
})

describe.each([
  'default',
  'dark',
  'destructive',
  'outline',
  'dashed',
  'secondary',
  'ghost',
  'link',
  'link-muted',
] as const)('Button variant %s', (variant) => {
  it('stays a reachable button', () => {
    render(<Button variant={variant}>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })
})

describe.each([
  'sm',
  'md',
  'lg',
  'icon-xs',
  'icon-sm',
  'icon-md',
  'icon-lg',
] as const)('Button size %s', (size) => {
  it('stays a reachable button', () => {
    render(
      <Button ariaLabel="Save" size={size}>
        Save
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })
})

describe('Button block', () => {
  it('stays a reachable button when full width', () => {
    render(<Button block>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })
})
