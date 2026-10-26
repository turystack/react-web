import { cleanup, render, screen } from '@testing-library/react'
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

describe('Checkbox error', () => {
  it('is valid until told otherwise', () => {
    render(<Checkbox label="Accept" />)

    const box = screen.getByRole('checkbox', { name: 'Accept' })
    expect(box).not.toHaveAttribute('aria-invalid')
    expect(box).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByTestId('checkbox-error')).not.toBeInTheDocument()
  })

  it('marks itself invalid and paints the destructive border', () => {
    render(<Checkbox error label="Accept" />)

    const box = screen.getByRole('checkbox', { name: 'Accept' })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveClass(
      'aria-invalid:border-destructive',
      'aria-invalid:ring-destructive/20',
    )
    // error alone renders no message and points at none.
    expect(box).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByTestId('checkbox-error')).not.toBeInTheDocument()
  })

  it('stays valid with error={false}', () => {
    render(<Checkbox error={false} label="Accept" />)

    expect(
      screen.getByRole('checkbox', { name: 'Accept' }),
    ).not.toHaveAttribute('aria-invalid')
  })

  it('announces the message as its description, not its name', () => {
    render(
      <Checkbox
        description="Read them first"
        errorMessage="You must accept the terms"
        label="Accept"
      />,
    )

    const box = screen.getByRole('checkbox', { name: 'AcceptRead them first' })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAccessibleDescription('You must accept the terms')
    expect(screen.getByTestId('checkbox-error')).toHaveClass('text-destructive')
  })

  it('keeps each message tied to its own checkbox', () => {
    render(
      <>
        <Checkbox errorMessage="First is wrong" label="First" />
        <Checkbox errorMessage="Second is wrong" label="Second" />
      </>,
    )

    expect(
      screen.getByRole('checkbox', { name: 'First' }),
    ).toHaveAccessibleDescription('First is wrong')
    expect(
      screen.getByRole('checkbox', { name: 'Second' }),
    ).toHaveAccessibleDescription('Second is wrong')
  })

  it('still toggles from its label while invalid', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox
        bordered
        errorMessage="Required"
        label="Accept"
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByText('Accept'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('treats an empty message as no message', () => {
    render(<Checkbox errorMessage={null} label="Accept" />)

    expect(
      screen.getByRole('checkbox', { name: 'Accept' }),
    ).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByTestId('checkbox-field')).not.toBeInTheDocument()
  })
})

describe.each([
  ['sm', 'pl-5'],
  ['md', 'pl-6'],
  ['lg', 'pl-7'],
] as const)('Checkbox error message at size %s', (size, indent) => {
  it('lines up under the label text', () => {
    render(<Checkbox errorMessage="Required" label="Accept" size={size} />)

    expect(screen.getByTestId('checkbox-error')).toHaveClass(indent)
  })
})

describe.each([
  ['sm', 'pl-8'],
  ['md', 'pl-9'],
  ['lg', 'pl-10'],
] as const)('Bordered Checkbox error message at size %s', (size, indent) => {
  it('lines up under the label text inside the border padding', () => {
    render(
      <Checkbox bordered errorMessage="Required" label="Accept" size={size} />,
    )

    expect(screen.getByTestId('checkbox-error')).toHaveClass(indent)
    expect(screen.getByTestId('checkbox-field')).toHaveClass('w-full')
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

describe('Checkbox.Group name', () => {
  it('is a group named by ariaLabel', () => {
    render(<Checkbox.Group ariaLabel="Fruits" items={items} />)

    expect(screen.getByRole('group', { name: 'Fruits' })).toBeInTheDocument()
  })
})

describe('Checkbox.Group error', () => {
  it('is valid by default and points at no message', () => {
    render(<Checkbox.Group ariaLabel="Fruits" items={items} />)

    const group = screen.getByRole('group', { name: 'Fruits' })
    expect(group).not.toHaveAttribute('aria-invalid')
    expect(group).not.toHaveAttribute('aria-describedby')
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).not.toHaveAttribute('aria-invalid')
    }
    expect(screen.queryByTestId('checkbox-group-error')).not.toBeInTheDocument()
  })

  it('marks the group and every box invalid with error alone', () => {
    render(<Checkbox.Group ariaLabel="Fruits" error items={items} />)

    const group = screen.getByRole('group', { name: 'Fruits' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    // error alone renders no message and points at none.
    expect(group).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByTestId('checkbox-group-error')).not.toBeInTheDocument()
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toHaveAttribute('aria-invalid', 'true')
      expect(box.className).toContain('aria-invalid:border-destructive')
    }
  })

  it('stays valid with error={false}', () => {
    render(<Checkbox.Group ariaLabel="Fruits" error={false} items={items} />)

    expect(screen.getByRole('group', { name: 'Fruits' })).not.toHaveAttribute(
      'aria-invalid',
    )
  })

  it('shows the message once and announces it as the group description', () => {
    render(
      <Checkbox.Group
        ariaLabel="Fruits"
        errorMessage="Pick at least one fruit"
        items={items}
      />,
    )

    const group = screen.getByRole('group', { name: 'Fruits' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('Pick at least one fruit')
    expect(screen.getAllByText('Pick at least one fruit')).toHaveLength(1)
    expect(screen.getByTestId('checkbox-group-error')).toHaveClass(
      'text-destructive',
    )
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toHaveAttribute('aria-invalid', 'true')
      // The reason belongs to the group, not repeated on every item.
      expect(box).not.toHaveAttribute('aria-describedby')
    }
  })

  it('keeps the message out of every item name', () => {
    render(
      <Checkbox.Group
        ariaLabel="Fruits"
        errorMessage="Required"
        items={items}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Fruits' })).toBeInTheDocument()
  })

  it('gives two invalid groups their own messages', () => {
    render(
      <>
        <Checkbox.Group
          ariaLabel="First"
          errorMessage="First is wrong"
          items={items}
        />
        <Checkbox.Group
          ariaLabel="Second"
          errorMessage="Second is wrong"
          items={items}
        />
      </>,
    )

    expect(
      screen.getByRole('group', { name: 'First' }),
    ).toHaveAccessibleDescription('First is wrong')
    expect(
      screen.getByRole('group', { name: 'Second' }),
    ).toHaveAccessibleDescription('Second is wrong')
  })

  it('treats a null message as no message', () => {
    render(
      <Checkbox.Group ariaLabel="Fruits" errorMessage={null} items={items} />,
    )

    expect(screen.getByRole('group', { name: 'Fruits' })).not.toHaveAttribute(
      'aria-invalid',
    )
    expect(screen.queryByTestId('checkbox-group-error')).not.toBeInTheDocument()
  })

  it('still toggles and delivers the selection while invalid', async () => {
    const onChange = vi.fn()
    render(
      <Checkbox.Group
        errorMessage="Pick at least one fruit"
        items={items}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Apple' }))

    expect(onChange).toHaveBeenLastCalledWith(['a1'])
  })

  it('starts the message at the group edge, not an item label', () => {
    render(<Checkbox.Group errorMessage="Required" items={items} size="lg" />)

    expect(screen.getByTestId('checkbox-group-error').className).not.toMatch(
      /\bpl-\d/,
    )
  })
})

describe('Checkbox ariaLabel', () => {
  it('names a box that has no visible label', () => {
    render(<Checkbox ariaLabel="Select row" />)

    expect(screen.getByRole('checkbox')).toHaveAccessibleName('Select row')
  })

  it('has no name without a label or ariaLabel', () => {
    render(<Checkbox />)

    expect(screen.getByRole('checkbox')).not.toHaveAccessibleName()
  })
})

describe('Checkbox indeterminate', () => {
  it('is exposed as mixed and draws a dash', () => {
    render(<Checkbox checked={false} indeterminate />)

    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-checked', 'mixed')
    expect(box).toHaveAttribute('data-indeterminate')
    const dash = screen.getByTestId('checkbox-indicator').innerHTML
    expect(dash).toContain('<svg')

    cleanup()
    render(<Checkbox checked />)
    // The mixed box draws something else than the check mark.
    expect(screen.getByTestId('checkbox-indicator').innerHTML).not.toBe(dash)
  })

  it('reads as plainly checked or unchecked when not indeterminate', () => {
    const { rerender } = render(<Checkbox checked indeterminate={false} />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')

    rerender(<Checkbox checked={false} />)
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('reports a check when the mixed box is pressed', async () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} indeterminate onChange={onChange} />)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('Checkbox axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Checkbox label="Accept" />)

    expect(screen.getByTestId('checkbox-root')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<Checkbox label="Accept" size="lg" />)

    expect(screen.getByTestId('checkbox-root')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })

  it('publishes the group defaults and the values it was given', () => {
    const items = [
      {
        label: 'A',
        value: 'a',
      },
    ]
    render(<Checkbox.Group items={items} />)

    const group = screen.getByTestId('checkbox-group')
    expect(group).toHaveAttribute('data-size', 'md')
    expect(group).toHaveAttribute('data-variant', 'vertical')

    cleanup()
    render(<Checkbox.Group items={items} size="sm" variant="horizontal" />)

    const given = screen.getByTestId('checkbox-group')
    expect(given).toHaveAttribute('data-size', 'sm')
    expect(given).toHaveAttribute('data-variant', 'horizontal')
  })
})

describe('Checkbox disabledReason', () => {
  const reason = 'Required by your plan'

  it('renders no wrapper and no description without a reason', () => {
    render(<Checkbox label="Audit log" />)

    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-describedby')
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('is blocked but stays in the tab order, and nothing changes it', async () => {
    const onChange = vi.fn()

    render(
      <>
        <button type="button">before</button>
        <Checkbox
          defaultChecked
          disabledReason={reason}
          label="Audit log"
          onChange={onChange}
        />
      </>,
    )
    const box = screen.getByRole('checkbox', { name: 'Audit log' })

    expect(box).toHaveAttribute('aria-disabled', 'true')
    expect(box).not.toHaveAttribute('data-disabled')

    await userEvent.tab()
    await userEvent.tab()
    expect(box).toHaveFocus()

    await userEvent.keyboard(' ')
    await userEvent.click(box, { pointerEventsCheck: 0 })
    await userEvent.click(screen.getByText('Audit log'), {
      pointerEventsCheck: 0,
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(box).toBeChecked()
  })

  it('is described by the reason, then its error, and shows it on focus', async () => {
    render(
      <Checkbox
        disabledReason={reason}
        errorMessage="Pick one"
        label="Audit"
      />,
    )

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      `${reason} Pick one`,
    )

    await userEvent.tab()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })

  it('blocks one item of a group, which stays reachable', async () => {
    const onChange = vi.fn()

    render(
      <Checkbox.Group
        items={[
          { label: 'Apple', value: 'a1' },
          { disabledReason: reason, label: 'Banana', value: 'b1' },
        ]}
        onChange={onChange}
      />,
    )
    const banana = screen.getByRole('checkbox', { name: 'Banana' })

    await userEvent.tab()
    await userEvent.tab()
    expect(banana).toHaveFocus()
    expect(banana).toHaveAccessibleDescription(reason)

    await userEvent.keyboard(' ')
    await userEvent.click(banana, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(banana).not.toBeChecked()
  })
})

describe('Checkbox disabledReason, edge cases', () => {
  const reason = 'Locked by your admin'

  it('keeps focus when a reason arrives on the focused box', async () => {
    const { rerender } = render(<Checkbox label="Newsletter" />)
    await userEvent.tab()
    const box = () => screen.getByRole('checkbox', { name: 'Newsletter' })
    expect(box()).toHaveFocus()

    rerender(<Checkbox disabledReason={reason} label="Newsletter" />)

    expect(box()).toHaveFocus()
    expect(box()).toHaveAttribute('aria-disabled', 'true')
    expect(box()).toHaveAccessibleDescription(reason)

    rerender(<Checkbox label="Newsletter" />)

    expect(box()).toHaveFocus()
  })
})

describe('Checkbox disabledReason, kept value', () => {
  it('keeps what the reader ticked when a reason arrives', async () => {
    const { rerender } = render(<Checkbox label="Accept the terms" />)

    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')

    rerender(
      <Checkbox disabledReason="Seats are full" label="Accept the terms" />,
    )

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })
})
