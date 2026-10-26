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

  it('carries an id so an in-page link can land on it', () => {
    render(<Flex id="pricing">Plans</Flex>)

    expect(screen.getByTestId('flex-root')).toHaveAttribute('id', 'pricing')
    expect(document.getElementById('pricing')).toBe(
      screen.getByTestId('flex-root'),
    )
  })

  it('renders no id when it is not given one', () => {
    render(<Flex>Plans</Flex>)

    expect(screen.getByTestId('flex-root')).not.toHaveAttribute('id')
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

describe('Flex responsive show/hide', () => {
  it.each([
    ['sm', 'sm:flex'],
    ['md', 'md:flex'],
    ['lg', 'lg:flex'],
    ['xl', 'xl:flex'],
  ] as const)(
    'hideBelow="%s" is gone on a phone and a flex row again from %s',
    (breakpoint, shown) => {
      render(<Flex hideBelow={breakpoint}>Links</Flex>)

      const row = screen.getByTestId('flex-root').className.split(' ')

      expect(row).toContain('hidden')
      expect(row).toContain(shown)
      // `hidden` has to be the base display, not fight a base `flex`.
      expect(row).not.toContain('flex')
      expect(row).not.toContain(`${breakpoint}:block`)
    },
  )

  it.each([
    ['sm', 'sm:inline-flex'],
    ['md', 'md:inline-flex'],
    ['lg', 'lg:inline-flex'],
    ['xl', 'xl:inline-flex'],
  ] as const)(
    'an inline row hidden below %s comes back inline-flex',
    (breakpoint, shown) => {
      render(
        <Flex hideBelow={breakpoint} inline>
          Chips
        </Flex>,
      )

      const row = screen.getByTestId('flex-root').className.split(' ')

      expect(row).toContain('hidden')
      expect(row).toContain(shown)
      expect(row).not.toContain('inline-flex')
      expect(row).not.toContain(`${breakpoint}:flex`)
    },
  )

  it.each([
    ['sm', 'sm:hidden'],
    ['md', 'md:hidden'],
    ['lg', 'lg:hidden'],
    ['xl', 'xl:hidden'],
  ] as const)(
    'hideAbove="%s" keeps its flex display and is gone from %s',
    (breakpoint, hidden) => {
      render(<Flex hideAbove={breakpoint}>Menu</Flex>)

      const row = screen.getByTestId('flex-root').className.split(' ')

      expect(row).toContain('flex')
      expect(row).toContain(hidden)
      expect(row).not.toContain('hidden')
    },
  )

  it('shows only between the two breakpoints when given both', () => {
    render(
      <Flex hideAbove="xl" hideBelow="md">
        Tablet
      </Flex>,
    )

    expect(screen.getByTestId('flex-root')).toHaveClass(
      'hidden',
      'md:flex',
      'xl:hidden',
    )
  })

  it('is a flex row at every width by default', () => {
    render(<Flex>Always</Flex>)

    const row = screen.getByTestId('flex-root')

    expect(row).toHaveClass('flex-root', 'flex')
    expect(row.className).not.toMatch(/hidden/)
  })
})
