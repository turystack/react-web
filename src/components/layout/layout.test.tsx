import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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

describe('Layout padding', () => {
  it('is what the header, the content and the footer fall back to', () => {
    render(
      <Layout padding="lg">
        <Layout.Header>head</Layout.Header>
        <Layout.Main>
          <Layout.Content>body</Layout.Content>
        </Layout.Main>
        <Layout.Footer>foot</Layout.Footer>
      </Layout>,
    )

    expect(screen.getByTestId('layout-header')).toHaveClass('px-6')
    expect(screen.getByTestId('layout-content-inner')).toHaveClass('p-8')
    expect(screen.getByTestId('layout-footer')).toHaveClass('px-6')
  })

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

    expect(screen.getByTestId('layout-header')).toHaveClass('px-2')
    expect(screen.getByTestId('layout-content-inner')).toHaveClass('p-0')
    expect(screen.getByTestId('layout-footer')).toHaveClass('px-6')
  })

  it('leaves the parts on their own defaults when the shell names none', () => {
    render(
      <Layout>
        <Layout.Header>head</Layout.Header>
        <Layout.Footer>foot</Layout.Footer>
      </Layout>,
    )

    expect(screen.getByTestId('layout-header')).toHaveClass('px-4')
    expect(screen.getByTestId('layout-footer')).toHaveClass('px-4')
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
