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
