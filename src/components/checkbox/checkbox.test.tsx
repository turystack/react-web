import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from './checkbox'

const items = [
  { label: 'Apple', value: 'a1' },
  { label: 'Banana', value: 'b1' },
  { disabled: true, label: 'Cherry', value: 'c1' },
]

describe('Checkbox', () => {
  it('takes its accessible name from the label', () => {
    render(<Checkbox label="Accept" />)

    expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeInTheDocument()
  })

  it('adds the description to the accessible name', () => {
    render(<Checkbox description="Terms apply" label="Accept" />)

    expect(
      screen.getByRole('checkbox', { name: 'AcceptTerms apply' }),
    ).toBeInTheDocument()
  })

  it('renders a bare checkbox with neither label nor description', () => {
    render(<Checkbox />)

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('flips on its own and delivers each new state when uncontrolled', async () => {
    const onChange = vi.fn()
    render(<Checkbox defaultChecked label="Accept" onChange={onChange} />)

    const box = screen.getByRole('checkbox', { name: 'Accept' })
    expect(box).toBeChecked()

    await userEvent.click(box)
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect(box).not.toBeChecked()

    await userEvent.click(box)
    expect(onChange).toHaveBeenLastCalledWith(true)
    expect(box).toBeChecked()
  })

  it('keeps the checked state it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} label="Accept" onChange={onChange} />)

    const box = screen.getByRole('checkbox', { name: 'Accept' })
    await userEvent.click(box)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(box).not.toBeChecked()
  })

  it('toggles from a click on the label text', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Accept" onChange={onChange} />)

    await userEvent.click(screen.getByText('Accept'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('blocks the toggle when disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox disabled label="Accept" onChange={onChange} />)

    const box = screen.getByRole('checkbox', { name: 'Accept' })
    expect(box).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(box)
    expect(onChange).not.toHaveBeenCalled()
    expect(box).not.toBeChecked()
  })

  it('stays reachable inside the bordered wrapper', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox
        bordered
        description="Terms"
        label="Accept"
        onChange={onChange}
        value="a1"
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'AcceptTerms' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Checkbox size %s', (size) => {
  it('stays a reachable checkbox', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Accept" onChange={onChange} size={size} />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'Accept' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('Checkbox.Group', () => {
  it('delivers the whole selection when an item is added', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox.Group
        defaultValue={['a1']}
        items={items}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith(['a1', 'b1'])
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeChecked()
  })

  it('delivers what is left when an item is removed', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox.Group
        defaultValue={['a1', 'b1']}
        items={items}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Apple' }))

    expect(onChange).toHaveBeenCalledWith(['b1'])
    expect(screen.getByRole('checkbox', { name: 'Apple' })).not.toBeChecked()
  })

  it('starts empty when neither value nor defaultValue is given', async () => {
    const onChange = vi.fn()
    render(<Checkbox.Group items={items} onChange={onChange} />)

    expect(screen.getByRole('checkbox', { name: 'Apple' })).not.toBeChecked()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Apple' }))
    expect(onChange).toHaveBeenCalledWith(['a1'])
  })

  it('keeps the selection it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(<Checkbox.Group items={items} onChange={onChange} value={['a1']} />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith(['a1', 'b1'])
    expect(screen.getByRole('checkbox', { name: 'Banana' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeChecked()
  })

  it('blocks the item that marks itself disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox.Group items={items} onChange={onChange} />)

    const cherry = screen.getByRole('checkbox', { name: 'Cherry' })
    expect(cherry).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(cherry)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('blocks every item when the group is disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox.Group disabled items={items} onChange={onChange} />)

    const apple = screen.getByRole('checkbox', { name: 'Apple' })
    expect(apple).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(apple)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('toggles without an onChange attached', async () => {
    render(<Checkbox.Group items={items} />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'Apple' }))

    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeChecked()
  })
})

describe('Checkbox.Group parity with Radio.Group', () => {
  const rich = [
    { description: 'Crisp and red', label: 'Apple', value: 'a1' },
    { label: 'Banana', value: 'b1' },
  ]

  it('carries the item description into the accessible name', () => {
    render(<Checkbox.Group items={rich} />)

    expect(
      screen.getByRole('checkbox', { name: 'AppleCrisp and red' }),
    ).toBeInTheDocument()
  })

  it('keeps every item reachable when bordered', () => {
    render(<Checkbox.Group bordered items={rich} />)

    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('gives every item the size the group asks for', () => {
    render(<Checkbox.Group items={rich} size="lg" />)

    for (const box of screen.getAllByTestId('checkbox-box')) {
      expect(box.className).toContain('size-5')
    }
  })

  it('gives every item its own form value', () => {
    const { container } = render(<Checkbox.Group items={rich} />)

    const values = [
      ...container.querySelectorAll('input[type="checkbox"]'),
    ].map((input) => input.getAttribute('value'))

    expect(values).toEqual(['a1', 'b1'])
  })
})

describe.each(['horizontal', 'vertical'] as const)(
  'Checkbox.Group %s',
  (variant) => {
    it('keeps every item reachable', () => {
      render(<Checkbox.Group items={items} variant={variant} />)

      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })
  },
)
