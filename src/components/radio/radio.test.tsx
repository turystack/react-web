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
  it('names the radiogroup with ariaLabel', () => {
    render(<Radio.Group ariaLabel="Payment method" items={items} />)

    expect(
      screen.getByRole('radiogroup', { name: 'Payment method' }),
    ).toBeInTheDocument()
  })

  it('leaves the radiogroup unnamed without ariaLabel', () => {
    render(<Radio.Group items={items} />)

    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-label')
  })

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

describe('Radio.Group card', () => {
  const intervals = [
    {
      label: 'Monthly',
      rightSection: <span>R$ 49,90/mo</span>,
      value: 'monthly',
    },
    {
      badge: <span>Economize 15%</span>,
      description: (
        <>
          <span>R$ 42,40/mo</span>
          <span>Billed R$ 508,80 once a year</span>
        </>
      ),
      label: <strong>Yearly</strong>,
      rightSection: <span>R$ 508,80/yr</span>,
      value: 'yearly',
    },
    { disabled: true, label: 'Lifetime', value: 'lifetime' },
  ]

  it('makes the whole card the radio, named by its label alone', () => {
    render(<Radio.Group card items={intervals} />)

    const cards = screen.getAllByTestId('radio-card')
    expect(cards).toHaveLength(3)
    expect(screen.getAllByRole('radio')).toEqual(cards)
    expect(screen.getByRole('radio', { name: 'Yearly' })).toBe(cards[1])
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBe(cards[0])
    // A div, not Base UI's default span: the card holds block content.
    for (const card of cards) {
      expect(card.tagName).toBe('DIV')
    }
  })

  it('reads the badge, description and right section as the description', () => {
    render(<Radio.Group card items={intervals} />)

    expect(
      screen.getByRole('radio', { name: 'Yearly' }),
    ).toHaveAccessibleDescription(
      'Economize 15% R$ 42,40/moBilled R$ 508,80 once a year R$ 508,80/yr',
    )
    expect(
      screen.getByRole('radio', { name: 'Monthly' }),
    ).toHaveAccessibleDescription('R$ 49,90/mo')
    expect(screen.getByRole('radio', { name: 'Lifetime' })).not.toHaveAttribute(
      'aria-describedby',
    )
  })

  it('renders the rich content it was given', () => {
    render(<Radio.Group card items={intervals} />)

    expect(screen.getByText('Economize 15%')).toBeInTheDocument()
    expect(screen.getByText('R$ 508,80/yr')).toBeInTheDocument()
    expect(screen.getByText('Yearly').tagName).toBe('STRONG')
  })

  it('picks the card from a click anywhere on it', async () => {
    const onChange = vi.fn()
    render(<Radio.Group card items={intervals} onChange={onChange} />)

    await userEvent.click(screen.getByText('R$ 508,80/yr'))

    expect(onChange).toHaveBeenCalledWith('yearly')
    expect(screen.getByRole('radio', { name: 'Yearly' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('keeps one tab stop and moves the selection with the arrow keys', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Radio.Group
          card
          defaultValue="monthly"
          items={intervals.slice(0, 2)}
          onChange={onChange}
        />
        <button type="button">after</button>
      </>,
    )
    const monthly = screen.getByRole('radio', { name: 'Monthly' })
    const yearly = screen.getByRole('radio', { name: 'Yearly' })

    await userEvent.tab()
    expect(monthly).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    expect(yearly).toHaveFocus()
    expect(yearly).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith('yearly')

    await userEvent.keyboard('{ArrowUp}')
    expect(monthly).toHaveFocus()
    expect(onChange).toHaveBeenLastCalledWith('monthly')

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
  })

  it('moves along a horizontal row with the side arrows', async () => {
    const onChange = vi.fn()
    render(
      <Radio.Group
        card
        defaultValue="monthly"
        items={intervals.slice(0, 2)}
        onChange={onChange}
        variant="horizontal"
      />,
    )

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(screen.getByRole('radio', { name: 'Yearly' })).toHaveFocus()
    expect(onChange).toHaveBeenLastCalledWith('yearly')
  })

  it('skips and blocks the disabled card', async () => {
    const onChange = vi.fn()
    render(
      <Radio.Group
        card
        defaultValue="yearly"
        items={intervals}
        onChange={onChange}
      />,
    )
    const lifetime = screen.getByRole('radio', { name: 'Lifetime' })
    expect(lifetime).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(lifetime)
    expect(onChange).not.toHaveBeenCalled()
    expect(lifetime).toHaveAttribute('aria-checked', 'false')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(lifetime).not.toHaveFocus()
    expect(onChange).not.toHaveBeenCalledWith('lifetime')
  })

  it('draws its focus ring and checked state on the card', async () => {
    render(<Radio.Group card defaultValue="yearly" items={intervals} />)

    const yearly = screen.getByRole('radio', { name: 'Yearly' })
    expect(yearly).toHaveClass(
      'focus-visible:ring-3',
      'data-checked:border-primary',
    )
    expect(yearly).toHaveAttribute('data-checked')
    expect(screen.getByRole('radio', { name: 'Monthly' })).not.toHaveAttribute(
      'data-checked',
    )
  })

  it('keeps the selection it was given and still asks for the change', async () => {
    const onChange = vi.fn()
    render(
      <Radio.Group
        card
        items={intervals}
        onChange={onChange}
        value="monthly"
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: 'Yearly' }))

    expect(onChange).toHaveBeenCalledWith('yearly')
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('shares a horizontal row evenly and fills a vertical column', () => {
    const { unmount } = render(
      <Radio.Group card items={intervals} variant="horizontal" />,
    )
    for (const card of screen.getAllByTestId('radio-card')) {
      expect(card).toHaveClass('flex-1', 'basis-0', 'min-w-40')
    }
    unmount()

    render(<Radio.Group card items={intervals} />)
    for (const card of screen.getAllByTestId('radio-card')) {
      expect(card).toHaveClass('w-full')
      expect(card).not.toHaveClass('flex-1')
    }
  })

  it('leaves badge and right section out of the plain group', () => {
    render(<Radio.Group items={intervals} />)

    expect(screen.queryByText('Economize 15%')).not.toBeInTheDocument()
    expect(screen.queryByText('R$ 508,80/yr')).not.toBeInTheDocument()
    expect(screen.queryByTestId('radio-card')).not.toBeInTheDocument()
  })
})

describe('Radio.Group axes', () => {
  it('publishes its default variant for a theme to select', () => {
    render(<Radio.Group items={items} />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'data-variant',
      'vertical',
    )
  })

  it('publishes the variant it was given', () => {
    render(<Radio.Group items={items} variant="horizontal" />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'data-variant',
      'horizontal',
    )
  })
})

describe('Radio disabledReason', () => {
  const reason = 'Pix is offline'
  const options = [
    { label: 'Card', value: 'card' },
    { disabledReason: reason, label: 'Pix', value: 'pix' },
    { label: 'Boleto', value: 'boleto' },
  ]

  it('renders no wrapper and no description without a reason', () => {
    render(<Radio.Group items={items} />)

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toHaveAttribute('aria-describedby')
    }
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('a standalone radio is blocked, reachable and never checks', async () => {
    const onChange = vi.fn()

    render(
      <>
        <button type="button">before</button>
        <Radio disabledReason={reason} label="Pix" onChange={onChange} />
      </>,
    )
    const radio = screen.getByRole('radio', { name: 'Pix' })

    expect(radio).toHaveAttribute('aria-disabled', 'true')
    expect(radio).not.toHaveAttribute('data-disabled')
    expect(radio).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    await userEvent.tab()
    expect(radio).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.keyboard(' ')
    await userEvent.click(radio, { pointerEventsCheck: 0 })
    await userEvent.click(screen.getByText('Pix'), { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(radio).not.toBeChecked()
  })

  it('in a group, the arrows land on it but never select it', async () => {
    const onChange = vi.fn()

    render(
      <Radio.Group defaultValue="card" items={options} onChange={onChange} />,
    )
    const pix = screen.getByRole('radio', { name: 'Pix' })

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    expect(pix).toHaveFocus()
    expect(pix).toHaveAttribute('aria-disabled', 'true')
    expect(pix).toHaveAccessibleDescription(reason)
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.keyboard(' ')
    await userEvent.click(pix, { pointerEventsCheck: 0 })
    await userEvent.click(screen.getByText('Pix'), { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(pix).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Card' })).toBeChecked()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Boleto' })).toHaveFocus()
    expect(onChange).toHaveBeenCalledWith('boleto')
  })

  it('a blocked card is reached by the arrows, described first by the reason', async () => {
    const onChange = vi.fn()

    render(
      <Radio.Group
        card
        defaultValue="card"
        items={[
          { label: 'Card', value: 'card' },
          {
            description: 'Instant',
            disabledReason: reason,
            label: 'Pix',
            value: 'pix',
          },
        ]}
        onChange={onChange}
      />,
    )
    const pix = screen.getByRole('radio', { name: 'Pix' })

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    expect(pix).toHaveFocus()
    expect(pix).toHaveAccessibleDescription(`${reason} Instant`)

    await userEvent.keyboard(' ')
    await userEvent.click(pix, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(pix).not.toBeChecked()
  })
})

describe('Radio.Group card disabledReason, edge cases', () => {
  const reason = 'Your plan has no yearly billing'
  const cards = (blocked: boolean) => [
    { label: 'Monthly', value: 'monthly' },
    {
      description: 'Billed once a year',
      disabledReason: blocked ? reason : undefined,
      label: 'Yearly',
      value: 'yearly',
    },
  ]

  it('points at its own details with no stray space when nothing blocks it', () => {
    render(<Radio.Group card items={cards(false)} />)

    expect(
      screen
        .getByRole('radio', { name: 'Yearly' })
        .getAttribute('aria-describedby'),
    ).toMatch(/^\S+$/)
  })

  it('keeps focus when a reason arrives on the focused card', async () => {
    const { rerender } = render(<Radio.Group card items={cards(false)} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    const yearly = () => screen.getByRole('radio', { name: 'Yearly' })
    expect(yearly()).toHaveFocus()

    rerender(<Radio.Group card items={cards(true)} />)

    expect(yearly()).toHaveFocus()
    expect(yearly()).toHaveAccessibleDescription(`${reason} Billed once a year`)

    rerender(<Radio.Group card items={cards(false)} />)

    expect(yearly()).toHaveFocus()
  })
})
