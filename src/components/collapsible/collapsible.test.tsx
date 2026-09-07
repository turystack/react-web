import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Collapsible } from './collapsible'

function Example(props: Parameters<typeof Collapsible>[0]) {
  return (
    <Collapsible {...props}>
      <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
      <Collapsible.Panel>the content</Collapsible.Panel>
    </Collapsible>
  )
}

describe('Collapsible', () => {
  it('starts closed and opens on the trigger', async () => {
    render(<Example />)

    expect(screen.queryByText('the content')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(screen.getByText('the content')).toBeInTheDocument()
  })

  it('starts open when told to', () => {
    render(<Example defaultOpen />)

    expect(screen.getByText('the content')).toBeInTheDocument()
  })

  it('reports the change to the page that controls it', async () => {
    const onChange = vi.fn()

    render(<Example onChange={onChange} open={false} />)

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('the content')).not.toBeInTheDocument()
  })

  it('tells assistive technology what the trigger controls', () => {
    render(<Example defaultOpen />)

    const trigger = screen.getByTestId('collapsible-trigger')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls')
  })

  it('refuses to open while disabled', async () => {
    render(<Example disabled />)

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(screen.queryByText('the content')).not.toBeInTheDocument()
  })

  it('keeps the content in the document when asked, so the browser can find it', () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
        <Collapsible.Panel keepMounted>
          <input aria-label="Code" />
        </Collapsible.Panel>
      </Collapsible>,
    )

    expect(screen.getByLabelText('Code')).toBeInTheDocument()
  })
})
