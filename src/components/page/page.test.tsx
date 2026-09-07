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

  it('renders no trail for an empty list', () => {
    render(<Page.Header breadcrumbs={[]} title="Dashboard" />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
