import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Flex } from './flex'

describe('Flex', () => {
  it('renders its children inside the flex root', () => {
    render(
      <Flex>
        <p>Row content</p>
      </Flex>,
    )

    expect(screen.getByTestId('flex-root')).toContainElement(
      screen.getByText('Row content'),
    )
  })

  it('renders a single root even with several children', () => {
    render(
      <Flex>
        <p>First</p>
        <p>Second</p>
      </Flex>,
    )

    expect(screen.getAllByTestId('flex-root')).toHaveLength(1)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('renders nothing but the root when it has no children', () => {
    render(<Flex />)

    expect(screen.getByTestId('flex-root')).toBeEmptyDOMElement()
  })

  it('keeps its children reachable with every flex prop combined', () => {
    render(
      <Flex
        align="center"
        block
        direction="col"
        gap="lg"
        inline
        justify="between"
        minHeight="screen"
        wrap="wrap"
      >
        <p>Row content</p>
      </Flex>,
    )

    expect(screen.getByTestId('flex-root')).toContainElement(
      screen.getByText('Row content'),
    )
  })
})

describe.each(['row', 'col', 'row-reverse', 'col-reverse'] as const)(
  'Flex direction %s',
  (direction) => {
    it('keeps its children reachable', () => {
      render(
        <Flex direction={direction}>
          <p>Row content</p>
        </Flex>,
      )

      expect(screen.getByText('Row content')).toBeInTheDocument()
    })
  },
)

describe.each([
  'start',
  'end',
  'center',
  'between',
  'around',
  'evenly',
] as const)('Flex justify %s', (justify) => {
  it('keeps its children reachable', () => {
    render(
      <Flex justify={justify}>
        <p>Row content</p>
      </Flex>,
    )

    expect(screen.getByText('Row content')).toBeInTheDocument()
  })
})

describe.each(['start', 'end', 'center', 'baseline', 'stretch'] as const)(
  'Flex align %s',
  (align) => {
    it('keeps its children reachable', () => {
      render(
        <Flex align={align}>
          <p>Row content</p>
        </Flex>,
      )

      expect(screen.getByText('Row content')).toBeInTheDocument()
    })
  },
)

describe.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const)(
  'Flex gap %s',
  (gap) => {
    it('keeps its children reachable', () => {
      render(
        <Flex gap={gap}>
          <p>Row content</p>
        </Flex>,
      )

      expect(screen.getByText('Row content')).toBeInTheDocument()
    })
  },
)

describe.each(['wrap', 'nowrap', 'wrap-reverse'] as const)(
  'Flex wrap %s',
  (wrap) => {
    it('keeps its children reachable', () => {
      render(
        <Flex wrap={wrap}>
          <p>Row content</p>
        </Flex>,
      )

      expect(screen.getByText('Row content')).toBeInTheDocument()
    })
  },
)

describe.each(['sm', 'md', 'lg', 'screen'] as const)(
  'Flex minHeight %s',
  (minHeight) => {
    it('keeps its children reachable', () => {
      render(
        <Flex minHeight={minHeight}>
          <p>Row content</p>
        </Flex>,
      )

      expect(screen.getByText('Row content')).toBeInTheDocument()
    })
  },
)

describe.each([true, false])('Flex inline %s', (inline) => {
  it('keeps its children reachable', () => {
    render(
      <Flex inline={inline}>
        <p>Row content</p>
      </Flex>,
    )

    expect(screen.getByText('Row content')).toBeInTheDocument()
  })
})

describe.each([true, false])('Flex block %s', (block) => {
  it('keeps its children reachable', () => {
    render(
      <Flex block={block}>
        <p>Row content</p>
      </Flex>,
    )

    expect(screen.getByText('Row content')).toBeInTheDocument()
  })
})
