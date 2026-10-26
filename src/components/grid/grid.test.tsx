import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Grid } from './grid'

describe('Grid', () => {
  it('renders its items inside the grid root', () => {
    render(
      <Grid>
        <Grid.Item>
          <p>Cell content</p>
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-root')).toContainElement(
      screen.getByTestId('grid-item'),
    )
    expect(screen.getByTestId('grid-item')).toContainElement(
      screen.getByText('Cell content'),
    )
  })

  it('renders one item per child', () => {
    render(
      <Grid cols={2} gap="md">
        <Grid.Item>First</Grid.Item>
        <Grid.Item>Second</Grid.Item>
      </Grid>,
    )

    expect(screen.getAllByTestId('grid-item')).toHaveLength(2)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('renders nothing but the root when it has no children', () => {
    render(<Grid />)

    expect(screen.getByTestId('grid-root')).toBeEmptyDOMElement()
  })

  it('renders an empty item when it has no children', () => {
    render(
      <Grid>
        <Grid.Item />
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toBeEmptyDOMElement()
  })
})

describe.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const)(
  'Grid cols %i',
  (cols) => {
    it('keeps its items reachable', () => {
      render(
        <Grid cols={cols}>
          <Grid.Item>Cell content</Grid.Item>
        </Grid>,
      )

      expect(screen.getByText('Cell content')).toBeInTheDocument()
    })
  },
)

describe.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const)(
  'Grid gap %s',
  (gap) => {
    it('keeps its items reachable', () => {
      render(
        <Grid gap={gap}>
          <Grid.Item>Cell content</Grid.Item>
        </Grid>,
      )

      expect(screen.getByText('Cell content')).toBeInTheDocument()
    })
  },
)

describe.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'full'] as const)(
  'Grid.Item span %s',
  (span) => {
    it('keeps its children reachable', () => {
      render(
        <Grid cols={12}>
          <Grid.Item span={span}>Cell content</Grid.Item>
        </Grid>,
      )

      expect(screen.getByText('Cell content')).toBeInTheDocument()
    })
  },
)

describe('Grid responsive cols', () => {
  it('keeps the number form one count at every width', () => {
    render(<Grid cols={3} />)

    const root = screen.getByTestId('grid-root')
    expect(root).toHaveClass('grid-cols-3')
    expect(root.className).not.toMatch(/(sm|md|lg|xl):grid-cols-/)
  })

  it('adds a column count per breakpoint, mobile-first', () => {
    render(<Grid cols={{ base: 1, lg: 4, md: 2, sm: 1, xl: 6 }} />)

    expect(screen.getByTestId('grid-root')).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-4',
      'xl:grid-cols-6',
    )
  })

  it('starts from one column when the object names no base', () => {
    render(<Grid cols={{ md: 3 }} />)

    const root = screen.getByTestId('grid-root')
    expect(root).toHaveClass('grid-cols-1', 'md:grid-cols-3')
    expect(root.className).not.toMatch(/(sm|lg|xl):grid-cols-/)
  })

  it('keeps one column everywhere for an empty object', () => {
    render(<Grid cols={{}} />)

    const root = screen.getByTestId('grid-root')
    expect(root).toHaveClass('grid-cols-1')
    expect(root.className).not.toMatch(/(sm|md|lg|xl):grid-cols-/)
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const)(
    'writes out every breakpoint class for %i columns',
    (n) => {
      render(<Grid cols={{ base: n, lg: n, md: n, sm: n, xl: n }} />)

      expect(screen.getByTestId('grid-root')).toHaveClass(
        `grid-cols-${n}`,
        `sm:grid-cols-${n}`,
        `md:grid-cols-${n}`,
        `lg:grid-cols-${n}`,
        `xl:grid-cols-${n}`,
      )
    },
  )
})

describe('Grid align', () => {
  it('stretches the cells by default', () => {
    render(<Grid />)

    expect(screen.getByTestId('grid-root')).toHaveClass('items-stretch')
  })

  it.each([
    ['start', 'items-start'],
    ['center', 'items-center'],
    ['end', 'items-end'],
    ['stretch', 'items-stretch'],
  ] as const)('aligns the cells to %s', (align, expected) => {
    render(
      <Grid align={align} cols={2}>
        <Grid.Item>Cell content</Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-root')).toHaveClass(expected)
    expect(screen.getByText('Cell content')).toBeInTheDocument()
  })
})

describe('Grid.Item rowSpan', () => {
  it('spans a single row when nothing is asked for', () => {
    render(
      <Grid>
        <Grid.Item>Cell</Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item').className).not.toMatch(/row-span/)
  })

  it.each([1, 2, 3, 4, 5, 6] as const)('spans %i rows', (rowSpan) => {
    render(
      <Grid cols={2}>
        <Grid.Item rowSpan={rowSpan} span={1}>
          Tall
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toHaveClass(
      `row-span-${rowSpan}`,
      'col-span-1',
    )
  })
})

describe('Grid.Item responsive span', () => {
  it('keeps the single-value form one span at every width', () => {
    render(
      <Grid cols={3}>
        <Grid.Item rowSpan={2} span={2}>
          Cell
        </Grid.Item>
      </Grid>,
    )

    const item = screen.getByTestId('grid-item')
    expect(item).toHaveClass('grid-item', 'col-span-2', 'row-span-2')
    expect(item.className).not.toMatch(/(sm|md|lg|xl):(col|row)-span-/)
  })

  it('keeps "full" a single value, not an object', () => {
    render(
      <Grid cols={3}>
        <Grid.Item span="full">Cell</Grid.Item>
      </Grid>,
    )

    const item = screen.getByTestId('grid-item')
    expect(item).toHaveClass('col-span-full')
    expect(item.className).not.toMatch(/(sm|md|lg|xl):col-span-/)
  })

  it('adds a column span per breakpoint, mobile-first', () => {
    render(
      <Grid cols={{ base: 1, md: 3 }}>
        <Grid.Item span={{ base: 1, lg: 3, md: 2, sm: 1, xl: 'full' }}>
          Cell
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toHaveClass(
      'col-span-1',
      'sm:col-span-1',
      'md:col-span-2',
      'lg:col-span-3',
      'xl:col-span-full',
    )
  })

  it('adds a row span per breakpoint, mobile-first', () => {
    render(
      <Grid cols={3}>
        <Grid.Item rowSpan={{ base: 1, lg: 3, md: 2, sm: 1, xl: 4 }}>
          Cell
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toHaveClass(
      'row-span-1',
      'sm:row-span-1',
      'md:row-span-2',
      'lg:row-span-3',
      'xl:row-span-4',
    )
  })

  it('spans one track below the first breakpoint an object names', () => {
    render(
      <Grid cols={{ base: 1, md: 3 }}>
        <Grid.Item rowSpan={{ md: 2 }} span={{ md: 2 }}>
          Cell
        </Grid.Item>
      </Grid>,
    )

    const item = screen.getByTestId('grid-item')
    expect(item).toHaveClass('md:col-span-2', 'md:row-span-2')
    expect(item.className).not.toMatch(/(^|\s)(col|row)-span-/)
    expect(item.className).not.toMatch(/(sm|lg|xl):(col|row)-span-/)
  })

  it('adds no span class for an empty object', () => {
    render(
      <Grid>
        <Grid.Item rowSpan={{}} span={{}}>
          Cell
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item').className).not.toMatch(/span/)
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'full'] as const)(
    'writes out every breakpoint class for span %s',
    (n) => {
      render(
        <Grid cols={12}>
          <Grid.Item span={{ base: n, lg: n, md: n, sm: n, xl: n }}>
            Cell
          </Grid.Item>
        </Grid>,
      )

      expect(screen.getByTestId('grid-item')).toHaveClass(
        `col-span-${n}`,
        `sm:col-span-${n}`,
        `md:col-span-${n}`,
        `lg:col-span-${n}`,
        `xl:col-span-${n}`,
      )
    },
  )

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'writes out every breakpoint class for rowSpan %i',
    (n) => {
      render(
        <Grid cols={2}>
          <Grid.Item rowSpan={{ base: n, lg: n, md: n, sm: n, xl: n }}>
            Cell
          </Grid.Item>
        </Grid>,
      )

      expect(screen.getByTestId('grid-item')).toHaveClass(
        `row-span-${n}`,
        `sm:row-span-${n}`,
        `md:row-span-${n}`,
        `lg:row-span-${n}`,
        `xl:row-span-${n}`,
      )
    },
  )
})

describe('Grid.Item order', () => {
  it('keeps the source order when no order is given', () => {
    render(
      <Grid cols={2}>
        <Grid.Item>Copy</Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item').className).not.toMatch(/order-/)
  })

  it('puts the image last on a phone and first from md', () => {
    render(
      <Grid cols={{ base: 1, md: 2 }}>
        <Grid.Item>Copy</Grid.Item>
        <Grid.Item order={{ base: 'last', md: 'first' }}>Image</Grid.Item>
      </Grid>,
    )

    const [copy, image] = screen.getAllByTestId('grid-item')

    expect(image).toHaveClass('order-last', 'md:order-first')
    expect(image.className).not.toMatch(/(^|\s)(sm|lg|xl):order-/)
    expect(copy.className).not.toMatch(/order-/)
  })

  it('reads a single value as the order at every width', () => {
    render(
      <Grid cols={3}>
        <Grid.Item order={2}>Second</Grid.Item>
      </Grid>,
    )

    const item = screen.getByTestId('grid-item')

    expect(item).toHaveClass('grid-item', 'order-2')
    expect(item.className).not.toMatch(/:order-/)
  })

  it.each([
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    'first',
    'last',
    'none',
  ] as const)('writes out every breakpoint class for order %s', (value) => {
    render(
      <Grid cols={2}>
        <Grid.Item
          order={{ base: value, lg: value, md: value, sm: value, xl: value }}
        >
          Cell
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toHaveClass(
      `order-${value}`,
      `sm:order-${value}`,
      `md:order-${value}`,
      `lg:order-${value}`,
      `xl:order-${value}`,
    )
  })

  it('combines with span and rowSpan on the same cell', () => {
    render(
      <Grid cols={3}>
        <Grid.Item order={{ lg: 1 }} rowSpan={2} span={{ md: 2 }}>
          Feature
        </Grid.Item>
      </Grid>,
    )

    expect(screen.getByTestId('grid-item')).toHaveClass(
      'lg:order-1',
      'row-span-2',
      'md:col-span-2',
    )
  })
})
