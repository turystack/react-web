import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Identity } from './identity'

describe('Identity', () => {
  it('renders the primary identity, supporting content, and inline action', () => {
    render(
      <Identity
        description="12.345.678/0001-90"
        action={<button type="button">Edit</button>}
        media={<span>NW</span>}
        title="Northwind Travel"
      />,
    )

    expect(screen.getByTestId('identity-title')).toHaveTextContent(
      'Northwind Travel',
    )
    expect(screen.getByTestId('identity-description')).toHaveTextContent(
      '12.345.678/0001-90',
    )
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('keeps a table identity within the width of its cell', () => {
    render(<Identity title="Trail pass" variant="table" />)

    expect(screen.getByTestId('identity').className).toContain('max-w-full')
  })

  it('accepts every documented density', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(<Identity size={size} title="Northwind" />)
      expect(screen.getByTestId('identity')).toBeInTheDocument()
      unmount()
    }
  })
})

describe('Identity axes', () => {
  it('publishes its default variant and size for a theme to select', () => {
    render(<Identity title="Northwind" />)

    const root = screen.getByTestId('identity')
    expect(root).toHaveAttribute('data-variant', 'default')
    expect(root).toHaveAttribute('data-size', 'md')
  })

  it('publishes the variant and size it was given', () => {
    render(<Identity size="lg" title="Northwind" variant="header" />)

    const root = screen.getByTestId('identity')
    expect(root).toHaveAttribute('data-variant', 'header')
    expect(root).toHaveAttribute('data-size', 'lg')
  })
})
