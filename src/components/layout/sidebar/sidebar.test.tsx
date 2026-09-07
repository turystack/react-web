import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Layout } from '../layout'

import { Sidebar } from './sidebar'
import { useSidebar } from './sidebar.context'
import type { SidebarMenuButtonTooltip } from './sidebar.types'

/**
 * `useIsMobile` asks a media query, which is the breakpoint CSS itself applies.
 * jsdom answers every query with `matches: false`, so a mobile viewport only
 * exists once matchMedia is taught to say yes — the width is kept as the
 * argument because it is what the test is about.
 */
function setViewport(width: number) {
  const mobile = width < 768

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
    writable: true,
  })

  window.matchMedia = ((query: string) =>
    ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: query.includes('max-width') ? mobile : !mobile,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList) as typeof window.matchMedia
}

// The sidebar publishes its expanded/collapsed state on the surface it renders;
// there is no landmark or role attached to it.
function sidebarState() {
  return document
    .querySelector('[data-slot="sidebar"]')
    ?.getAttribute('data-state')
}

function collapsibleMode() {
  return document
    .querySelector('[data-slot="sidebar"]')
    ?.getAttribute('data-collapsible')
}

afterEach(() => {
  setViewport(1024)
  // The provider persists its open state in `sidebar_state`, and jsdom keeps a
  // single cookie jar for the whole file, so a toggle here would seed the next
  // test with a collapsed sidebar.
  // biome-ignore lint/suspicious/noDocumentCookie: jsdom ships no Cookie Store API
  document.cookie = 'sidebar_state=; path=/; max-age=0'
})

describe('useSidebar', () => {
  it('refuses to work outside a Sidebar.Provider', () => {
    function Orphan() {
      useSidebar()
      return null
    }

    expect(() => render(<Orphan />)).toThrow(
      'useSidebar must be used within a Layout.Sidebar.Provider',
    )
  })
})

describe('Sidebar.Provider', () => {
  it('starts expanded when nothing is asked for', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(sidebarState()).toBe('expanded')
  })

  it('starts collapsed when defaultOpen is turned off', () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(sidebarState()).toBe('collapsed')
  })

  it('collapses on its own from defaultOpen when the trigger is used', async () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(sidebarState()).toBe('collapsed')
  })

  it('holds the state a controlled open prop pins it to', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sidebar.Provider onOpenChange={onOpenChange} open>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(sidebarState()).toBe('expanded')
  })

  it('delivers the requested state on the control key shortcut', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sidebar.Provider onOpenChange={onOpenChange} open>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.keyboard('{Control>}b{/Control}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('delivers the requested state on the meta key shortcut', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sidebar.Provider onOpenChange={onOpenChange} open={false}>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.keyboard('{Meta>}b{/Meta}')

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('ignores the shortcut letter pressed without a modifier', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sidebar.Provider onOpenChange={onOpenChange} open>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.keyboard('b')

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('persists the state it moved to as a cookie', async () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(document.cookie).toContain('sidebar_state=false')
  })

  it('moves to the state a consumer sets through the hook', async () => {
    function CollapseButton() {
      const { setOpen } = useSidebar()

      return (
        <button onClick={() => setOpen(false)} type="button">
          Collapse
        </button>
      )
    }

    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <CollapseButton />
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))

    expect(sidebarState()).toBe('collapsed')
  })

  it('hands the inset variant down to the Layout beside it', () => {
    render(
      <Sidebar.Provider variant="inset">
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Layout>
          <Layout.Main>
            <h1>Orders</h1>
          </Layout.Main>
        </Layout>
      </Sidebar.Provider>,
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Orders' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('layout-root')).toHaveAttribute(
      'data-with-sidebar',
    )
  })
})

describe('Sidebar.Trigger', () => {
  it('runs the consumer handler before toggling', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger onClick={onClick} />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(sidebarState()).toBe('collapsed')
  })
})

describe('Sidebar', () => {
  it('records the collapsible mode it collapses into', () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(collapsibleMode()).toBe('icon')
  })

  it('records no collapsible mode while it is expanded', () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="icon">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(collapsibleMode()).toBe('')
  })

  it('keeps its content mounted and stateless when it never collapses', async () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="none">
          <Sidebar.Content>
            <a href="/vehicles">Vehicles</a>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(screen.getByRole('link', { name: 'Vehicles' })).toBeInTheDocument()
  })

  it('anchors itself to the side it is given', () => {
    render(
      <Sidebar.Provider>
        <Sidebar side="right">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-side',
      'right',
    )
  })

  it('anchors itself to the left when no side is given', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-side',
      'left',
    )
  })

  it('lets its own variant win over the provider variant', () => {
    render(
      <Sidebar.Provider variant="sidebar">
        <Sidebar variant="floating">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-variant',
      'floating',
    )
  })

  it('falls back to the provider variant when it declares none', () => {
    render(
      <Sidebar.Provider variant="inset">
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-variant',
      'inset',
    )
  })
})

describe('Sidebar on a mobile viewport', () => {
  it('keeps the navigation out of the page until the trigger opens it', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>
            <a href="/vehicles">Vehicles</a>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    expect(
      screen.queryByRole('link', { name: 'Vehicles' }),
    ).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(
      await screen.findByRole('link', { name: 'Vehicles' }),
    ).toBeInTheDocument()
  })

  it('carries the consumer className onto the drawer', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider>
        <Sidebar className="border-dashed">
          <Sidebar.Content>
            <a href="/vehicles">Vehicles</a>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    const link = await screen.findByRole('link', { name: 'Vehicles' })

    expect(link.closest('[data-mobile="true"]')).toHaveClass('border-dashed')
  })

  it('opens the panel anchored to the side it is given', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider>
        <Sidebar side="right">
          <Sidebar.Content>
            <a href="/vehicles">Vehicles</a>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(
      await screen.findByRole('link', { name: 'Vehicles' }),
    ).toBeInTheDocument()
  })
})

describe('Sidebar structure', () => {
  function renderStructure() {
    return render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Header>
            <h2>Turystack</h2>
          </Sidebar.Header>
          <Sidebar.Separator />
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Group.Label>Operations</Sidebar.Group.Label>
              <Sidebar.Group.Action>Add group</Sidebar.Group.Action>
              <Sidebar.Group.Content>
                <Sidebar.Menu>
                  <Sidebar.Menu.Item>
                    <Sidebar.Menu.Button>Vehicles</Sidebar.Menu.Button>
                    <Sidebar.Menu.Action>More</Sidebar.Menu.Action>
                    <Sidebar.Menu.Badge>12</Sidebar.Menu.Badge>
                  </Sidebar.Menu.Item>
                </Sidebar.Menu>
              </Sidebar.Group.Content>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <button type="button">Sign out</button>
          </Sidebar.Footer>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  it('renders the header, footer and divider it is composed with', () => {
    renderStructure()

    expect(
      screen.getByRole('heading', { name: 'Turystack' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('gives the divider a thickness, so it is visible at all', () => {
    renderStructure()

    // Base UI's Separator has no intrinsic size: without this rule the element
    // is in the DOM, has a colour, and paints nothing.
    expect(screen.getByRole('separator')).toHaveClass('data-horizontal:h-px')
  })

  it('renders the group with its label and action', () => {
    renderStructure()

    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add group' })).toBeEnabled()
  })

  it('renders the menu as a list of items', () => {
    renderStructure()

    expect(
      within(screen.getByRole('list')).getAllByRole('listitem'),
    ).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Vehicles' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'More' })).toBeEnabled()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('keeps the hover-only action reachable', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Action showOnHover>More</Sidebar.Menu.Action>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'More' })).toBeEnabled()
  })
})

describe('Sidebar.Menu.Button on the icon rail', () => {
  it('keeps the leading mark and drops everything after it', () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button size="lg">
                <span data-testid="mark">A</span>
                <span>Ana Ribeiro</span>
                <span data-testid="chevron">{'>'}</span>
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    // A row with something trailing the label — an account row, a chevron —
    // has no span as its last child, so the old rule matched nothing and left
    // the whole row inside a 32px button.
    expect(screen.getByRole('button')).toHaveClass(
      'group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden',
    )
    expect(screen.getByTestId('mark')).toBeInTheDocument()
    expect(screen.getByTestId('chevron')).toBeInTheDocument()
  })
})

describe('Sidebar right-hand gutter', () => {
  it('puts the brand action and a group action on one axis', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Header>
            <Sidebar.Brand action={<Sidebar.Trigger />}>
              Turystack
            </Sidebar.Brand>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Group.Label>Platform</Sidebar.Group.Label>
              <Sidebar.Group.Action aria-label="Add">+</Sidebar.Group.Action>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    // Both are a 32px square whose right edge is the rail's own 8px gutter —
    // the header's `p-2` for one, `right-2` inside the group's `p-2` for the
    // other. Same box, same offset, so their icons share a vertical axis.
    // jsdom computes no geometry, so the assertion is on the metrics that
    // produce it.
    const groupAction = screen.getByRole('button', { name: 'Add' })
    const brandAction = screen
      .getByRole('button', { name: 'Toggle Sidebar' })
      .closest('.layout-sidebar-brand-action')

    expect(groupAction).toHaveClass('size-8', 'right-2')
    expect(brandAction).toHaveClass('[&>button]:size-8!')
    expect(brandAction?.parentElement).not.toHaveClass('px-2')
  })
})

describe('Sidebar.Trigger icon', () => {
  function iconOf(side: 'left' | 'right', defaultOpen: boolean) {
    cleanup()
    render(
      <Sidebar.Provider defaultOpen={defaultOpen}>
        <Sidebar collapsible="icon" side={side}>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    return screen
      .getByRole('button', { name: 'Toggle Sidebar' })
      .querySelector('svg')?.innerHTML
  }

  // The icon says which way the rail is about to move, which is the one thing
  // a reader needs from it on a collapsed strip — it is the way back.
  it('points the same way for the two states that mean the same move', () => {
    const collapseALeftRail = iconOf('left', true)
    const expandARightRail = iconOf('right', false)
    const expandALeftRail = iconOf('left', false)
    const collapseARightRail = iconOf('right', true)

    expect(collapseALeftRail).toBe(expandARightRail)
    expect(expandALeftRail).toBe(collapseARightRail)
    expect(collapseALeftRail).not.toBe(expandALeftRail)
    expect(collapseALeftRail).toBeTruthy()
  })

  it('reverses the icon when the rail collapses', async () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="icon">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' })
    const before = trigger.querySelector('svg')?.innerHTML

    await userEvent.click(trigger)

    expect(trigger.querySelector('svg')?.innerHTML).not.toBe(before)
  })
})

describe('Sidebar.Brand', () => {
  function renderBrand() {
    return render(
      <Sidebar.Provider>
        <Sidebar collapsible="icon">
          <Sidebar.Header>
            <Sidebar.Brand
              logo={<span data-testid="brand-mark">T</span>}
              subtitle="Operations"
            >
              Turystack
            </Sidebar.Brand>
          </Sidebar.Header>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  it('renders the mark, the name and the second line', () => {
    renderBrand()

    expect(screen.getByTestId('brand-mark')).toBeInTheDocument()
    expect(screen.getByText('Turystack')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
  })

  it('hides the words on the icon rail and keeps the mark', () => {
    renderBrand()

    // The words are hidden by CSS the rail turns on, not unmounted, so the
    // assertion is on the class that does it rather than on presence.
    const words = screen.getByText('Turystack').parentElement

    expect(words).toHaveClass('group-data-[collapsible=icon]:hidden')
    expect(screen.getByTestId('brand-mark')).toBeVisible()
  })

  it('carries a trailing action, stacked above the mark on the icon rail', () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="icon">
          <Sidebar.Header>
            <Sidebar.Brand
              action={<Sidebar.Trigger />}
              logo={<span data-testid="brand-mark">T</span>}
            >
              Turystack
            </Sidebar.Brand>
          </Sidebar.Header>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const brand = screen
      .getByTestId('brand-mark')
      .closest('.layout-sidebar-brand')

    // One DOM order, two directions: the action closes the row and, once the
    // rail is a strip, `flex-col-reverse` lifts it above the mark.
    expect(brand).toHaveClass('group-data-[collapsible=icon]:flex-col-reverse')
    expect(brand?.lastElementChild).toHaveClass('layout-sidebar-brand-action')
    expect(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    ).toBeInTheDocument()
  })

  it('leaves out the mark and the second line when neither is given', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Header>
            <Sidebar.Brand>Turystack</Sidebar.Brand>
          </Sidebar.Header>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByText('Turystack')).toBeInTheDocument()
    expect(document.querySelector('.layout-sidebar-brand-logo')).toBeNull()
    expect(document.querySelector('.layout-sidebar-brand-subtitle')).toBeNull()
    expect(document.querySelector('.layout-sidebar-brand-action')).toBeNull()
  })
})

describe('Sidebar.Menu.Skeleton', () => {
  it('renders a single text placeholder by default', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Skeleton />
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(1)
  })

  it('adds an icon placeholder when the row has an icon', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Skeleton showIcon />
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(2)
  })
})

describe('Sidebar.Menu.Button', () => {
  it('fires the click it is given', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button onClick={onClick}>
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Vehicles' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks the current entry as active', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button isActive>Vehicles</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Vehicles' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('leaves an inactive entry unmarked', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button>Vehicles</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(
      screen.getByRole('button', { name: 'Vehicles' }),
    ).not.toHaveAttribute('data-active')
  })

  it('blocks the click when it is disabled', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button disabled onClick={onClick}>
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const button = screen.getByRole('button', { name: 'Vehicles' })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows no tooltip while the sidebar is expanded', async () => {
    render(
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button tooltip="Fleet vehicles">
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(screen.queryByText('Fleet vehicles')).not.toBeInTheDocument()
  })

  it('reveals the label as a tooltip once collapsed to icons', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button tooltip="Fleet vehicles">
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(await screen.findByText('Fleet vehicles')).toBeInTheDocument()
  })

  it('accepts the tooltip as a placement object', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button
                tooltip={{
                  children: 'Fleet vehicles',
                  side: 'top',
                  sideOffset: 8,
                }}
              >
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(await screen.findByText('Fleet vehicles')).toBeInTheDocument()
  })

  it('falls back to the placement defaults of the object form', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button
                tooltip={{
                  children: 'Fleet vehicles',
                }}
              >
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(await screen.findByText('Fleet vehicles')).toBeInTheDocument()
  })
})

describe.each(['sm', 'default', 'lg'] as const)(
  'Sidebar.Menu.Button size %s',
  (size) => {
    it('stays a reachable control', () => {
      render(
        <Sidebar.Provider>
          <Sidebar>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Button size={size} variant="outline">
                  Vehicles
                </Sidebar.Menu.Button>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar>
        </Sidebar.Provider>,
      )

      expect(screen.getByRole('button', { name: 'Vehicles' })).toBeEnabled()
    })
  },
)

describe('Sidebar.Menu.Sub', () => {
  it('renders the sub entries as links', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Sub>
                <Sidebar.Menu.Sub.Item>
                  <Sidebar.Menu.Sub.Button href="/vehicles">
                    Vehicles
                  </Sidebar.Menu.Sub.Button>
                </Sidebar.Menu.Sub.Item>
              </Sidebar.Menu.Sub>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('link', { name: 'Vehicles' })).toHaveAttribute(
      'href',
      '/vehicles',
    )
  })

  it('marks the current sub entry as active', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Sub>
                <Sidebar.Menu.Sub.Item>
                  <Sidebar.Menu.Sub.Button href="/vehicles" isActive size="sm">
                    Vehicles
                  </Sidebar.Menu.Sub.Button>
                </Sidebar.Menu.Sub.Item>
              </Sidebar.Menu.Sub>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('link', { name: 'Vehicles' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })
})

describe('Sidebar.Menu.Collapsible while the sidebar is expanded', () => {
  function renderPanel(props: {
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    open?: boolean
  }) {
    return render(
      <Sidebar.Provider defaultOpen>
        <Sidebar collapsible="offcanvas">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Collapsible {...props}>
                <Sidebar.Menu.Collapsible.Trigger>
                  Operations
                </Sidebar.Menu.Collapsible.Trigger>
                <Sidebar.Menu.Collapsible.Content>
                  <Sidebar.Menu.Sub>
                    <Sidebar.Menu.Sub.Item>
                      <Sidebar.Menu.Sub.Button href="/vehicles">
                        Vehicles
                      </Sidebar.Menu.Sub.Button>
                    </Sidebar.Menu.Sub.Item>
                  </Sidebar.Menu.Sub>
                </Sidebar.Menu.Collapsible.Content>
              </Sidebar.Menu.Collapsible>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )
  }

  it('starts closed and opens the panel on the trigger', async () => {
    renderPanel({})

    expect(
      screen.queryByRole('link', { name: 'Vehicles' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Operations' }))

    expect(
      await screen.findByRole('link', { name: 'Vehicles' }),
    ).toBeInTheDocument()
  })

  it('starts open when defaultOpen is asked for', () => {
    renderPanel({
      defaultOpen: true,
    })

    expect(screen.getByRole('link', { name: 'Vehicles' })).toBeInTheDocument()
  })

  it('delivers the requested state and stays put when controlled', async () => {
    const onOpenChange = vi.fn()
    renderPanel({
      onOpenChange,
      open: true,
    })

    await userEvent.click(screen.getByRole('button', { name: 'Operations' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('link', { name: 'Vehicles' })).toBeInTheDocument()
  })

  it('closes the panel and reports it when the sidebar collapses', async () => {
    const onOpenChange = vi.fn()
    renderPanel({
      defaultOpen: true,
      onOpenChange,
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(
      screen.queryByRole('link', { name: 'Vehicles' }),
    ).not.toBeInTheDocument()
  })
})

describe('Sidebar.Menu.Collapsible while the sidebar is collapsed to icons', () => {
  function renderIconMode(props: {
    label?: React.ReactNode
    tooltip?: SidebarMenuButtonTooltip
  }) {
    return render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Collapsible label={props.label}>
                <Sidebar.Menu.Collapsible.Trigger tooltip={props.tooltip}>
                  Operations
                </Sidebar.Menu.Collapsible.Trigger>
                <Sidebar.Menu.Collapsible.Content>
                  <Sidebar.Menu.Sub>
                    <Sidebar.Menu.Sub.Item>
                      <Sidebar.Menu.Sub.Button href="/vehicles">
                        Vehicles
                      </Sidebar.Menu.Sub.Button>
                    </Sidebar.Menu.Sub.Item>
                  </Sidebar.Menu.Sub>
                </Sidebar.Menu.Collapsible.Content>
              </Sidebar.Menu.Collapsible>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  it('reveals the entries in a dropdown instead of an inline panel', async () => {
    renderIconMode({})

    expect(
      screen.queryByRole('menuitem', { name: 'Vehicles' }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Operations' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Vehicles' }),
    ).toHaveAttribute('href', '/vehicles')
  })

  it('heads the dropdown with the label it is given', async () => {
    renderIconMode({
      label: 'Operations',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Operations' }))

    const dropdown = await screen.findByRole('menu')
    expect(within(dropdown).getByText('Operations')).toBeInTheDocument()
    expect(
      within(dropdown).getByRole('menuitem', { name: 'Vehicles' }),
    ).toBeInTheDocument()
  })

  it('shows the trigger tooltip before the dropdown is opened', async () => {
    renderIconMode({
      tooltip: 'Fleet operations',
    })

    await userEvent.hover(screen.getByRole('button', { name: 'Operations' }))

    expect(await screen.findByText('Fleet operations')).toBeInTheDocument()
  })

  it('accepts the trigger tooltip as a placement object', async () => {
    renderIconMode({
      tooltip: {
        children: 'Fleet operations',
        side: 'top',
        sideOffset: 8,
      },
    })

    await userEvent.hover(screen.getByRole('button', { name: 'Operations' }))

    expect(await screen.findByText('Fleet operations')).toBeInTheDocument()
  })

  it('falls back to the placement defaults of the trigger tooltip object', async () => {
    renderIconMode({
      tooltip: {
        children: 'Fleet operations',
      },
    })

    await userEvent.hover(screen.getByRole('button', { name: 'Operations' }))

    expect(await screen.findByText('Fleet operations')).toBeInTheDocument()
  })
})

describe('Sidebar.Menu.Collapsible on a mobile viewport', () => {
  it('opens the dropdown without a tooltip getting in the way', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Collapsible>
                <Sidebar.Menu.Collapsible.Trigger tooltip="Fleet operations">
                  Operations
                </Sidebar.Menu.Collapsible.Trigger>
                <Sidebar.Menu.Collapsible.Content>
                  <Sidebar.Menu.Sub>
                    <Sidebar.Menu.Sub.Item>
                      <Sidebar.Menu.Sub.Button href="/vehicles">
                        Vehicles
                      </Sidebar.Menu.Sub.Button>
                    </Sidebar.Menu.Sub.Item>
                  </Sidebar.Menu.Sub>
                </Sidebar.Menu.Collapsible.Content>
              </Sidebar.Menu.Collapsible>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(
      await screen.findByRole('button', { name: 'Operations' }),
    ).toBeEnabled()
  })
})

describe('Sidebar inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the mobile panel inside the named container', async () => {
    setViewport(500)
    render(
      <TuryProvider portalContainer={container}>
        <Sidebar.Provider>
          <Sidebar>
            <Sidebar.Content>
              <a href="/vehicles">Vehicles</a>
            </Sidebar.Content>
          </Sidebar>
          <Sidebar.Trigger />
        </Sidebar.Provider>
      </TuryProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(container).toContainElement(
      await screen.findByRole('link', { name: 'Vehicles' }),
    )
  })

  it('leaves the mobile panel on the body when no container is named', async () => {
    setViewport(500)
    render(
      <TuryProvider>
        <Sidebar.Provider>
          <Sidebar>
            <Sidebar.Content>
              <a href="/vehicles">Vehicles</a>
            </Sidebar.Content>
          </Sidebar>
          <Sidebar.Trigger />
        </Sidebar.Provider>
      </TuryProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(container).not.toContainElement(
      await screen.findByRole('link', { name: 'Vehicles' }),
    )
  })
})

describe('Sidebar.Provider persistence', () => {
  it('starts from the state the last toggle stored', () => {
    // biome-ignore lint/suspicious/noDocumentCookie: jsdom ships no Cookie Store API
    document.cookie = 'sidebar_state=false; path=/'
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(sidebarState()).toBe('collapsed')
  })

  it('carries the toggled state across a remount', async () => {
    const shell = (
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>
    )
    const { unmount } = render(shell)

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )
    expect(sidebarState()).toBe('collapsed')

    unmount()
    render(shell)

    expect(sidebarState()).toBe('collapsed')
  })

  it('leaves a controlled provider to its own value', () => {
    // biome-ignore lint/suspicious/noDocumentCookie: jsdom ships no Cookie Store API
    document.cookie = 'sidebar_state=false; path=/'
    render(
      <Sidebar.Provider onOpenChange={vi.fn()} open>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(sidebarState()).toBe('expanded')
  })
})

describe('Sidebar.Trigger props', () => {
  it('blocks the toggle while it is disabled', async () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger disabled />
      </Sidebar.Provider>,
    )

    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' })
    expect(trigger).toBeDisabled()

    await userEvent.click(trigger)

    expect(sidebarState()).toBe('expanded')
  })

  it('takes an accessible name of its own', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger ariaLabel="Open navigation" />
      </Sidebar.Provider>,
    )

    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toBeInTheDocument()
  })

  it('renders the element it is handed when asChild is set', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger asChild>
          <a href="/menu">Menu</a>
        </Sidebar.Trigger>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'href',
      '/menu',
    )
  })
})

describe('Sidebar current entry', () => {
  it('announces the active menu entry as the current page', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button isActive>Vehicles</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Vehicles' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('leaves an inactive menu entry without a current marker', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button>Vehicles</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(
      screen.getByRole('button', { name: 'Vehicles' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('announces the active sub entry as the current page', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Sub>
                <Sidebar.Menu.Sub.Item>
                  <Sidebar.Menu.Sub.Button href="/vans" isActive>
                    Vans
                  </Sidebar.Menu.Sub.Button>
                </Sidebar.Menu.Sub.Item>
              </Sidebar.Menu.Sub>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('link', { name: 'Vans' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

describe('Sidebar.Menu.Button tooltip alignment', () => {
  it('places the tooltip on the alignment it is given', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button
                tooltip={{
                  align: 'end',
                  children: 'Fleet vehicles',
                }}
              >
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(await screen.findByText('Fleet vehicles')).toHaveAttribute(
      'data-align',
      'end',
    )
  })

  it('centres the tooltip when no alignment is asked for', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button tooltip="Fleet vehicles">
                Vehicles
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Vehicles' }))

    expect(await screen.findByText('Fleet vehicles')).toHaveAttribute(
      'data-align',
      'center',
    )
  })
})

describe('Sidebar side and variant on every branch', () => {
  it('publishes them on a sidebar that never collapses', () => {
    render(
      <Sidebar.Provider>
        <Sidebar collapsible="none" side="right" variant="floating">
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const surface = document.querySelector('[data-slot="sidebar"]')
    expect(surface).toHaveAttribute('data-side', 'right')
    expect(surface).toHaveAttribute('data-variant', 'floating')
  })

  it('publishes them on the mobile panel', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider>
        <Sidebar side="right" variant="inset">
          <Sidebar.Content>
            <a href="/vehicles">Vehicles</a>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )
    await screen.findByRole('link', { name: 'Vehicles' })

    const surface = document.querySelector('[data-slot="sidebar"]')
    expect(surface).toHaveAttribute('data-side', 'right')
    expect(surface).toHaveAttribute('data-variant', 'inset')
  })
})
