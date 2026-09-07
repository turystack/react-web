import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('takes its accessible name from a string label', () => {
    render(<Switch label="Dark mode" />)

    expect(
      screen.getByRole('switch', { name: 'Dark mode' }),
    ).toBeInTheDocument()
  })

  it('takes its accessible name from a label object', () => {
    render(<Switch label={{ content: 'Dark mode' }} />)

    expect(
      screen.getByRole('switch', { name: 'Dark mode' }),
    ).toBeInTheDocument()
  })

  it('marks a required label', () => {
    render(<Switch label={{ content: 'Dark mode', required: true }} />)

    expect(
      screen.getByRole('switch', { name: 'Dark mode*' }),
    ).toBeInTheDocument()
  })

  it('marks an optional label', () => {
    render(<Switch label={{ content: 'Dark mode', optional: true }} />)

    expect(
      screen.getByRole('switch', { name: 'Dark mode(optional)' }),
    ).toBeInTheDocument()
  })

  it('keeps the label reachable when it carries a tooltip', () => {
    render(
      <Switch label={{ content: 'Dark mode', tooltip: 'Saves your eyes' }} />,
    )

    expect(
      screen.getByRole('switch', { name: 'Dark mode' }),
    ).toBeInTheDocument()
  })

  it('dims a label marked disabled without blocking the switch', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        label={{ content: 'Dark mode', disabled: true, htmlFor: 'dark' }}
        onCheckedChange={onCheckedChange}
      />,
    )

    const control = screen.getByRole('switch', { name: 'Dark mode' })
    expect(control).not.toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('keeps the description out of the name and offers it as the description', () => {
    render(<Switch description="Less light" label="Dark mode" />)

    const control = screen.getByRole('switch', { name: 'Dark mode' })
    expect(control).toHaveAccessibleDescription('Less light')
    expect(screen.getByText('Less light')).toBeInTheDocument()
  })

  it('renders a description with no label at all', () => {
    render(<Switch description="Less light" />)

    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByText('Less light')).toBeInTheDocument()
  })

  it('renders a bare switch with neither label nor description', () => {
    render(<Switch />)

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('flips on its own and delivers each new state when uncontrolled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        defaultChecked
        label="Dark mode"
        onCheckedChange={onCheckedChange}
      />,
    )

    const control = screen.getByRole('switch', { name: 'Dark mode' })
    expect(control).toBeChecked()

    await userEvent.click(control)
    // The headless switch hands the callback an event-details object after the
    // checked value, so the assert has to name both to reach the value.
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    expect(control).not.toBeChecked()

    await userEvent.click(control)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(control).toBeChecked()
  })

  it('keeps the state it was given and still asks for the change', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        checked={false}
        label="Dark mode"
        onCheckedChange={onCheckedChange}
      />,
    )

    const control = screen.getByRole('switch', { name: 'Dark mode' })
    await userEvent.click(control)

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(control).not.toBeChecked()
  })

  it('toggles from a click on the label text', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        description="Less light"
        label="Dark mode"
        onCheckedChange={onCheckedChange}
      />,
    )

    await userEvent.click(screen.getByText('Dark mode'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked()
  })

  it('leaves the description out of the toggle', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        bordered
        description="Less light"
        label="Dark mode"
        onCheckedChange={onCheckedChange}
      />,
    )

    await userEvent.click(screen.getByText('Less light'))

    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(screen.getByRole('switch', { name: 'Dark mode' })).not.toBeChecked()
  })

  it('leaves the bordered row itself out of the toggle', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        bordered
        description="Less light"
        label="Dark mode"
        onCheckedChange={onCheckedChange}
      />,
    )

    await userEvent.click(screen.getByTestId('switch-wrapper'))

    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(screen.getByRole('switch', { name: 'Dark mode' })).not.toBeChecked()
  })

  it('nests no label inside another', () => {
    render(<Switch description="Less light" label="Dark mode" />)

    for (const element of document.querySelectorAll('label')) {
      expect(element.querySelector('label')).toBeNull()
    }
  })

  it('carries the label styling hook it was handed', () => {
    render(<Switch label={{ className: 'uppercase', content: 'Dark mode' }} />)

    expect(screen.getByText('Dark mode').closest('label')).toHaveClass(
      'uppercase',
    )
  })

  it('blocks the toggle when disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch disabled label="Dark mode" onCheckedChange={onCheckedChange} />,
    )

    const control = screen.getByRole('switch', { name: 'Dark mode' })
    expect(control).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(control)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(control).not.toBeChecked()
  })

  it('stays reachable inside the bordered wrapper', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        bordered
        label="Dark mode"
        onCheckedChange={onCheckedChange}
        value="on"
      />,
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('toggles without an onCheckedChange attached', async () => {
    render(<Switch label="Dark mode" />)

    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }))

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Switch size %s', (size) => {
  it('stays a reachable switch', async () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        label="Dark mode"
        onCheckedChange={onCheckedChange}
        size={size}
      />,
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
