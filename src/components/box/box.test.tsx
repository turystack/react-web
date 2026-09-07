import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Box } from './box'

describe('Box', () => {
  it('renders its children inside the box root', () => {
    render(
      <Box>
        <p>Panel content</p>
      </Box>,
    )

    expect(screen.getByTestId('box-root')).toContainElement(
      screen.getByText('Panel content'),
    )
  })

  it('renders a single root even with several children', () => {
    render(
      <Box>
        <p>First</p>
        <p>Second</p>
      </Box>,
    )

    expect(screen.getAllByTestId('box-root')).toHaveLength(1)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('renders nothing but the root when it has no children', () => {
    render(<Box />)

    expect(screen.getByTestId('box-root')).toBeEmptyDOMElement()
  })

  it('keeps its children reachable with every layout prop combined', () => {
    render(
      <Box
        bg="card"
        grow
        minHeight="screen"
        overflow="auto"
        padding="md"
        paddingX="lg"
        paddingY="sm"
        position="relative"
        rounded="xl"
        textAlign="center"
        width="full"
      >
        <p>Panel content</p>
      </Box>,
    )

    expect(screen.getByTestId('box-root')).toContainElement(
      screen.getByText('Panel content'),
    )
  })
})

describe.each(['background', 'muted', 'card'] as const)('Box bg %s', (bg) => {
  it('keeps its children reachable', () => {
    render(
      <Box bg={bg}>
        <p>Panel content</p>
      </Box>,
    )

    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })
})

describe.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const)(
  'Box padding %s',
  (padding) => {
    it('keeps its children reachable on every axis', () => {
      render(
        <Box padding={padding} paddingX={padding} paddingY={padding}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
  'Box rounded %s',
  (rounded) => {
    it('keeps its children reachable', () => {
      render(
        <Box rounded={rounded}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each(['auto', 'full'] as const)('Box width %s', (width) => {
  it('keeps its children reachable', () => {
    render(
      <Box width={width}>
        <p>Panel content</p>
      </Box>,
    )

    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg', 'screen'] as const)(
  'Box minHeight %s',
  (minHeight) => {
    it('keeps its children reachable', () => {
      render(
        <Box minHeight={minHeight}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each(['static', 'relative', 'absolute'] as const)(
  'Box position %s',
  (position) => {
    it('keeps its children reachable', () => {
      render(
        <Box position={position}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each(['hidden', 'visible', 'auto'] as const)(
  'Box overflow %s',
  (overflow) => {
    it('keeps its children reachable', () => {
      render(
        <Box overflow={overflow}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each(['left', 'center', 'right'] as const)(
  'Box textAlign %s',
  (textAlign) => {
    it('keeps its children reachable', () => {
      render(
        <Box textAlign={textAlign}>
          <p>Panel content</p>
        </Box>,
      )

      expect(screen.getByText('Panel content')).toBeInTheDocument()
    })
  },
)

describe.each([true, false])('Box grow %s', (grow) => {
  it('keeps its children reachable', () => {
    render(
      <Box grow={grow}>
        <p>Panel content</p>
      </Box>,
    )

    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })
})
