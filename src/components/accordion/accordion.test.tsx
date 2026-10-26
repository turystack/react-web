import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Accordion } from './accordion'

function items() {
  return (
    <>
      <Accordion.Item value="a">
        <Accordion.Trigger>Item A</Accordion.Trigger>
        <Accordion.Content>Body A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Trigger>Item B</Accordion.Trigger>
        <Accordion.Content>Body B</Accordion.Content>
      </Accordion.Item>
    </>
  )
}

describe('Accordion single', () => {
  it('keeps every panel closed until a trigger is used', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('delivers the value of the item the user opened', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).toHaveBeenCalledWith('a')
    expect(screen.getByText('Body A')).toBeInTheDocument()
  })

  it('closes the previous item when another one opens', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))
    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenLastCalledWith('b')
    expect(screen.getByText('Body B')).toBeInTheDocument()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('delivers null when the open item is closed again', async () => {
    const onChange = vi.fn()
    render(
      <Accordion defaultValue="a" onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('holds the last open item when it is not collapsible', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        collapsible={false}
        defaultValue="a"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('still moves between items when it is not collapsible', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        collapsible={false}
        defaultValue="a"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByText('Body B')).toBeInTheDocument()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('opens the item named by defaultValue and then follows the user', async () => {
    render(
      <Accordion defaultValue="a" type="single">
        {items()}
      </Accordion>,
    )

    expect(screen.getByText('Body A')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(screen.getByText('Body B')).toBeInTheDocument()
  })

  it('starts closed when defaultValue is empty', () => {
    render(
      <Accordion defaultValue="" type="single">
        {items()}
      </Accordion>,
    )

    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('keeps the controlled item open until the owner changes it', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single" value="a">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })

  it('shows nothing when the controlled value is empty', () => {
    render(
      <Accordion type="single" value="">
        {items()}
      </Accordion>,
    )

    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })

  it('opens without an onChange listener', async () => {
    render(<Accordion type="single">{items()}</Accordion>)

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
  })
})

describe('Accordion multiple', () => {
  it('delivers the full list of open items', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="multiple">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))
    expect(onChange).toHaveBeenCalledWith(['a'])

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
  })

  it('leaves the other panels open', async () => {
    render(
      <Accordion defaultValue={['a']} type="multiple">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.getByText('Body B')).toBeInTheDocument()
  })

  it('keeps the controlled list until the owner changes it', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="multiple" value={['a']}>
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })
})

describe('Accordion.Item', () => {
  it('blocks a disabled item from opening', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        <Accordion.Item disabled value="a">
          <Accordion.Trigger>Item A</Accordion.Trigger>
          <Accordion.Content>Body A</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Item A' })
    expect(trigger).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(trigger)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })
})

describe.each([true, false])('Accordion bordered %s', (bordered) => {
  it('still opens the panel of the item that was clicked', async () => {
    render(
      <Accordion bordered={bordered} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByRole('region')).toHaveTextContent('Body A')
  })
})

describe('Accordion size', () => {
  it('keeps the trigger at the md step when no size is given', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    expect(screen.getByRole('button', { name: 'Item A' })).toHaveClass(
      'py-2.5',
      'text-sm',
    )
  })

  it.each([
    ['sm', 'py-2', 'text-xs'],
    ['md', 'py-2.5', 'text-sm'],
    ['lg', 'py-4', 'text-base'],
  ] as const)(
    'scales the trigger and the panel at %s',
    async (size, py, text) => {
      render(
        <Accordion size={size} type="multiple">
          {items()}
        </Accordion>,
      )

      const trigger = screen.getByRole('button', { name: 'Item A' })
      expect(trigger).toHaveClass(py, text)

      await userEvent.click(trigger)

      expect(screen.getByRole('region')).toHaveClass(text)
      expect(screen.getByRole('region')).toHaveTextContent('Body A')
    },
  )
})

describe('Accordion indicator', () => {
  it('shows chevrons and no radio by default', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    expect(
      screen.queryByTestId('accordion-trigger-radio'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('accordion-root')).toHaveAttribute(
      'data-indicator',
      'chevron',
    )
  })

  it('draws a decorative radio before each label in radio mode', () => {
    render(
      <Accordion indicator="radio" type="single">
        {items()}
      </Accordion>,
    )

    const radios = screen.getAllByTestId('accordion-trigger-radio')
    expect(radios).toHaveLength(2)
    for (const radio of radios) {
      expect(radio).toHaveAttribute('aria-hidden', 'true')
    }
    const trigger = screen.getByRole('button', { name: 'Item A' })
    expect(trigger.firstElementChild).toBe(radios[0])
    expect(trigger.querySelector('svg')).toBeNull()
  })

  it('keeps the trigger the only control, exposing the choice as expanded', async () => {
    render(
      <Accordion indicator="radio" type="single">
        {items()}
      </Accordion>,
    )

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(screen.getByRole('button', { name: 'Item B' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('moves the choice without letting the chosen item be un-chosen', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        defaultValue="a"
        indicator="radio"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Body A')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('lets the consumer opt back into collapsing in radio mode', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        collapsible
        defaultValue="a"
        indicator="radio"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('chooses an item from the keyboard', async () => {
    const onChange = vi.fn()
    render(
      <Accordion indicator="radio" onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Item B' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('b')

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenLastCalledWith('a')
    expect(screen.getByText('Body A')).toBeInTheDocument()
  })

  it('indents the panel to the label edge in radio mode only', async () => {
    const { unmount } = render(
      <Accordion defaultValue="a" indicator="radio" type="single">
        {items()}
      </Accordion>,
    )
    expect(screen.getByTestId('accordion-content-inner')).toHaveClass('pl-7')
    unmount()

    render(
      <Accordion defaultValue="a" type="single">
        {items()}
      </Accordion>,
    )
    expect(screen.getByTestId('accordion-content-inner')).not.toHaveClass(
      'pl-7',
    )
  })

  it('refuses the radio indicator in multiple mode at the type level', () => {
    render(
      // @ts-expect-error several open items are not a radio choice
      <Accordion indicator="radio" type="multiple">
        {items()}
      </Accordion>,
    )

    expect(screen.getByTestId('accordion-root')).toBeInTheDocument()
  })
})

describe('Accordion.Trigger description and rightSection', () => {
  function method(indicator: 'chevron' | 'radio') {
    return (
      <Accordion defaultValue="card" indicator={indicator} type="single">
        <Accordion.Item value="card">
          <Accordion.Trigger
            description="Credit, auto-renewing"
            rightSection={<svg data-testid="method-icon" />}
          >
            Card
          </Accordion.Trigger>
          <Accordion.Content>Card fields</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="pix">
          <Accordion.Trigger>Pix</Accordion.Trigger>
          <Accordion.Content>Pix fields</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
  }

  it.each(['chevron', 'radio'] as const)(
    'renders no block element inside the trigger button (%s)',
    (indicator) => {
      render(method(indicator))

      const trigger = screen.getByRole('button', { name: 'Card' })
      expect(
        trigger.querySelector('div, p, h1, h2, h3, h4, h5, h6, ul, ol'),
      ).toBe(null)
    },
  )

  it('shows the description as a second line and describes the trigger with it', () => {
    render(method('chevron'))

    const trigger = screen.getByRole('button', { name: 'Card' })
    expect(
      screen.getByTestId('accordion-trigger-description'),
    ).toHaveTextContent('Credit, auto-renewing')
    expect(trigger).toHaveAccessibleDescription(/^Credit, auto-renewing\s*$/)
  })

  it('puts the right section after the title and before the chevron', () => {
    render(method('chevron'))

    const trigger = screen.getByRole('button', { name: 'Card' })
    const children = Array.from(trigger.children)
    const body = screen.getByTestId('accordion-trigger-body')
    const right = screen.getByTestId('accordion-trigger-right-section')
    expect(right).toContainElement(screen.getByTestId('method-icon'))
    expect(children.indexOf(body)).toBeLessThan(children.indexOf(right))
    expect(children.indexOf(right)).toBeLessThan(
      children.findIndex((el) => el.tagName.toLowerCase() === 'svg'),
    )
  })

  it('keeps the radio before the title and the right section last', () => {
    render(method('radio'))

    const trigger = screen.getByRole('button', { name: 'Card' })
    const children = Array.from(trigger.children)
    expect(children[0]).toBe(
      screen.getAllByTestId('accordion-trigger-radio')[0],
    )
    expect(children.at(-1)).toBe(
      screen.getByTestId('accordion-trigger-right-section'),
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders a description without a right section', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger description="Second line">Title</Accordion.Trigger>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    expect(screen.getByRole('button', { name: 'Title' })).toBeInTheDocument()
    expect(
      screen.queryByTestId('accordion-trigger-right-section'),
    ).not.toBeInTheDocument()
  })

  it('renders a right section without a description', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger rightSection="R$ 49,90">Title</Accordion.Trigger>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Title' })
    expect(trigger).toHaveAccessibleDescription('R$ 49,90')
    expect(
      screen.queryByTestId('accordion-trigger-description'),
    ).not.toBeInTheDocument()
  })

  it('keeps a plain trigger as it was: named by its content, no wrapper', () => {
    render(method('chevron'))

    const trigger = screen.getByRole('button', { name: 'Pix' })
    expect(trigger).not.toHaveAttribute('aria-labelledby')
    expect(trigger).not.toHaveAttribute('aria-describedby')
    expect(trigger.querySelector('.accordion-trigger-body')).toBe(null)
  })

  it('opens the panel from a rich trigger', async () => {
    render(method('chevron'))

    await userEvent.click(screen.getByRole('button', { name: 'Pix' }))
    await userEvent.click(screen.getByRole('button', { name: 'Card' }))

    expect(screen.getByRole('button', { name: 'Card' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('centres the chevron on a two-line trigger', () => {
    render(method('chevron'))

    const trigger = screen.getByRole('button', { name: 'Card' })
    for (const icon of Array.from(
      trigger.querySelectorAll('.accordion-trigger-icon'),
    )) {
      expect(icon).toHaveClass('self-center')
    }
    expect(trigger.querySelectorAll('.accordion-trigger-icon')).toHaveLength(2)
  })

  it('keeps the chevron on the first line of a plain or right-section-only trigger', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger rightSection="R$ 49,90">Title</Accordion.Trigger>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>A long question that may wrap</Accordion.Trigger>
        </Accordion.Item>
      </Accordion>,
    )

    for (const name of ['Title', 'A long question that may wrap']) {
      const trigger = screen.getByRole('button', { name })
      expect(trigger).toHaveClass('items-start')
      for (const icon of Array.from(
        trigger.querySelectorAll('.accordion-trigger-icon'),
      )) {
        expect(icon).not.toHaveClass('self-center')
      }
    }
  })

  it('centres the radio on a two-line trigger', () => {
    render(method('radio'))

    const trigger = screen.getByRole('button', { name: 'Card' })
    expect(trigger).toHaveClass('items-center')
    expect(trigger).not.toHaveClass('items-start')
  })
})

describe('Accordion headingLevel', () => {
  it('puts every trigger in an h3 by default', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.map((heading) => heading.tagName)).toEqual(['H3', 'H3'])
    expect(headings[0]).toContainElement(
      screen.getByRole('button', { name: 'Item A' }),
    )
    expect(headings[0]).toHaveClass('accordion-header')
  })

  it.each([2, 3, 4, 5, 6] as const)(
    'sets every trigger to h%i from the root',
    (level) => {
      render(
        <Accordion headingLevel={level} type="multiple">
          {items()}
        </Accordion>,
      )

      const headings = screen.getAllByRole('heading', { level })
      expect(headings).toHaveLength(2)
      expect(headings[1]).toContainElement(
        screen.getByRole('button', { name: 'Item B' }),
      )
    },
  )

  it('lets one trigger override the root', () => {
    render(
      <Accordion headingLevel={2} type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger>Item A</Accordion.Trigger>
          <Accordion.Content>Body A</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger headingLevel={4}>Item B</Accordion.Trigger>
          <Accordion.Content>Body B</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Item A',
    )
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
      'Item B',
    )
  })

  it('takes a trigger level without one on the root', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger headingLevel={5}>Item A</Accordion.Trigger>
          <Accordion.Content>Body A</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent(
      'Item A',
    )
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('keeps the trigger working inside another heading level', async () => {
    const user = userEvent.setup()
    render(
      <Accordion headingLevel={2} type="single">
        {items()}
      </Accordion>,
    )

    await user.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Body A')).toBeInTheDocument()
  })
})

describe('Accordion axes', () => {
  it('publishes its default size and indicator for a theme to select', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    const root = screen.getByTestId('accordion-root')
    expect(root).toHaveAttribute('data-size', 'md')
    expect(root).toHaveAttribute('data-indicator', 'chevron')
  })

  it('publishes the size and indicator it was given', () => {
    render(
      <Accordion indicator="radio" size="lg" type="single">
        {items()}
      </Accordion>,
    )

    const root = screen.getByTestId('accordion-root')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-indicator', 'radio')
  })
})

describe('Accordion.Item disabledReason', () => {
  const reason = 'Add a card first'

  it('renders no wrapper and no description without a reason', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    expect(screen.getByRole('button', { name: 'Item A' })).not.toHaveAttribute(
      'aria-describedby',
    )
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('keeps the trigger focusable and never expands it', async () => {
    const onChange = vi.fn()

    render(
      <Accordion onChange={onChange} type="multiple">
        <Accordion.Item value="card">
          <Accordion.Trigger>Card</Accordion.Trigger>
          <Accordion.Content>Card body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item disabledReason={reason} value="pix">
          <Accordion.Trigger description="Instant">Pix</Accordion.Trigger>
          <Accordion.Content>Pix body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    const pix = screen.getByRole('button', { name: 'Pix' })

    expect(pix).toHaveAttribute('aria-disabled', 'true')
    expect(pix).not.toHaveAttribute('disabled')
    expect(pix).toHaveAccessibleDescription(`${reason} Instant`)

    await userEvent.tab()
    await userEvent.tab()
    expect(pix).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(pix, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(pix).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Pix body')).not.toBeInTheDocument()
  })
})

describe('Accordion.Item disabledReason, edge cases', () => {
  it('points at its own details with no stray space when nothing blocks it', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="pix">
          <Accordion.Trigger description="Instant">Pix</Accordion.Trigger>
          <Accordion.Content>Pix body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const ids = screen
      .getByRole('button', { name: 'Pix' })
      .getAttribute('aria-describedby')
    expect(ids).toMatch(/^\S+$/)
  })

  it('keeps focus when a reason arrives on the focused trigger', async () => {
    const reason = 'Add a card first'
    const tree = (blocked: boolean) => (
      <Accordion type="single">
        <Accordion.Item
          disabledReason={blocked ? reason : undefined}
          value="pix"
        >
          <Accordion.Trigger>Pix</Accordion.Trigger>
          <Accordion.Content>Pix body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
    const { rerender } = render(tree(false))
    await userEvent.tab()
    const pix = () => screen.getByRole('button', { name: 'Pix' })
    expect(pix()).toHaveFocus()

    rerender(tree(true))

    expect(pix()).toHaveFocus()
    expect(pix()).toHaveAccessibleDescription(reason)
  })
})
