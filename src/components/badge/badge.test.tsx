import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Badge } from './badge'
import type { BadgeAlign, BadgeSize, BadgeVariant } from './badge.types'

describe('Badge', () => {
  it('renders the label it is given', () => {
    render(<Badge>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveTextContent('New')
  })

  it('fires onClick when the badge is clicked', async () => {
    const onClick = vi.fn()
    render(<Badge onClick={onClick}>New</Badge>)

    await userEvent.click(screen.getByTestId('badge'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('announces the loading state and shows an indicator', () => {
    render(<Badge loading>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()
  })

  it('shows no indicator and no busy state when idle', () => {
    render(<Badge>New</Badge>)

    expect(screen.getByTestId('badge')).not.toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument()
  })

  it('blocks the click while loading', async () => {
    const onClick = vi.fn()
    render(
      <Badge loading onClick={onClick}>
        New
      </Badge>,
    )

    const badge = screen.getByRole('button', { name: 'New' })
    expect(badge).toBeDisabled()

    await userEvent.click(badge)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('answers the keyboard when it is clickable', async () => {
    const onClick = vi.fn()
    render(<Badge onClick={onClick}>New</Badge>)

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'New' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stays out of the tab order while it does nothing', async () => {
    render(<Badge>New</Badge>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    await userEvent.tab()

    expect(screen.getByTestId('badge')).not.toHaveFocus()
  })

  it('keeps the label readable while loading', () => {
    render(<Badge loading>New</Badge>)

    expect(screen.getByTestId('badge-content')).toHaveTextContent('New')
  })

  it('stays a readable badge when it takes the full width', () => {
    render(<Badge block>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveTextContent('New')
  })
})

describe('Badge asChild', () => {
  it('renders the child once, not wrapped in a badge of its own', () => {
    render(
      <Badge asChild>
        <a href="/orders">New</a>
      </Badge>,
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'New' })).toHaveAttribute(
      'href',
      '/orders',
    )
    expect(screen.getByTestId('badge')).toHaveAttribute('href', '/orders')
  })

  it('shows the indicator on the child while loading', () => {
    render(
      <Badge asChild loading>
        <a href="/orders">New</a>
      </Badge>,
    )

    expect(screen.getByRole('link')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()
  })

  it('fires onClick from the child it renders onto', async () => {
    const onClick = vi.fn()
    render(
      <Badge asChild onClick={onClick}>
        <a href="/orders">New</a>
      </Badge>,
    )

    await userEvent.click(screen.getByRole('link', { name: 'New' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('blocks the click on the child while loading', async () => {
    const onClick = vi.fn()
    render(
      <Badge asChild loading onClick={onClick}>
        <a href="/orders">New</a>
      </Badge>,
    )

    const link = screen.getByRole('link', { name: 'New' })
    expect(link).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('falls back to a span when the child is not an element', () => {
    render(<Badge asChild>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveTextContent('New')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe.each([
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
  'solid',
  'solid-destructive',
  'solid-success',
  'solid-info',
  'purple',
  'pink',
  'teal',
  'orange',
] as BadgeVariant[])('Badge variant %s', (variant) => {
  it('still renders its label', () => {
    render(<Badge variant={variant}>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveTextContent('New')
  })
})

describe.each(['orange', 'pink', 'purple', 'teal'] as BadgeVariant[])(
  'Badge category variant %s',
  (variant) => {
    it('paints with its category tokens, not a raw palette', () => {
      render(<Badge variant={variant}>Tag</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        `bg-category-${variant}`,
        `text-category-${variant}-foreground`,
      )
      expect(badge.className).not.toMatch(/\b(orange|pink|purple|teal)-\d/)
    })
  },
)

describe.each([
  ['destructive', ['text-destructive', 'bg-destructive/5']],
  ['success', ['text-success', 'bg-success/5', 'border-success/25']],
  ['warning', ['text-warning', 'bg-warning/5', 'border-warning/25']],
  ['info', ['text-info', 'bg-info/5', 'border-info/25']],
  ['solid-destructive', ['bg-destructive', 'text-background']],
  ['solid-success', ['bg-success', 'text-success-foreground']],
  ['solid-info', ['bg-info', 'text-info-foreground']],
] as [BadgeVariant, string[]][])(
  'Badge status variant %s',
  (variant, tokens) => {
    it('paints with the theme status tokens, not a raw palette', () => {
      render(<Badge variant={variant}>Paid</Badge>)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(...tokens)
      expect(badge.className).not.toMatch(
        /\b(emerald|amber|sky|red|green|yellow)-\d/,
      )
      expect(badge.className).not.toMatch(/\btext-white\b/)
    })
  },
)

describe.each(['start', 'center', 'end'] as BadgeAlign[])(
  'Badge align %s',
  (align) => {
    it('still renders its label', () => {
      render(<Badge align={align}>New</Badge>)

      expect(screen.getByTestId('badge')).toHaveTextContent('New')
    })
  },
)

describe.each(['sm', 'md', 'lg'] as BadgeSize[])('Badge size %s', (size) => {
  it('reports the size on the plain badge', () => {
    render(<Badge size={size}>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveAttribute('data-size', size)
    expect(screen.getByTestId('badge')).toHaveTextContent('New')
  })

  it('reports the size on the badge that turned into a button', async () => {
    const onClick = vi.fn()
    render(
      <Badge onClick={onClick} size={size}>
        New
      </Badge>,
    )

    const badge = screen.getByRole('button', { name: 'New' })
    expect(badge).toHaveAttribute('data-size', size)

    await userEvent.click(badge)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('reports the size on the child it renders onto', () => {
    render(
      <Badge asChild size={size}>
        <a href="/orders">New</a>
      </Badge>,
    )

    expect(screen.getByRole('link', { name: 'New' })).toHaveAttribute(
      'data-size',
      size,
    )
  })
})

describe('Badge size default', () => {
  it('renders the medium badge when no size is given', () => {
    render(<Badge>New</Badge>)

    expect(screen.getByTestId('badge')).toHaveAttribute('data-size', 'md')
  })

  it('keeps the loading indicator on a sized badge', () => {
    render(
      <Badge loading size="lg">
        New
      </Badge>,
    )

    expect(screen.getByTestId('badge')).toHaveAttribute('data-size', 'lg')
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()
  })
})

describe('Badge axes', () => {
  it('publishes its default variant and size for a theme to select', () => {
    render(<Badge>New</Badge>)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'default')
    expect(badge).toHaveAttribute('data-size', 'md')
  })

  it('publishes the variant it was given', () => {
    render(<Badge variant="destructive">Error</Badge>)

    expect(screen.getByTestId('badge')).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })

  it('publishes it on the button and on the asChild element', () => {
    render(
      <>
        <Badge onClick={() => undefined} variant="info">
          Click
        </Badge>
        <Badge asChild variant="success">
          <a href="/bookings">Open bookings</a>
        </Badge>
      </>,
    )

    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'info')
    expect(screen.getByRole('link')).toHaveAttribute('data-variant', 'success')
  })
})
