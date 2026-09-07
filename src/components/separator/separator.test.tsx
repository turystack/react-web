import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('announces a horizontal divider when no orientation is asked for', () => {
    render(<Separator />)

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    )
  })

  it('announces the vertical orientation when asked for it', () => {
    render(<Separator orientation="vertical" />)

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
  })

  it('leaves the accessibility tree while staying on screen when decorative', () => {
    render(<Separator decorative />)

    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(screen.getByTestId('separator')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('stays announced when decorative is explicitly turned off', () => {
    render(<Separator decorative={false} />)

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-hidden',
      'false',
    )
  })

  it('reserves no room around the line by default', () => {
    render(<Separator />)

    expect(screen.getByTestId('separator').className).not.toMatch(/\bmy-/)
  })
})

describe.each(['sm', 'md', 'lg'] as const)(
  'Separator spacing %s',
  (spacing) => {
    it('reserves room above and below a horizontal divider', () => {
      render(<Separator spacing={spacing} />)

      expect(screen.getByTestId('separator').className).toMatch(/\bmy-/)
    })

    it('reserves room either side of a vertical divider', () => {
      render(<Separator orientation="vertical" spacing={spacing} />)

      expect(screen.getByTestId('separator').className).toMatch(/\bmx-/)
    })
  },
)
