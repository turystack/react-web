import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DropdownMenu } from '@/components/dropdown-menu'
import { Toggle } from '@/components/toggle'
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

/**
 * jsdom's cookie jar — the one `document.cookie` reads. Tests seed it the way
 * a server's Set-Cookie would, from outside the page, instead of writing the
 * cookie string from page code.
 */
const cookieJar = (
  globalThis as unknown as {
    jsdom: {
      cookieJar: {
        setCookieSync: (cookie: string, url: string) => unknown
      }
    }
  }
).jsdom.cookieJar

function seedCookie(cookie: string) {
  cookieJar.setCookieSync(cookie, window.location.href)
}

type StoredCookie = {
  expires: number
  name: string
  path: string
  value: string
}

/**
 * jsdom ships no Cookie Store API. This stand-in writes into the same jar
 * `document.cookie` reads, which is what the browser's does.
 */
function stubCookieStore() {
  const set = vi.fn(async (cookie: StoredCookie) => {
    seedCookie(
      `${cookie.name}=${cookie.value}; Path=${cookie.path}; Expires=${new Date(cookie.expires).toUTCString()}`,
    )
  })
  vi.stubGlobal('cookieStore', {
    set,
  })
  return set
}

afterEach(() => {
  setViewport(1024)
  vi.unstubAllGlobals()
  // The provider persists its open state in `sidebar_state`, and jsdom keeps a
  // single cookie jar for the whole file, so a toggle here would seed the next
  // test with a collapsed sidebar.
  seedCookie('sidebar_state=; Path=/; Max-Age=0')
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
    stubCookieStore()
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

  it('keeps the drawer at its own width whatever the rail width is', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider width="lg">
        <Sidebar>
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
    const drawer = link.closest<HTMLElement>('[data-mobile="true"]')

    expect(drawer?.style.getPropertyValue('--sidebar-width')).toBe('18rem')
  })

  it('dims the page behind the drawer with the shared overlay token', async () => {
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

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )
    await screen.findByRole('link', { name: 'Vehicles' })

    const backdrop = document.querySelector('.layout-sidebar-backdrop')
    expect(backdrop).toHaveClass('bg-overlay', 'backdrop-blur-overlay')
    expect(backdrop?.className).not.toMatch(/bg-black/)
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
              <Sidebar.Group.Action ariaLabel="Add group">
                +
              </Sidebar.Group.Action>
              <Sidebar.Group.Content>
                <Sidebar.Menu>
                  <Sidebar.Menu.Item>
                    <Sidebar.Menu.Button>Vehicles</Sidebar.Menu.Button>
                    <Sidebar.Menu.Action ariaLabel="More">
                      …
                    </Sidebar.Menu.Action>
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
              <Sidebar.Menu.Action ariaLabel="More" showOnHover>
                …
              </Sidebar.Menu.Action>
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
              <Sidebar.Group.Action ariaLabel="Add">+</Sidebar.Group.Action>
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

  it('leaves room under the action on the icon rail, so it is not read as part of the mark', () => {
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

    // At the brand's 4px gap the toggle stacked above the mark reads as one
    // control. The padding is only for the strip; on the full rail the two sit
    // side by side and need nothing extra.
    const action = screen
      .getByRole('button', { name: 'Toggle Sidebar' })
      .closest('.layout-sidebar-brand-action')

    expect(action).toHaveClass('group-data-[collapsible=icon]:pb-2')
    expect(action?.className).not.toMatch(/(?:^|\s)pb-2(?:\s|$)/)
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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet vehicles' }),
    )

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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet vehicles' }),
    )

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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet vehicles' }),
    )

    expect(await screen.findByText('Fleet vehicles')).toBeInTheDocument()
  })

  function rail(
    button: React.ReactNode,
    { open = false }: { open?: boolean } = {},
  ) {
    return render(
      <Sidebar.Provider defaultOpen={open}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>{button}</Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  it('takes its name from the tooltip text on the collapsed rail', () => {
    rail(
      <Sidebar.Menu.Button tooltip="Fleet vehicles">
        <svg aria-hidden="true" />
        <span>Vehicles</span>
      </Sidebar.Menu.Button>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Fleet vehicles')
  })

  it('takes its name from the text of a tooltip object', () => {
    rail(
      <Sidebar.Menu.Button
        tooltip={{ children: 'Fleet vehicles', side: 'top' }}
      >
        <svg aria-hidden="true" />
      </Sidebar.Menu.Button>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Fleet vehicles')
  })

  it('lets an explicit ariaLabel win over the tooltip', () => {
    rail(
      <Sidebar.Menu.Button ariaLabel="Vehicles list" tooltip="Fleet vehicles">
        <svg aria-hidden="true" />
      </Sidebar.Menu.Button>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Vehicles list')
  })

  it('names nothing from a tooltip whose content is not text', () => {
    rail(
      <Sidebar.Menu.Button tooltip={{ children: <strong>Fleet</strong> }}>
        <span>Vehicles</span>
      </Sidebar.Menu.Button>,
    )

    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveAccessibleName('Vehicles')
  })

  it('leaves the label to name the row while expanded', () => {
    rail(
      <Sidebar.Menu.Button tooltip="Fleet vehicles">
        <span>Vehicles</span>
      </Sidebar.Menu.Button>,
      { open: true },
    )

    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveAccessibleName('Vehicles')
  })

  it('names a collapsible trigger from its tooltip on the collapsed rail', () => {
    rail(
      <Sidebar.Menu.Collapsible>
        <Sidebar.Menu.Collapsible.Trigger tooltip="Reports">
          <svg aria-hidden="true" />
          <span>Reports</span>
        </Sidebar.Menu.Collapsible.Trigger>
      </Sidebar.Menu.Collapsible>,
    )

    expect(screen.getByRole('button', { name: 'Reports' })).toHaveAttribute(
      'aria-label',
      'Reports',
    )
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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet operations' }),
    )

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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet operations' }),
    )

    expect(await screen.findByText('Fleet operations')).toBeInTheDocument()
  })

  it('falls back to the placement defaults of the trigger tooltip object', async () => {
    renderIconMode({
      tooltip: {
        children: 'Fleet operations',
      },
    })

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet operations' }),
    )

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
    seedCookie('sidebar_state=false; Path=/')
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
    stubCookieStore()
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

  it('stores the toggle for a week at the site root, through the Cookie Store API', async () => {
    const set = stubCookieStore()
    const before = Date.now()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    expect(set).toHaveBeenCalledTimes(1)
    const [stored] = set.mock.calls[0] ?? []
    expect(stored).toMatchObject({
      name: 'sidebar_state',
      path: '/',
      value: 'false',
    })
    const week = 60 * 60 * 24 * 7 * 1000
    expect(stored?.expires).toBeGreaterThanOrEqual(before + week)
    expect(stored?.expires).toBeLessThanOrEqual(Date.now() + week)
    expect(document.cookie).toContain('sidebar_state=false')
  })

  it('still toggles, for the page only, where the Cookie Store API is missing', async () => {
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
    expect(document.cookie).not.toContain('sidebar_state')

    unmount()
    render(shell)

    expect(sidebarState()).toBe('expanded')
  })

  it('shrugs off a Cookie Store that refuses the write', async () => {
    // A plain function, not vi.fn: a mock tracks the promises it returns,
    // which would handle the refusal for the component.
    let writes = 0
    vi.stubGlobal('cookieStore', {
      set: () => {
        writes += 1
        return Promise.reject(new Error('blocked'))
      },
    })
    // A refusal nobody handles surfaces as the host's unhandledRejection.
    const host = (
      globalThis as unknown as {
        process: {
          off: (event: string, listener: (reason: unknown) => void) => void
          on: (event: string, listener: (reason: unknown) => void) => void
        }
      }
    ).process
    const unhandled = vi.fn()
    host.on('unhandledRejection', unhandled)
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle Sidebar' }),
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    host.off('unhandledRejection', unhandled)

    expect(writes).toBe(1)
    expect(unhandled).not.toHaveBeenCalled()
    expect(sidebarState()).toBe('collapsed')
  })

  it('leaves a controlled provider to its own value', () => {
    seedCookie('sidebar_state=false; Path=/')
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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet vehicles' }),
    )

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

    await userEvent.hover(
      screen.getByRole('button', { name: 'Fleet vehicles' }),
    )

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

describe('Sidebar.Provider height', () => {
  function renderShell(height?: 'viewport' | 'fill') {
    render(
      <Sidebar.Provider height={height}>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    return {
      container: document.querySelector('[data-slot="sidebar-container"]'),
      wrapper: document.querySelector('[data-slot="sidebar-wrapper"]'),
    }
  }

  it('owns the screen by default, with the rail fixed to the window', () => {
    const { container, wrapper } = renderShell()

    expect(wrapper).toHaveClass('h-svh')
    expect(container).toHaveClass('fixed', 'h-svh')
  })

  it('fills its parent under fill, with the rail positioned against it', () => {
    const { container, wrapper } = renderShell('fill')

    // The frame is the box popovers measure from (`relative`) and cannot be
    // scrolled by an off-screen rail (`overflow-clip`); the rail ends where the
    // frame ends instead of a viewport below it.
    expect(wrapper).not.toHaveClass('h-svh')
    expect(wrapper).toHaveClass('relative', 'h-full', 'overflow-clip')
    expect(container).toHaveClass('absolute', 'h-full')
    expect(container).not.toHaveClass('fixed')
    expect(container).not.toHaveClass('h-svh')
  })
})

describe('Sidebar.Provider width', () => {
  function railWidth(width?: 'sm' | 'md' | 'lg') {
    cleanup()
    render(
      <Sidebar.Provider width={width}>
        <Sidebar>
          <Sidebar.Content>nav</Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const wrapper = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-wrapper"]',
    )

    return {
      icon: wrapper?.style.getPropertyValue('--sidebar-width-icon'),
      rail: wrapper?.style.getPropertyValue('--sidebar-width'),
    }
  }

  it.each([
    ['sm', '14rem'],
    ['md', '16rem'],
    ['lg', '20rem'],
  ] as const)('sets the rail to its %s preset', (width, expected) => {
    expect(railWidth(width).rail).toBe(expected)
  })

  it('is md when nothing is asked for', () => {
    expect(railWidth().rail).toBe('16rem')
  })

  it('leaves the icon strip at 3.5rem at every width', () => {
    expect(railWidth('lg').icon).toBe('3.5rem')
    expect(railWidth('sm').icon).toBe('3.5rem')
  })
})

describe('Sidebar group label on the icon rail', () => {
  function renderRail(open: boolean, collapsible: 'icon' | 'offcanvas') {
    return render(
      <Sidebar.Provider defaultOpen={open}>
        <Sidebar collapsible={collapsible}>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Group.Label>Operations</Sidebar.Group.Label>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  function label() {
    return document.querySelector<HTMLElement>(
      '[data-slot="sidebar-group-label"]',
    )
  }

  it('leaves the accessibility tree while the rail is collapsed', () => {
    renderRail(false, 'icon')

    expect(label()).toHaveAttribute('aria-hidden', 'true')
    expect(label()).toHaveAttribute('inert')
    expect(label()).toHaveTextContent('Operations')
  })

  it('is read as usual while expanded', () => {
    renderRail(true, 'icon')

    expect(label()).not.toHaveAttribute('aria-hidden')
    expect(label()).not.toHaveAttribute('inert')
  })

  it('comes back once the rail expands again', async () => {
    renderRail(false, 'icon')
    expect(label()).toHaveAttribute('aria-hidden', 'true')

    await userEvent.keyboard('{Control>}b{/Control}')

    expect(sidebarState()).toBe('expanded')
    expect(label()).not.toHaveAttribute('aria-hidden')
    expect(label()).not.toHaveAttribute('inert')
  })

  it('is left alone by an offcanvas collapse, which hides the whole panel', () => {
    renderRail(false, 'offcanvas')

    expect(label()).not.toHaveAttribute('aria-hidden')
  })

  it('is read in the mobile drawer', async () => {
    setViewport(500)
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Group.Label>Operations</Sidebar.Group.Label>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <Sidebar.Trigger />
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: /sidebar/i }))

    const drawerLabel = await screen.findByText('Operations')
    expect(drawerLabel).not.toHaveAttribute('aria-hidden')
    expect(drawerLabel).not.toHaveAttribute('inert')
  })
})

describe('Sidebar icon-only actions', () => {
  it('names the group action by its ariaLabel', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Group>
            <Sidebar.Group.Label>Platform</Sidebar.Group.Label>
            <Sidebar.Group.Action ariaLabel="Add project" onClick={onClick}>
              <svg />
            </Sidebar.Group.Action>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add project' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('blocks the group action while it is disabled', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Group>
            <Sidebar.Group.Action ariaLabel="Add project" disabled>
              <svg />
            </Sidebar.Group.Action>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Add project' })).toBeDisabled()
  })

  it('names the menu action by its ariaLabel', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button>Team</Sidebar.Menu.Button>
              <Sidebar.Menu.Action ariaLabel="Invite" onClick={onClick}>
                <svg />
              </Sidebar.Menu.Action>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Invite' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Sidebar parts composed under a DropdownMenu trigger', () => {
  it('opens the menu from a Menu.Button handed to Trigger asChild', async () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Sidebar.Menu.Button size="lg">
                    Ana Ribeiro
                  </Sidebar.Menu.Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>Profile</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Ana Ribeiro' })
    await userEvent.click(row)

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
    // The trigger's ARIA state reached the row, and the row is still the
    // sidebar's own button rather than a second button wrapped around it.
    expect(row).toHaveAttribute('aria-expanded', 'true')
    expect(row).toHaveAttribute('data-slot', 'sidebar-menu-button')
  })

  it('opens the menu from a Menu.Action handed to Trigger asChild', async () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button>Team</Sidebar.Menu.Button>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Sidebar.Menu.Action ariaLabel="Team actions">
                    <svg />
                  </Sidebar.Menu.Action>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>Invite</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Team actions' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Invite' }),
    ).toBeInTheDocument()
  })

  it('opens the menu from the collapsed icon rail, tooltip and all', async () => {
    render(
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Sidebar.Menu.Button tooltip="Ana Ribeiro">
                    Ana Ribeiro
                  </Sidebar.Menu.Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>Profile</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Ana Ribeiro' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
  })

  it('forwards what a parent injects but never a class or a style', () => {
    // What `render` / `asChild` hand the child at runtime, outside the public
    // type. The id and the handler must land; the styling must not.
    const injected = {
      className: 'hijacked',
      id: 'account-row',
      style: {
        color: 'red',
      },
    } as unknown as Record<string, never>

    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button {...injected}>Account</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Account' })
    expect(row).toHaveAttribute('id', 'account-row')
    expect(row).not.toHaveClass('hijacked')
    expect(row).not.toHaveAttribute('style')
  })

  it('opens the menu from a Sidebar.Trigger handed to Trigger asChild', async () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Header>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Sidebar.Trigger ariaLabel="Workspace menu" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>Settings</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </Sidebar.Header>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const trigger = screen.getByRole('button', { name: 'Workspace menu' })
    await userEvent.click(trigger)

    expect(
      await screen.findByRole('menuitem', { name: 'Settings' }),
    ).toBeInTheDocument()
    // The menu's ARIA state reached the element, which is still the sidebar
    // trigger rather than a button wrapped around it.
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('data-sidebar', 'trigger')
  })

  it('forwards what a parent injects into Sidebar.Trigger but never a class or a style', () => {
    const injected = {
      className: 'hijacked',
      'data-origin': 'menu',
      id: 'rail-toggle',
      style: {
        color: 'red',
      },
    } as unknown as Record<string, never>

    render(
      <Sidebar.Provider>
        <Sidebar.Trigger {...injected} ariaLabel="Toggle rail" />
      </Sidebar.Provider>,
    )

    const trigger = screen.getByRole('button', { name: 'Toggle rail' })
    expect(trigger).toHaveAttribute('id', 'rail-toggle')
    expect(trigger).toHaveAttribute('data-origin', 'menu')
    expect(trigger).not.toHaveClass('hijacked')
    expect(trigger).not.toHaveAttribute('style')
  })
})

describe('Sidebar.Menu.Button accessible name', () => {
  it('takes an ariaLabel for a row whose content is not text', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button ariaLabel="Overview">
                <svg />
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Overview' })).toBeEnabled()
  })

  it('never submits a form it sits in', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Sidebar.Provider>
          <Sidebar>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Button>Vehicles</Sidebar.Menu.Button>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar>
        </Sidebar.Provider>
      </form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Vehicles' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('Sidebar.Menu.Button sections', () => {
  function renderAccountRow({
    open = true,
    ariaLabel,
    tooltip = 'Ana Souza',
  }: {
    open?: boolean
    ariaLabel?: string
    tooltip?: SidebarMenuButtonTooltip
  } = {}) {
    return render(
      <Sidebar.Provider defaultOpen={open}>
        <Sidebar collapsible="icon">
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Button
                  ariaLabel={ariaLabel}
                  description="ana@acme.com"
                  leftSection={<span data-testid="avatar">AS</span>}
                  rightSection={
                    <svg aria-hidden="true" data-testid="chevron" />
                  }
                  size="lg"
                  tooltip={tooltip}
                >
                  Ana Souza
                </Sidebar.Menu.Button>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  // The right section here is a decorative chevron, so it adds nothing but
  // whitespace to the description the row points at.
  const email = /^ana@acme\.com\s*$/

  it('builds the two-line row from phrasing content only', () => {
    renderAccountRow()

    const row = screen.getByRole('button')
    // No block element inside the <button>: every part is a span.
    expect(row.querySelector('div, p, section, ul, li')).toBeNull()
    for (const part of Array.from(row.children)) {
      expect(part.tagName).toBe('SPAN')
    }
    expect(row).toHaveTextContent('Ana Souza')
    expect(row).toHaveTextContent('ana@acme.com')
    expect(within(row).getByTestId('avatar')).toBeInTheDocument()
    expect(within(row).getByTestId('chevron')).toBeInTheDocument()
  })

  it('orders the parts left section, label and description, right section', () => {
    renderAccountRow()

    const row = screen.getByRole('button')
    const [left, body, right] = Array.from(row.children)
    expect(left).toContainElement(screen.getByTestId('avatar'))
    expect(body).toHaveTextContent('Ana Souzaana@acme.com')
    expect(right).toContainElement(screen.getByTestId('chevron'))
  })

  it('is named by its label and described by its second line', () => {
    renderAccountRow()

    const row = screen.getByRole('button', { name: 'Ana Souza' })
    expect(row).toHaveAccessibleDescription(email)
  })

  it('lets ariaLabel name the row instead of its label', () => {
    renderAccountRow({ ariaLabel: 'Account menu' })

    const row = screen.getByRole('button', { name: 'Account menu' })
    expect(row).not.toHaveAttribute('aria-labelledby')
    expect(row).toHaveAccessibleDescription(email)
  })

  it('shows only the left section on the collapsed icon rail', () => {
    renderAccountRow({ open: false })

    const row = screen.getByRole('button')
    expect(sidebarState()).toBe('collapsed')
    // The rail hides every child after the first — the left section is first.
    expect(row).toHaveClass(
      'group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden',
    )
    expect(row.firstElementChild).toContainElement(screen.getByTestId('avatar'))
  })

  it('is named by its tooltip on the collapsed icon rail', () => {
    renderAccountRow({ open: false, tooltip: 'Your account' })

    const row = screen.getByRole('button', { name: 'Your account' })
    expect(row).not.toHaveAttribute('aria-labelledby')
    expect(row).toHaveAccessibleDescription(email)
  })

  it('keeps its label as the name on the rail when the tooltip is not text', () => {
    renderAccountRow({
      open: false,
      tooltip: { children: <strong>Ana</strong> },
    })

    expect(
      screen.getByRole('button', { name: 'Ana Souza' }),
    ).toBeInTheDocument()
  })

  it('adds a description alone without a left or right section', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button description="3 open" size="lg">
                Orders
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Orders' })
    expect(row).toHaveAccessibleDescription('3 open')
    expect(row.children).toHaveLength(1)
  })

  it('describes the row by a right section that carries text', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button rightSection="12">Inbox</Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Inbox' })
    expect(row).toHaveAccessibleDescription('12')
  })

  it('leaves the children form untouched when no section is given', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <Sidebar.Menu.Button
                description={null}
                leftSection={false}
                rightSection={undefined}
              >
                <svg data-testid="icon" />
                <span>Vehicles</span>
              </Sidebar.Menu.Button>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Vehicles' })
    expect(row.firstElementChild).toBe(screen.getByTestId('icon'))
    expect(row).not.toHaveAttribute('aria-labelledby')
    expect(row).not.toHaveAttribute('aria-describedby')
  })

  it('opens a DropdownMenu as the sectioned account row', async () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Menu>
            <Sidebar.Menu.Item>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Sidebar.Menu.Button
                    description="ana@acme.com"
                    leftSection={<span>AS</span>}
                    size="lg"
                  >
                    Ana Souza
                  </Sidebar.Menu.Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>Profile</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Sidebar.Menu.Item>
          </Sidebar.Menu>
        </Sidebar>
      </Sidebar.Provider>,
    )

    const row = screen.getByRole('button', { name: 'Ana Souza' })
    await userEvent.click(row)

    expect(
      await screen.findByRole('menuitem', { name: 'Profile' }),
    ).toBeInTheDocument()
    expect(row).toHaveAttribute('aria-expanded', 'true')
    expect(row).toHaveAccessibleDescription(email)
  })
})

describe('Sidebar.Content edge fades', () => {
  const metrics = {
    clientHeight: 400,
    scrollHeight: 400,
    scrollTop: 0,
  }
  let frames: FrameRequestCallback[] = []
  let resize: (() => void) | null = null
  let observed: Element[] = []
  const OriginalResizeObserver = globalThis.ResizeObserver

  const isScroller = (element: Element) =>
    element.getAttribute('data-slot') === 'sidebar-content'

  beforeEach(() => {
    metrics.clientHeight = 400
    metrics.scrollHeight = 400
    metrics.scrollTop = 0
    frames = []
    resize = null
    observed = []

    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(
      function (this: Element) {
        return isScroller(this) ? metrics.clientHeight : 0
      },
    )
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(
      function (this: Element) {
        return isScroller(this) ? metrics.scrollHeight : 0
      },
    )
    vi.spyOn(Element.prototype, 'scrollTop', 'get').mockImplementation(
      function (this: Element) {
        return isScroller(this) ? metrics.scrollTop : 0
      },
    )
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)

      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resize = callback
      }
      observe(element: Element) {
        observed.push(element)
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.ResizeObserver = OriginalResizeObserver
  })

  const flushFrames = () => {
    act(() => {
      const pending = frames
      frames = []

      for (const callback of pending) {
        callback(0)
      }
    })
  }

  const scroller = () =>
    document.querySelector('[data-slot="sidebar-content"]') as HTMLElement

  const fade = (edge: 'top' | 'bottom') => {
    const element = document.querySelector(
      `[data-slot="sidebar-content-fade"][data-edge="${edge}"]`,
    )

    if (!element) {
      throw new Error(`no ${edge} fade`)
    }

    return element
  }

  const renderRail = () =>
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.Menu.Item>
                  <Sidebar.Menu.Button>Orders</Sidebar.Menu.Button>
                </Sidebar.Menu.Item>
              </Sidebar.Menu>
            </Sidebar.Group>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.Menu.Item>
                  <Sidebar.Menu.Button>Reports</Sidebar.Menu.Button>
                </Sidebar.Menu.Item>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    )

  it('shows no fade when every group fits', () => {
    renderRail()

    expect(fade('top')).toHaveAttribute('data-state', 'hidden')
    expect(fade('bottom')).toHaveAttribute('data-state', 'hidden')
    expect(fade('bottom').className).toContain('opacity-0')
  })

  it('fades only the bottom edge at the top of a rail that overflows', () => {
    metrics.scrollHeight = 900
    renderRail()

    expect(fade('top')).toHaveAttribute('data-state', 'hidden')
    expect(fade('bottom')).toHaveAttribute('data-state', 'visible')
    expect(fade('bottom').className).toContain('opacity-100')
  })

  it('follows the scroll: both fades midway, only the top fade at the end', () => {
    metrics.scrollHeight = 900
    renderRail()

    metrics.scrollTop = 200
    fireEvent.scroll(scroller())
    // Measured on the next frame, not on the event itself.
    expect(fade('top')).toHaveAttribute('data-state', 'hidden')
    flushFrames()
    expect(fade('top')).toHaveAttribute('data-state', 'visible')
    expect(fade('bottom')).toHaveAttribute('data-state', 'visible')

    metrics.scrollTop = 500
    fireEvent.scroll(scroller())
    flushFrames()
    expect(fade('top')).toHaveAttribute('data-state', 'visible')
    expect(fade('bottom')).toHaveAttribute('data-state', 'hidden')
  })

  it('measures a burst of scroll events once a frame', () => {
    metrics.scrollHeight = 900
    renderRail()

    fireEvent.scroll(scroller())
    fireEvent.scroll(scroller())
    fireEvent.scroll(scroller())

    expect(frames).toHaveLength(1)
  })

  it('re-measures when the rail or a group changes size', () => {
    metrics.scrollHeight = 900
    renderRail()
    expect(fade('bottom')).toHaveAttribute('data-state', 'visible')

    // The scroller and every group in it are watched: a window that grows
    // and a group that opens both land here.
    expect(observed).toContain(scroller())
    expect(observed).toEqual(
      expect.arrayContaining(Array.from(scroller().children)),
    )

    metrics.clientHeight = 900
    act(() => resize?.())
    flushFrames()

    expect(fade('bottom')).toHaveAttribute('data-state', 'hidden')
  })

  it('listens to scroll passively', () => {
    const listen = vi.spyOn(HTMLElement.prototype, 'addEventListener')
    renderRail()

    expect(listen).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    })
  })

  it('is decoration: hidden from assistive tech, never takes a pointer, still under reduced motion', () => {
    renderRail()

    for (const edge of ['top', 'bottom'] as const) {
      expect(fade(edge)).toHaveAttribute('aria-hidden', 'true')
      expect(fade(edge).className).toContain('pointer-events-none')
      expect(fade(edge).className).toContain('motion-reduce:transition-none')
      // The icon rail clips instead of scrolling, so it shows no affordance.
      expect(fade(edge).className).toContain(
        'group-data-[collapsible=icon]:hidden',
      )
    }
    expect(fade('top').className).toContain('bg-linear-to-b')
    expect(fade('bottom').className).toContain('bg-linear-to-t')
  })

  it('keeps the scroller the element the rail scrolls, inside a frame the fades pin to', () => {
    renderRail()

    const frame = scroller().parentElement

    expect(frame).toHaveAttribute('data-slot', 'sidebar-content-frame')
    expect(frame?.className).toContain('relative')
    expect(scroller().className).toContain('overflow-auto')
    expect(scroller()).toHaveAttribute('data-sidebar', 'content')
  })

  it('stops listening once unmounted', () => {
    metrics.scrollHeight = 900
    const { unmount } = renderRail()
    const node = scroller()
    const forget = vi.spyOn(node, 'removeEventListener')

    unmount()

    expect(forget).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

describe('Sidebar disabledReason', () => {
  const reason = 'Ask an admin for access'

  function shell(children: React.ReactNode, { open = true } = {}) {
    return render(
      <Sidebar.Provider defaultOpen={open}>
        <Sidebar collapsible="icon">
          <Sidebar.Group>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>{children}</Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  async function pressEverything(element: HTMLElement) {
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(element, { pointerEventsCheck: 0 })
  }

  it('renders no wrapper and no description without a reason', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Group>
            <Sidebar.Group.Action ariaLabel="Add">
              <svg />
            </Sidebar.Group.Action>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Button>Billing</Sidebar.Menu.Button>
              </Sidebar.Menu.Item>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Collapsible>
                  <Sidebar.Menu.Collapsible.Trigger>
                    Reports
                  </Sidebar.Menu.Collapsible.Trigger>
                </Sidebar.Menu.Collapsible>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('aria-describedby')
    }
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('blocks a Menu.Button that stays in the tab order', async () => {
    const onClick = vi.fn()
    shell(
      <Sidebar.Menu.Button disabledReason={reason} onClick={onClick}>
        Billing
      </Sidebar.Menu.Button>,
    )
    const button = screen.getByRole('button', { name: 'Billing' })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toHaveAttribute('disabled')

    await userEvent.tab()
    expect(button).toHaveFocus()

    await pressEverything(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('opens no menu from a blocked Menu.Button handed to a trigger', async () => {
    shell(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Sidebar.Menu.Button disabledReason={reason}>
            Account
          </Sidebar.Menu.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    const button = screen.getByRole('button', { name: 'Account' })

    await userEvent.tab()
    expect(button).toHaveFocus()

    // One gesture at a time: an Enter that opened the menu and a click that
    // toggled it shut again would otherwise look like nothing happened.
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(button, { pointerEventsCheck: 0 })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('describes a Menu.Button by the reason, after its own details', () => {
    shell(
      <Sidebar.Menu.Button description="ana@acme.com" disabledReason={reason}>
        Ana Souza
      </Sidebar.Menu.Button>,
    )

    expect(
      screen.getByRole('button', { name: 'Ana Souza' }),
    ).toHaveAccessibleDescription(`ana@acme.com ${reason}`)
  })

  it('shows the reason when a Menu.Button takes keyboard focus', async () => {
    shell(
      <Sidebar.Menu.Button disabledReason={reason}>
        Billing
      </Sidebar.Menu.Button>,
    )

    await userEvent.tab()

    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })

  it('lets the reason replace the label tooltip on the collapsed rail', async () => {
    const onClick = vi.fn()
    shell(
      <Sidebar.Menu.Button
        disabledReason={reason}
        onClick={onClick}
        tooltip="Fleet billing"
      >
        <svg aria-hidden="true" />
        <span>Billing</span>
      </Sidebar.Menu.Button>,
      { open: false },
    )
    const button = screen.getByRole('button', { name: 'Fleet billing' })

    expect(button).toHaveAccessibleDescription(reason)
    await userEvent.tab()
    expect(button).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
    expect(screen.queryByText('Fleet billing')).not.toBeInTheDocument()

    await pressEverything(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks a Group.Action that stays in the tab order', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Group>
            <Sidebar.Group.Label>Projects</Sidebar.Group.Label>
            <Sidebar.Group.Action
              ariaLabel="Add project"
              disabledReason={reason}
              onClick={onClick}
            >
              <svg />
            </Sidebar.Group.Action>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )
    const action = screen.getByRole('button', { name: 'Add project' })

    expect(action).toHaveAttribute('aria-disabled', 'true')
    expect(action).not.toHaveAttribute('disabled')
    expect(action).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(action).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await pressEverything(action)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks a Collapsible.Trigger from opening its panel', async () => {
    const onOpenChange = vi.fn()
    shell(
      <Sidebar.Menu.Collapsible onOpenChange={onOpenChange}>
        <Sidebar.Menu.Collapsible.Trigger disabledReason={reason}>
          Reports
        </Sidebar.Menu.Collapsible.Trigger>
        <Sidebar.Menu.Collapsible.Content>
          <Sidebar.Menu.Sub>
            <Sidebar.Menu.Sub.Item>
              <Sidebar.Menu.Sub.Button href="/sales">
                Sales
              </Sidebar.Menu.Sub.Button>
            </Sidebar.Menu.Sub.Item>
          </Sidebar.Menu.Sub>
        </Sidebar.Menu.Collapsible.Content>
      </Sidebar.Menu.Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Reports' })

    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(trigger).not.toHaveAttribute('disabled')
    expect(trigger).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(trigger).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await pressEverything(trigger)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('blocks a Collapsible.Trigger on the collapsed rail, keeping it reachable', async () => {
    shell(
      <Sidebar.Menu.Collapsible>
        <Sidebar.Menu.Collapsible.Trigger
          disabledReason={reason}
          tooltip="Reports"
        >
          <svg aria-hidden="true" />
          <span>Reports</span>
        </Sidebar.Menu.Collapsible.Trigger>
        <Sidebar.Menu.Collapsible.Content>
          <Sidebar.Menu.Sub>
            <Sidebar.Menu.Sub.Item>
              <Sidebar.Menu.Sub.Button href="/sales">
                Sales
              </Sidebar.Menu.Sub.Button>
            </Sidebar.Menu.Sub.Item>
          </Sidebar.Menu.Sub>
        </Sidebar.Menu.Collapsible.Content>
      </Sidebar.Menu.Collapsible>,
      { open: false },
    )
    const trigger = screen.getByRole('button', { name: 'Reports' })

    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(trigger).not.toHaveAttribute('disabled')
    expect(trigger).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(trigger).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await pressEverything(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.queryByText('Sales')).not.toBeInTheDocument()
  })
})

describe('Sidebar disabledReason, edge cases', () => {
  const reason = 'Ask an admin for access'
  /** What a composing parent hands a part through Base UI `render`. */
  const injected = {
    'aria-describedby': 'hint',
  } as object

  function shell(children: React.ReactNode, { open = true } = {}) {
    return render(
      <Sidebar.Provider defaultOpen={open}>
        <Sidebar collapsible="icon">
          <span id="hint">Opens the billing portal</span>
          <Sidebar.Group>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>{children}</Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )
  }

  it('pins only the Group.Action wrapper to the corner, not other blocked controls', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <Sidebar.Group>
            <Sidebar.Group.Action
              ariaLabel="Add project"
              disabledReason={reason}
            >
              <svg />
            </Sidebar.Group.Action>
            <Toggle ariaLabel="Pin" disabledReason={reason}>
              <svg />
            </Toggle>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )
    const group = document.querySelector('[data-slot="sidebar-group"]')
    const [actionWrapper, toggleWrapper] = document.querySelectorAll(
      '[data-slot="disabled-reason"]',
    )

    // jsdom has no layout: the selector the group places with is the claim.
    expect(group?.className).not.toContain('*:data-[slot=disabled-reason]')
    expect(group).toHaveClass(
      '*:data-[reason-slot=sidebar-group-action]:absolute',
    )
    expect(actionWrapper).toHaveAttribute(
      'data-reason-slot',
      'sidebar-group-action',
    )
    expect(toggleWrapper).not.toHaveAttribute('data-reason-slot')
  })

  it('joins the description a composing parent gave a blocked Menu.Button', () => {
    shell(
      <Sidebar.Menu.Button {...injected} disabledReason={reason}>
        Billing
      </Sidebar.Menu.Button>,
    )

    expect(
      screen.getByRole('button', { name: 'Billing' }),
    ).toHaveAccessibleDescription(`Opens the billing portal ${reason}`)
  })

  it('joins the description a composing parent gave a blocked Group.Action', () => {
    render(
      <Sidebar.Provider>
        <Sidebar>
          <span id="hint">Adds a project</span>
          <Sidebar.Group>
            <Sidebar.Group.Action
              {...injected}
              ariaLabel="Add"
              disabledReason={reason}
            >
              <svg />
            </Sidebar.Group.Action>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>,
    )

    expect(
      screen.getByRole('button', { name: 'Add' }),
    ).toHaveAccessibleDescription(`Adds a project ${reason}`)
  })

  it('keeps focus when a reason arrives on a focused rail row with a tooltip', async () => {
    const row = (blocked: boolean) => (
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Group>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Button
                  disabledReason={blocked ? reason : undefined}
                  tooltip="Billing"
                >
                  <svg aria-hidden="true" />
                </Sidebar.Menu.Button>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>
    )
    const { rerender } = render(row(false))
    const billing = () => screen.getByRole('button', { name: 'Billing' })
    billing().focus()
    expect(billing()).toHaveFocus()

    rerender(row(true))

    expect(billing()).toHaveFocus()
    expect(billing()).toHaveAttribute('aria-disabled', 'true')

    rerender(row(false))

    expect(billing()).toHaveFocus()
  })

  it('keeps focus when a reason arrives on a focused rail Collapsible.Trigger', async () => {
    const tree = (blocked: boolean) => (
      <Sidebar.Provider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <Sidebar.Group>
            <Sidebar.Menu>
              <Sidebar.Menu.Item>
                <Sidebar.Menu.Collapsible>
                  <Sidebar.Menu.Collapsible.Trigger
                    disabledReason={blocked ? reason : undefined}
                    tooltip="Reports"
                  >
                    <svg aria-hidden="true" />
                  </Sidebar.Menu.Collapsible.Trigger>
                </Sidebar.Menu.Collapsible>
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar>
      </Sidebar.Provider>
    )
    const { rerender } = render(tree(false))
    const trigger = () => screen.getByRole('button', { name: 'Reports' })
    trigger().focus()
    expect(trigger()).toHaveFocus()

    rerender(tree(true))

    expect(trigger()).toHaveFocus()
    expect(trigger()).toHaveAccessibleDescription(reason)

    rerender(tree(false))

    expect(trigger()).toHaveFocus()
  })

  it('blocks a Menu.Sub.Button: no href, still a focusable link, says why', async () => {
    const onClick = vi.fn()
    shell(
      <Sidebar.Menu.Sub>
        <Sidebar.Menu.Sub.Item>
          <Sidebar.Menu.Sub.Button
            disabledReason={reason}
            href="/sales"
            onClick={onClick}
          >
            Sales
          </Sidebar.Menu.Sub.Button>
        </Sidebar.Menu.Sub.Item>
      </Sidebar.Menu.Sub>,
    )
    const link = screen.getByRole('link', { name: 'Sales' })

    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(link).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.click(link, { pointerEventsCheck: 0 })
    await userEvent.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('drops the href a router Link injects into a blocked Menu.Sub.Button', () => {
    shell(
      <Sidebar.Menu.Sub>
        <Sidebar.Menu.Sub.Item>
          <Sidebar.Menu.Sub.Button
            {...({ href: '/router-sales' } as object)}
            disabledReason={reason}
          >
            Sales
          </Sidebar.Menu.Sub.Button>
        </Sidebar.Menu.Sub.Item>
      </Sidebar.Menu.Sub>,
    )

    expect(screen.getByRole('link', { name: 'Sales' })).not.toHaveAttribute(
      'href',
    )
  })

  it('leaves an unblocked Menu.Sub.Button a plain link', () => {
    shell(
      <Sidebar.Menu.Sub>
        <Sidebar.Menu.Sub.Item>
          <Sidebar.Menu.Sub.Button href="/sales">Sales</Sidebar.Menu.Sub.Button>
        </Sidebar.Menu.Sub.Item>
      </Sidebar.Menu.Sub>,
    )
    const link = screen.getByRole('link', { name: 'Sales' })

    expect(link).toHaveAttribute('href', '/sales')
    expect(link).not.toHaveAttribute('aria-disabled')
    expect(link).not.toHaveAttribute('aria-describedby')
    expect(link).not.toHaveAttribute('tabindex')
  })

  it('blocks a Menu.Action that stays in the tab order, keeping its corner', async () => {
    const onClick = vi.fn()
    shell(
      <>
        <Sidebar.Menu.Button>Team</Sidebar.Menu.Button>
        <Sidebar.Menu.Action
          ariaLabel="Team actions"
          disabledReason={reason}
          onClick={onClick}
        >
          <svg />
        </Sidebar.Menu.Action>
      </>,
    )
    const action = screen.getByRole('button', { name: 'Team actions' })

    expect(action).toHaveAttribute('aria-disabled', 'true')
    expect(action).not.toHaveAttribute('disabled')
    expect(action).toHaveAccessibleDescription(reason)
    expect(action.closest('[data-slot="disabled-reason"]')).toHaveAttribute(
      'data-reason-slot',
      'sidebar-menu-action',
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(action).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)

    await userEvent.keyboard('{Enter}')
    await userEvent.click(action, { pointerEventsCheck: 0 })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('opens no menu from a blocked Menu.Action handed to a trigger', async () => {
    shell(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Sidebar.Menu.Action ariaLabel="Team actions" disabledReason={reason}>
            <svg />
          </Sidebar.Menu.Action>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Invite</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    const action = screen.getByRole('button', { name: 'Team actions' })

    await userEvent.tab()
    expect(action).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await userEvent.click(action, { pointerEventsCheck: 0 })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
