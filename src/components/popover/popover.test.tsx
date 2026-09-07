import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Popover } from './popover'

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
