import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'

import { Alert } from './alert'

describe('Alert', () => {
  it('announces itself with its title and its message', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
        <Alert.Description>Your changes are stored.</Alert.Description>
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Saved')
    expect(alert).toHaveTextContent('Your changes are stored.')
  })

  it('carries the icon and the action slot beside the message', () => {
    render(
      <Alert>
        <Alert.Icon>
          <span>!</span>
        </Alert.Icon>
        <Alert.Title>Failed</Alert.Title>
        <Alert.Action>
          <button type="button">Retry</button>
        </Alert.Action>
      </Alert>,
    )

    expect(screen.getByText('!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('offers no close button unless it is closable', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })

  it('names its close button and marks itself closing when it is pressed', async () => {
    const onClose = vi.fn()
    render(
      <Alert closable onClose={onClose}>
        <Alert.Title>Saved</Alert.Title>
        <Alert.Action>
          <button type="button">Retry</button>
        </Alert.Action>
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).not.toHaveAttribute('data-closing')

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByRole('alert')).toHaveAttribute('data-closing', 'true')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('leaves the screen and reports the close once the closing ends', async () => {
    const onClose = vi.fn()
    render(
      <Alert closable onClose={onClose}>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).not.toHaveBeenCalled()

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes without an onClose attached', async () => {
    render(
      <Alert closable>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByRole('alert')).toHaveAttribute('data-closing', 'true')
  })
})

describe.each([
  'default',
  'info',
  'success',
  'warning',
  'destructive',
] as const)('Alert variant %s', (variant) => {
  it('still announces every section it was given', () => {
    render(
      <Alert variant={variant}>
        <Alert.Icon>
          <span>!</span>
        </Alert.Icon>
        <Alert.Title>Failed</Alert.Title>
        <Alert.Description>Try again later.</Alert.Description>
        <Alert.Action>
          <span>later</span>
        </Alert.Action>
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Failed')
    expect(alert).toHaveTextContent('Try again later.')
    expect(alert).toHaveTextContent('later')
  })
})

describe('Alert layout', () => {
  it('gives the action its own column instead of floating it over the text', () => {
    render(
      <Alert>
        <Alert.Title>Sync paused</Alert.Title>
        <Alert.Description>
          Nothing has been lost — pick it up whenever you like.
        </Alert.Description>
        <Alert.Action>
          <Button size="sm">Resume the synchronisation now</Button>
        </Alert.Action>
      </Alert>,
    )

    const action = screen.getByTestId('alert-action')

    // Absolute + a fixed pr-18 reservation is what let a wide control spill
    // left over the description. A column cannot overlap its neighbour.
    expect(action).not.toHaveClass('absolute')
    expect(action).toHaveClass('col-start-3')
    expect(screen.getByTestId('alert-root')).not.toHaveClass('pr-18')
    expect(screen.getByTestId('alert-description')).toHaveClass('col-start-2')
  })

  it('keeps the close button clear of the action', () => {
    render(
      <Alert closable>
        <Alert.Title>Sync paused</Alert.Title>
        <Alert.Action>
          <Button size="sm">Resume</Button>
        </Alert.Action>
      </Alert>,
    )

    // Both used to be pinned to top-2 right-2, so they stacked on each other.
    expect(screen.getByTestId('alert-action')).toHaveClass('col-start-3')
    expect(screen.getByTestId('alert-close')).toHaveClass('col-start-4')
  })
})

describe('Alert tones', () => {
  it.each([
    ['default', 'bg-card', 'text-current'],
    ['info', 'bg-primary/5', 'text-primary'],
    ['success', 'bg-success/10', 'text-success'],
    ['warning', 'bg-warning/10', 'text-warning'],
    ['destructive', 'text-destructive', 'text-current'],
  ] as const)(
    'paints %s with its own surface and icon colour',
    (variant, surface, icon) => {
      render(
        <Alert variant={variant}>
          <Alert.Icon>
            <span>!</span>
          </Alert.Icon>
          <Alert.Title>Heads up</Alert.Title>
        </Alert>,
      )

      const root = screen.getByTestId('alert-root')
      expect(root).toHaveAttribute('data-variant', variant)
      expect(root).toHaveClass(surface)
      expect(screen.getByTestId('alert-icon')).toHaveClass(icon)
    },
  )

  it.each([
    ['success', 'border-success/30'],
    ['warning', 'border-warning/30'],
    ['info', 'border-primary/30'],
  ] as const)('edges %s with its own token (%s)', (variant, border) => {
    render(
      <Alert variant={variant}>
        <Alert.Title>Heads up</Alert.Title>
      </Alert>,
    )

    expect(screen.getByTestId('alert-root')).toHaveClass(border)
  })

  it.each(['info', 'success', 'warning'] as const)(
    'keeps the %s description on the card ink, not the muted grey',
    (variant) => {
      render(
        <Alert variant={variant}>
          <Alert.Description>Details</Alert.Description>
        </Alert>,
      )

      const description = screen.getByTestId('alert-description')
      expect(description).toHaveClass('text-card-foreground/80')
      expect(description).not.toHaveClass('text-muted-foreground')
    },
  )

  it('paints no tone from a raw Tailwind palette', () => {
    for (const variant of [
      'default',
      'info',
      'success',
      'warning',
      'destructive',
    ] as const) {
      const { unmount } = render(
        <Alert variant={variant}>
          <Alert.Icon>
            <span>!</span>
          </Alert.Icon>
          <Alert.Description>x</Alert.Description>
        </Alert>,
      )
      const painted = [
        screen.getByTestId('alert-root').className,
        screen.getByTestId('alert-icon').className,
        screen.getByTestId('alert-description').className,
      ].join(' ')
      expect(painted).not.toMatch(/\b(emerald|amber|green|blue|red)-\d/)
      unmount()
    }
  })

  it('tells the tones apart — no two share a surface', () => {
    const surfaces = (
      ['default', 'info', 'success', 'warning', 'destructive'] as const
    ).map((variant) => {
      const { unmount } = render(
        <Alert variant={variant}>
          <Alert.Title>x</Alert.Title>
        </Alert>,
      )
      const className = screen.getByTestId('alert-root').className
      unmount()
      return className
    })

    expect(new Set(surfaces).size).toBe(surfaces.length)
  })

  it('renders the default tone when none is named', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    expect(screen.getByTestId('alert-root')).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it('hides the icon from assistive technology, leaving the text to speak', () => {
    render(
      <Alert variant="warning">
        <Alert.Icon>
          <span>!</span>
        </Alert.Icon>
        <Alert.Title>Maintenance tonight</Alert.Title>
      </Alert>,
    )

    expect(screen.getByTestId('alert-icon')).toHaveAttribute('aria-hidden')
    expect(screen.getByRole('alert')).toHaveTextContent('Maintenance tonight')
  })
})

describe('Alert banner layout', () => {
  function Banner(props: { closable?: boolean; onClose?: () => void }) {
    return (
      <Alert layout="banner" variant="warning" {...props}>
        <Alert.Icon>
          <span>!</span>
        </Alert.Icon>
        <Alert.Title>Sandbox</Alert.Title>
        <Alert.Description>You are looking at test data.</Alert.Description>
        <Alert.Action>
          <button type="button">Switch to live</button>
        </Alert.Action>
      </Alert>
    )
  }

  it('is a card by default', () => {
    render(
      <Alert>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )

    const root = screen.getByTestId('alert-root')
    expect(root).toHaveAttribute('data-layout', 'card')
    expect(root).toHaveClass('grid', 'rounded-lg', 'border')
  })

  it('spans the shell edge to edge with square corners and no side border', () => {
    render(<Banner />)

    const root = screen.getByTestId('alert-root')
    expect(root).toHaveAttribute('data-layout', 'banner')
    expect(root).toHaveClass('w-full', 'rounded-none', 'border-0', 'border-b')
    expect(root).not.toHaveClass('rounded-lg')
    expect(root).not.toHaveClass('border')
  })

  it('keeps icon, title, description and action on one line', () => {
    render(<Banner />)

    const root = screen.getByTestId('alert-root')
    // A flex row, not the card's two-row grid, and the description gives way
    // by truncating instead of wrapping the strip taller.
    expect(root).toHaveClass('flex', 'items-center')
    expect(root).not.toHaveClass('grid')
    expect(screen.getByTestId('alert-description')).toHaveClass('truncate')
    expect(screen.getByTestId('alert-title')).toHaveClass('whitespace-nowrap')
    // The action rides to the far edge.
    expect(screen.getByTestId('alert-action')).toHaveClass('ml-auto')
  })

  it('announces itself politely, with every part it was given', () => {
    render(<Banner />)

    // On every screen for as long as it lasts: a status, not an alert.
    const status = screen.getByRole('status')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(status).toHaveTextContent('Sandbox')
    expect(status).toHaveTextContent('You are looking at test data.')
    expect(
      screen.getByRole('button', { name: 'Switch to live' }),
    ).toBeInTheDocument()
  })

  it('offers no close button unless it is closable', () => {
    render(<Banner />)

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })

  it('closes like the card when it is closable', async () => {
    const onClose = vi.fn()
    render(<Banner closable onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('status'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each(['default', 'info', 'success', 'warning', 'destructive'] as const)(
    'keeps the %s tone in the banner',
    (variant) => {
      render(
        <Alert layout="banner" variant={variant}>
          <Alert.Title>Notice</Alert.Title>
        </Alert>,
      )

      const root = screen.getByRole('status')
      expect(root).toHaveAttribute('data-variant', variant)
      expect(root).toHaveClass('rounded-none')
    },
  )
})
