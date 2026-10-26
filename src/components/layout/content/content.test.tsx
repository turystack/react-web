import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Layout } from '../layout'

describe('Layout.Content', () => {
  it('puts the id on the scrolling pane, so a skip link lands on one pane of a split', () => {
    render(
      <Layout skipLinks={[{ href: '#form', label: 'Skip to form' }]}>
        <Layout.Main>
          <Layout.Content bg="gradient">Brand</Layout.Content>
          <Layout.Content id="form">Sign in</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const link = screen.getByRole('link', { name: 'Skip to form' })
    const target = document.querySelector(link.getAttribute('href') ?? '')
    const [brand, form] = screen.getAllByTestId('layout-content')

    expect(target).toBe(form)
    expect(form).toHaveTextContent('Sign in')
    expect(brand).not.toHaveAttribute('id')
    expect(screen.getByRole('main')).not.toHaveAttribute('id')
  })

  it('carries no id when none is given', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content>Orders</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByTestId('layout-content')).not.toHaveAttribute('id')
  })
})
