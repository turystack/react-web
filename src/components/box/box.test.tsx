import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

describe.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const)(
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

describe.each([
  ['2xl', 'p-16', 'px-16', 'py-16'],
  ['3xl', 'p-24', 'px-24', 'py-24'],
] as const)('Box section rhythm %s', (step, all, x, y) => {
  it('pads the band 64px or 96px on the axis it is asked for', () => {
    render(
      <>
        <Box padding={step}>all</Box>
        <Box paddingX={step}>horizontal</Box>
        <Box paddingY={step}>vertical</Box>
      </>,
    )

    const [allBox, xBox, yBox] = screen.getAllByTestId('box-root')
    expect(allBox).toHaveClass(all)
    expect(xBox).toHaveClass(x)
    expect(xBox).not.toHaveClass(y)
    expect(yBox).toHaveClass(y)
    expect(yBox).not.toHaveClass(x)
  })

  it('lets one axis override the uniform step', () => {
    render(
      <Box padding="md" paddingY={step}>
        band
      </Box>,
    )

    expect(screen.getByTestId('box-root')).toHaveClass('p-4', y)
  })
})

describe('Box id', () => {
  it('puts the id on the element so an anchor link can reach it', () => {
    render(<Box id="pricing">Pricing</Box>)

    const root = screen.getByTestId('box-root')
    expect(root).toHaveAttribute('id', 'pricing')
    expect(document.getElementById('pricing')).toBe(root)
  })

  it('renders no id attribute when none is given', () => {
    render(<Box>Pricing</Box>)

    expect(screen.getByTestId('box-root')).not.toHaveAttribute('id')
  })
})

describe('Box sticky', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function stickyHeader(height: number) {
    const header = document.createElement('header')
    header.className = 'layout-header'
    header.style.position = 'sticky'
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      height,
    } as DOMRect)
    document.body.append(header)

    return header
  }

  it('pins to the top above the content by default', () => {
    render(<Box position="sticky">Filters</Box>)

    const box = screen.getByTestId('box-root')

    expect(box).toHaveClass('sticky', 'top-0', 'z-30')
    expect(box).not.toHaveClass('top-14')
    expect(box.style.top).toBe('')
  })

  it('pins just below the sticky app header, at its measured height', () => {
    const header = stickyHeader(64)

    render(
      <Box offset="header" position="sticky">
        Filters
      </Box>,
    )

    const box = screen.getByTestId('box-root')

    expect(box).toHaveClass('sticky', 'top-14', 'z-30')
    expect(box.style.top).toBe('64px')

    header.remove()
  })

  it('ignores a header that scrolls away with the page', () => {
    const header = stickyHeader(64)
    header.style.position = 'static'

    render(
      <Box offset="header" position="sticky">
        Filters
      </Box>,
    )

    expect(screen.getByTestId('box-root').style.top).toBe('0px')

    header.remove()
  })

  it('reads offset only when the box is sticky', () => {
    const header = stickyHeader(64)

    render(
      <Box offset="header" position="relative">
        Panel
      </Box>,
    )

    const box = screen.getByTestId('box-root')

    expect(box).toHaveClass('relative')
    expect(box).not.toHaveClass('sticky')
    expect(box).not.toHaveClass('top-14')
    expect(box).not.toHaveClass('top-0')
    expect(box).not.toHaveClass('z-30')
    expect(box.style.top).toBe('')

    header.remove()
  })

  it('lets go of the measured top when it stops being sticky', () => {
    const header = stickyHeader(40)

    const { rerender } = render(
      <Box offset="header" position="sticky">
        Filters
      </Box>,
    )

    expect(screen.getByTestId('box-root').style.top).toBe('40px')

    rerender(
      <Box offset="header" position="static">
        Filters
      </Box>,
    )

    expect(screen.getByTestId('box-root').style.top).toBe('')

    header.remove()
  })
})

describe('Box responsive show/hide', () => {
  it.each([
    ['sm', 'sm:block'],
    ['md', 'md:block'],
    ['lg', 'lg:block'],
    ['xl', 'xl:block'],
  ] as const)(
    'hideBelow="%s" is gone on a phone and a block again from %s',
    (breakpoint, shown) => {
      render(<Box hideBelow={breakpoint}>Links</Box>)

      const box = screen.getByTestId('box-root')

      expect(box).toHaveClass('box-root', 'hidden', shown)
      expect(box.className).not.toMatch(/(^|\s)\w+:hidden/)
    },
  )

  it.each([
    ['sm', 'sm:hidden'],
    ['md', 'md:hidden'],
    ['lg', 'lg:hidden'],
    ['xl', 'xl:hidden'],
  ] as const)(
    'hideAbove="%s" stays on a phone and is gone from %s',
    (breakpoint, hidden) => {
      render(<Box hideAbove={breakpoint}>Menu</Box>)

      const box = screen.getByTestId('box-root')

      expect(box).toHaveClass(hidden)
      expect(box.className.split(' ')).not.toContain('hidden')
    },
  )

  it('shows only between the two breakpoints when given both', () => {
    render(
      <Box hideAbove="lg" hideBelow="sm">
        Tablet
      </Box>,
    )

    expect(screen.getByTestId('box-root')).toHaveClass(
      'hidden',
      'sm:block',
      'lg:hidden',
    )
  })

  it('is shown at every width by default', () => {
    render(<Box>Always</Box>)

    expect(screen.getByTestId('box-root').className).not.toMatch(/hidden/)
  })
})
