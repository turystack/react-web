import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Alert } from '@/components/alert'

import { Layout } from './layout'
import { useLayout } from './layout.context'

function SidebarFlagProbe() {
  const { withSidebar } = useLayout()

  return <output>{String(withSidebar)}</output>
}

describe('Layout', () => {
  it('assembles the shell landmarks around the page content', () => {
    render(
      <Layout>
        <Layout.Header>Turystack</Layout.Header>
        <Layout.Main>
          <Layout.Content>
            <h1>Orders</h1>
          </Layout.Content>
        </Layout.Main>
        <Layout.Footer>All rights reserved</Layout.Footer>
      </Layout>,
    )

    expect(screen.getByRole('banner')).toHaveTextContent('Turystack')
    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Orders' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'All rights reserved',
    )
  })

  it('reports no sidebar to its parts when nothing is asked for', () => {
    render(
      <Layout>
        <SidebarFlagProbe />
      </Layout>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('false')
  })

  it('shares the sidebar mode with the parts below it', () => {
    render(
      <Layout.Sidebar.Provider>
        <Layout.Sidebar>
          <Layout.Sidebar.Content>nav</Layout.Sidebar.Content>
        </Layout.Sidebar>
        <Layout>
          <SidebarFlagProbe />
        </Layout>
      </Layout.Sidebar.Provider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('true')
  })

  it('reports no sidebar to a part rendered outside any Layout', () => {
    render(<SidebarFlagProbe />)

    expect(screen.getByRole('status')).toHaveTextContent('false')
  })
})

describe('Layout.Header', () => {
  it('exposes a banner landmark carrying its content', () => {
    render(<Layout.Header>Turystack</Layout.Header>)

    expect(screen.getByRole('banner')).toHaveTextContent('Turystack')
  })

  it('keeps both sections reachable beside the title', () => {
    render(
      <Layout.Header
        leftSection={<button type="button">Menu</button>}
        rightSection={<button type="button">Profile</button>}
      >
        Turystack
      </Layout.Header>,
    )

    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('button', { name: 'Menu' })).toBeEnabled()
    expect(
      within(banner).getByRole('button', { name: 'Profile' }),
    ).toBeEnabled()
    expect(banner).toHaveTextContent('Turystack')
  })

  it('keeps the title reachable when only the left section is given', () => {
    render(
      <Layout.Header leftSection={<button type="button">Menu</button>}>
        Turystack
      </Layout.Header>,
    )

    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('button', { name: 'Menu' })).toBeEnabled()
    expect(banner).toHaveTextContent('Turystack')
  })

  it('keeps the title reachable when only the right section is given', () => {
    render(
      <Layout.Header rightSection={<button type="button">Profile</button>}>
        Turystack
      </Layout.Header>,
    )

    const banner = screen.getByRole('banner')
    expect(
      within(banner).getByRole('button', { name: 'Profile' }),
    ).toBeEnabled()
    expect(banner).toHaveTextContent('Turystack')
  })

  it('stays a banner when bordered and stuck to the top', () => {
    render(
      <Layout.Header bordered sticky>
        Turystack
      </Layout.Header>,
    )

    expect(screen.getByRole('banner')).toHaveTextContent('Turystack')
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Layout.Header size %s', (size) => {
  it('stays a banner carrying its content', () => {
    render(<Layout.Header size={size}>Turystack</Layout.Header>)

    expect(screen.getByRole('banner')).toHaveTextContent('Turystack')
  })
})

describe('Layout.Main', () => {
  it('exposes a main landmark carrying the page', () => {
    render(
      <Layout.Main>
        <h1>Orders</h1>
      </Layout.Main>,
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Orders' }),
    ).toBeInTheDocument()
  })
})

describe('Layout.Content', () => {
  it('renders the page inside its scroll area', () => {
    render(
      <Layout.Content>
        <h1>Orders</h1>
      </Layout.Content>,
    )

    expect(
      within(screen.getByTestId('layout-content')).getByRole('heading', {
        name: 'Orders',
      }),
    ).toBeInTheDocument()
  })

  it('keeps the page reachable under every spacing constraint', () => {
    render(
      <Layout.Content
        maxWidth="lg"
        padding="lg"
        paddingHorizontal="md"
        paddingVertical="sm"
      >
        <h1>Orders</h1>
      </Layout.Content>,
    )

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)(
  'Layout.Content maxWidth %s',
  (maxWidth) => {
    it('keeps the page reachable', () => {
      render(
        <Layout.Content maxWidth={maxWidth} padding={maxWidth}>
          <h1>Orders</h1>
        </Layout.Content>,
      )

      expect(
        screen.getByRole('heading', { name: 'Orders' }),
      ).toBeInTheDocument()
    })
  },
)

/** The horizontal gutter class a part carries, whichever way it was set. */
function gutterOf(element: HTMLElement) {
  return [...element.classList].find((name) => /^(px|p)-\d+$/.test(name))
}

describe('Layout padding', () => {
  // One scale for every part: the header's left edge is the content's and the
  // footer's at every step. Each part declared its own scale once, and at every
  // setting the content sat 8px inside the header around it.
  it.each([
    ['none', 'px-0', 'py-0'],
    ['sm', 'px-4', 'py-4'],
    ['md', 'px-6', 'py-6'],
    ['lg', 'px-8', 'py-8'],
  ] as const)(
    'lines the header, the content and the footer up at %s',
    (padding, x, y) => {
      render(
        <Layout padding={padding}>
          <Layout.Header>head</Layout.Header>
          <Layout.Main>
            <Layout.Content>body</Layout.Content>
          </Layout.Main>
          <Layout.Footer>foot</Layout.Footer>
        </Layout>,
      )

      expect(screen.getByTestId('layout-header')).toHaveClass(x)
      expect(screen.getByTestId('layout-content-inner')).toHaveClass(x, y)
      expect(screen.getByTestId('layout-footer')).toHaveClass(x)
    },
  )

  it('loses to a part that names its own', () => {
    render(
      <Layout padding="lg">
        <Layout.Header padding="sm">head</Layout.Header>
        <Layout.Main>
          <Layout.Content padding="none">body</Layout.Content>
        </Layout.Main>
        <Layout.Footer>foot</Layout.Footer>
      </Layout>,
    )

    expect(screen.getByTestId('layout-header')).toHaveClass('px-4')
    expect(screen.getByTestId('layout-content-inner')).toHaveClass('px-0')
    expect(screen.getByTestId('layout-footer')).toHaveClass('px-8')
  })

  it('falls back to md everywhere when the shell names none', () => {
    render(
      <Layout>
        <Layout.Header>head</Layout.Header>
        <Layout.Main>
          <Layout.Content>body</Layout.Content>
        </Layout.Main>
        <Layout.Footer>foot</Layout.Footer>
      </Layout>,
    )

    // Before, the header and the footer said 16px and the content said nothing
    // at all — 0px, flush against the pane's edge under a padded header.
    expect(gutterOf(screen.getByTestId('layout-header'))).toBe('px-6')
    expect(screen.getByTestId('layout-content-inner')).toHaveClass('px-6')
    expect(gutterOf(screen.getByTestId('layout-footer'))).toBe('px-6')
  })

  it('gives a part outside any shell the same default as one inside', () => {
    render(
      <>
        <Layout.Header>head</Layout.Header>
        <Layout.Content>body</Layout.Content>
      </>,
    )

    expect(screen.getByTestId('layout-header')).toHaveClass('px-6')
    expect(screen.getByTestId('layout-content-inner')).toHaveClass('px-6')
  })
})

describe('Layout variant', () => {
  it('centres the content in a narrow column when centered', () => {
    render(
      <Layout variant="centered">
        <Layout.Main>
          <Layout.Content>card</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const inner = screen.getByTestId('layout-content-inner')

    // Both axes: mx-auto across, a flex column centred down.
    expect(inner).toHaveClass('mx-auto', 'flex', 'flex-col', 'justify-center')
    // The width of a sign-in card unless the screen asks for another.
    expect(inner).toHaveClass('max-w-sm')
  })

  it('lets a centred screen choose its own width', () => {
    render(
      <Layout variant="centered">
        <Layout.Main>
          <Layout.Content maxWidth="sm">card</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-content-inner')).toHaveClass('max-w-2xl')
    expect(screen.getByTestId('layout-content-inner')).not.toHaveClass(
      'max-w-sm',
    )
  })

  it('leaves the content flowing from the top by default', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content>page</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const inner = screen.getByTestId('layout-content-inner')

    expect(inner).not.toHaveClass('justify-center')
    expect(inner).not.toHaveClass('max-w-sm')
  })

  it('paints a pane that is a surface of its own', () => {
    render(
      <Layout variant="centered">
        <Layout.Main>
          <Layout.Content>form</Layout.Content>
          <Layout.Content bg="muted">brand</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const [form, brand] = screen.getAllByTestId('layout-content')

    expect(brand).toHaveClass('bg-muted')
    expect(form).not.toHaveClass('bg-muted')
  })

  it('paints a gradient pane from the theme tokens', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content bg="gradient">brand</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-content')).toHaveClass(
      'bg-linear-to-br',
      'from-muted',
    )
  })

  it('divides the row by shares, so 3 beside 2 is a 60/40 split', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content span={3}>form</Layout.Content>
          <Layout.Content span={2}>brand</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const [form, brand] = screen.getAllByTestId('layout-content')

    expect(form).toHaveClass('md:flex-[3]')
    expect(brand).toHaveClass('md:flex-[2]')
  })

  it('stacks two panes below md and puts them side by side from it', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content>a</Layout.Content>
          <Layout.Content>b</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-main')).toHaveClass(
      'flex-col',
      'md:flex-row',
    )
  })
})

describe('Layout.Header sections', () => {
  it('paints no section box for the section it was not given', () => {
    render(
      <Layout.Header rightSection={<button type="button">Profile</button>}>
        Turystack
      </Layout.Header>,
    )

    expect(screen.queryByTestId('layout-header-left')).not.toBeInTheDocument()
    expect(screen.getByTestId('layout-header-right')).toBeInTheDocument()
  })

  it('paints both when both are given', () => {
    render(
      <Layout.Header
        leftSection={<button type="button">Menu</button>}
        rightSection={<button type="button">Profile</button>}
      >
        Turystack
      </Layout.Header>,
    )

    expect(screen.getByTestId('layout-header-left')).toBeInTheDocument()
    expect(screen.getByTestId('layout-header-right')).toBeInTheDocument()
  })
})

describe('Layout.Footer', () => {
  it('exposes a contentinfo landmark carrying its content', () => {
    render(<Layout.Footer>All rights reserved</Layout.Footer>)

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'All rights reserved',
    )
  })

  it('keeps its actions reachable when bordered and stuck to the bottom', () => {
    render(
      <Layout.Footer bordered sticky>
        <button type="button">Save</button>
      </Layout.Footer>,
    )

    expect(
      within(screen.getByRole('contentinfo')).getByRole('button', {
        name: 'Save',
      }),
    ).toBeEnabled()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Layout.Footer size %s', (size) => {
  it('stays a contentinfo landmark carrying its content', () => {
    render(<Layout.Footer size={size}>All rights reserved</Layout.Footer>)

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'All rights reserved',
    )
  })
})

describe('Layout sidebar mode', () => {
  it('marks the shell as living inside a sidebar surface', () => {
    render(
      <Layout.Sidebar.Provider>
        <Layout.Sidebar>
          <Layout.Sidebar.Content>nav</Layout.Sidebar.Content>
        </Layout.Sidebar>
        <Layout>
          <Layout.Main>page</Layout.Main>
        </Layout>
      </Layout.Sidebar.Provider>,
    )

    expect(screen.getByTestId('layout-root')).toHaveAttribute(
      'data-with-sidebar',
    )
  })

  it('takes no height of its own beside a rail, so the inset margin fits', () => {
    render(
      <Layout.Sidebar.Provider variant="inset">
        <Layout.Sidebar>
          <Layout.Sidebar.Content>nav</Layout.Sidebar.Content>
        </Layout.Sidebar>
        <Layout height="viewport">
          <Layout.Main>page</Layout.Main>
        </Layout>
      </Layout.Sidebar.Provider>,
    )

    // `h-svh` plus the inset variant's `m-2` overflows the wrapper by the
    // margin, so the shell stretches instead of measuring itself — and the
    // `height` it was handed is ignored rather than fought with.
    const root = screen.getByTestId('layout-root')

    expect(root).toHaveClass('flex-1')
    expect(root).not.toHaveClass('h-svh')
    expect(root).not.toHaveClass('h-full')
  })

  it('leaves exactly one main landmark beside the rail', () => {
    render(
      <Layout.Sidebar.Provider>
        <Layout.Sidebar>
          <Layout.Sidebar.Content>nav</Layout.Sidebar.Content>
        </Layout.Sidebar>
        <Layout>
          <Layout.Main>page</Layout.Main>
        </Layout>
      </Layout.Sidebar.Provider>,
    )

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('leaves the flag off by default', () => {
    render(
      <Layout>
        <Layout.Main>page</Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-root')).not.toHaveAttribute(
      'data-with-sidebar',
    )
  })
})

function EnvironmentBanner() {
  return (
    <Alert layout="banner" variant="warning">
      <Alert.Title>Sandbox</Alert.Title>
      <Alert.Description>test data</Alert.Description>
    </Alert>
  )
}

describe('Layout banner', () => {
  it('puts the banner first, above the header', () => {
    render(
      <Layout banner={<EnvironmentBanner />}>
        <Layout.Header>Turystack</Layout.Header>
        <Layout.Main>page</Layout.Main>
      </Layout>,
    )

    const root = screen.getByTestId('layout-root')
    const banner = screen.getByTestId('layout-banner')

    expect(root.firstElementChild).toBe(banner)
    expect(within(banner).getByRole('status')).toHaveTextContent('Sandbox')
    expect(
      banner.compareDocumentPosition(screen.getByRole('banner')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('keeps the shell its height, the banner a strip that does not shrink', () => {
    render(
      <Layout banner={<EnvironmentBanner />}>
        <Layout.Main>page</Layout.Main>
      </Layout>,
    )

    // The root stays the viewport-tall, overflow-hidden column: the banner is
    // inside that height, not added to it, and header/main/footer share the rest.
    const root = screen.getByTestId('layout-root')
    expect(root).toHaveClass('h-svh', 'flex-col', 'overflow-hidden')
    expect(screen.getByTestId('layout-banner')).toHaveClass('shrink-0')
  })

  it('keeps filling its parent with a banner when asked to', () => {
    render(
      <Layout banner={<EnvironmentBanner />} height="fill">
        <Layout.Main>page</Layout.Main>
      </Layout>,
    )

    const root = screen.getByTestId('layout-root')
    expect(root).toHaveClass('h-full', 'flex-1')
    expect(root).not.toHaveClass('h-svh')
  })

  it('paints no banner box when there is no banner', () => {
    render(
      <Layout>
        <Layout.Header>Turystack</Layout.Header>
      </Layout>,
    )

    expect(screen.queryByTestId('layout-banner')).not.toBeInTheDocument()
    expect(screen.getByTestId('layout-root').firstElementChild).toBe(
      screen.getByRole('banner'),
    )
  })
})

function railShell(props: { height?: 'viewport' | 'fill'; banner?: boolean }) {
  return render(
    <Layout.Sidebar.Provider
      banner={props.banner ? <EnvironmentBanner /> : undefined}
      height={props.height}
    >
      <Layout.Sidebar>
        <Layout.Sidebar.Content>nav</Layout.Sidebar.Content>
      </Layout.Sidebar>
      <Layout>
        <Layout.Header>Turystack</Layout.Header>
        <Layout.Main>page</Layout.Main>
      </Layout>
    </Layout.Sidebar.Provider>,
  )
}

function slot(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-slot="${name}"]`)
  if (!(element instanceof HTMLElement)) {
    throw new Error(`no ${name}`)
  }
  return element
}

describe('Layout.Sidebar.Provider banner', () => {
  it('spans the banner above both the rail and the header, first in the DOM', () => {
    const { container } = railShell({ banner: true })

    const frame = slot(container, 'sidebar-frame')
    const banner = slot(container, 'sidebar-banner')
    const row = slot(container, 'sidebar-wrapper')

    expect(container.firstElementChild).toBe(frame)
    expect(frame.firstElementChild).toBe(banner)
    expect(banner.nextElementSibling).toBe(row)
    expect(within(banner).getByRole('status')).toHaveTextContent('Sandbox')
    // The rail and the header both live in the row below the banner.
    expect(within(row).getByText('nav')).toBeInTheDocument()
    expect(within(row).getByRole('banner')).toHaveTextContent('Turystack')
    expect(within(banner).queryByText('nav')).not.toBeInTheDocument()
  })

  it('keeps the shell viewport-tall and lets the row fill what the banner leaves', () => {
    const { container } = railShell({ banner: true })

    const frame = slot(container, 'sidebar-frame')
    const row = slot(container, 'sidebar-wrapper')

    expect(frame).toHaveClass('h-svh', 'flex-col', 'overflow-hidden')
    expect(slot(container, 'sidebar-banner')).toHaveClass('shrink-0')
    // Not a second h-svh under the banner — that would overflow by its height.
    expect(row).toHaveClass('flex-1', 'min-h-0')
    expect(row).not.toHaveClass('h-svh')
    expect(row).toHaveAttribute('data-height', 'fill')
  })

  it('pins the rail inside the row, not to the window, so it starts under the banner', () => {
    const { container } = railShell({ banner: true })

    const rail = slot(container, 'sidebar-container')
    expect(rail).toHaveClass('absolute', 'h-full')
    expect(rail).not.toHaveClass('fixed')
  })

  it('fills its parent with a banner when the provider is told to', () => {
    const { container } = railShell({ banner: true, height: 'fill' })

    const frame = slot(container, 'sidebar-frame')
    expect(frame).toHaveClass('h-full', 'flex-1')
    expect(frame).not.toHaveClass('h-svh')
    expect(frame).toHaveAttribute('data-height', 'fill')
  })

  it('renders exactly as before when there is no banner', () => {
    const { container } = railShell({})

    expect(
      container.querySelector('[data-slot="sidebar-frame"]'),
    ).not.toBeInTheDocument()
    const row = slot(container, 'sidebar-wrapper')
    expect(container.firstElementChild).toBe(row)
    expect(row).toHaveClass('h-svh')
    expect(slot(container, 'sidebar-container')).toHaveClass('fixed')
  })

  describe('skipLinks', () => {
    const links = [
      {
        href: '#main',
        label: 'Skip to content',
      },
      {
        href: '#search',
        label: 'Skip to search',
      },
    ]

    it('renders none by default', () => {
      render(
        <Layout>
          <Layout.Main>Page</Layout.Main>
        </Layout>,
      )

      expect(screen.queryByTestId('layout-skip-links')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders none for an empty list', () => {
      render(
        <Layout skipLinks={[]}>
          <Layout.Main>Page</Layout.Main>
        </Layout>,
      )

      expect(screen.queryByTestId('layout-skip-links')).not.toBeInTheDocument()
    })

    it('comes first in the shell, before the banner and the header', () => {
      render(
        <Layout
          banner={<Alert layout="banner">Sandbox</Alert>}
          skipLinks={links}
        >
          <Layout.Header>Turystack</Layout.Header>
          <Layout.Main>Page</Layout.Main>
        </Layout>,
      )

      const root = screen.getByTestId('layout-root')

      expect(root.firstElementChild).toBe(
        screen.getByTestId('layout-skip-links'),
      )
      expect(
        screen
          .getAllByRole('link')
          .map((link) => [link.textContent, link.getAttribute('href')]),
      ).toEqual([
        ['Skip to content', '#main'],
        ['Skip to search', '#search'],
      ])
    })

    it('takes the first Tab stops in order, and shows itself only on keyboard focus', async () => {
      const user = userEvent.setup()

      render(
        <Layout skipLinks={links}>
          <Layout.Header>
            <button type="button">Menu</button>
          </Layout.Header>
          <Layout.Main>Page</Layout.Main>
        </Layout>,
      )

      const [content, search] = screen.getAllByRole('link')

      // Hidden at rest, revealed by the focus-visible utilities only.
      expect(content).toHaveClass('sr-only')
      expect(content).toHaveClass('focus-visible:not-sr-only')
      expect(content).toHaveClass('focus-visible:fixed')
      // not-sr-only zeroes padding after every plain utility, so the padding
      // has to be a focus-visible utility as well.
      expect(content).toHaveClass('focus-visible:px-3')
      expect(content).not.toHaveClass('px-3')

      await user.tab()
      expect(content).toHaveFocus()

      await user.tab()
      expect(search).toHaveFocus()

      await user.tab()
      expect(
        screen.getByRole('button', {
          name: 'Menu',
        }),
      ).toHaveFocus()
    })
  })
})

describe('Layout axes', () => {
  it('publishes its default variant for a theme to select', () => {
    render(<Layout>page</Layout>)

    expect(screen.getByTestId('layout-root')).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it('publishes the variant it was given', () => {
    render(<Layout variant="centered">page</Layout>)

    expect(screen.getByTestId('layout-root')).toHaveAttribute(
      'data-variant',
      'centered',
    )
  })
})

describe('Layout.Footer axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Layout.Footer>All rights reserved</Layout.Footer>)

    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-size', 'md')
  })

  it('publishes the size it was given', () => {
    render(<Layout.Footer size="lg">All rights reserved</Layout.Footer>)

    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-size', 'lg')
  })
})

describe('Layout loadingBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function showBar() {
    act(() => {
      vi.advanceTimersByTime(200)
    })

    return screen.getByTestId('loading-bar-root')
  }

  it('renders no bar when the prop is absent, however long it waits', () => {
    render(
      <Layout>
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByTestId('loading-bar-root')).toBeNull()
  })

  it("shows the bar as the root's first child while loading", () => {
    render(
      <Layout
        banner={<Alert layout="banner">Sandbox</Alert>}
        loadingBar={{
          loading: true,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )

    const bar = showBar()

    expect(screen.getByTestId('layout-root').firstElementChild).toBe(bar)
    expect(
      screen.getByRole('progressbar', {
        name: 'Loading page',
      }),
    ).toBe(bar)
  })

  it('keeps the bar mounted to finish when loading turns false', () => {
    const { rerender } = render(
      <Layout
        loadingBar={{
          loading: true,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )
    showBar()

    rerender(
      <Layout
        loadingBar={{
          loading: false,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('loading-bar-root')).toHaveAttribute(
      'data-state',
      'done',
    )
  })

  it('removes the bar at once when the prop goes away mid-load', () => {
    const { rerender } = render(
      <Layout
        loadingBar={{
          loading: true,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )
    showBar()

    rerender(
      <Layout>
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )

    expect(screen.queryByTestId('loading-bar-root')).toBeNull()
  })

  it('keeps the skip links first, before the bar', () => {
    render(
      <Layout
        loadingBar={{
          loading: true,
        }}
        skipLinks={[
          {
            href: '#main',
            label: 'Skip to content',
          },
        ]}
      >
        <Layout.Main id="main">Page</Layout.Main>
      </Layout>,
    )
    const bar = showBar()
    const root = screen.getByTestId('layout-root')

    expect(root.firstElementChild).toBe(screen.getByTestId('layout-skip-links'))
    expect(root.children[1]).toBe(bar)
  })

  it('pins the bar to the viewport when the shell is the viewport', () => {
    render(
      <Layout
        loadingBar={{
          loading: true,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )

    expect(showBar()).toHaveAttribute('data-position', 'fixed')
  })

  it('pins the bar to a fill shell, which is positioned for it', () => {
    render(
      <Layout
        height="fill"
        loadingBar={{
          loading: true,
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )

    expect(showBar()).toHaveAttribute('data-position', 'absolute')
    expect(screen.getByTestId('layout-root')).toHaveClass('relative')
  })

  it('pins the bar to the content pane beside a rail', () => {
    render(
      <Layout.Sidebar.Provider>
        <Layout.Sidebar>Nav</Layout.Sidebar>
        <Layout
          loadingBar={{
            loading: true,
          }}
        >
          <Layout.Main>Page</Layout.Main>
        </Layout>
      </Layout.Sidebar.Provider>,
    )

    expect(showBar()).toHaveAttribute('data-position', 'absolute')
    expect(screen.getByTestId('layout-root')).toHaveClass('relative')
  })

  it('passes the rest of the bar through', () => {
    render(
      <Layout
        loadingBar={{
          delay: 0,
          loading: true,
          size: 'lg',
          variant: 'warning',
        }}
      >
        <Layout.Main>Page</Layout.Main>
      </Layout>,
    )
    act(() => {
      vi.advanceTimersByTime(0)
    })

    const bar = screen.getByTestId('loading-bar-root')

    expect(bar).toHaveAttribute('data-size', 'lg')
    expect(bar).toHaveAttribute('data-variant', 'warning')
  })
})
