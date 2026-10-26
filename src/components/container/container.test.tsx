import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Container } from './container'

describe('Container', () => {
  it('renders its children inside the container root', () => {
    render(
      <Container>
        <p>Page content</p>
      </Container>,
    )

    expect(screen.getByTestId('container-root')).toContainElement(
      screen.getByText('Page content'),
    )
  })

  it('renders a single root even with several children', () => {
    render(
      <Container>
        <p>First</p>
        <p>Second</p>
      </Container>,
    )

    expect(screen.getAllByTestId('container-root')).toHaveLength(1)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('renders nothing but the root when it has no children', () => {
    render(<Container />)

    expect(screen.getByTestId('container-root')).toBeEmptyDOMElement()
  })
})

describe.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
  'Container maxWidth %s',
  (maxWidth) => {
    it('keeps its children reachable', () => {
      render(
        <Container maxWidth={maxWidth}>
          <p>Page content</p>
        </Container>,
      )

      expect(screen.getByText('Page content')).toBeInTheDocument()
    })
  },
)

describe.each(['left', 'center', 'right'] as const)(
  'Container textAlign %s',
  (textAlign) => {
    it('keeps its children reachable', () => {
      render(
        <Container textAlign={textAlign}>
          <p>Page content</p>
        </Container>,
      )

      expect(screen.getByText('Page content')).toBeInTheDocument()
    })
  },
)

describe.each([true, false])('Container centered %s', (centered) => {
  it('keeps its children reachable', () => {
    render(
      <Container centered={centered}>
        <p>Page content</p>
      </Container>,
    )

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })
})

describe('Container paddingX', () => {
  it('adds no gutter when none is asked for, as before', () => {
    render(<Container>Page content</Container>)

    const root = screen.getByTestId('container-root')
    expect(root).toHaveClass('px-0')
    expect(root).not.toHaveClass('px-4', 'px-6', 'px-8')
  })

  it.each([
    ['none', 'px-0'],
    ['sm', 'px-4'],
    ['md', 'px-6'],
    ['lg', 'px-8'],
  ] as const)('pads the sides by the %s step', (paddingX, expected) => {
    render(
      <Container maxWidth="lg" paddingX={paddingX}>
        Page content
      </Container>,
    )

    const root = screen.getByTestId('container-root')
    expect(root).toHaveClass(expected, 'max-w-6xl', 'mx-auto')
    expect(root).toContainElement(screen.getByText('Page content'))
  })
})

describe('Container id', () => {
  it('puts the id on the element so an anchor link can reach it', () => {
    render(<Container id="pricing">Pricing</Container>)

    const root = screen.getByTestId('container-root')
    expect(root).toHaveAttribute('id', 'pricing')
    expect(document.getElementById('pricing')).toBe(root)
  })

  it('renders no id attribute when none is given', () => {
    render(<Container>Pricing</Container>)

    expect(screen.getByTestId('container-root')).not.toHaveAttribute('id')
  })
})
