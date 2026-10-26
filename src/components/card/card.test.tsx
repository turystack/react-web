import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, onTestFinished, vi } from 'vitest'

import { Card } from './card'
import type { CardProps } from './card.types'

describe('Card', () => {
  it('renders every section it was given', () => {
    render(
      <Card>
        <Card.Header bordered>
          <Card.Title>Pro plan</Card.Title>
          <Card.Description>Billed monthly</Card.Description>
        </Card.Header>
        <Card.Content>Everything included</Card.Content>
        <Card.Separator />
        <Card.Footer bordered>Upgrade</Card.Footer>
      </Card>,
    )

    expect(screen.getByText('Pro plan')).toBeInTheDocument()
    expect(screen.getByText('Billed monthly')).toBeInTheDocument()
    expect(screen.getByText('Everything included')).toBeInTheDocument()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders an unbordered header and footer just as well', () => {
    render(
      <Card>
        <Card.Header>Pro plan</Card.Header>
        <Card.Footer>Upgrade</Card.Footer>
      </Card>,
    )

    expect(screen.getByText('Pro plan')).toBeInTheDocument()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('fires onClick from anywhere inside the card', async () => {
    const onClick = vi.fn()
    render(
      <Card onClick={onClick}>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    await userEvent.click(screen.getByText('Everything included'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stays inert when no onClick was given', async () => {
    render(
      <Card>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    await userEvent.click(screen.getByText('Everything included'))

    expect(screen.getByText('Everything included')).toBeInTheDocument()
  })

  it('keeps a button inside the card reachable on its own', async () => {
    const onClick = vi.fn()
    const onCardClick = vi.fn()
    render(
      <Card onClick={onCardClick}>
        <Card.Footer>
          <button onClick={onClick} type="button">
            Upgrade
          </button>
        </Card.Footer>
      </Card>,
    )

    // The card is a button named by its text too, so the nested one is taken
    // by its own text node.
    await userEvent.click(screen.getByText('Upgrade'))

    expect(onClick).toHaveBeenCalledTimes(1)
    // The click belongs to the nested button, as it does in href mode.
    expect(onCardClick).not.toHaveBeenCalled()
  })
})

describe('Card onClick without href', () => {
  const renderPressable = (props: Pick<CardProps, 'ariaLabel'> = {}) => {
    const onClick = vi.fn()
    render(
      <Card {...props} onClick={onClick}>
        <Card.Title>Pro plan</Card.Title>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )
    return onClick
  }

  it('is a button reached by Tab', async () => {
    renderPressable()

    const card = screen.getByRole('button')
    expect(card).toBe(screen.getByTestId('card-root'))
    expect(card).toHaveAttribute('tabindex', '0')

    await userEvent.tab()

    expect(card).toHaveFocus()
  })

  it('runs onClick on Enter', async () => {
    const onClick = renderPressable()

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('runs onClick on Space', async () => {
    const onClick = renderPressable()

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', async () => {
    const onClick = renderPressable()

    await userEvent.tab()
    await userEvent.keyboard('a{Escape}')

    expect(onClick).not.toHaveBeenCalled()
  })

  it('draws a focus-visible ring', () => {
    renderPressable()

    expect(screen.getByTestId('card-root')).toHaveClass(
      'focus-visible:ring-3',
      'focus-visible:ring-ring/50',
    )
  })

  it('takes its name from ariaLabel when one is given', () => {
    renderPressable({ ariaLabel: 'Choose the Pro plan' })

    expect(screen.getByRole('button', { name: 'Choose the Pro plan' })).toBe(
      screen.getByTestId('card-root'),
    )
  })

  it('is named by its text without ariaLabel', () => {
    renderPressable()

    expect(screen.getByRole('button')).toHaveAccessibleName(
      /Pro plan.*Everything included/,
    )
  })

  it('leaves Enter on a nested button to that button', async () => {
    const onCardClick = vi.fn()
    const onUpgrade = vi.fn()
    render(
      <Card onClick={onCardClick}>
        <Card.Footer>
          <button onClick={onUpgrade} type="button">
            Upgrade
          </button>
        </Card.Footer>
      </Card>,
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByText('Upgrade')).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    expect(onUpgrade).toHaveBeenCalledTimes(1)
    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('is neither a button nor focusable without onClick', () => {
    render(
      <Card>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    const root = screen.getByTestId('card-root')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(root).not.toHaveAttribute('tabindex')
    expect(root).not.toHaveClass('focus-visible:ring-3')
  })

  it('leaves the button role to the link when href is given too', () => {
    render(
      <Card href="/plans/pro" onClick={() => {}}>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByTestId('card-root')).not.toHaveAttribute('tabindex')
  })
})

describe('Card href development warning', () => {
  const spyOnError = () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    onTestFinished(() => spy.mockRestore())
    return spy
  }

  it('reports a link with neither a Card.Title nor an ariaLabel', () => {
    const error = spyOnError()
    render(
      <Card href="/plans/pro">
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('neither a Card.Title nor an ariaLabel'),
    )
  })

  it('stays quiet when a Card.Title names the link', () => {
    const error = spyOnError()
    render(
      <Card href="/plans/pro">
        <Card.Header>
          <Card.Title>Pro plan</Card.Title>
        </Card.Header>
      </Card>,
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('stays quiet when ariaLabel names the link', () => {
    const error = spyOnError()
    render(
      <Card ariaLabel="Open the Pro plan" href="/plans/pro">
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('stays quiet without href', () => {
    const error = spyOnError()
    render(
      <Card>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    expect(error).not.toHaveBeenCalled()
  })

  it('says nothing in production', () => {
    const error = spyOnError()
    vi.stubEnv('NODE_ENV', 'production')
    onTestFinished(() => {
      vi.unstubAllEnvs()
    })
    render(
      <Card href="/plans/pro">
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    expect(error).not.toHaveBeenCalled()
  })
})

describe.each(['sm', 'md', 'lg', 'xl'] as const)(
  'Card minHeight %s',
  (minHeight) => {
    it('keeps its content readable', () => {
      render(
        <Card minHeight={minHeight}>
          <Card.Content>Everything included</Card.Content>
        </Card>,
      )

      expect(screen.getByText('Everything included')).toBeInTheDocument()
    })
  },
)

describe.each(['start', 'center'] as const)(
  'Card verticalAlign %s',
  (verticalAlign) => {
    it('keeps its content readable', () => {
      render(
        <Card verticalAlign={verticalAlign}>
          <Card.Content>Everything included</Card.Content>
        </Card>,
      )

      expect(screen.getByText('Everything included')).toBeInTheDocument()
    })
  },
)

describe('Card size', () => {
  it('shrinks the gutter of every part from the root alone', () => {
    render(
      <Card size="sm">
        <Card.Header bordered>Workspace</Card.Header>
        <Card.Content>Acme</Card.Content>
        <Card.Footer bordered>Open</Card.Footer>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('py-3', 'shadow-none')
    expect(screen.getByTestId('card-header')).toHaveClass('px-3', 'pb-3')
    expect(screen.getByTestId('card-content')).toHaveClass('px-3')
    expect(screen.getByTestId('card-footer')).toHaveClass('px-3', 'py-3')
    for (const [part, gone] of [
      ['card-root', ['py-5', 'gap-4', 'shadow-sm']],
      ['card-header', ['px-5', 'pb-5']],
      ['card-content', ['px-5']],
      ['card-footer', ['px-5', 'py-5']],
    ] as const) {
      for (const name of gone) {
        expect(screen.getByTestId(part)).not.toHaveClass(name)
      }
    }
  })

  it('keeps the default gutter when no size is given', () => {
    render(
      <Card>
        <Card.Content>Acme</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('py-5', 'shadow-sm')
    expect(screen.getByTestId('card-content')).toHaveClass('px-5')
  })
})

describe('Card href', () => {
  const renderLinked = (props: Pick<CardProps, 'onClick'> = {}) =>
    render(
      <Card href="/plans/pro" {...props}>
        <Card.Header>
          <Card.Title>Pro plan</Card.Title>
          <Card.Description>Billed monthly</Card.Description>
        </Card.Header>
        <Card.Footer>
          <button type="button">Compare</button>
        </Card.Footer>
      </Card>,
    )

  // jsdom does not navigate; a click on the link that bubbled all the way up
  // (past React's handlers) without being prevented is the navigation a
  // browser would perform.
  const trackNavigation = (link: HTMLElement) => {
    const navigations: string[] = []
    const listener = (event: MouseEvent) => {
      if (event.target === link && !event.defaultPrevented) {
        navigations.push(link.getAttribute('href') ?? '')
      }
      event.preventDefault()
    }
    document.addEventListener('click', listener)
    onTestFinished(() => document.removeEventListener('click', listener))
    return navigations
  }

  it('is a real link named by its title alone', () => {
    renderLinked()

    const link = screen.getByRole('link', { name: 'Pro plan' })
    expect(link).toHaveAttribute('href', '/plans/pro')
    expect(link.tagName).toBe('A')
  })

  it('takes its name from ariaLabel when it has no title', () => {
    render(
      <Card ariaLabel="Open the Acme workspace" href="/w/acme">
        <Card.Content>Acme</Card.Content>
      </Card>,
    )

    expect(
      screen.getByRole('link', { name: 'Open the Acme workspace' }),
    ).toHaveAttribute('href', '/w/acme')
  })

  it('is reached by Tab and followed with Enter', async () => {
    renderLinked()
    const link = screen.getByRole('link', { name: 'Pro plan' })
    const navigations = trackNavigation(link)

    await userEvent.tab()
    expect(link).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(navigations).toEqual(['/plans/pro'])
  })

  it('is followed when clicked', async () => {
    renderLinked()
    const link = screen.getByRole('link', { name: 'Pro plan' })
    const navigations = trackNavigation(link)

    await userEvent.click(link)

    expect(navigations).toEqual(['/plans/pro'])
  })

  it('keeps a nested button usable without navigating', async () => {
    const onCompare = vi.fn()
    render(
      <Card href="/plans/pro">
        <Card.Title>Pro plan</Card.Title>
        <Card.Footer>
          <button onClick={onCompare} type="button">
            Compare
          </button>
        </Card.Footer>
      </Card>,
    )
    const link = screen.getByRole('link', { name: 'Pro plan' })
    const navigations = trackNavigation(link)
    const button = screen.getByRole('button', { name: 'Compare' })

    // The button is a sibling of the link, never inside it — a control inside
    // an <a> is invalid HTML and would navigate with it.
    expect(link).not.toContainElement(button)

    await userEvent.click(button)
    button.focus()
    await userEvent.keyboard('{Enter}')

    expect(onCompare).toHaveBeenCalledTimes(2)
    expect(navigations).toEqual([])
  })

  it('reaches the link before the controls inside it', async () => {
    renderLinked()

    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'Pro plan' })).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Compare' })).toHaveFocus()
  })

  it('lifts on hover the way a clickable card does', () => {
    const { unmount } = render(
      <Card onClick={() => {}}>
        <Card.Content>Clickable</Card.Content>
      </Card>,
    )
    expect(screen.getByTestId('card-root')).toHaveClass('hover:shadow-md')
    unmount()

    renderLinked()
    expect(screen.getByTestId('card-root')).toHaveClass(
      'hover:shadow-md',
      'cursor-pointer',
    )
  })

  it('runs onClick on activation and not on a nested control', async () => {
    const onClick = vi.fn()
    renderLinked({ onClick })
    const link = screen.getByRole('link', { name: 'Pro plan' })
    trackNavigation(link)

    await userEvent.click(screen.getByRole('button', { name: 'Compare' }))
    expect(onClick).not.toHaveBeenCalled()

    await userEvent.click(link)
    link.focus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('lets onClick route client-side by preventing the navigation', async () => {
    renderLinked({ onClick: (event) => event.preventDefault() })
    const link = screen.getByRole('link', { name: 'Pro plan' })
    const navigations = trackNavigation(link)

    await userEvent.click(link)

    expect(navigations).toEqual([])
  })

  it('renders no link without href', () => {
    render(
      <Card>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toHaveTextContent('Pro plan')
  })

  it('lets ariaLabel name the link over the title, leaving one link', () => {
    render(
      <Card ariaLabel="Open the Pro plan" href="/plans/pro">
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(
      screen.getByRole('link', { name: 'Open the Pro plan' }),
    ).toHaveAttribute('href', '/plans/pro')
    expect(screen.getByTestId('card-title')).toHaveTextContent('Pro plan')
  })

  it('is never an empty link', () => {
    renderLinked()

    expect(screen.getByRole('link')).toHaveTextContent('Pro plan')
  })

  it('keeps the compact size when it is a link', () => {
    render(
      <Card href="/w/acme" size="sm">
        <Card.Title>Acme</Card.Title>
        <Card.Content>Workspace</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('py-3', 'shadow-none')
    expect(screen.getByTestId('card-content')).toHaveClass('px-3')
    expect(screen.getByRole('link', { name: 'Acme' })).toBeInTheDocument()
  })
})

describe('Card selected', () => {
  it('shows nothing selected by default', () => {
    render(
      <Card onClick={() => {}}>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByRole('button')
    expect(root).not.toHaveAttribute('aria-pressed')
    expect(root).not.toHaveClass('ring-2', 'before:bg-primary/5')
    expect(root).toHaveClass('ring-1', 'ring-foreground/10')
  })

  it('draws the primary ring and tint', () => {
    render(
      <Card selected>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByTestId('card-root')
    expect(root).toHaveClass('ring-2', 'ring-primary', 'before:bg-primary/5')
    // The tint layers over the card's own background instead of replacing it.
    expect(root).toHaveClass('bg-card', 'isolate', 'before:-z-1')
    expect(root).not.toHaveClass('ring-1', 'ring-foreground/10')
  })

  it('is a pressed toggle button when the card has onClick', async () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <Card onClick={onClick} selected={false}>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Card onClick={onClick} selected>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument()
  })

  it('carries no ARIA state on a static card', () => {
    render(
      <Card selected>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByTestId('card-root')
    expect(root).not.toHaveAttribute('aria-pressed')
    expect(root).not.toHaveAttribute('aria-selected')
    expect(root).not.toHaveAttribute('role')
  })

  it('stays a plain link when linked', () => {
    render(
      <Card href="/plans/pro" selected>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.getByRole('link', { name: 'Pro plan' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByTestId('card-root')).not.toHaveAttribute('aria-pressed')
    expect(screen.getByTestId('card-root')).toHaveClass(
      'ring-2',
      'ring-primary',
    )
  })

  it('keeps its ring on focus and shows focus as an outline', () => {
    render(
      <Card onClick={() => {}} selected>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByRole('button')
    expect(root).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-primary',
      'focus-visible:outline-3',
      'focus-visible:outline-solid',
    )
    expect(root).not.toHaveClass(
      'focus-visible:ring-3',
      'focus-visible:ring-ring/50',
    )
  })

  it('keeps the compact size', () => {
    render(
      <Card selected size="sm">
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('py-3', 'ring-2')
  })
})

describe('Card onSelectedChange', () => {
  it('is a toggle button that asks for the opposite state', async () => {
    const onSelectedChange = vi.fn()
    const { rerender } = render(
      <Card onSelectedChange={onSelectedChange}>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    // Unselected is still reported, not left undefined.
    const card = screen.getByRole('button', { pressed: false })
    await userEvent.click(card)
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)

    rerender(
      <Card onSelectedChange={onSelectedChange} selected>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )
    await userEvent.click(screen.getByRole('button', { pressed: true }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(false)
  })

  it('toggles from the keyboard', async () => {
    const onSelectedChange = vi.fn()
    render(
      <Card onSelectedChange={onSelectedChange} selected={false}>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')

    expect(onSelectedChange).toHaveBeenCalledTimes(2)
    expect(onSelectedChange).toHaveBeenCalledWith(true)
  })

  it('runs onClick too, and neither from a nested control', async () => {
    const onClick = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <Card onClick={onClick} onSelectedChange={onSelectedChange}>
        <Card.Title>Pro plan</Card.Title>
        <Card.Footer>
          <button type="button">Compare</button>
        </Card.Footer>
      </Card>,
    )

    await userEvent.click(screen.getByText('Compare'))
    expect(onClick).not.toHaveBeenCalled()
    expect(onSelectedChange).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('Pro plan'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).toHaveBeenCalledWith(true)
  })

  it('leaves a linked card a link', async () => {
    const onSelectedChange = vi.fn()
    render(
      <Card href="/plans/pro" onSelectedChange={onSelectedChange} selected>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pro plan' })).toBeInTheDocument()
  })
})

describe('Card highlighted', () => {
  it('turns the hairline ring primary', () => {
    render(
      <Card highlighted>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByTestId('card-root')
    expect(root).toHaveClass('ring-1', 'ring-primary')
    expect(root).not.toHaveClass('ring-foreground/10', 'before:bg-primary/5')
    expect(root).not.toHaveAttribute('aria-pressed')
  })

  it('shows the selection when also selected', () => {
    render(
      <Card highlighted selected>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass(
      'ring-2',
      'ring-primary',
      'before:bg-primary/5',
    )
  })

  it('keeps its hairline primary ring on focus when pressable', () => {
    render(
      <Card highlighted onClick={() => {}}>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const root = screen.getByRole('button')
    expect(root).not.toHaveAttribute('aria-pressed')
    expect(root).toHaveClass(
      'focus-visible:ring-1',
      'focus-visible:ring-primary',
      'focus-visible:outline-3',
    )
    expect(root).not.toHaveClass('focus-visible:ring-3')
  })

  it('leaves the ordinary focus ring on a card that is neither', () => {
    render(
      <Card highlighted={false} onClick={() => {}}>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByRole('button')).toHaveClass(
      'focus-visible:ring-3',
      'focus-visible:ring-ring/50',
    )
    expect(screen.getByRole('button')).not.toHaveClass(
      'focus-visible:outline-3',
    )
  })
})

describe('Card id', () => {
  it('puts the id on the root element, as a scroll target', () => {
    render(
      <Card id="billing">
        <Card.Content>Billing</Card.Content>
      </Card>,
    )

    expect(document.getElementById('billing')).toBe(
      screen.getByTestId('card-root'),
    )
  })

  it('keeps it on the root of a pressable and a linked card', () => {
    const { unmount } = render(
      <Card id="pro" onClick={() => {}}>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('id', 'pro')
    unmount()

    render(
      <Card href="/plans/pro" id="pro-link">
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )
    expect(screen.getByTestId('card-root')).toHaveAttribute('id', 'pro-link')
    expect(screen.getByRole('link')).not.toHaveAttribute('id')
  })

  it('renders no id unless given one', () => {
    render(
      <Card>
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).not.toHaveAttribute('id')
  })
})

describe('Card height', () => {
  it('keeps its content height by default', () => {
    render(
      <Card>
        <Card.Content>Short</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).not.toHaveClass('h-full')
  })

  it('keeps its content height with height="auto"', () => {
    render(
      <Card height="auto">
        <Card.Content>Short</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).not.toHaveClass('h-full')
  })

  it('fills its cell with height="full"', () => {
    render(
      <Card height="full">
        <Card.Content>Short</Card.Content>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('card-root', 'h-full')
  })

  it('keeps filling its cell as a pressable, selected, small card', async () => {
    const onSelectedChange = vi.fn()
    render(
      <Card
        height="full"
        highlighted
        minHeight="sm"
        onSelectedChange={onSelectedChange}
        selected
        size="sm"
      >
        <Card.Content>Pro</Card.Content>
      </Card>,
    )

    const card = screen.getByRole('button')
    expect(card).toHaveClass('h-full', 'min-h-80', 'ring-2', 'py-3')
    expect(card).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(card)
    expect(onSelectedChange).toHaveBeenCalledWith(false)
  })

  it('keeps filling its cell as a linked card', () => {
    render(
      <Card height="full" href="/plans/pro">
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    expect(screen.getByTestId('card-root')).toHaveClass('h-full', 'relative')
    expect(screen.getByRole('link', { name: 'Pro plan' })).toHaveAttribute(
      'href',
      '/plans/pro',
    )
  })
})

describe('Card.Title headingLevel', () => {
  it('renders a plain block, not a heading, by default', () => {
    render(
      <Card>
        <Card.Title>Pro plan</Card.Title>
      </Card>,
    )

    const title = screen.getByTestId('card-title')
    expect(title.tagName).toBe('DIV')
    expect(title).toHaveClass('card-title')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders the title as an h%i heading',
    (level) => {
      render(
        <Card>
          <Card.Header>
            <Card.Title headingLevel={level}>Pro plan</Card.Title>
          </Card.Header>
        </Card>,
      )

      const heading = screen.getByRole('heading', { level, name: 'Pro plan' })
      expect(heading.tagName).toBe(`H${level}`)
      expect(heading).toHaveClass('card-title')
    },
  )

  it('keeps the stretched link inside the heading in href mode', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(
      <Card href="/plans/pro" onClick={onClick}>
        <Card.Header>
          <Card.Title headingLevel={3}>Pro plan</Card.Title>
        </Card.Header>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    const heading = screen.getByRole('heading', { level: 3, name: 'Pro plan' })
    const link = screen.getByRole('link', { name: 'Pro plan' })
    expect(heading).toContainElement(link)
    expect(link).toHaveAttribute('href', '/plans/pro')
    expect(link).toHaveClass('card-link')
    expect(screen.getAllByRole('link')).toHaveLength(1)

    await user.tab()
    expect(link).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stays a plain heading when ariaLabel names the link', () => {
    render(
      <Card ariaLabel="Open the Pro plan" href="/plans/pro">
        <Card.Title headingLevel={2}>Pro plan</Card.Title>
      </Card>,
    )

    const heading = screen.getByRole('heading', { level: 2, name: 'Pro plan' })
    expect(heading.querySelector('a')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Open the Pro plan' }),
    ).toHaveAttribute('href', '/plans/pro')
  })
})

describe('Card axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Card>Body</Card>)

    expect(screen.getByTestId('card-root')).toHaveAttribute(
      'data-size',
      'default',
    )
  })

  it('publishes the size it was given', () => {
    render(<Card size="sm">Body</Card>)

    expect(screen.getByTestId('card-root')).toHaveAttribute('data-size', 'sm')
  })
})
