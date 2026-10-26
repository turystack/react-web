import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Board } from './board'
import type { BoardColumn, BoardProps } from './board.types'

type Deal = {
  id: string
  name: string
  stage: string
}

const COLUMNS: BoardColumn[] = [
  {
    id: 'lead',
    label: 'Lead',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    summary: 'R$ 12.000',
  },
  {
    id: 'won',
    label: 'Won',
  },
]

const DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Acme',
    stage: 'lead',
  },
  {
    id: 'd2',
    name: 'Globex',
    stage: 'lead',
  },
  {
    id: 'd3',
    name: 'Initech',
    stage: 'proposal',
  },
  {
    id: 'd4',
    name: 'Hooli',
    stage: 'nowhere',
  },
]

function renderBoard(overrides: Partial<BoardProps<Deal>> = {}) {
  return render(
    <Board
      columnOf={(deal) => deal.stage}
      columns={COLUMNS}
      itemKey="id"
      items={DEALS}
      renderCard={(deal) => <span>{deal.name}</span>}
      {...overrides}
    />,
  )
}

function column(name: string) {
  return screen.getByRole('group', {
    name,
  })
}

function card(name: string) {
  const text = screen.getByText(name)
  const element = text.closest('[data-board-card]')

  if (!(element instanceof HTMLElement)) {
    throw new Error(`no card for ${name}`)
  }

  return element
}

function live() {
  return screen.getByTestId('board-live')
}

/** A board that applies every move, the way a consumer would. */
function MovingBoard({ onMove }: { onMove: BoardProps<Deal>['onMove'] }) {
  const [deals, setDeals] = useState(DEALS.slice(0, 3))

  return (
    <Board
      columnOf={(deal) => deal.stage}
      columns={COLUMNS}
      itemKey="id"
      items={deals}
      onMove={(id, stage, index) => {
        onMove?.(id, stage, index)
        setDeals((current) => {
          const moving = current.find((deal) => deal.id === id)

          if (!moving) {
            return current
          }

          const rest = current.filter((deal) => deal.id !== id)
          const inStage = rest.filter((deal) => deal.stage === stage)
          const before = inStage[index]
          const next = {
            ...moving,
            stage,
          }
          const at = before ? rest.indexOf(before) : rest.length

          return [...rest.slice(0, at), next, ...rest.slice(at)]
        })
      }}
      renderCard={(deal) => <span>{deal.name}</span>}
    />
  )
}

describe('Board', () => {
  it('draws one named group per column with its cards in order', () => {
    renderBoard()

    const lead = column('Lead')
    expect(lead.tagName).toBe('FIELDSET')
    expect(lead).not.toHaveAttribute('role')

    expect(
      within(lead)
        .getAllByTestId('board-card')
        .map((element) => element.textContent),
    ).toEqual(['Acme', 'Globex'])
    expect(within(column('Proposal')).getByText('Initech')).toBeInTheDocument()
    expect(within(column('Won')).queryAllByTestId('board-card')).toHaveLength(0)
  })

  it('counts the cards of every column and shows the summary', () => {
    renderBoard()

    expect(
      screen
        .getAllByTestId('board-column-count')
        .map((element) => element.textContent),
    ).toEqual(['2', '1', '0'])
    expect(
      within(column('Proposal')).getByTestId('board-column-summary'),
    ).toHaveTextContent('R$ 12.000')
  })

  it('leaves out an item whose column does not exist', () => {
    renderBoard()

    expect(screen.queryByText('Hooli')).not.toBeInTheDocument()
  })

  it('reads the key through a function too', () => {
    const onMove = vi.fn()

    renderBoard({
      itemKey: (deal) => `deal-${deal.id}`,
      onMove,
    })

    expect(card('Acme')).toHaveAttribute('data-board-card', 'deal-d1')
  })

  it('is a named region only when ariaLabel is given', () => {
    const { unmount } = renderBoard()

    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    unmount()

    renderBoard({
      ariaLabel: 'Pipeline',
    })

    expect(
      screen.getByRole('region', {
        name: 'Pipeline',
      }),
    ).toBeInTheDocument()
  })

  it('applies the column width preset, md by default', () => {
    const { unmount } = renderBoard()

    expect(screen.getAllByTestId('board-column')[0]).toHaveClass('w-72')
    unmount()

    renderBoard({
      columnWidth: 'sm',
    })

    expect(screen.getAllByTestId('board-column')[0]).toHaveClass('w-64')
  })

  describe('add', () => {
    it('shows no add button without onAdd', () => {
      renderBoard()

      expect(screen.queryByTestId('board-add')).not.toBeInTheDocument()
    })

    it('names each add button after its column and reports the column id', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()

      renderBoard({
        onAdd,
      })

      await user.click(
        screen.getByRole('button', {
          name: 'Add Proposal',
        }),
      )

      expect(onAdd).toHaveBeenCalledWith('proposal')
      expect(screen.getAllByTestId('board-add')).toHaveLength(3)
    })

    it('lets addLabel replace the word', () => {
      renderBoard({
        addLabel: 'New deal',
        onAdd: vi.fn(),
      })

      expect(
        screen.getByRole('button', {
          name: 'New deal Won',
        }),
      ).toBeInTheDocument()
    })
  })

  describe('keyboard move', () => {
    it('makes cards tab stops described by the instructions only with onMove', () => {
      const { unmount } = renderBoard()

      expect(card('Acme')).not.toHaveAttribute('tabindex')
      expect(card('Acme')).not.toHaveAttribute('draggable')
      unmount()

      renderBoard({
        onMove: vi.fn(),
      })

      expect(card('Acme')).toHaveAttribute('tabindex', '0')
      expect(card('Acme')).toHaveAttribute('draggable', 'true')
      expect(card('Acme')).toHaveAccessibleDescription(
        'Press Space to pick up. Use the arrow keys to move, Space to drop, Escape to cancel.',
      )
    })

    it('picks up, moves across a column and down, and drops with onMove args', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Acme').focus()
      await user.keyboard(' ')

      expect(card('Acme')).toHaveAttribute('data-state', 'lifted')
      expect(live()).toHaveTextContent('Picked up in Lead, position 1 of 2.')

      await user.keyboard('{ArrowRight}')

      expect(within(column('Proposal')).getByText('Acme')).toBeInTheDocument()
      expect(card('Acme')).toHaveFocus()
      expect(live()).toHaveTextContent('Proposal, position 1 of 2.')
      // The counts follow the card the reader is holding.
      expect(
        screen
          .getAllByTestId('board-column-count')
          .map((element) => element.textContent),
      ).toEqual(['1', '2', '0'])

      await user.keyboard('{ArrowDown}')

      expect(live()).toHaveTextContent('Proposal, position 2 of 2.')

      // The last slot is the end of the column: one more press stays there.
      await user.keyboard('{ArrowDown}')
      expect(live()).toHaveTextContent('Proposal, position 2 of 2.')

      await user.keyboard(' ')

      expect(onMove).toHaveBeenCalledTimes(1)
      expect(onMove).toHaveBeenCalledWith('d1', 'proposal', 1)
      expect(live()).toHaveTextContent('Dropped in Proposal, position 2 of 2.')
      expect(card('Acme')).not.toHaveAttribute('data-state')
    })

    it('moves within the column with the up arrow and Enter drops', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Globex').focus()
      await user.keyboard('{Enter}{ArrowUp}{Enter}')

      expect(onMove).toHaveBeenCalledWith('d2', 'lead', 0)
    })

    it('does not leave the first or last column', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Acme').focus()
      await user.keyboard(' {ArrowLeft}')

      expect(live()).toHaveTextContent('Picked up in Lead, position 1 of 2.')

      await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

      expect(within(column('Won')).getByText('Acme')).toBeInTheDocument()
      expect(live()).toHaveTextContent('Won, position 1 of 1.')

      await user.keyboard(' ')

      expect(onMove).toHaveBeenCalledWith('d1', 'won', 0)
    })

    it('Escape puts the card back and announces it without a move', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Acme').focus()
      await user.keyboard(' {ArrowRight}{Escape}')

      expect(within(column('Lead')).getByText('Acme')).toBeInTheDocument()
      expect(card('Acme')).toHaveFocus()
      expect(onMove).not.toHaveBeenCalled()
      expect(live()).toHaveTextContent(
        'Move cancelled. The card is back where it started.',
      )
    })

    it('dropping where it started asks for nothing', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Acme').focus()
      await user.keyboard(' {ArrowDown}{ArrowUp} ')

      expect(onMove).not.toHaveBeenCalled()
    })

    it('tabbing away from a lifted card puts it back', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      card('Acme').focus()
      await user.keyboard(' {ArrowRight}')
      await user.tab()
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(within(column('Lead')).getByText('Acme')).toBeInTheDocument()
      expect(live()).toHaveTextContent('Move cancelled.')
      expect(onMove).not.toHaveBeenCalled()
    })

    it('ignores keys pressed on a control inside the card', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      renderBoard({
        onMove,
        renderCard: (deal) => <button type="button">{deal.name}</button>,
      })

      screen
        .getByRole('button', {
          name: 'Acme',
        })
        .focus()
      await user.keyboard(' ')

      expect(card('Acme')).not.toHaveAttribute('data-state')
    })

    it('does nothing by keyboard without onMove', () => {
      renderBoard()

      fireEvent.keyDown(card('Acme'), {
        key: ' ',
      })

      expect(card('Acme')).not.toHaveAttribute('data-state')
    })

    it('keeps focus on the card once the consumer applies the move', async () => {
      const user = userEvent.setup()
      const onMove = vi.fn()

      render(<MovingBoard onMove={onMove} />)

      card('Globex').focus()
      await user.keyboard(' {ArrowRight}{ArrowDown} ')

      expect(onMove).toHaveBeenCalledWith('d2', 'proposal', 1)
      expect(
        within(column('Proposal'))
          .getAllByTestId('board-card')
          .map((element) => element.textContent),
      ).toEqual(['Initech', 'Globex'])
      expect(card('Globex')).toHaveFocus()
      expect(
        screen
          .getAllByTestId('board-column-count')
          .map((element) => element.textContent),
      ).toEqual(['1', '2', '0'])
    })
  })

  describe('pointer drag and drop', () => {
    /** jsdom has no DragEvent, so the pointer's height is set by hand. */
    function dragAt(
      kind: 'dragOver' | 'drop',
      target: HTMLElement,
      clientY: number,
    ) {
      const event = createEvent[kind](target, {
        dataTransfer: dataTransfer(),
      })

      Object.defineProperty(event, 'clientY', {
        value: clientY,
      })
      fireEvent(target, event)
    }

    function dataTransfer() {
      return {
        dropEffect: 'none',
        effectAllowed: 'all',
        setData: vi.fn(),
      }
    }

    it('drops a dragged card at the end of another column', () => {
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      const transfer = dataTransfer()

      fireEvent.dragStart(card('Acme'), {
        dataTransfer: transfer,
      })

      expect(transfer.setData).toHaveBeenCalledWith('text/plain', 'd1')
      expect(card('Acme')).toHaveClass('opacity-50')

      // jsdom lays nothing out, so every card's middle is at 0 and a pointer
      // below it lands after the last card.
      dragAt('dragOver', column('Proposal'), 100)

      expect(column('Proposal')).toHaveClass('border-primary')
      expect(
        within(column('Proposal')).getByTestId('board-drop-indicator'),
      ).toBeInTheDocument()

      dragAt('drop', column('Proposal'), 100)

      expect(onMove).toHaveBeenCalledWith('d1', 'proposal', 1)
      expect(
        screen.queryByTestId('board-drop-indicator'),
      ).not.toBeInTheDocument()
    })

    it('drops before the first card when the pointer is above its middle', () => {
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      fireEvent.dragStart(card('Initech'), {
        dataTransfer: dataTransfer(),
      })
      dragAt('dragOver', column('Lead'), -10)

      expect(
        within(column('Lead')).getAllByRole('listitem', {
          hidden: true,
        })[0],
      ).toHaveAttribute('data-testid', 'board-drop-indicator')

      dragAt('drop', column('Lead'), -10)

      expect(onMove).toHaveBeenCalledWith('d3', 'lead', 0)
    })

    it('ignores a drop that started nowhere on the board', () => {
      const onMove = vi.fn()

      renderBoard({
        onMove,
      })

      fireEvent.drop(column('Won'), {
        dataTransfer: dataTransfer(),
      })

      expect(onMove).not.toHaveBeenCalled()
    })

    it('clears the drag when it ends outside a column', () => {
      renderBoard({
        onMove: vi.fn(),
      })

      fireEvent.dragStart(card('Acme'), {
        dataTransfer: dataTransfer(),
      })
      fireEvent.dragEnd(card('Acme'))

      expect(card('Acme')).not.toHaveClass('opacity-50')
    })
  })
})

describe('Board edge fades', () => {
  const metrics = {
    clientWidth: 600,
    scrollLeft: 0,
    scrollWidth: 600,
  }
  let frames: FrameRequestCallback[] = []
  let resize: (() => void) | null = null
  const OriginalResizeObserver = globalThis.ResizeObserver

  const isViewport = (element: Element) =>
    element.getAttribute('data-testid') === 'board-viewport'

  beforeEach(() => {
    metrics.clientWidth = 600
    metrics.scrollLeft = 0
    metrics.scrollWidth = 600
    frames = []
    resize = null

    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(
      function (this: Element) {
        return isViewport(this) ? metrics.clientWidth : 0
      },
    )
    vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(
      function (this: Element) {
        return isViewport(this) ? metrics.scrollWidth : 0
      },
    )
    vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockImplementation(
      function (this: Element) {
        return isViewport(this) ? metrics.scrollLeft : 0
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
      observe() {}
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

  const fade = (edge: 'start' | 'end') => {
    const element = screen
      .getAllByTestId('board-fade')
      .find((node) => node.getAttribute('data-edge') === edge)

    if (!element) {
      throw new Error(`no ${edge} fade`)
    }

    return element
  }

  const renderWide = () =>
    render(
      <Board
        columnOf={(deal: Deal) => deal.stage}
        columns={COLUMNS}
        itemKey="id"
        items={DEALS}
        renderCard={(deal) => deal.name}
      />,
    )

  it('shows no fade when every column fits', () => {
    renderWide()

    expect(fade('start')).toHaveAttribute('data-state', 'hidden')
    expect(fade('end')).toHaveAttribute('data-state', 'hidden')
  })

  it('shows only the end fade at the start of an overflowing board', () => {
    metrics.scrollWidth = 1200
    renderWide()

    expect(fade('start')).toHaveAttribute('data-state', 'hidden')
    expect(fade('end')).toHaveAttribute('data-state', 'visible')
  })

  it('follows the scroll: both fades midway, only the start fade at the end', () => {
    metrics.scrollWidth = 1200
    renderWide()
    const viewport = screen.getByTestId('board-viewport')

    metrics.scrollLeft = 300
    fireEvent.scroll(viewport)
    // Measured on the next frame, not on the event itself.
    expect(fade('start')).toHaveAttribute('data-state', 'hidden')
    flushFrames()
    expect(fade('start')).toHaveAttribute('data-state', 'visible')
    expect(fade('end')).toHaveAttribute('data-state', 'visible')

    metrics.scrollLeft = 600
    fireEvent.scroll(viewport)
    flushFrames()
    expect(fade('start')).toHaveAttribute('data-state', 'visible')
    expect(fade('end')).toHaveAttribute('data-state', 'hidden')
  })

  it('measures a burst of scroll events once a frame', () => {
    metrics.scrollWidth = 1200
    renderWide()
    const viewport = screen.getByTestId('board-viewport')

    fireEvent.scroll(viewport)
    fireEvent.scroll(viewport)
    fireEvent.scroll(viewport)

    expect(frames).toHaveLength(1)
  })

  it('reads a right-to-left scroll offset by its magnitude', () => {
    metrics.scrollWidth = 1200
    renderWide()

    metrics.scrollLeft = -600
    fireEvent.scroll(screen.getByTestId('board-viewport'))
    flushFrames()

    expect(fade('start')).toHaveAttribute('data-state', 'visible')
    expect(fade('end')).toHaveAttribute('data-state', 'hidden')
  })

  it('re-measures when the board is resized', () => {
    metrics.scrollWidth = 1200
    renderWide()
    expect(fade('end')).toHaveAttribute('data-state', 'visible')

    metrics.clientWidth = 1200
    act(() => resize?.())
    flushFrames()

    expect(fade('end')).toHaveAttribute('data-state', 'hidden')
  })

  it('listens to scroll passively', () => {
    const listen = vi.spyOn(HTMLElement.prototype, 'addEventListener')
    renderWide()

    const viewport = screen.getByTestId('board-viewport')
    const call = listen.mock.calls.find(
      ([type], index) =>
        type === 'scroll' && listen.mock.contexts[index] === viewport,
    )

    expect(call?.[2]).toEqual({
      passive: true,
    })
  })

  it('keeps the fades out of the accessibility tree and out of the pointer path', () => {
    metrics.scrollWidth = 1200
    renderWide()

    for (const element of screen.getAllByTestId('board-fade')) {
      expect(element).toHaveAttribute('aria-hidden', 'true')
      expect(element).toHaveClass(
        'board-fade',
        'pointer-events-none',
        'motion-reduce:transition-none',
      )
    }
    expect(fade('start')).toHaveClass('start-0', 'opacity-0')
    expect(fade('end')).toHaveClass('end-0', 'opacity-100')
  })
})
