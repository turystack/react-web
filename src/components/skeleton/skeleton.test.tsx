import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a placeholder reachable by its test handle', () => {
    render(<Skeleton />)

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('is already a visible block when asked for nothing', () => {
    render(<Skeleton />)

    const placeholder = screen.getByTestId('skeleton')
    expect(placeholder.className).toMatch(/\bh-\S/)
    expect(placeholder.className).toMatch(/\bw-\S/)
  })

  it('takes its height from the token it is given', () => {
    render(<Skeleton height="xl" />)

    expect(screen.getByTestId('skeleton').className).toContain('h-20')
  })

  it('takes its width from the token it is given', () => {
    render(<Skeleton width="md" />)

    expect(screen.getByTestId('skeleton').className).toContain('w-32')
  })

  it('keeps a circle square, sized by its height', () => {
    render(<Skeleton height="md" shape="circle" width="xs" />)

    const placeholder = screen.getByTestId('skeleton')
    expect(placeholder.className).toContain('aspect-square')
    expect(placeholder.className).toContain('rounded-full')
    expect(placeholder.className).toContain('w-auto')
  })

  it('renders one placeholder per instance', () => {
    render(
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })
})

describe.each(['rectangle', 'circle', 'text'] as const)(
  'Skeleton shape %s',
  (shape) => {
    it('still renders the placeholder', () => {
      render(<Skeleton shape={shape} />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })
  },
)

describe.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
  'Skeleton size %s',
  (size) => {
    it('still renders the placeholder', () => {
      render(<Skeleton height={size} width={size} />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })
  },
)
