import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Layout } from '../layout'

function shell(header: ReactNode) {
  return (
    <Layout>
      {header}
      <Layout.Main>
        <Layout.Content>
          <p>Page</p>
        </Layout.Content>
      </Layout.Main>
    </Layout>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
})

function scrollPane(pane: HTMLElement, top: number) {
  pane.scrollTop = top
  fireEvent.scroll(pane)
}

describe('Layout.Header condenseOnScroll', () => {
  it('starts tall and without its border at the top of the page', () => {
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))

    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('data-condensed', 'false')
    expect(header).toHaveClass('h-14', 'border-b', 'border-transparent')
  })

  it('shrinks a step and shows its border once the content scrolls', async () => {
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))

    scrollPane(screen.getByTestId('layout-content'), 120)

    const header = screen.getByRole('banner')
    await waitFor(() =>
      expect(header).toHaveAttribute('data-condensed', 'true'),
    )
    expect(header).toHaveClass('h-10', 'border-border')
    expect(header).not.toHaveClass('h-14', 'border-transparent')
  })

  it('ignores a scroll that stays inside the small threshold', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame')
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))

    scrollPane(screen.getByTestId('layout-content'), 8)

    await waitFor(() => expect(frame).toHaveBeenCalled())
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(screen.getByRole('banner')).toHaveAttribute(
      'data-condensed',
      'false',
    )
  })

  it('grows back when the content returns to the top', async () => {
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))
    const pane = screen.getByTestId('layout-content')
    const header = screen.getByRole('banner')

    scrollPane(pane, 200)
    await waitFor(() =>
      expect(header).toHaveAttribute('data-condensed', 'true'),
    )

    scrollPane(pane, 0)
    await waitFor(() =>
      expect(header).toHaveAttribute('data-condensed', 'false'),
    )
    expect(header).toHaveClass('h-14')
  })

  it.each([
    ['sm', 'h-10', 'h-8'],
    ['md', 'h-14', 'h-10'],
    ['lg', 'h-16', 'h-12'],
  ] as const)('drops %s from %s to %s', async (size, tall, short) => {
    render(
      shell(
        <Layout.Header condenseOnScroll size={size}>
          Turystack
        </Layout.Header>,
      ),
    )
    const header = screen.getByRole('banner')
    expect(header).toHaveClass(tall)

    scrollPane(screen.getByTestId('layout-content'), 100)

    await waitFor(() => expect(header).toHaveClass(short))
    expect(header).not.toHaveClass(tall)
  })

  it('reads the scroll once per frame however many events arrive', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame')
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))
    const pane = screen.getByTestId('layout-content')

    scrollPane(pane, 50)
    scrollPane(pane, 60)
    scrollPane(pane, 70)

    expect(frame).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(screen.getByRole('banner')).toHaveAttribute(
        'data-condensed',
        'true',
      ),
    )
  })

  it('does not condense for a box scrolling inside the page', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame')
    render(
      <Layout>
        <Layout.Header condenseOnScroll>Turystack</Layout.Header>
        <Layout.Main>
          <Layout.Content>
            <div data-testid="table-scroller">wide table</div>
          </Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    scrollPane(screen.getByTestId('table-scroller'), 300)

    expect(frame).not.toHaveBeenCalled()
    expect(screen.getByRole('banner')).toHaveAttribute(
      'data-condensed',
      'false',
    )
  })

  it('follows the window when it is not inside a Layout', async () => {
    render(<Layout.Header condenseOnScroll>Turystack</Layout.Header>)

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      })
    })
    fireEvent.scroll(document)

    await waitFor(() =>
      expect(screen.getByRole('banner')).toHaveAttribute(
        'data-condensed',
        'true',
      ),
    )
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  })

  it('stops listening once it is unmounted', () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame')
    const { unmount } = render(
      shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>),
    )
    const pane = screen.getByTestId('layout-content')
    const shellRoot = screen.getByTestId('layout-root')
    unmount()
    document.body.appendChild(shellRoot)

    try {
      scrollPane(pane, 200)

      expect(frame).not.toHaveBeenCalled()
    } finally {
      shellRoot.remove()
    }
  })

  it('never condenses and publishes no state when it is off', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame')
    render(shell(<Layout.Header>Turystack</Layout.Header>))

    scrollPane(screen.getByTestId('layout-content'), 200)

    const header = screen.getByRole('banner')
    expect(frame).not.toHaveBeenCalled()
    expect(header).not.toHaveAttribute('data-condensed')
    expect(header).toHaveClass('h-14')
    expect(header).not.toHaveClass('border-b')
  })

  it('keeps a bordered header visibly bordered at the top', () => {
    render(
      shell(
        <Layout.Header bordered condenseOnScroll>
          Turystack
        </Layout.Header>,
      ),
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-border', 'border-b')
    expect(header).not.toHaveClass('border-transparent')
  })

  it('turns its height transition off under reduced motion', () => {
    render(shell(<Layout.Header condenseOnScroll>Turystack</Layout.Header>))

    expect(screen.getByRole('banner')).toHaveClass(
      'motion-reduce:transition-none',
    )
  })
})

describe('Layout.Header centerSection', () => {
  it('lays the bar out as three columns with the middle slot centred', () => {
    render(
      <Layout.Header
        centerSection={<span>Logo</span>}
        leftSection={<button type="button">Menu</button>}
        rightSection={
          <>
            <button type="button">Search</button>
            <button type="button">Help</button>
            <button type="button">Profile</button>
          </>
        }
      />,
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'grid',
      'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    )
    expect(header).not.toHaveClass('flex')

    const cells = Array.from(header.children)
    expect(cells.map((cell) => cell.getAttribute('data-testid'))).toEqual([
      'layout-header-start',
      'layout-header-middle',
      'layout-header-end',
    ])
    expect(screen.getByTestId('layout-header-middle')).toHaveTextContent('Logo')
    expect(screen.getByTestId('layout-header-middle')).toHaveClass(
      'justify-center',
    )
    expect(screen.getByTestId('layout-header-start')).toContainElement(
      screen.getByRole('button', { name: 'Menu' }),
    )
    expect(screen.getByTestId('layout-header-end')).toContainElement(
      screen.getByRole('button', { name: 'Profile' }),
    )
  })

  it('keeps the middle in the middle column when a side is missing', () => {
    render(<Layout.Header centerSection={<span>Logo</span>} />)

    const header = screen.getByRole('banner')
    expect(header.children).toHaveLength(3)
    expect(header.children[1]).toHaveTextContent('Logo')
    expect(screen.getByTestId('layout-header-start')).toBeEmptyDOMElement()
    expect(screen.getByTestId('layout-header-end')).toBeEmptyDOMElement()
  })

  it('puts the title in the left column after the left section', () => {
    render(
      <Layout.Header
        centerSection={<span>Logo</span>}
        leftSection={<button type="button">Menu</button>}
      >
        Dashboard
      </Layout.Header>,
    )

    const start = screen.getByTestId('layout-header-start')
    expect(start).toHaveTextContent('MenuDashboard')
    expect(screen.getByTestId('layout-header-middle')).not.toHaveTextContent(
      'Dashboard',
    )
  })

  it('stays a flex row when no centre is given', () => {
    render(
      <Layout.Header leftSection={<button type="button">Menu</button>}>
        Dashboard
      </Layout.Header>,
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('flex')
    expect(header).not.toHaveClass('grid')
    expect(screen.queryByTestId('layout-header-middle')).not.toBeInTheDocument()
  })

  it('condenses on scroll in the three-column layout too', async () => {
    render(
      shell(
        <Layout.Header centerSection={<span>Logo</span>} condenseOnScroll />,
      ),
    )

    scrollPane(screen.getByTestId('layout-content'), 100)

    await waitFor(() =>
      expect(screen.getByRole('banner')).toHaveAttribute(
        'data-condensed',
        'true',
      ),
    )
    expect(screen.getByRole('banner')).toHaveClass('grid', 'h-10')
  })
})

describe('Layout.Header maxWidth', () => {
  it('is the row itself by default, uncapped', () => {
    render(
      <Layout.Header leftSection={<span>Logo</span>} padding="sm">
        Title
      </Layout.Header>,
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('flex', 'px-4', 'items-center')
    expect(header.className).not.toMatch(/max-w-/)
    expect(screen.queryByTestId('layout-header-inner')).not.toBeInTheDocument()
  })

  it('treats full as no cap', () => {
    render(<Layout.Header maxWidth="full">Title</Layout.Header>)

    expect(screen.queryByTestId('layout-header-inner')).not.toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveClass('flex')
  })

  it.each([
    ['sm', 'max-w-sm'],
    ['md', 'max-w-3xl'],
    ['lg', 'max-w-6xl'],
    ['xl', 'max-w-7xl'],
    ['2xl', 'max-w-(--breakpoint-2xl)'],
  ] as const)(
    'caps the row at Container %s (%s) and centres it',
    (maxWidth, cap) => {
      render(
        <Layout.Header
          leftSection={<span>Logo</span>}
          maxWidth={maxWidth}
          padding="md"
          rightSection={<button type="button">Sign in</button>}
          size="lg"
          sticky
        >
          Title
        </Layout.Header>,
      )

      const header = screen.getByRole('banner')
      const inner = screen.getByTestId('layout-header-inner')

      // The bar keeps its height and stickiness across the whole screen...
      expect(header).toHaveClass('h-16', 'sticky', 'bg-background')
      expect(header).not.toHaveClass('flex', 'px-6', cap)
      expect(header.children).toHaveLength(1)
      // ...and its content is the capped, centred row, gutter inside the cap.
      expect(inner).toHaveClass(
        'layout-header-inner',
        cap,
        'mx-auto',
        'w-full',
        'h-full',
        'flex',
        'items-center',
        'px-6',
      )
      expect(inner).toContainElement(screen.getByText('Logo'))
      expect(inner).toContainElement(
        screen.getByRole('button', { name: 'Sign in' }),
      )
      expect(inner).toHaveTextContent('LogoTitleSign in')
    },
  )

  it('caps the three-column bar too, the middle still centred', () => {
    render(
      <Layout.Header
        centerSection={<span>Logo</span>}
        leftSection={<button type="button">Menu</button>}
        maxWidth="lg"
      />,
    )

    const inner = screen.getByTestId('layout-header-inner')

    expect(screen.getByRole('banner')).not.toHaveClass('grid')
    expect(inner).toHaveClass(
      'max-w-6xl',
      'grid',
      'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    )
    expect(
      Array.from(inner.children).map((cell) =>
        cell.getAttribute('data-testid'),
      ),
    ).toEqual([
      'layout-header-start',
      'layout-header-middle',
      'layout-header-end',
    ])
  })

  it('caps a header with only a title', () => {
    render(<Layout.Header maxWidth="md">Title</Layout.Header>)

    expect(screen.getByTestId('layout-header-inner')).toHaveTextContent('Title')
    expect(screen.getByTestId('layout-header-inner')).toHaveClass('max-w-3xl')
  })

  it('keeps the shell padding inside the cap and condenses the outer bar', async () => {
    render(
      <Layout padding="lg">
        <Layout.Header condenseOnScroll maxWidth="xl">
          Title
        </Layout.Header>
        <Layout.Main>
          <Layout.Content>
            <p>Page</p>
          </Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-header-inner')).toHaveClass('px-8')

    scrollPane(screen.getByTestId('layout-content'), 100)

    const header = screen.getByRole('banner')
    await waitFor(() =>
      expect(header).toHaveAttribute('data-condensed', 'true'),
    )
    expect(header).toHaveClass('h-10', 'border-border')
  })
})

describe('Layout.Header axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(shell(<Layout.Header>Title</Layout.Header>))

    expect(screen.getByTestId('layout-header')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given, capped or not', () => {
    const { rerender } = render(
      shell(<Layout.Header size="sm">Title</Layout.Header>),
    )

    expect(screen.getByTestId('layout-header')).toHaveAttribute(
      'data-size',
      'sm',
    )

    rerender(
      shell(
        <Layout.Header maxWidth="lg" size="lg">
          Title
        </Layout.Header>,
      ),
    )

    expect(screen.getByTestId('layout-header')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })
})
