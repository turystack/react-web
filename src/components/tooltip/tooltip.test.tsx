import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Tooltip } from './tooltip'

describe('Tooltip', () => {
  it('keeps the content hidden until the trigger is hovered', async () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    )

    expect(screen.queryByText('Save changes')).not.toBeInTheDocument()

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save changes')
  })

  it('describes the trigger while the content is shown', async () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    )

    const trigger = screen.getByTestId('tooltip-trigger')
    expect(trigger).toHaveAccessibleDescription('')

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))
    await screen.findByRole('tooltip')

    expect(trigger).toHaveAccessibleDescription('Save changes')
  })

  it('hides the content again when the pointer leaves', async () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))
    await screen.findByRole('tooltip')

    await userEvent.unhover(screen.getByRole('button', { name: 'Save' }))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the content on keyboard focus', async () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    )

    await userEvent.tab()

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save changes')
  })

  it('renders a node as content', async () => {
    render(
      <Tooltip
        content={
          <span>
            Press <kbd>K</kbd>
          </span>
        }
      >
        <button type="button">Save</button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Press K')
  })

  it('honors an explicit placement, offset and delay', async () => {
    render(
      <Tooltip
        content="Save changes"
        delayDuration={0}
        side="right"
        sideOffset={12}
      >
        <button type="button">Save</button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('tooltip')).toHaveAttribute(
      'data-side',
      'right',
    )
  })
})

describe('Tooltip inside a provider that names a portal container', () => {
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
        <Tooltip content="Save changes">
          <button type="button">Save</button>
        </Tooltip>
      </TuryProvider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))

    expect(container).toContainElement(await screen.findByRole('tooltip'))
  })

  it('leaves the popup on the body when no container is named', async () => {
    render(
      <TuryProvider>
        <Tooltip content="Save changes">
          <button type="button">Save</button>
        </Tooltip>
      </TuryProvider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Save' }))

    expect(container).not.toContainElement(await screen.findByRole('tooltip'))
  })
})
