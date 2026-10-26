import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/button'

import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('says what is missing with nothing else required', () => {
    render(<EmptyState title="No bookings yet" />)

    expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
      'No bookings yet',
    )
    expect(
      screen.queryByTestId('empty-state-description'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-state-action')).not.toBeInTheDocument()
  })

  it('adds the reason and the way out when it has them', () => {
    render(
      <EmptyState
        action={<Button>New booking</Button>}
        description="Bookings appear here once a guest confirms."
        title="No bookings yet"
      />,
    )

    expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
      'Bookings appear here once a guest confirms.',
    )
    expect(
      screen.getByRole('button', { name: 'New booking' }),
    ).toBeInTheDocument()
  })

  it('hides the icon from assistive technology, which the title already tells', () => {
    render(
      <EmptyState icon={<svg aria-hidden="true" />} title="Nothing here" />,
    )

    expect(
      screen.getByTestId('empty-state').querySelector('[aria-hidden="true"]'),
    ).toBeInTheDocument()
  })

  it('takes less room inside a popup than inside a page', () => {
    const { rerender } = render(<EmptyState size="sm" title="Nothing" />)

    expect(screen.getByTestId('empty-state').className).toContain('py-6')

    rerender(<EmptyState size="lg" title="Nothing" />)

    expect(screen.getByTestId('empty-state').className).toContain('py-16')
  })

  it('sets the way out apart from the words, more so the larger it is', () => {
    const action = <Button>New booking</Button>
    const { rerender } = render(
      <EmptyState action={action} size="sm" title="Nothing" />,
    )

    // The root's gap is the rhythm between title and description; the action
    // gets a margin on top of it so it does not read as a third line of copy.
    expect(screen.getByTestId('empty-state-action')).toHaveClass('mt-3')

    rerender(<EmptyState action={action} title="Nothing" />)

    expect(screen.getByTestId('empty-state-action')).toHaveClass('mt-4')

    rerender(<EmptyState action={action} size="lg" title="Nothing" />)

    expect(screen.getByTestId('empty-state-action')).toHaveClass('mt-5')
  })

  it('draws no edge by default', () => {
    render(<EmptyState title="Nothing" />)

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveAttribute('data-bordered', 'none')
    expect(root).not.toHaveClass('border')
    expect(root).not.toHaveClass('border-dashed')
  })

  it('outlines the empty region with a solid edge', () => {
    render(<EmptyState bordered="solid" title="Nothing" />)

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveAttribute('data-bordered', 'solid')
    expect(root).toHaveClass('border', 'rounded-lg')
    expect(root).not.toHaveClass('border-dashed')
  })

  it('outlines the empty region with a dashed edge', () => {
    render(<EmptyState bordered="dashed" title="Nothing" />)

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveAttribute('data-bordered', 'dashed')
    expect(root).toHaveClass('border', 'border-dashed', 'rounded-lg')
  })

  it.each([
    ['sm', 'py-6'],
    ['md', 'py-10'],
    ['lg', 'py-16'],
  ] as const)('keeps the %s padding inside a dashed edge', (size, padding) => {
    render(
      <EmptyState
        action={<Button>New payout</Button>}
        bordered="dashed"
        size={size}
        title="No payouts yet"
      />,
    )

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveClass('border-dashed', padding)
    expect(
      screen.getByRole('button', { name: 'New payout' }),
    ).toBeInTheDocument()
  })

  it('keeps its action in the text colour, whatever the container mutes', () => {
    render(
      <div className="text-muted-foreground">
        <EmptyState
          action={<button type="button">Try again</button>}
          title="Nothing"
        />
      </div>,
    )

    expect(screen.getByTestId('empty-state-action')).toHaveClass(
      'text-foreground',
    )
  })
})

describe('EmptyState headingLevel', () => {
  it('keeps the title a paragraph, not a heading, by default', () => {
    render(<EmptyState title="No bookings yet" />)

    const title = screen.getByTestId('empty-state-title')
    expect(title.tagName).toBe('P')
    expect(title).toHaveClass('empty-state-title')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'makes the title an h%i heading',
    (level) => {
      render(
        <EmptyState
          description="Create one to get started."
          headingLevel={level}
          title="No projects yet"
        />,
      )

      const heading = screen.getByRole('heading', { level })
      expect(heading).toHaveTextContent('No projects yet')
      expect(heading.tagName).toBe(`H${level}`)
      expect(heading).toHaveClass('empty-state-title')
      // The reason stays body copy.
      expect(screen.getByTestId('empty-state-description').tagName).toBe('P')
    },
  )
})

describe('EmptyState axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<EmptyState title="No invoices" />)

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveAttribute('data-size', 'md')
    expect(root).toHaveAttribute('data-bordered', 'none')
  })

  it('publishes the size it was given', () => {
    render(<EmptyState bordered="dashed" size="sm" title="No invoices" />)

    const root = screen.getByTestId('empty-state')
    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveAttribute('data-bordered', 'dashed')
  })
})
