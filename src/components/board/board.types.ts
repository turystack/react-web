/**
 * Board
 *
 * Cards laid out in columns by stage — a Kanban board, a CRM pipeline — that
 * the reader moves from one stage to the next.
 *
 * Behavior:
 * - Controlled: `items` is the truth and `columnOf` says which column each one
 *   sits in. The board never keeps its own copy — a move is only a request,
 *   `onMove(itemId, toColumnId, toIndex)`, and the card lands where the next
 *   `items` puts it. An item whose `columnOf` names no column is not drawn
 * - Within a column the cards keep their order in `items`. `toIndex` is the
 *   0-based position the card asks for in the destination column once it is
 *   there, counted without the card itself — so moving a card to the end of a
 *   column of three (itself not included) is index 3
 * - Columns keep a fixed width (`columnWidth`) and the board scrolls
 *   horizontally, so a pipeline of nine stages stays nine readable columns
 *   instead of nine slivers. Each column header shows its label, how many
 *   cards it holds and an optional `summary` (a sum, a limit)
 * - An edge fade marks each side with more columns past it, shown only while
 *   the board can scroll that way (measured on scroll and on resize, at most
 *   once a frame; right-to-left aware). It is decoration: `aria-hidden`, it
 *   never takes a pointer, and it appears without a transition under
 *   reduced motion
 * - Moving is on only with `onMove`. By pointer it is native drag and drop: a
 *   line marks where the card will land. By keyboard every card is a tab stop:
 *   Space (or Enter) picks it up, the Up/Down arrows move it within the
 *   column, Left/Right move it across columns, Space (or Enter) drops it, and
 *   Escape — or leaving the card with Tab — puts it back. Every step is
 *   announced in a live region, and the card carries the instructions as its
 *   accessible description. A key pressed on a control inside the card
 *   belongs to that control
 * - `onAdd` puts an "Add" button under every column; its accessible name is
 *   the label plus the column's name ("Add To do"). `addLabel` overrides the
 *   word
 *
 * Implementation:
 * - A group per column (`role="group"` named by its label) holding a list of
 *   cards; the board is a named region when `ariaLabel` is given
 * - HTML5 drag events (no drag-and-drop dependency) and a keyboard path of its
 *   own, both ending in the same `onMove`
 * - <Board
 *     columns={[{ id: 'lead', label: 'Lead' }, { id: 'won', label: 'Won', summary: <MoneyText value={total} /> }]}
 *     items={deals}
 *     itemKey="id"
 *     columnOf={(deal) => deal.stage}
 *     renderCard={(deal) => <Card size="sm">…</Card>}
 *     onMove={(id, stage, index) => moveDeal(id, stage, index)}
 *     onAdd={(stage) => openNewDeal(stage)}
 *   />
 *
 * Dependencies: Button, LabelsProvider
 */

import type { ReactNode } from 'react'

export type BoardColumnWidth = 'sm' | 'md' | 'lg'

export type BoardItemKey<T> = keyof T | ((item: T) => string | number)

export type BoardColumn = {
  id: string // stable identity; what `columnOf` returns (required)
  label: ReactNode // the column's heading and the name of its group (required)
  summary?: ReactNode // a line under the heading: a sum, a limit
}

export type BoardProps<T> = {
  addLabel?: string // overrides the word on every column's add button
  ariaLabel?: string // names the board as a region
  columnOf: (item: T) => string // the id of the column an item sits in (required)
  columnWidth?: BoardColumnWidth // fixed width of every column (default 'md')
  columns: BoardColumn[] // the stages, left to right (required)
  itemKey: BoardItemKey<T> // stable identity of an item; the id `onMove` reports (required)
  items: T[] // every card on the board (required)
  onAdd?: (columnId: string) => void // shows an add button under each column
  onMove?: (itemId: string, toColumnId: string, toIndex: number) => void // enables moving by pointer and keyboard
  renderCard: (item: T) => ReactNode // what one card looks like (required)
}
