import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/button'

import { Indicator } from './indicator'

const Bell = () => (
  <button aria-label="Notifications" type="button">
    bell
  </button>
)

describe('Indicator', () => {
  it('pins the count to the element it wraps', () => {
    render(
      <Indicator count={3}>
        <Bell />
      </Indicator>,
    )

    expect(
      screen.getByRole('button', { name: 'Notifications' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('indicator-badge')).toHaveTextContent('3')
  })

  it('caps the number at 99 by default', () => {
    const { rerender } = render(
      <Indicator count={99}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent(/^99$/)

    rerender(
      <Indicator count={100}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent(/^99\+$/)
  })

  it('caps the number at the max it is given', () => {
    const { rerender } = render(
      <Indicator count={9} max={9}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent(/^9$/)

    rerender(
      <Indicator count={10} max={9}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent(/^9\+$/)
  })

  it('hides a count of zero', () => {
    render(
      <Indicator count={0}>
        <Bell />
      </Indicator>,
    )

    expect(screen.queryByTestId('indicator-badge')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Notifications' }),
    ).toBeInTheDocument()
  })

  it('keeps a count of zero when showZero is set', () => {
    render(
      <Indicator count={0} showZero>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveTextContent(/^0$/)
  })

  it('hides a negative count even with showZero', () => {
    render(
      <Indicator count={-2} showZero>
        <Bell />
      </Indicator>,
    )

    expect(screen.queryByTestId('indicator-badge')).not.toBeInTheDocument()
  })

  it('pins nothing without a count or a dot', () => {
    render(
      <Indicator>
        <Bell />
      </Indicator>,
    )

    expect(screen.queryByTestId('indicator-badge')).not.toBeInTheDocument()
  })

  it('shows a dot with no number', () => {
    render(
      <Indicator dot>
        <Bell />
      </Indicator>,
    )

    const badge = screen.getByTestId('indicator-badge')
    expect(badge).toBeEmptyDOMElement()
    expect(badge).toHaveClass('size-2.5')
    expect(badge).not.toHaveClass('min-w-4')
  })

  it('lets a count decide whether the dot shows', () => {
    const { rerender } = render(
      <Indicator count={4} dot>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toBeEmptyDOMElement()

    rerender(
      <Indicator count={0} dot>
        <Bell />
      </Indicator>,
    )

    expect(screen.queryByTestId('indicator-badge')).not.toBeInTheDocument()
  })

  it('pins to the top-right corner by default', () => {
    render(
      <Indicator count={1}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).toHaveClass(
      'top-0',
      'right-0',
    )
  })

  it.each([
    ['top-right', ['top-0', 'right-0']],
    ['top-left', ['top-0', 'left-0']],
    ['bottom-right', ['bottom-0', 'right-0']],
    ['bottom-left', ['bottom-0', 'left-0']],
  ] as const)('pins to the %s corner', (position, classes) => {
    render(
      <Indicator count={1} position={position}>
        <Bell />
      </Indicator>,
    )

    const badge = screen.getByTestId('indicator-badge')
    expect(badge).toHaveAttribute('data-position', position)
    expect(badge).toHaveClass(...classes)
  })

  it.each([
    ['default', 'bg-primary', 'text-primary-foreground'],
    ['destructive', 'bg-destructive', 'text-destructive-foreground'],
  ] as const)(
    'paints the %s variant with its paired ink',
    (variant, fill, ink) => {
      render(
        <Indicator count={1} variant={variant}>
          <Bell />
        </Indicator>,
      )

      const badge = screen.getByTestId('indicator-badge')
      expect(badge).toHaveClass(fill, ink)
      // A fixed white ink fails contrast on the dark scheme's light destructive.
      expect(badge).not.toHaveClass('text-white')
    },
  )

  it('tells a screen reader the label, not the bare number', () => {
    render(
      <Indicator count={3} label="3 unread notifications">
        <Bell />
      </Indicator>,
    )

    expect(screen.getByText('3 unread notifications')).toHaveClass('sr-only')
    expect(screen.getByTestId('indicator-badge')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('leaves the number readable when no label is given', () => {
    render(
      <Indicator count={3}>
        <Bell />
      </Indicator>,
    )

    expect(screen.getByTestId('indicator-badge')).not.toHaveAttribute(
      'aria-hidden',
    )
  })

  it('describes the control it is pinned to with the label', () => {
    render(
      <Indicator count={3} label="3 unread notifications">
        <Button ariaLabel="Notifications">bell</Button>
      </Indicator>,
    )

    const bell = screen.getByRole('button', { name: 'Notifications' })
    expect(bell).toHaveAccessibleDescription('3 unread notifications')
    expect(screen.getByTestId('indicator-badge')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('keeps the description the control already had', () => {
    render(
      <>
        <span id="bell-hint">Opens the inbox</span>
        <Indicator count={3} label="3 unread notifications">
          <button aria-describedby="bell-hint" type="button">
            bell
          </button>
        </Indicator>
      </>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      'Opens the inbox 3 unread notifications',
    )
  })

  it('adds no description without a label', () => {
    render(
      <Indicator count={3}>
        <Button ariaLabel="Notifications">bell</Button>
      </Indicator>,
    )

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
  })

  it('adds no description while the indicator is hidden', () => {
    render(
      <Indicator count={0} label="No unread notifications">
        <Button ariaLabel="Notifications">bell</Button>
      </Indicator>,
    )

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
  })

  it('leaves a non-element child as it is', () => {
    render(
      <Indicator count={3} label="3 unread">
        plain text
      </Indicator>,
    )

    expect(screen.getByText('plain text')).toBeInTheDocument()
    expect(screen.getByTestId('indicator-label')).toHaveTextContent('3 unread')
  })

  it('drops the label along with a hidden indicator', () => {
    render(
      <Indicator count={0} label="No unread notifications">
        <Bell />
      </Indicator>,
    )

    expect(
      screen.queryByText('No unread notifications'),
    ).not.toBeInTheDocument()
  })
})

describe('Indicator axes', () => {
  it('publishes its default variant for a theme to select', () => {
    render(
      <Indicator count={3}>
        <span>Inbox</span>
      </Indicator>,
    )

    expect(screen.getByTestId('indicator')).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it('publishes the variant it was given', () => {
    render(
      <Indicator count={3} variant="destructive">
        <span>Inbox</span>
      </Indicator>,
    )

    expect(screen.getByTestId('indicator')).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })
})
