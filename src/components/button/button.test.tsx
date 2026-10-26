import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, type ReactNode, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DropdownMenu } from '@/components/dropdown-menu'

import { Button } from './button'
import { ComposedButton } from './button.composed'

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

describe('Button composed under a trigger', () => {
  it('opens the menu when handed to DropdownMenu.Trigger asChild', async () => {
    const onClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button onClick={onClick} variant="outline">
            Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    const trigger = screen.getByRole('button', { name: 'Actions' })
    await userEvent.click(trigger)

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
    // The trigger's state landed on the Button itself, and its own click
    // handler still ran alongside the menu's.
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('data-slot', 'button')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards injected handlers, aria, data, id and ref to the element', async () => {
    const onKeyDown = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    render(
      <ComposedButton
        aria-controls="menu-1"
        data-origin="menu"
        id="actions"
        onKeyDown={onKeyDown}
        ref={ref}
      >
        Actions
      </ComposedButton>,
    )

    const button = screen.getByRole('button', { name: 'Actions' })
    expect(ref.current).toBe(button)
    expect(button).toHaveAttribute('id', 'actions')
    expect(button).toHaveAttribute('aria-controls', 'menu-1')
    expect(button).toHaveAttribute('data-origin', 'menu')

    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('drops an injected style and never loses its own classes', () => {
    const injected = {
      className: 'from-parent',
      style: {
        color: 'red',
      },
    }
    render(<ComposedButton {...injected}>Actions</ComposedButton>)

    // `className` is still a public ButtonProps key, so a class under that
    // key is merged, never substituted: the slot class stays first in line.
    const button = screen.getByRole('button', { name: 'Actions' })
    expect(button).toHaveClass('button')
    expect(button).not.toHaveAttribute('style')
  })

  it('keeps an injected accessible name unless it has its own', () => {
    const { rerender } = render(
      <ComposedButton aria-label="Injected name" size="icon-md" />,
    )
    expect(
      screen.getByRole('button', { name: 'Injected name' }),
    ).toBeInTheDocument()

    rerender(
      <ComposedButton
        aria-label="Injected name"
        ariaLabel="Own name"
        size="icon-md"
      />,
    )
    expect(screen.getByRole('button', { name: 'Own name' })).toBeInTheDocument()
  })

  it('does not accept native attributes in its public contract', () => {
    render(
      <Button
        // @ts-expect-error — id is injected by a composing parent, not a prop
        id="direct"
      >
        Save
      </Button>,
    )

    // Runtime forwarding is for composition; the type is what keeps a
    // consumer from treating Button as a bag of native attributes.
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'id',
      'direct',
    )
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

describe('Button link variants', () => {
  it.each(['link', 'link-muted'] as const)(
    '%s takes the text box: no side padding, auto height',
    (variant) => {
      render(<Button variant={variant}>Docs</Button>)

      const link = screen.getByRole('button', { name: 'Docs' })
      expect(link).toHaveClass('px-0', 'h-auto', 'border-0')
      expect(link).not.toHaveClass('px-2.5')
      expect(link).not.toHaveClass('h-10')
    },
  )

  it('keeps the side padding of every other variant', () => {
    render(<Button variant="ghost">Docs</Button>)

    expect(screen.getByRole('button', { name: 'Docs' })).toHaveClass(
      'px-2.5',
      'h-10',
    )
  })

  it('paints link-muted muted, foreground on hover', () => {
    render(<Button variant="link-muted">Docs</Button>)

    const link = screen.getByRole('button', { name: 'Docs' })
    expect(link).toHaveClass('text-muted-foreground', 'hover:text-foreground')
    expect(link).not.toHaveClass('text-foreground')
  })
})

describe('Button with href', () => {
  it('renders a real link with the same look', () => {
    render(
      <Button href="/settings" variant="link">
        Settings
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/settings')
    expect(link).toHaveClass('button', 'px-0')
    expect(link).not.toHaveAttribute('role')
    expect(link).not.toHaveAttribute('type')
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('keeps any variant and its sections on the link', () => {
    render(
      <Button href="/new" leftSection={<span>+</span>} variant="default">
        New
      </Button>,
    )

    expect(screen.getByRole('link', { name: '+New' })).toHaveClass('bg-primary')
  })

  it('fires onClick when followed', async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    )
    render(
      <Button href="/settings" onClick={onClick}>
        Settings
      </Button>,
    )

    await userEvent.click(screen.getByRole('link', { name: 'Settings' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('opens an external link in a new tab without handing it the opener', () => {
    render(
      <Button external href="https://example.com">
        Docs
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it.each(['disabled', 'loading'] as const)(
    'cannot navigate while %s',
    async (state) => {
      const onClick = vi.fn()
      render(
        <Button
          disabled={state === 'disabled'}
          href="/settings"
          loading={state === 'loading'}
          onClick={onClick}
        >
          Settings
        </Button>,
      )

      const link = screen.getByRole('link', { name: 'Settings' })
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).not.toHaveAttribute('href')
      expect(link).toHaveAttribute('tabindex', '-1')

      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
      link.dispatchEvent(click)

      expect(click.defaultPrevented).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
    },
  )

  it('stays in the tab order and navigable while enabled', () => {
    render(<Button href="/settings">Settings</Button>)

    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).not.toHaveAttribute('aria-disabled')
    expect(link).not.toHaveAttribute('tabindex')
  })

  it('takes its accessible name from ariaLabel', () => {
    render(<Button ariaLabel="Open settings" href="/settings" size="icon-md" />)

    expect(
      screen.getByRole('link', { name: 'Open settings' }),
    ).toBeInTheDocument()
  })

  it('lets an asChild element win over href', () => {
    render(
      <Button asChild href="/ignored">
        <a href="/settings">Settings</a>
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })
})

describe('Button current', () => {
  it.each(['page', 'location'] as const)(
    'exposes current="%s" as aria-current on a link',
    (current) => {
      render(
        <Button current={current} href="/orders" variant="ghost">
          Orders
        </Button>,
      )

      expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute(
        'aria-current',
        current,
      )
    },
  )

  it('exposes current as aria-current on a button', () => {
    render(<Button current="page">Orders</Button>)

    expect(screen.getByRole('button', { name: 'Orders' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('reads current={true} as the generic "true" token', () => {
    render(<Button current>Monthly</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true')
  })

  it.each([false, undefined])('leaves aria-current off for %s', (current) => {
    render(
      <Button current={current} href="/orders" variant="ghost">
        Orders
      </Button>,
    )

    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('aria-current')
    expect(link).not.toHaveAttribute('data-current')
  })

  it.each([
    ['ghost', 'data-current:bg-muted'],
    ['link', 'data-current:underline'],
    ['link-muted', 'data-current:text-foreground'],
  ] as const)(
    'gives the %s variant an active look while current',
    (variant, active) => {
      render(
        <Button current="page" href="/orders" variant={variant}>
          Orders
        </Button>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('data-current')
      expect(link).toHaveClass(active)
    },
  )

  it('carries aria-current onto the asChild element', () => {
    render(
      <Button asChild current="page" variant="ghost">
        <a href="/orders">Orders</a>
      </Button>,
    )

    expect(screen.getByText('Orders').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

describe('Button axes', () => {
  it('publishes its default variant and size for a theme to select', () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'md')
  })

  it('publishes the variant and size it was given', () => {
    render(
      <Button size="sm" variant="destructive">
        Delete
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'destructive')
    expect(button).toHaveAttribute('data-size', 'sm')
  })

  it('publishes them on the anchor when it renders a link', () => {
    render(
      <Button href="/docs" variant="link">
        Docs
      </Button>,
    )

    expect(screen.getByRole('link')).toHaveAttribute('data-variant', 'link')
  })
})

describe('Button disabledReason', () => {
  const reason = 'Only owners can delete'

  it('renders no wrapper and no description without a reason', () => {
    render(<Button>Delete</Button>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('is blocked but stays in the tab order', async () => {
    const onClick = vi.fn()
    render(
      <>
        <button type="button">before</button>
        <Button disabledReason={reason} onClick={onClick}>
          Delete
        </Button>
      </>,
    )
    const button = screen.getByRole('button', {
      name: 'Delete',
    })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toHaveAttribute('disabled')

    await userEvent.tab()
    await userEvent.tab()
    expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(button, {
      pointerEventsCheck: 0,
    })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is described by the reason before any tooltip opens', () => {
    render(<Button disabledReason={reason}>Delete</Button>)

    expect(screen.getByRole('button')).toHaveAccessibleDescription(reason)
  })

  it('shows the reason on keyboard focus and hides it on blur', async () => {
    render(
      <>
        <Button disabledReason={reason}>Delete</Button>
        <button type="button">after</button>
      </>,
    )

    await userEvent.tab()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.tab()
    await vi.waitFor(() =>
      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument(),
    )
  })

  it('shows the reason on hover over the wrapper', async () => {
    render(<Button disabledReason={reason}>Delete</Button>)

    await userEvent.hover(
      document.querySelector('[data-slot="disabled-reason"]') as HTMLElement,
    )

    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })

  it('closes on Escape while focus stays', async () => {
    render(<Button disabledReason={reason}>Delete</Button>)

    await userEvent.tab()
    await screen.findByTestId('disabled-reason-popup')
    await userEvent.keyboard('{Escape}')

    await vi.waitFor(() =>
      expect(
        screen.queryByTestId('disabled-reason-popup'),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('blocks a link the same way, keeping it reachable', async () => {
    render(
      <Button disabledReason={reason} href="/danger">
        Delete
      </Button>,
    )
    const link = screen.getByRole('link')

    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(link).toHaveFocus()
  })
})

describe('Button disabledReason, edge cases', () => {
  const reason = 'Only owners can delete'

  it('keeps focus when a reason arrives on the focused button', async () => {
    function SeatLimited() {
      const [full, setFull] = useState(false)

      return (
        <Button
          disabledReason={full ? '10 of 10 seats in use' : undefined}
          onClick={() => setFull(true)}
        >
          Send invite
        </Button>
      )
    }
    render(<SeatLimited />)

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    const button = screen.getByRole('button', {
      name: 'Send invite',
    })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveFocus()
    expect(button).toHaveAccessibleDescription('10 of 10 seats in use')
  })

  it('keeps focus when the reason goes away', async () => {
    const { rerender } = render(<Button disabledReason={reason}>Delete</Button>)
    await userEvent.tab()

    rerender(<Button>Delete</Button>)

    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('stretches its wrapper when block', () => {
    render(
      <Button block disabledReason={reason}>
        Delete
      </Button>,
    )

    expect(document.querySelector('[data-slot="disabled-reason"]')).toHaveClass(
      'w-full',
    )
  })

  it('drops the href of a blocked asChild link', () => {
    render(
      <Button asChild disabledReason={reason}>
        <a href="/danger">Delete</a>
      </Button>,
    )

    expect(screen.getByText('Delete').closest('a')).not.toHaveAttribute('href')
  })

  it('shows no reason while loading', () => {
    render(
      <Button disabledReason={reason} loading>
        Delete
      </Button>,
    )

    expect(screen.getByRole('button')).not.toHaveAccessibleDescription(reason)
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('joins a description a composing parent gave it', () => {
    render(
      <>
        <span id="hint">Type the name to confirm</span>
        <ComposedButton aria-describedby="hint" disabledReason={reason}>
          Delete
        </ComposedButton>
      </>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      `Type the name to confirm ${reason}`,
    )
  })
})

describe('Button asChild with a router link', () => {
  function Link({ children, to }: { children?: ReactNode; to: string }) {
    return <a href={to}>{children}</a>
  }

  it('renders an inert link with no destination while blocked', async () => {
    render(
      <Button asChild disabledReason="Upgrade to see pricing">
        <Link to="/pricing">Pricing</Link>
      </Button>,
    )
    const link = screen.getByRole('link', {
      name: 'Pricing',
    })

    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAccessibleDescription('Upgrade to see pricing')

    await userEvent.tab()
    expect(link).toHaveFocus()
  })

  it('is the Link again once it may act', () => {
    render(
      <Button asChild>
        <Link to="/pricing">Pricing</Link>
      </Button>,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '/pricing')
  })
})
