import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { DropdownMenu } from './dropdown-menu'

/**
 * The headless menu throws when a group label has no group. That is correct at
 * that layer and wrong to expose: composing a label into a menu is a reasonable
 * thing to do, and which element carries it is the primitive's decision.
 */
function open(children: React.ReactNode) {
  return render(
    <DropdownMenu open>
      <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
      <DropdownMenu.Content>{children}</DropdownMenu.Content>
    </DropdownMenu>,
  )
}

afterEach(cleanup)

describe('DropdownMenu.Label', () => {
  it('renders on its own, without a Group', () => {
    expect(() =>
      open(<DropdownMenu.Label>My Account</DropdownMenu.Label>),
    ).not.toThrow()
    expect(screen.getByText('My Account')).toBeTruthy()
  })

  it('still renders inside a Group', () => {
    open(
      <DropdownMenu.Group>
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
      </DropdownMenu.Group>,
    )

    expect(screen.getByText('My Account')).toBeTruthy()
  })
})

describe('DropdownMenu.RadioItem', () => {
  it('works inside a RadioGroup', () => {
    open(
      <DropdownMenu.RadioGroup value="light">
        <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    )

    expect(screen.getByText('Light')).toBeTruthy()
  })

  it("fails in this library's words, not the headless layer's", () => {
    // The headless message names <Menu.RadioGroup> — a component nobody wrote
    // and that does not exist in this API.
    expect(() =>
      open(
        <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>,
      ),
    ).toThrow(
      'DropdownMenu.RadioItem must be used inside DropdownMenu.RadioGroup',
    )
  })
})

describe('DropdownMenu', () => {
  it('keeps its items out of the document until the trigger opens it', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
  })

  it('delivers true to onOpenChange when it opens', async () => {
    const onOpenChange = vi.fn()
    render(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menu')

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('stays closed when open is held false from outside', async () => {
    render(
      <DropdownMenu open={false}>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })
})

describe('DropdownMenu.Trigger', () => {
  it('opens the menu from the element it was given under asChild', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button type="button">Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
  })

  it('falls back to its own trigger when asChild has no element child', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
  })
})

describe('DropdownMenu.Item', () => {
  it('fires onClick when the item is chosen', async () => {
    const onClick = vi.fn()
    open(<DropdownMenu.Item onClick={onClick}>Edit</DropdownMenu.Item>)

    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks itself disabled and blocks onClick', async () => {
    const onClick = vi.fn()
    open(
      <DropdownMenu.Item disabled onClick={onClick}>
        Edit
      </DropdownMenu.Item>,
    )

    const item = screen.getByRole('menuitem', { name: 'Edit' })
    expect(item).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(item)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('projects the menu item onto the element it was given under asChild', () => {
    open(
      <DropdownMenu.Item asChild>
        <a href="/settings">Settings</a>
      </DropdownMenu.Item>,
    )

    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('falls back to its own element when asChild has no element child', () => {
    open(<DropdownMenu.Item asChild>Settings</DropdownMenu.Item>)

    expect(
      screen.getByRole('menuitem', { name: 'Settings' }),
    ).toBeInTheDocument()
  })

  it('stays a reachable item in the destructive variant', async () => {
    const onClick = vi.fn()
    open(
      <DropdownMenu.Item onClick={onClick} variant="destructive">
        Delete
      </DropdownMenu.Item>,
    )

    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows its shortcut as part of the item', () => {
    open(
      <DropdownMenu.Item>
        Edit
        <DropdownMenu.Shortcut>⌘E</DropdownMenu.Shortcut>
      </DropdownMenu.Item>,
    )

    expect(screen.getByRole('menuitem', { name: 'Edit⌘E' })).toBeInTheDocument()
  })
})

describe('DropdownMenu.CheckboxItem', () => {
  it('reports the checked state it was given', () => {
    open(
      <DropdownMenu.CheckboxItem checked>Show bar</DropdownMenu.CheckboxItem>,
    )

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Show bar' }),
    ).toBeChecked()
  })

  it('delivers the next checked state to onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    open(
      <DropdownMenu.CheckboxItem
        checked={false}
        onCheckedChange={onCheckedChange}
      >
        Show bar
      </DropdownMenu.CheckboxItem>,
    )

    await userEvent.click(
      screen.getByRole('menuitemcheckbox', { name: 'Show bar' }),
    )

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('marks itself disabled and blocks onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    open(
      <DropdownMenu.CheckboxItem
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      >
        Show bar
      </DropdownMenu.CheckboxItem>,
    )

    const item = screen.getByRole('menuitemcheckbox', { name: 'Show bar' })
    expect(item).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(item)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

describe('DropdownMenu.RadioGroup', () => {
  it('reports which item the group value selected', () => {
    open(
      <DropdownMenu.RadioGroup value="dark">
        <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="dark">Dark</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    )

    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeChecked()
    expect(
      screen.getByRole('menuitemradio', { name: 'Light' }),
    ).not.toBeChecked()
  })

  it('delivers the chosen value to onValueChange', async () => {
    const onValueChange = vi.fn()
    open(
      <DropdownMenu.RadioGroup onValueChange={onValueChange} value="light">
        <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="dark">Dark</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    )

    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }))

    expect(onValueChange).toHaveBeenCalledWith('dark', expect.anything())
  })

  it('marks a disabled item and blocks onValueChange', async () => {
    const onValueChange = vi.fn()
    open(
      <DropdownMenu.RadioGroup onValueChange={onValueChange} value="light">
        <DropdownMenu.RadioItem disabled value="dark">
          Dark
        </DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    )

    const item = screen.getByRole('menuitemradio', { name: 'Dark' })
    expect(item).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(item)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('DropdownMenu.Label', () => {
  it('still renders when inset', () => {
    open(<DropdownMenu.Label inset>My Account</DropdownMenu.Label>)

    expect(screen.getByText('My Account')).toBeInTheDocument()
  })
})

describe('DropdownMenu.Separator', () => {
  it('divides the menu with a separator', () => {
    open(
      <>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Delete</DropdownMenu.Item>
      </>,
    )

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})

describe('DropdownMenu.Content', () => {
  it('keeps its items reachable at a fixed width', () => {
    render(
      <DropdownMenu open>
        <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
        <DropdownMenu.Content width={240}>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )

    expect(
      screen.getByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
  })
})

describe.each(['top', 'right', 'bottom', 'left'] as const)(
  'DropdownMenu.Content on side %s',
  (side) => {
    it('reports the side it settled on', () => {
      render(
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content side={side} sideOffset={8}>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>,
      )

      expect(screen.getByRole('menu')).toHaveAttribute('data-side', side)
    })
  },
)

describe.each(['start', 'center', 'end'] as const)(
  'DropdownMenu.Content aligned to %s',
  (align) => {
    it('reports the alignment it settled on', () => {
      render(
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content align={align}>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>,
      )

      expect(screen.getByRole('menu')).toHaveAttribute('data-align', align)
    })
  },
)

describe('DropdownMenu inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the menu inside the named container', () => {
    render(
      <TuryProvider portalContainer={container}>
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </TuryProvider>,
    )

    expect(container).toContainElement(screen.getByRole('menu'))
  })

  it('leaves the menu on the body when no container is named', () => {
    render(
      <TuryProvider>
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </TuryProvider>,
    )

    expect(container).not.toContainElement(screen.getByRole('menu'))
  })
})

describe('DropdownMenu.Item axes', () => {
  it('publishes its default variant for a theme to select', () => {
    open(<DropdownMenu.Item>Edit</DropdownMenu.Item>)

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it('publishes the variant it was given', () => {
    open(<DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>)

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })

  it('publishes it on the element it was given under asChild', () => {
    open(
      <DropdownMenu.Item asChild variant="destructive">
        <a href="/delete">Delete</a>
      </DropdownMenu.Item>,
    )

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })
})

describe('DropdownMenu disabledReason', () => {
  const reason = 'Only owners can share'

  /** Opens from the keyboard, so focus moves into the menu as a user's would. */
  async function openByKeyboard(children: React.ReactNode) {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>{children}</DropdownMenu.Content>
      </DropdownMenu>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await screen.findByRole('menu')
  }

  it('renders no wrapper and no description without a reason', () => {
    open(
      <>
        <DropdownMenu.Item>Share</DropdownMenu.Item>
        <DropdownMenu.CheckboxItem>Pinned</DropdownMenu.CheckboxItem>
      </>,
    )

    expect(screen.getByRole('menuitem')).not.toHaveAttribute('aria-describedby')
    expect(screen.getByRole('menuitemcheckbox')).not.toHaveAttribute(
      'aria-describedby',
    )
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('blocks an Item that arrow keys still reach, and keeps the menu open', async () => {
    const onClick = vi.fn()
    await openByKeyboard(
      <>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item disabledReason={reason} onClick={onClick}>
          Share
        </DropdownMenu.Item>
      </>,
    )
    const item = screen.getByRole('menuitem', { name: 'Share' })

    expect(item).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{ArrowDown}')
    expect(item).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(item, { pointerEventsCheck: 0 })

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('blocks a CheckboxItem from toggling', async () => {
    const onCheckedChange = vi.fn()
    await openByKeyboard(
      <>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.CheckboxItem
          checked={false}
          disabledReason={reason}
          onCheckedChange={onCheckedChange}
        >
          Pinned
        </DropdownMenu.CheckboxItem>
      </>,
    )
    const item = screen.getByRole('menuitemcheckbox', { name: 'Pinned' })

    await userEvent.keyboard('{ArrowDown}')
    expect(item).toHaveFocus()
    expect(item).toHaveAttribute('aria-disabled', 'true')

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(item, { pointerEventsCheck: 0 })

    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(item).not.toBeChecked()
  })

  it('blocks a RadioItem from being selected', async () => {
    const onValueChange = vi.fn()
    await openByKeyboard(
      <DropdownMenu.RadioGroup onValueChange={onValueChange} value="light">
        <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem disabledReason={reason} value="dark">
          Dark
        </DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    )
    const item = screen.getByRole('menuitemradio', { name: 'Dark' })

    await userEvent.keyboard('{ArrowDown}')
    expect(item).toHaveFocus()
    expect(item).toHaveAttribute('aria-disabled', 'true')

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(item, { pointerEventsCheck: 0 })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(item).not.toBeChecked()
  })

  it('describes each kind of item by the reason', () => {
    open(
      <>
        <DropdownMenu.Item disabledReason={reason}>Share</DropdownMenu.Item>
        <DropdownMenu.CheckboxItem disabledReason={reason}>
          Pinned
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.RadioGroup value="light">
          <DropdownMenu.RadioItem disabledReason={reason} value="dark">
            Dark
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </>,
    )

    expect(screen.getByRole('menuitem')).toHaveAccessibleDescription(reason)
    expect(screen.getByRole('menuitemcheckbox')).toHaveAccessibleDescription(
      reason,
    )
    expect(screen.getByRole('menuitemradio')).toHaveAccessibleDescription(
      reason,
    )
  })

  it('shows the reason when arrow keys reach the item', async () => {
    await openByKeyboard(
      <>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item disabledReason={reason}>Share</DropdownMenu.Item>
      </>,
    )

    expect(
      screen.queryByTestId('disabled-reason-popup'),
    ).not.toBeInTheDocument()
    await userEvent.keyboard('{ArrowDown}')

    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })
})

describe('DropdownMenu disabledReason, edge cases', () => {
  const reason = 'Only owners can share'

  function Menu({ blocked }: { blocked: boolean }) {
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item disabledReason={blocked ? reason : undefined}>
            Share
          </DropdownMenu.Item>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    )
  }

  it('keeps focus when a reason arrives on the highlighted item', async () => {
    const { rerender } = render(<Menu blocked={false} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await screen.findByRole('menu')
    const share = () => screen.getByRole('menuitem', { name: 'Share' })
    expect(share()).toHaveFocus()

    rerender(<Menu blocked />)

    expect(share()).toHaveAttribute('aria-disabled', 'true')
    expect(share()).toHaveFocus()
    expect(share()).toHaveAccessibleDescription(reason)

    rerender(<Menu blocked={false} />)

    expect(share()).toHaveFocus()
  })

  it('joins the description an asChild child brings', () => {
    open(
      <>
        <span id="hint">Shares the whole folder</span>
        <DropdownMenu.Item asChild disabledReason={reason}>
          <div aria-describedby="hint">Share</div>
        </DropdownMenu.Item>
      </>,
    )

    expect(screen.getByRole('menuitem')).toHaveAccessibleDescription(
      `Shares the whole folder ${reason}`,
    )
  })

  it('stretches a blocked item across its row', () => {
    open(<DropdownMenu.Item disabledReason={reason}>Share</DropdownMenu.Item>)

    // jsdom has no layout: the class that makes the item fill is the claim.
    expect(document.querySelector('[data-slot="disabled-reason"]')).toHaveClass(
      'w-full',
      '*:grow',
    )
  })
})
