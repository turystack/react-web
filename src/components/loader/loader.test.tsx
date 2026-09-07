import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Loader } from './loader'

describe('Loader', () => {
  it('renders a spinner when no size is asked for', () => {
    render(<Loader />)

    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('announces the loading state as a live status region', () => {
    render(<Loader />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('keeps the spinning glyph itself decorative', () => {
    render(<Loader />)

    expect(screen.getByTestId('icon-loading')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('announces the label it was given instead of the default', () => {
    render(<Loader label="Uploading photos" />)

    expect(screen.getByRole('status')).toHaveTextContent('Uploading photos')
  })

  it('announces the words the provider was configured with', () => {
    render(
      <TuryProvider labels={{ loader: { loading: 'Carregando' } }}>
        <Loader />
      </TuryProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('renders one spinner per instance', () => {
    render(
      <div>
        <Loader />
        <Loader size="sm" />
      </div>,
    )

    expect(screen.getAllByRole('status')).toHaveLength(2)
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Loader size %s', (size) => {
  it('still renders the spinner', () => {
    render(<Loader size={size} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
