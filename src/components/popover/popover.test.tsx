import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { TuryProvider } from '@/components/tury-provider'

import { Popover } from './popover'
import { ComposedPopover } from './popover.composed'

describe('Popover', () => {
  it('keeps its content out of the document until it is opened', () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('shows the content in a dialog when the trigger is clicked', async () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(await screen.findByRole('dialog')).toHaveTextContent('Panel')
  })

  it('exposes the trigger as a button', () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    expect(screen.getByTestId('popover-trigger')).toHaveAttribute(
      'role',
      'button',
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBe(
      screen.getByTestId('popover-trigger'),
    )
  })

  it('opens from a control the consumer nested inside the trigger', async () => {
    render(
      <Popover content={<p>Panel</p>}>
        <input placeholder="Pick a date" readOnly />
      </Popover>,
    )

    await userEvent.click(screen.getByPlaceholderText('Pick a date'))

    expect(await screen.findByRole('dialog')).toHaveTextContent('Panel')
  })

  it('marks the trigger as expanded while the content is open', async () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    const trigger = screen.getByTestId('popover-trigger')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('delivers true to onOpenChange when it opens', async () => {
    const onOpenChange = vi.fn()
    render(
      <Popover content={<p>Panel</p>} onOpenChange={onOpenChange}>
        <span>Open</span>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('delivers false to onOpenChange when Escape dismisses it', async () => {
    const onOpenChange = vi.fn()
    render(
      <Popover content={<p>Panel</p>} onOpenChange={onOpenChange}>
        <span>Open</span>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('stays open when open is held true from outside', async () => {
    render(
      <Popover content={<p>Panel</p>} open>
        <span>Open</span>
      </Popover>,
    )

    expect(await screen.findByRole('dialog')).toHaveTextContent('Panel')

    await userEvent.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toHaveTextContent('Panel')
  })

  it('stays closed when open is held false from outside', async () => {
    render(
      <Popover content={<p>Panel</p>} open={false}>
        <span>Open</span>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on its own when nothing controls it', async () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Popover ariaLabel', () => {
  it('names the wrapper trigger when what it wraps has no name', () => {
    render(
      <Popover ariaLabel="Open calendar" content={<p>Panel</p>}>
        <input readOnly />
      </Popover>,
    )

    expect(screen.getByTestId('popover-trigger')).toHaveAccessibleName(
      'Open calendar',
    )
  })

  it('leaves the wrapper named by its content without it', () => {
    render(
      <Popover content={<p>Panel</p>}>
        <span>Open</span>
      </Popover>,
    )

    expect(screen.getByTestId('popover-trigger')).not.toHaveAttribute(
      'aria-label',
    )
  })

  it('leaves the Button its own name with asChild', () => {
    render(
      <Popover ariaLabel="Ignored" asChild content={<p>Panel</p>}>
        <Button>Open</Button>
      </Popover>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Open')
  })
})

describe('Popover width', () => {
  it('fits its content by default', async () => {
    render(
      <Popover content={<p>Panel</p>} open>
        <span>Open</span>
      </Popover>,
    )

    const popup = await screen.findByRole('dialog')
    expect(popup).toHaveAttribute('data-width', 'auto')
    expect(popup).toHaveClass('w-fit')
  })

  it.each([
    ['sm', 'w-56'],
    ['md', 'w-72'],
    ['lg', 'w-96'],
    ['trigger', 'w-(--anchor-width)'],
  ] as const)('takes the %s width', async (width, token) => {
    render(
      <Popover content={<p>Panel</p>} open width={width}>
        <span>Open</span>
      </Popover>,
    )

    const popup = await screen.findByRole('dialog')
    expect(popup).toHaveAttribute('data-width', width)
    expect(popup).toHaveClass(token)
    expect(popup).not.toHaveClass('w-fit')
  })

  it('keeps a fixed preset inside the room left on screen', async () => {
    render(
      <Popover content={<p>Panel</p>} open width="lg">
        <span>Open</span>
      </Popover>,
    )

    expect(await screen.findByRole('dialog')).toHaveClass(
      'max-w-(--available-width)',
    )
  })

  it('keeps the width when the Button is the trigger', async () => {
    render(
      <Popover asChild content={<p>Panel</p>} width="md">
        <Button>Open</Button>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(await screen.findByRole('dialog')).toHaveClass('w-72')
  })

  it('refuses a popup class from a consumer of the package', () => {
    render(
      // @ts-expect-error popupClassName is internal; the public API sizes with width
      <Popover content={<p>Panel</p>} popupClassName="w-80">
        <span>Open</span>
      </Popover>,
    )

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('takes the popup class the package composers hand it', async () => {
    render(
      <ComposedPopover
        content={<p>Panel</p>}
        open
        popupClassName="date-input-popup p-0"
        width="trigger"
      >
        <span>Open</span>
      </ComposedPopover>,
    )

    const popup = await screen.findByRole('dialog')
    expect(popup).toHaveClass('date-input-popup', 'p-0', 'w-(--anchor-width)')
    expect(popup).not.toHaveClass('p-4')
  })
})

describe('Popover with asChild', () => {
  it('makes the Button itself the trigger, so it is one button with one name', () => {
    render(
      <Popover asChild content={<p>Panel</p>}>
        <Button>Filters</Button>
      </Popover>,
    )

    expect(screen.getAllByRole('button', { name: 'Filters' })).toHaveLength(1)
    expect(screen.queryByTestId('popover-trigger')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filters' })).toBe(
      screen.getByTestId('button'),
    )
  })

  it('opens from the Button and marks it expanded', async () => {
    render(
      <Popover asChild content={<p>Panel</p>}>
        <Button>Filters</Button>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)

    expect(await screen.findByRole('dialog')).toHaveTextContent('Panel')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens from the keyboard and returns focus to the Button on Escape', async () => {
    render(
      <Popover asChild content={<p>Panel</p>}>
        <Button>Filters</Button>
      </Popover>,
    )

    await userEvent.tab()
    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('still runs the Button onClick alongside the toggle', async () => {
    const onClick = vi.fn()
    render(
      <Popover asChild content={<p>Panel</p>}>
        <Button onClick={onClick}>Filters</Button>
      </Popover>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('falls back to the wrapper when the children are not a single element', async () => {
    render(
      <Popover asChild content={<p>Panel</p>}>
        Open
      </Popover>,
    )

    const trigger = screen.getByTestId('popover-trigger')
    expect(trigger).toHaveAttribute('role', 'button')

    await userEvent.click(trigger)

    expect(await screen.findByRole('dialog')).toHaveTextContent('Panel')
  })

  it('wraps an element child when asChild is off', () => {
    render(
      <Popover content={<p>Panel</p>}>
        <Button>Filters</Button>
      </Popover>,
    )

    expect(screen.getByTestId('popover-trigger')).toContainElement(
      screen.getByTestId('button'),
    )
  })
})

describe.each(['top', 'right', 'bottom', 'left'] as const)(
  'Popover on side %s',
  (side) => {
    it('reports the side it settled on', async () => {
      render(
        <Popover content={<p>Panel</p>} open side={side} sideOffset={12}>
          <span>Open</span>
        </Popover>,
      )

      expect(await screen.findByRole('dialog')).toHaveAttribute(
        'data-side',
        side,
      )
    })
  },
)

describe.each(['start', 'center', 'end'] as const)(
  'Popover aligned to %s',
  (align) => {
    it('reports the alignment it settled on', async () => {
      render(
        <Popover align={align} content={<p>Panel</p>} open>
          <span>Open</span>
        </Popover>,
      )

      expect(await screen.findByRole('dialog')).toHaveAttribute(
        'data-align',
        align,
      )
    })
  },
)

describe('Popover inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the popup inside the named container', async () => {
    render(
      <TuryProvider portalContainer={container}>
        <Popover content={<p>Panel</p>}>
          <span>Open</span>
        </Popover>
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(container).toContainElement(await screen.findByRole('dialog'))
  })

  it('resolves a container given as a function', async () => {
    render(
      <TuryProvider portalContainer={() => container}>
        <Popover content={<p>Panel</p>}>
          <span>Open</span>
        </Popover>
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(container).toContainElement(await screen.findByRole('dialog'))
  })

  it('leaves the popup on the body when no container is named', async () => {
    render(
      <TuryProvider>
        <Popover content={<p>Panel</p>}>
          <span>Open</span>
        </Popover>
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(container).not.toContainElement(await screen.findByRole('dialog'))
  })
})
