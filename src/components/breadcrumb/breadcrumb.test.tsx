import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('names the navigation landmark it renders', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>,
    )

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' }),
    ).toBeInTheDocument()
  })

  it('renders the trail as a list of items', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>,
    )

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('marks the page as the current location', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>,
    )

    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page')
  })

  it('navigates through the link href', () => {
    render(
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/settings">Settings</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>,
    )

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('renders a link without an href when none is given', () => {
    render(<Breadcrumb.Link>Settings</Breadcrumb.Link>)

    expect(screen.getByTestId('breadcrumb-link')).not.toHaveAttribute('href')
  })

  it('projects the link onto the child under asChild', async () => {
    const onClick = vi.fn()
    render(
      <Breadcrumb.Link asChild>
        <button onClick={onClick} type="button">
          Settings
        </button>
      </Breadcrumb.Link>,
    )

    const trigger = screen.getByRole('button', { name: 'Settings' })
    expect(trigger).toHaveAttribute('data-testid', 'breadcrumb-link')

    await userEvent.click(trigger)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the child once, not wrapped in an anchor of its own', () => {
    render(
      <Breadcrumb.Link asChild>
        <a href="/settings">Settings</a>
      </Breadcrumb.Link>,
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('falls back to an anchor when asChild has no element child', () => {
    render(
      <Breadcrumb.Link asChild href="/settings">
        Settings
      </Breadcrumb.Link>,
    )

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('hides the default separator from assistive technology', () => {
    render(<Breadcrumb.Separator />)

    const separator = screen.getByTestId('breadcrumb-separator')
    expect(separator).toHaveAttribute('aria-hidden', 'true')
    expect(separator).toHaveAttribute('role', 'presentation')
    expect(separator).not.toBeEmptyDOMElement()
  })

  it('replaces the separator glyph with the one given', () => {
    render(<Breadcrumb.Separator>/</Breadcrumb.Separator>)

    expect(screen.getByTestId('breadcrumb-separator')).toHaveTextContent('/')
  })

  it('announces the collapsed items behind the ellipsis', () => {
    render(<Breadcrumb.Ellipsis />)

    expect(screen.getByRole('img', { name: 'More' })).toHaveAttribute(
      'data-testid',
      'breadcrumb-ellipsis',
    )
  })

  it('keeps the class the child brought under asChild', () => {
    render(
      <Breadcrumb.Link asChild>
        <a className="router-link" href="/settings">
          Settings
        </a>
      </Breadcrumb.Link>,
    )

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveClass(
      'router-link',
    )
  })
})
