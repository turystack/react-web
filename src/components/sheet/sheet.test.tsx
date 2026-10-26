import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TuryProvider } from '@/components/tury-provider'

import { Sheet } from './sheet'
import { ComposedSheet } from './sheet.composed'

describe('Sheet', () => {
  it('renders no dialog while closed', () => {
    render(
      <Sheet open={false}>
        <Sheet.Body>Filters</Sheet.Body>
      </Sheet>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('takes its accessible name and description from the header', () => {
    render(
      <Sheet open>
        <Sheet.Header>
          <Sheet.Header.Title>Filters</Sheet.Header.Title>
          <Sheet.Header.Description>
            Narrow the results
          </Sheet.Header.Description>
        </Sheet.Header>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Filters' })
    expect(dialog).toHaveAccessibleDescription('Narrow the results')
  })

  it('reports the closing when the close button is pressed', async () => {
    const onChange = vi.fn()
    render(
      <Sheet onChange={onChange} open>
        <Sheet.Header closable>
          <Sheet.Header.Title>Filters</Sheet.Header.Title>
        </Sheet.Header>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    // The headless dialog appends its own event-detail argument, so the
    // delivered open state is read positionally instead of by whole-call shape.
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('reports the closing when the backdrop is pressed', async () => {
    const onChange = vi.fn()
    render(
      <Sheet onChange={onChange} open>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    await userEvent.click(screen.getByTestId('sheet-backdrop'))

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('reports the closing when Escape is pressed', async () => {
    const onChange = vi.fn()
    render(
      <Sheet onChange={onChange} open>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    await userEvent.keyboard('{Escape}')

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('stays open while open is held true by the consumer', async () => {
    render(
      <Sheet onChange={vi.fn()} open>
        <Sheet.Header closable>
          <Sheet.Header.Title>Filters</Sheet.Header.Title>
        </Sheet.Header>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    await userEvent.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('keeps the sheet open when its own content is clicked', async () => {
    const onChange = vi.fn()
    render(
      <Sheet onChange={onChange} open>
        <Sheet.Body>
          <button type="button">Apply</button>
        </Sheet.Body>
      </Sheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders no close button unless the header is closable', () => {
    render(
      <Sheet open>
        <Sheet.Header>
          <Sheet.Header.Title>Filters</Sheet.Header.Title>
        </Sheet.Header>
      </Sheet>,
    )

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument()
  })

  it('gives the body the minimum height it was asked for', () => {
    render(
      <Sheet open>
        <Sheet.Body minHeight="25rem">filter controls</Sheet.Body>
      </Sheet>,
    )

    expect(screen.getByTestId('sheet-body')).toHaveStyle({
      minHeight: '25rem',
    })
  })

  it('leaves the body height to the layout when none is asked for', () => {
    render(
      <Sheet open>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    expect(screen.getByTestId('sheet-body')).not.toHaveAttribute('style')
  })

  it('keeps the footer actions reachable, bordered or not', () => {
    const { rerender } = render(
      <Sheet open>
        <Sheet.Footer>
          <button type="button">Apply</button>
        </Sheet.Footer>
      </Sheet>,
    )
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()

    rerender(
      <Sheet open>
        <Sheet.Footer bordered>
          <button type="button">Apply</button>
        </Sheet.Footer>
      </Sheet>,
    )
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
  })

  it('keeps the header content reachable when bordered', () => {
    render(
      <Sheet open>
        <Sheet.Header bordered closable>
          <Sheet.Header.Title>Filters</Sheet.Header.Title>
        </Sheet.Header>
      </Sheet>,
    )

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled()
  })
})

describe.each(['top', 'right', 'bottom', 'left'] as const)(
  'Sheet side %s',
  (side) => {
    it('announces the edge it slid in from', () => {
      render(
        <Sheet open side={side}>
          <Sheet.Body>filter controls</Sheet.Body>
        </Sheet>,
      )

      expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side)
    })
  },
)

describe('Sheet side default', () => {
  it('slides in from the right when no side is given', () => {
    render(
      <Sheet open>
        <Sheet.Body>filter controls</Sheet.Body>
      </Sheet>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'right')
  })
})

describe.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)(
  'Sheet size %s',
  (size) => {
    it('stays a reachable dialog', () => {
      render(
        <Sheet open side="left" size={size}>
          <Sheet.Header>
            <Sheet.Header.Title>Filters</Sheet.Header.Title>
          </Sheet.Header>
        </Sheet>,
      )

      expect(
        screen.getByRole('dialog', { name: 'Filters' }),
      ).toBeInTheDocument()
    })
  },
)

describe('Sheet inside a provider that names a portal container', () => {
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
        <Sheet open>
          <Sheet.Body>Filters</Sheet.Body>
        </Sheet>
      </TuryProvider>,
    )

    expect(container).toContainElement(screen.getByRole('dialog'))
  })

  it('leaves the dialog on the body when no container is named', () => {
    render(
      <TuryProvider>
        <Sheet open>
          <Sheet.Body>Filters</Sheet.Body>
        </Sheet>
      </TuryProvider>,
    )

    expect(container).not.toContainElement(screen.getByRole('dialog'))
  })
})

describe('Sheet floating, non-modal', () => {
  it('covers the page with a backdrop while it is modal', () => {
    render(
      <Sheet open>
        <Sheet.Body>panel</Sheet.Body>
      </Sheet>,
    )

    expect(screen.getByTestId('sheet-backdrop')).toBeInTheDocument()
  })

  it('renders no backdrop at all when it is not modal', () => {
    render(
      <Sheet modal={false} open side="bottom" variant="floating">
        <Sheet.Body>bar</Sheet.Body>
      </Sheet>,
    )

    expect(screen.queryByTestId('sheet-backdrop')).not.toBeInTheDocument()
    expect(screen.getByTestId('sheet-popup')).toBeInTheDocument()
  })

  it('sits inset and rounded when it floats', () => {
    render(
      <Sheet modal={false} open side="bottom" variant="floating">
        <Sheet.Body>bar</Sheet.Body>
      </Sheet>,
    )

    const popup = screen.getByTestId('sheet-popup')

    expect(popup).toHaveAttribute('data-variant', 'floating')
    expect(popup.className).toContain('rounded-xl')
    expect(popup.className).toContain('bottom-4')
    expect(popup.className).not.toContain('inset-x-0')
  })

  it('still fills the edge it slid from by default', () => {
    render(
      <Sheet open side="bottom">
        <Sheet.Body>panel</Sheet.Body>
      </Sheet>,
    )

    const popup = screen.getByTestId('sheet-popup')

    expect(popup).toHaveAttribute('data-variant', 'default')
    expect(popup.className).toContain('inset-x-0')
  })

  it('closes on Escape, which a floating bar still answers to', async () => {
    const onChange = vi.fn()

    render(
      <Sheet
        dismissible={false}
        modal={false}
        onChange={onChange}
        open
        side="bottom"
        variant="floating"
      >
        <Sheet.Body>bar</Sheet.Body>
      </Sheet>,
    )

    await userEvent.keyboard('{Escape}')

    expect(onChange).toHaveBeenCalledWith(false)
  })
})

describe('Sheet scrim', () => {
  it('dims the page with the shared overlay token, blurred', () => {
    render(
      <Sheet open>
        <Sheet.Body>panel</Sheet.Body>
      </Sheet>,
    )

    const backdrop = screen.getByTestId('sheet-backdrop')
    expect(backdrop).toHaveClass('bg-overlay', 'backdrop-blur-overlay')
    expect(backdrop.className).not.toMatch(/bg-black/)
  })
})

describe('ComposedSheet finalFocus', () => {
  function Harness({ redirect }: { redirect: boolean }) {
    const [open, setOpen] = useState(false)
    const target = useRef<HTMLButtonElement>(null)

    return (
      <>
        <button onClick={() => setOpen(true)} type="button">
          Open
        </button>
        <button ref={target} type="button">
          Target
        </button>
        <ComposedSheet
          finalFocus={redirect ? target : undefined}
          onChange={setOpen}
          open={open}
        >
          <ComposedSheet.Body>panel</ComposedSheet.Body>
        </ComposedSheet>
      </>
    )
  }

  it('sends focus where the composer says once the sheet closes', async () => {
    const user = userEvent.setup()
    render(<Harness redirect />)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target' })).toHaveFocus(),
    )
  })

  it('returns focus to the control that opened it by default', async () => {
    const user = userEvent.setup()
    render(<Harness redirect={false} />)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus(),
    )
  })
})

describe('Sheet axes', () => {
  it('publishes its default variant, and no size when none was chosen', () => {
    render(
      <Sheet open>
        <Sheet.Body>panel</Sheet.Body>
      </Sheet>,
    )

    const popup = screen.getByTestId('sheet-popup')
    expect(popup).toHaveAttribute('data-variant', 'default')
    expect(popup).not.toHaveAttribute('data-size')
  })

  it('publishes the size and variant it was given', () => {
    render(
      <Sheet open side="left" size="xl" variant="floating">
        <Sheet.Body>panel</Sheet.Body>
      </Sheet>,
    )

    const popup = screen.getByTestId('sheet-popup')
    expect(popup).toHaveAttribute('data-size', 'xl')
    expect(popup).toHaveAttribute('data-variant', 'floating')
  })
})
