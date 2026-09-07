import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Radio } from './radio'

const items = [
  { label: 'One', value: '1' },
  { description: 'Second choice', label: 'Two', value: '2' },
  { disabled: true, label: 'Three', value: '3' },
]

describe('Radio', () => {
  it('takes its accessible name from the label', () => {
    render(<Radio label="One" value="v1" />)

    expect(screen.getByRole('radio', { name: 'One' })).toBeInTheDocument()
  })

  it('adds the description to the accessible name', () => {
    render(<Radio description="Only once" label="One" value="v1" />)

    expect(
      screen.getByRole('radio', { name: 'OneOnly once' }),
    ).toBeInTheDocument()
  })

  it('renders a bare control with neither label nor description', () => {
    render(<Radio value="v1" />)

    expect(screen.getByRole('radio')).not.toBeChecked()
  })

  it('renders a description with no label at all', () => {
    render(<Radio description="Only once" value="v1" />)

    expect(screen.getByRole('radio', { name: 'Only once' })).toBeInTheDocument()
  })

  it('shows the checked state it was given', () => {
    render(<Radio checked label="One" value="v1" />)

    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked()
  })

  it('keeps the checked state it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Radio checked={false} label="One" onChange={onChange} value="v1" />)

    const control = screen.getByRole('radio', { name: 'One' })
    await userEvent.click(control)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(control).not.toBeChecked()
  })

  it('checks itself on a click when nothing controls it', async () => {
    const onChange = vi.fn()
    render(<Radio label="One" onChange={onChange} value="v1" />)

    const control = screen.getByRole('radio', { name: 'One' })
    expect(control).not.toBeChecked()

    await userEvent.click(control)

    expect(control).toBeChecked()
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('starts from defaultChecked and stays checked', async () => {
    render(<Radio defaultChecked label="One" value="v1" />)

    const control = screen.getByRole('radio', { name: 'One' })
    expect(control).toBeChecked()

    await userEvent.click(control)

    expect(control).toBeChecked()
  })

  it('lets the controlled state win over defaultChecked', () => {
    render(<Radio checked={false} defaultChecked label="One" value="v1" />)

    expect(screen.getByRole('radio', { name: 'One' })).not.toBeChecked()
  })

  it('falls back to its own value when none is given', async () => {
    const onChange = vi.fn()
    render(<Radio label="One" onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'One' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('blocks the pick when disabled', async () => {
    const onChange = vi.fn()
    render(<Radio disabled label="One" onChange={onChange} value="v1" />)

    const control = screen.getByRole('radio', { name: 'One' })
    expect(control).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(control)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('stays reachable inside the bordered wrapper', async () => {
    const onChange = vi.fn()
    render(<Radio bordered label="One" onChange={onChange} value="v1" />)

    await userEvent.click(screen.getByRole('radio', { name: 'One' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('Radio.Group', () => {
  it('delivers the value of the picked item', async () => {
    const onChange = vi.fn()
    render(<Radio.Group items={items} onChange={onChange} />)

    await userEvent.click(
      screen.getByRole('radio', { name: 'TwoSecond choice' }),
    )

    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('moves the selection on its own when uncontrolled', async () => {
    const onChange = vi.fn()
    render(<Radio.Group defaultValue="1" items={items} onChange={onChange} />)

    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked()

    await userEvent.click(
      screen.getByRole('radio', { name: 'TwoSecond choice' }),
    )

    expect(onChange).toHaveBeenCalledWith('2')
    expect(
      screen.getByRole('radio', { name: 'TwoSecond choice' }),
    ).toBeChecked()
    expect(screen.getByRole('radio', { name: 'One' })).not.toBeChecked()
  })

  it('keeps the selection it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Radio.Group items={items} onChange={onChange} value="1" />)

    await userEvent.click(
      screen.getByRole('radio', { name: 'TwoSecond choice' }),
    )

    expect(onChange).toHaveBeenCalledWith('2')
    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: 'TwoSecond choice' }),
    ).not.toBeChecked()
  })

  it('blocks the item that marks itself disabled', async () => {
    const onChange = vi.fn()
    render(<Radio.Group items={items} onChange={onChange} />)

    const three = screen.getByRole('radio', { name: 'Three' })
    expect(three).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(three)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('blocks every item when the group is disabled', async () => {
    const onChange = vi.fn()
    render(<Radio.Group disabled items={items} onChange={onChange} />)

    const one = screen.getByRole('radio', { name: 'One' })
    expect(one).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(one)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('picks an item without an onChange attached', async () => {
    render(<Radio.Group items={items} />)

    await userEvent.click(screen.getByRole('radio', { name: 'One' }))

    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked()
  })

  it('keeps every item reachable when bordered', () => {
    render(<Radio.Group bordered items={items} />)

    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })
})

describe.each(['horizontal', 'vertical'] as const)(
  'Radio.Group %s',
  (variant) => {
    it('keeps every item reachable', () => {
      render(<Radio.Group items={items} variant={variant} />)

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(3)
    })
  },
)
