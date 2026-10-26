import {
  type DragEvent,
  type FocusEvent,
  Fragment,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { ComposedButton } from '@/components/button/button.composed'
import { useLabels } from '@/components/labels-provider'
import { Plus } from '@/internal/icons'

import type { BoardItemKey, BoardProps } from './board.types'

export const styles = tv({
  defaultVariants: {
    columnWidth: 'md',
  },
  slots: {
    add: 'board-add',
    card: 'board-card min-w-0 rounded-md outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50',
    column:
      'board-column m-0 flex max-h-full min-w-0 shrink-0 flex-col gap-2 rounded-lg border border-border bg-muted/40 p-2 transition-colors',
    // Shown on a side only while more columns lie past it. Painted over the
    // scroller from the frame, so it stays put while the columns move under it;
    // it never takes a pointer and is decoration only.
    fade: 'board-fade pointer-events-none absolute inset-y-0 z-10 w-10 from-background to-transparent transition-opacity duration-200 motion-reduce:transition-none',
    columnCount:
      'board-column-count shrink-0 rounded-full bg-muted px-2 text-muted-foreground text-xs tabular-nums',
    columnHeader: 'board-column-header flex flex-col gap-0.5 px-1 pt-1',
    columnHeading: 'board-column-heading flex min-w-0 items-center gap-2',
    dropIndicator:
      'board-drop-indicator h-0.5 shrink-0 rounded-full bg-primary',
    instructions: 'board-instructions sr-only',
    columnList:
      'board-column-list flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto',
    live: 'board-live sr-only',
    root: 'board relative w-full min-w-0',
    columnSummary: 'board-column-summary text-muted-foreground text-xs',
    columnTitle:
      'board-column-title min-w-0 truncate font-medium text-foreground text-sm',
    viewport:
      'board-viewport flex w-full min-w-0 items-start gap-3 overflow-x-auto pb-2',
  },
  variants: {
    columnWidth: {
      lg: {
        column: 'w-80',
      },
      md: {
        column: 'w-72',
      },
      sm: {
        column: 'w-64',
      },
    },
    edge: {
      end: {
        fade: 'end-0 bg-linear-to-l rtl:bg-linear-to-r',
      },
      start: {
        fade: 'start-0 bg-linear-to-r rtl:bg-linear-to-l',
      },
    },
    dragging: {
      true: {
        card: 'opacity-50',
      },
    },
    lifted: {
      true: {
        card: 'shadow-lg ring-2 ring-primary',
      },
    },
    movable: {
      true: {
        card: 'cursor-grab active:cursor-grabbing',
      },
    },
    visible: {
      false: {
        fade: 'opacity-0',
      },
      true: {
        fade: 'opacity-100',
      },
    },
    over: {
      true: {
        column: 'border-primary',
      },
    },
  },
})

/** Where a card is, or asks to be: a column by position and an index in it. */
type BoardSpot = {
  column: number
  index: number
}

/** A card picked up by keyboard: where it started and where it hovers now. */
type BoardLift = BoardSpot & {
  from: BoardSpot
  key: string
}

function readKey<T>(item: T, itemKey: BoardItemKey<T>): string {
  return String(
    typeof itemKey === 'function' ? itemKey(item) : item[itemKey as keyof T],
  )
}

/** Which sides of the scroller have more columns past them. */
type BoardEdges = {
  end: boolean
  start: boolean
}

/**
 * Tracks whether the board can scroll toward either edge. Measured once on
 * mount, then on scroll (passive) and on resize, at most once a frame. In a
 * right-to-left page `scrollLeft` runs negative from the start edge, so its
 * magnitude is what counts.
 */
function useScrollEdges(deps: readonly unknown[]) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = useState<BoardEdges>({
    end: false,
    start: false,
  })

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    let frame = 0

    const measure = () => {
      frame = 0
      const offset = Math.abs(element.scrollLeft)
      const room = element.scrollWidth - element.clientWidth
      const start = offset > 1
      const end = room - offset > 1

      setEdges((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : {
              end,
              start,
            },
      )
    }

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure)
      }
    }

    measure()
    element.addEventListener('scroll', schedule, {
      passive: true,
    })

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(schedule)

    observer?.observe(element)

    return () => {
      element.removeEventListener('scroll', schedule)
      observer?.disconnect()

      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, deps)

  return [ref, edges] as const
}

function sameSpot(a: BoardSpot, b: BoardSpot) {
  return a.column === b.column && a.index === b.index
}

export function Board<T>({
  addLabel,
  ariaLabel,
  columnOf,
  columnWidth = 'md',
  columns,
  itemKey,
  items,
  onAdd,
  onMove,
  renderCard,
}: BoardProps<T>) {
  const labels = useLabels()
  const baseId = useId()
  const instructionsId = `${baseId}-instructions`
  const movable = Boolean(onMove)

  const [lift, setLift] = useState<BoardLift | null>(null)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropSpot, setDropSpot] = useState<BoardSpot | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const cardRefs = useRef(new Map<string, HTMLLIElement>())
  const titleRefs = useRef(new Map<number, HTMLElement>())
  const listRefs = useRef(new Map<number, HTMLUListElement>())
  const focusKeyRef = useRef<string | null>(null)
  const liftRef = useRef(lift)
  liftRef.current = lift

  /** The cards of every column, in the order `items` gives them. */
  const grouped = useMemo(() => {
    const byColumn = new Map(columns.map((column) => [column.id, [] as T[]]))

    for (const item of items) {
      byColumn.get(columnOf(item))?.push(item)
    }

    return columns.map((column) => byColumn.get(column.id) ?? [])
  }, [columnOf, columns, items])

  /**
   * What is drawn: the columns as they are, except a card lifted by keyboard,
   * which is shown where it hovers so the reader sees the move before it is
   * asked for.
   */
  const shown = useMemo(() => {
    if (!lift) {
      return grouped
    }

    const moving = grouped[lift.from.column]?.[lift.from.index]

    if (moving === undefined) {
      return grouped
    }

    const next = grouped.map((cards) => [...cards])
    next[lift.from.column]?.splice(lift.from.index, 1)
    next[lift.column]?.splice(lift.index, 0, moving)

    return next
  }, [grouped, lift])

  // The lifted card may have been remounted in another column's list, and a
  // dropped one may land there on the next `items`: focus follows the card.
  useLayoutEffect(() => {
    const key = lift?.key ?? focusKeyRef.current

    if (key === null) {
      return
    }

    const element = cardRefs.current.get(key)

    if (element && document.activeElement !== element) {
      element.focus()
    }

    if (element && !lift) {
      focusKeyRef.current = null
    }
  })

  const columnName = (column: number) =>
    titleRefs.current.get(column)?.textContent?.trim() ?? ''

  const locate = (key: string): BoardSpot | null => {
    for (const [column, cards] of grouped.entries()) {
      const index = cards.findIndex((item) => readKey(item, itemKey) === key)

      if (index !== -1) {
        return {
          column,
          index,
        }
      }
    }

    return null
  }

  const requestMove = (key: string, from: BoardSpot, to: BoardSpot) => {
    const column = columns[to.column]

    if (!column || sameSpot(from, to)) {
      return
    }

    onMove?.(key, column.id, to.index)
  }

  const cancelLift = () => {
    if (!lift) {
      return
    }

    focusKeyRef.current = lift.key
    setLift(null)
    setAnnouncement(labels.board.cancelled)
  }

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    key: string,
  ) => {
    // A key pressed on a control inside the card belongs to that control.
    if (!movable || event.target !== event.currentTarget) {
      return
    }

    const isToggle = event.key === ' ' || event.key === 'Enter'

    if (!lift) {
      if (!isToggle) {
        return
      }

      const from = locate(key)

      if (!from) {
        return
      }

      event.preventDefault()
      setLift({
        ...from,
        from,
        key,
      })
      setAnnouncement(
        labels.board.pickedUp(
          columnName(from.column),
          from.index + 1,
          grouped[from.column]?.length ?? 0,
        ),
      )

      return
    }

    if (lift.key !== key) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelLift()

      return
    }

    if (isToggle) {
      event.preventDefault()
      focusKeyRef.current = key
      setLift(null)
      setAnnouncement(
        labels.board.dropped(
          columnName(lift.column),
          lift.index + 1,
          shown[lift.column]?.length ?? 0,
        ),
      )
      requestMove(key, lift.from, lift)

      return
    }

    // Room in a column for the lifted card: its cards without the card itself,
    // plus one slot at the end.
    const roomIn = (column: number) =>
      (grouped[column]?.length ?? 0) - (column === lift.from.column ? 1 : 0)

    let next: BoardSpot | null = null

    if (event.key === 'ArrowUp') {
      next = {
        column: lift.column,
        index: Math.max(0, lift.index - 1),
      }
    } else if (event.key === 'ArrowDown') {
      next = {
        column: lift.column,
        index: Math.min(roomIn(lift.column), lift.index + 1),
      }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const column = lift.column + (event.key === 'ArrowLeft' ? -1 : 1)

      if (column >= 0 && column < columns.length) {
        next = {
          column,
          index: Math.min(roomIn(column), lift.index),
        }
      } else {
        next = lift
      }
    }

    if (!next) {
      return
    }

    event.preventDefault()

    if (sameSpot(next, lift)) {
      return
    }

    setLift({
      ...lift,
      ...next,
    })
    setAnnouncement(
      labels.board.moved(
        columnName(next.column),
        next.index + 1,
        roomIn(next.column) + 1,
      ),
    )
  }

  /**
   * Leaving the lifted card with Tab puts it back. The check waits a tick
   * because moving the card across columns remounts it, and the element that
   * loses focus that way gets it back from the layout effect above.
   */
  const handleCardBlur = (_event: FocusEvent<HTMLLIElement>, key: string) => {
    if (lift?.key !== key) {
      return
    }

    window.setTimeout(() => {
      const element = cardRefs.current.get(key)

      if (
        liftRef.current?.key === key &&
        element &&
        document.activeElement !== element
      ) {
        liftRef.current = null
        setLift(null)
        setAnnouncement(labels.board.cancelled)
      }
    }, 0)
  }

  const handleDragStart = (event: DragEvent<HTMLLIElement>, key: string) => {
    if (!movable) {
      return
    }

    event.dataTransfer?.setData('text/plain', key)

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }

    setLift(null)
    setDragKey(key)
  }

  const clearDrag = () => {
    setDragKey(null)
    setDropSpot(null)
  }

  /** The slot under the pointer: before the first card whose middle is below it. */
  const spotAt = (column: number, clientY: number): BoardSpot => {
    const list = listRefs.current.get(column)
    const cards = list
      ? Array.from(list.querySelectorAll<HTMLElement>('[data-board-card]'))
      : []
    const others = cards.filter((card) => card.dataset.boardCard !== dragKey)
    const index = others.findIndex((card) => {
      const rect = card.getBoundingClientRect()

      return clientY < rect.top + rect.height / 2
    })

    return {
      column,
      index: index === -1 ? others.length : index,
    }
  }

  const handleDragOver = (event: DragEvent<HTMLElement>, column: number) => {
    if (dragKey === null) {
      return
    }

    event.preventDefault()

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }

    const spot = spotAt(column, event.clientY)

    if (!dropSpot || !sameSpot(dropSpot, spot)) {
      setDropSpot(spot)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    const next = event.relatedTarget

    if (next instanceof Node && event.currentTarget.contains(next)) {
      return
    }

    setDropSpot(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, column: number) => {
    if (dragKey === null) {
      return
    }

    event.preventDefault()

    const from = locate(dragKey)
    const to =
      dropSpot?.column === column ? dropSpot : spotAt(column, event.clientY)

    if (from) {
      requestMove(dragKey, from, to)
    }

    clearDrag()
  }

  const slots = styles({
    columnWidth,
  })
  const [viewportRef, edges] = useScrollEdges([columns.length, columnWidth])

  return (
    // A <section> is a region landmark only once it has a name, which is
    // exactly the rule: named by ariaLabel, a region; otherwise a plain box.
    <section
      aria-label={ariaLabel}
      className={slots.root()}
      data-testid="board"
    >
      <div
        className={slots.viewport()}
        data-testid="board-viewport"
        ref={viewportRef}
      >
        {columns.map((column, columnIndex) => {
          const titleId = `${baseId}-title-${columnIndex}`
          const addId = `${baseId}-add-${columnIndex}`
          const cards = shown[columnIndex] ?? []
          const isOver = dropSpot?.column === columnIndex
          const { column: columnSlot } = styles({
            columnWidth,
            over: isOver,
          })
          let placed = 0

          const indicator = (
            <li
              aria-hidden="true"
              className={slots.dropIndicator()}
              data-testid="board-drop-indicator"
              key="board-drop-indicator"
            />
          )

          return (
            // A column is a group named by its title; <fieldset> is that group.
            <fieldset
              aria-labelledby={titleId}
              className={columnSlot()}
              data-column={column.id}
              data-testid="board-column"
              key={column.id}
              onDragLeave={handleDragLeave}
              onDragOver={(event) => handleDragOver(event, columnIndex)}
              onDrop={(event) => handleDrop(event, columnIndex)}
            >
              <div className={slots.columnHeader()}>
                <div className={slots.columnHeading()}>
                  <span
                    className={slots.columnTitle()}
                    id={titleId}
                    ref={(node) => {
                      if (node) {
                        titleRefs.current.set(columnIndex, node)
                      } else {
                        titleRefs.current.delete(columnIndex)
                      }
                    }}
                  >
                    {column.label}
                  </span>
                  <span
                    className={slots.columnCount()}
                    data-testid="board-column-count"
                  >
                    {cards.length}
                  </span>
                </div>
                {column.summary ? (
                  <div
                    className={slots.columnSummary()}
                    data-testid="board-column-summary"
                  >
                    {column.summary}
                  </div>
                ) : null}
              </div>

              <ul
                aria-labelledby={titleId}
                className={slots.columnList()}
                ref={(node) => {
                  if (node) {
                    listRefs.current.set(columnIndex, node)
                  } else {
                    listRefs.current.delete(columnIndex)
                  }
                }}
              >
                {cards.map((item) => {
                  const key = readKey(item, itemKey)
                  const isDragged = dragKey === key
                  const showIndicator =
                    isOver && !isDragged && dropSpot?.index === placed

                  if (!isDragged) {
                    placed += 1
                  }

                  return (
                    <Fragment key={key}>
                      {showIndicator ? indicator : null}
                      <li
                        aria-describedby={movable ? instructionsId : undefined}
                        className={slots.card({
                          dragging: isDragged,
                          lifted: lift?.key === key,
                          movable,
                        })}
                        data-board-card={key}
                        data-state={lift?.key === key ? 'lifted' : undefined}
                        data-testid="board-card"
                        draggable={movable || undefined}
                        onBlur={(event) => handleCardBlur(event, key)}
                        onDragEnd={clearDrag}
                        onDragStart={(event) => handleDragStart(event, key)}
                        onKeyDown={(event) => handleCardKeyDown(event, key)}
                        ref={(node) => {
                          if (node) {
                            cardRefs.current.set(key, node)
                          } else {
                            cardRefs.current.delete(key)
                          }
                        }}
                        tabIndex={movable ? 0 : undefined}
                      >
                        {renderCard(item)}
                      </li>
                    </Fragment>
                  )
                })}
                {isOver && dropSpot?.index === placed ? indicator : null}
              </ul>

              {onAdd ? (
                <ComposedButton
                  aria-labelledby={`${addId} ${titleId}`}
                  block
                  data-testid="board-add"
                  leftSection={<Plus />}
                  onClick={() => onAdd(column.id)}
                  size="sm"
                  variant="ghost"
                >
                  <span className={slots.add()} id={addId}>
                    {addLabel ?? labels.board.add}
                  </span>
                </ComposedButton>
              ) : null}
            </fieldset>
          )
        })}
      </div>

      {(['start', 'end'] as const).map((edge) => (
        <div
          aria-hidden="true"
          className={styles({
            edge,
            visible: edges[edge],
          }).fade()}
          data-edge={edge}
          data-state={edges[edge] ? 'visible' : 'hidden'}
          data-testid="board-fade"
          key={edge}
        />
      ))}

      {movable ? (
        <span className={slots.instructions()} id={instructionsId}>
          {labels.board.instructions}
        </span>
      ) : null}
      <span
        aria-atomic="true"
        aria-live="assertive"
        className={slots.live()}
        data-testid="board-live"
      >
        {announcement}
      </span>
    </section>
  )
}
