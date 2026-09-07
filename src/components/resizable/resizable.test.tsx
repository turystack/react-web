import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Resizable } from './resizable'

function Split(props: Parameters<typeof Resizable>[0] = {}) {
  return (
    <Resizable {...props}>
      <Resizable.Panel defaultSize={30} minSize={20}>
        list
      </Resizable.Panel>
      <Resizable.Handle withGrip />
      <Resizable.Panel>detail</Resizable.Panel>
    </Resizable>
  )
}

describe('Resizable', () => {
  it('renders the panels and the handle between them', () => {
    const { container } = render(<Split />)

    expect(container.querySelectorAll('[data-panel]')).toHaveLength(2)
    expect(container.querySelector('[data-separator]')).toBeInTheDocument()
  })

  it('gives the handle a keyboard role, not just a drag target', () => {
    const { container } = render(<Split />)

    expect(container.querySelector('[data-separator]')).toHaveAttribute(
      'role',
      'separator',
    )
  })

  it('reads its sizes as percentages, never as pixels', () => {
    const { container } = render(<Split />)
    const first = container.querySelector('[data-panel]')

    expect(first?.getAttribute('style') ?? '').toContain('%')
  })

  it('lays out vertically when asked', () => {
    const { container } = render(<Split direction="vertical" />)

    expect(container.querySelector('[data-group]')).toHaveAttribute(
      'data-panel-group-direction',
      'vertical',
    )
  })

  it('starts from the layout the app stored', () => {
    const { container } = render(
      <Resizable
        defaultLayout={{
          list: 25,
        }}
      >
        <Resizable.Panel id="list">list</Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel id="detail">detail</Resizable.Panel>
      </Resizable>,
    )

    expect(container.querySelector('[data-panel]')).toBeInTheDocument()
  })

  it('pins the panels when the handle is disabled', () => {
    const { container } = render(
      <Resizable>
        <Resizable.Panel>list</Resizable.Panel>
        <Resizable.Handle disabled />
        <Resizable.Panel>detail</Resizable.Panel>
      </Resizable>,
    )

    expect(container.querySelector('[data-separator]')).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
