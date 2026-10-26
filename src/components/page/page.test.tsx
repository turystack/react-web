import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Page } from './page'

describe('Page', () => {
  it('stacks the header, the toolbar and the content it is given', () => {
    render(
      <Page>
        <Page.Header title="Orders" />
        <Page.Toolbar>filters</Page.Toolbar>
        <Page.Content>the table</Page.Content>
      </Page>,
    )

    expect(screen.getByTestId('page-root')).toBeInTheDocument()
    expect(screen.getByTestId('page-toolbar')).toHaveTextContent('filters')
    expect(screen.getByTestId('page-content')).toHaveTextContent('the table')
  })

  it('renders no main landmark of its own', () => {
    render(
      <main>
        <Page>
          <Page.Header title="Orders" />
        </Page>
      </main>,
    )

    // Layout.Main is already the landmark; a page inside it is a section of
    // that main, and a second <main> is one landmark too many.
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})

describe('Page anchors', () => {
  it('lets an in-page link land on the header, the toolbar and each content block', () => {
    render(
      <Page>
        <Page.Header id="top" title="Orders" />
        <Page.Toolbar id="filters">Filters</Page.Toolbar>
        <Page.Content id="summary">Summary</Page.Content>
        <Page.Content id="activity">Activity</Page.Content>
      </Page>,
    )

    expect(document.getElementById('top')).toBe(
      screen.getByTestId('page-header'),
    )
    expect(document.getElementById('filters')).toBe(
      screen.getByTestId('page-toolbar'),
    )
    expect(document.getElementById('summary')).toHaveTextContent('Summary')
    expect(document.getElementById('activity')).toHaveTextContent('Activity')
  })

  it('renders no id on a part that was not given one', () => {
    render(
      <Page>
        <Page.Header title="Orders" />
        <Page.Toolbar>Filters</Page.Toolbar>
        <Page.Content>Summary</Page.Content>
      </Page>,
    )

    expect(screen.getByTestId('page-header')).not.toHaveAttribute('id')
    expect(screen.getByTestId('page-toolbar')).not.toHaveAttribute('id')
    expect(screen.getByTestId('page-content')).not.toHaveAttribute('id')
  })
})

describe('Page.Header', () => {
  it('names the page as its heading', () => {
    render(<Page.Header title="Orders" />)

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument()
  })

  it('carries the description, the icon and the action it is given', () => {
    render(
      <Page.Header
        action={<button type="button">New order</button>}
        description="Every order, across every channel."
        icon={<span data-testid="mark">•</span>}
        title="Orders"
      />,
    )

    expect(
      screen.getByText('Every order, across every channel.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('mark')).toBeInTheDocument()
    expect(
      within(screen.getByTestId('page-header-action')).getByRole('button', {
        name: 'New order',
      }),
    ).toBeEnabled()
  })

  it('leaves out what it was not given', () => {
    render(<Page.Header title="Orders" />)

    expect(screen.queryByTestId('page-header-action')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders the trail, and the last step as the current page', () => {
    render(
      <Page.Header
        breadcrumbs={[
          { href: '/orders', label: 'Orders' },
          { label: 'Order #1042' },
        ]}
        title="Order #1042"
      />,
    )

    const trail = screen.getByRole('navigation')

    // The last step is where the reader already is: a link to here is a
    // control that does nothing, and assistive tech announces it as one.
    expect(within(trail).getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/orders',
    )
    expect(
      within(trail).queryByRole('link', { name: 'Order #1042' }),
    ).not.toBeInTheDocument()
  })

  it('puts one separator between every two crumbs, never inside one', () => {
    render(
      <Page.Header
        breadcrumbs={[
          {
            href: '/operations',
            label: 'Operations',
          },
          {
            // No link, and not the last: it used to lose the separator after it.
            label: 'Sales',
          },
          {
            label: 'Orders',
          },
        ]}
        title="Orders"
      />,
    )

    // A separator is an <li> of its own. Inside an item's <li> it is invalid
    // HTML, which React reported on every render of every page with a trail.
    expect(document.querySelectorAll('li li')).toHaveLength(0)
    expect(screen.getAllByTestId('breadcrumb-separator')).toHaveLength(2)
    expect(screen.getAllByTestId('breadcrumb-item')).toHaveLength(3)
  })

  it('renders no trail for an empty list', () => {
    render(<Page.Header breadcrumbs={[]} title="Dashboard" />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('lets the action wrap under the title instead of squeezing it', () => {
    render(
      <Page.Header
        action={<button type="button">New order</button>}
        description="Every order, across every channel."
        title="Orders"
      />,
    )

    const row = screen.getByTestId('page-header-main')
    const identity = screen.getByTestId('page-header-identity')

    // The row wraps; the title block keeps a 16rem basis and grows, so the
    // action leaves the line before the title gets narrower than that.
    expect(row.className).toContain('flex-wrap')
    expect(identity.className).toContain('basis-64')
    expect(identity.className).toContain('grow')
    expect(identity.className).toContain('min-w-0')
    // The action never shrinks, so it is the one that moves.
    expect(screen.getByTestId('page-header-action').className).toContain(
      'shrink-0',
    )
    expect(row.firstElementChild).toBe(identity)
  })
})
