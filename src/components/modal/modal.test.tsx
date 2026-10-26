import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Modal } from './modal'

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal open={false}>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  it('stays closed when no open state is given', () => {
    render(
      <Modal>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows its content in a dialog while open', () => {
    render(
      <Modal open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveTextContent('Body')
  })

  it('names and describes the dialog from the header', () => {
    render(
      <Modal open>
        <Modal.Header>
          <Modal.Header.Title>Edit profile</Modal.Header.Title>
          <Modal.Header.Description>Update your info</Modal.Header.Description>
        </Modal.Header>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAccessibleDescription('Update your info')
  })

  it('delivers false when the user presses Escape', async () => {
    const onChange = vi.fn()
    render(
      <Modal onChange={onChange} open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    await userEvent.keyboard('{Escape}')

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('delivers false when the user clicks the backdrop', async () => {
    const onChange = vi.fn()
    render(
      <Modal onChange={onChange} open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    await userEvent.click(screen.getByTestId('modal-backdrop'))

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('does not close when the click lands inside the popup', async () => {
    const onChange = vi.fn()
    render(
      <Modal onChange={onChange} open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    await userEvent.click(screen.getByText('Body'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Modal.Header', () => {
  it('offers a close button that delivers false when closable', async () => {
    const onChange = vi.fn()
    render(
      <Modal onChange={onChange} open>
        <Modal.Header closable>
          <Modal.Header.Title>Edit profile</Modal.Header.Title>
        </Modal.Header>
      </Modal>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('offers no close button by default', () => {
    render(
      <Modal open>
        <Modal.Header>
          <Modal.Header.Title>Edit profile</Modal.Header.Title>
        </Modal.Header>
      </Modal>,
    )

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })
})

describe.each([true, false, undefined])('Modal bordered %s', (bordered) => {
  it('keeps the header, body and footer content readable', () => {
    render(
      <Modal open>
        <Modal.Header bordered={bordered} closable>
          <Modal.Header.Title>Edit profile</Modal.Header.Title>
          <Modal.Header.Description>Update your info</Modal.Header.Description>
        </Modal.Header>
        <Modal.Body>Body</Modal.Body>
        <Modal.Footer bordered={bordered}>Footer</Modal.Footer>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveTextContent('Update your info')
    expect(dialog).toHaveTextContent('Body')
    expect(dialog).toHaveTextContent('Footer')
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled()
  })
})

describe.each(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
  'Modal size %s',
  (size) => {
    it('still opens a dialog holding its content', () => {
      render(
        <Modal open size={size}>
          <Modal.Body>Body</Modal.Body>
        </Modal>,
      )

      expect(screen.getByRole('dialog')).toHaveTextContent('Body')
    })
  },
)

describe('Modal inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the dialog inside the named container', () => {
    render(
      <TuryProvider portalContainer={container}>
        <Modal open>
          <Modal.Body>Body</Modal.Body>
        </Modal>
      </TuryProvider>,
    )

    expect(container).toContainElement(screen.getByRole('dialog'))
  })

  it('leaves the dialog on the body when no container is named', () => {
    render(
      <TuryProvider>
        <Modal open>
          <Modal.Body>Body</Modal.Body>
        </Modal>
      </TuryProvider>,
    )

    expect(container).not.toContainElement(screen.getByRole('dialog'))
  })
})

describe('Modal scrim', () => {
  it('dims the page with the shared overlay token, blurred', () => {
    render(
      <Modal open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    expect(backdrop).toHaveClass('bg-overlay', 'backdrop-blur-overlay')
    expect(backdrop.className).not.toMatch(/bg-black/)
  })
})

describe('the overlay token every scrim paints with', () => {
  // Read from disk, not imported: vitest hands a stylesheet import back empty.
  // The built-in is named through a variable because this program is typed
  // for the browser and does not load node's types.
  const nodeFs = 'node:fs'
  let stylesheet = ''

  beforeAll(async () => {
    const fs: { readFileSync(path: string, encoding: 'utf8'): string } =
      await import(/* @vite-ignore */ nodeFs)
    stylesheet = fs.readFileSync(
      new URL('../../index.css', `file://${expect.getState().testPath}`)
        .pathname,
      'utf8',
    )
  })

  function block(selector: string) {
    const start = stylesheet.indexOf(`${selector} {`)
    expect(start).toBeGreaterThanOrEqual(0)

    return stylesheet.slice(start, stylesheet.indexOf('\n}', start))
  }

  function alpha(declarations: string) {
    const match = declarations.match(/--overlay:\s*oklch\(0 0 0 \/ (\d+)%\)/)
    expect(match).not.toBeNull()

    return Number(match?.[1])
  }

  it('is declared for the light scheme with its blur', () => {
    const light = block(':root')

    expect(alpha(light)).toBe(50)
    expect(light).toMatch(/--overlay-blur:\s*8px;/)
  })

  it('is darker in the dark scheme, where a black veil barely shows', () => {
    expect(alpha(block('.dark'))).toBe(70)
    expect(alpha(block('.dark'))).toBeGreaterThan(alpha(block(':root')))
  })

  it('is mapped into the theme as bg-overlay and backdrop-blur-overlay', () => {
    const theme = block('@theme inline')

    expect(theme).toMatch(/--color-overlay:\s*var\(--overlay\);/)
    expect(theme).toMatch(/--blur-overlay:\s*var\(--overlay-blur\);/)
  })
})

describe('Modal axes', () => {
  it('publishes its default size on the popup for a theme to select', () => {
    render(
      <Modal open>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    expect(screen.getByTestId('modal-popup')).toHaveAttribute('data-size', 'md')
  })

  it('publishes the size it was given', () => {
    render(
      <Modal open size="full">
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )

    expect(screen.getByTestId('modal-popup')).toHaveAttribute(
      'data-size',
      'full',
    )
  })
})
