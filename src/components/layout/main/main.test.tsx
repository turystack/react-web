import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Layout } from '../layout'

describe('Layout.Main', () => {
  it('names the main landmark with the id a skip link targets', () => {
    render(
      <Layout skipLinks={[{ href: '#main', label: 'Skip to content' }]}>
        <Layout.Main id="main">
          <Layout.Content>Orders</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    const link = screen.getByRole('link', { name: 'Skip to content' })
    const target = document.querySelector(link.getAttribute('href') ?? '')

    expect(target).toBe(screen.getByRole('main'))
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('carries no id when none is given', () => {
    render(
      <Layout>
        <Layout.Main>
          <Layout.Content>Orders</Layout.Content>
        </Layout.Main>
      </Layout>,
    )

    expect(screen.getByRole('main')).not.toHaveAttribute('id')
  })
})
