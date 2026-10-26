import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { LabelsProvider } from '@/components/labels-provider'

import { Checklist } from './checklist'
import type { ChecklistItem } from './checklist.types'

const items: ChecklistItem[] = [
  { done: true, id: 'profile', label: 'Complete your profile' },
  { done: true, id: 'team', label: 'Invite your team' },
  {
    action: <Button size="sm">Add account</Button>,
    description: 'Payouts land here.',
    done: false,
    id: 'bank',
    label: 'Add a bank account',
  },
  {
    action: <Button size="sm">Create</Button>,
    done: false,
    id: 'product',
    label: 'Create a product',
  },
  { done: false, id: 'launch', label: 'Go live' },
]

describe('Checklist', () => {
  it('reads back how far along it is, in words and on the bar', () => {
    render(<Checklist items={items} title="Set up your account" />)

    expect(screen.getByTestId('checklist-count')).toHaveTextContent(
      '2 of 5 complete',
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(
      screen.getByRole('progressbar', { name: '2 of 5 complete' }),
    ).toBeInTheDocument()
  })

  it('counts nothing done and an empty list without dividing by zero', () => {
    const { rerender } = render(
      <Checklist items={items.map((item) => ({ ...item, done: false }))} />,
    )

    expect(screen.getByTestId('checklist-count')).toHaveTextContent(
      '0 of 5 complete',
    )

    rerender(<Checklist items={[]} />)

    expect(screen.getByTestId('checklist-count')).toHaveTextContent(
      '0 of 0 complete',
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
    expect(screen.queryByTestId('checklist-list')).not.toBeInTheDocument()
  })

  it('takes its words from the labels provider', () => {
    render(
      <LabelsProvider
        labels={{
          checklist: { progress: (done, total) => `${done}/${total} feitos` },
        }}
      >
        <Checklist items={items} />
      </LabelsProvider>,
    )

    expect(screen.getByTestId('checklist-count')).toHaveTextContent(
      '2/5 feitos',
    )
    expect(
      screen.getByRole('progressbar', { name: '2/5 feitos' }),
    ).toBeInTheDocument()
  })

  it('strikes a done item, says so to a screen reader, and drops its action', () => {
    render(
      <Checklist
        items={[
          {
            action: <Button size="sm">Edit profile</Button>,
            done: true,
            id: 'profile',
            label: 'Complete your profile',
          },
          ...items.slice(2),
        ]}
      />,
    )

    const doneLabel = screen.getByTestId('checklist-item-label-profile')

    expect(doneLabel).toHaveClass('line-through', 'text-muted-foreground')
    expect(doneLabel).toHaveTextContent('Complete your profile (Done)')
    expect(
      screen.queryByRole('button', { name: 'Edit profile' }),
    ).not.toBeInTheDocument()

    const pendingLabel = screen.getByTestId('checklist-item-label-product')

    expect(pendingLabel).not.toHaveClass('line-through')
    expect(pendingLabel).not.toHaveTextContent('(Done)')
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('emphasises only the first undone item as the next step', () => {
    render(<Checklist items={items} />)

    expect(screen.getByTestId('checklist-item-bank')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByTestId('checklist-item-label-bank')).toHaveClass(
      'font-medium',
    )
    expect(screen.getByTestId('checklist-item-product')).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByTestId('checklist-item-label-product')).not.toHaveClass(
      'font-medium',
    )
    expect(screen.getByTestId('checklist-item-profile')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('names the list by its title', () => {
    render(<Checklist items={items} title="Set up your account" />)

    expect(
      screen.getByRole('list', { name: 'Set up your account' }),
    ).toBeInTheDocument()
  })

  it('offers a dismiss control only when it can be dismissed', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Checklist items={items} />)

    expect(screen.queryByTestId('checklist-dismiss')).not.toBeInTheDocument()

    rerender(<Checklist items={items} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('shows every item and no toggle when it is not collapsible', () => {
    render(<Checklist items={items} />)

    expect(
      within(screen.getByTestId('checklist-list')).getAllByRole('listitem'),
    ).toHaveLength(5)
    expect(screen.queryByTestId('checklist-toggle')).not.toBeInTheDocument()
  })

  it('folds the done items behind a toggle when collapsible', () => {
    render(<Checklist collapsible items={items} />)

    const toggle = screen.getByRole('button', { name: 'Show completed (2)' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByTestId('checklist-item-profile'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('checklist-item-bank')).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveTextContent('Hide completed')
    expect(screen.getByTestId('checklist-item-profile')).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(
      screen.queryByTestId('checklist-item-profile'),
    ).not.toBeInTheDocument()
  })

  it('has nothing to fold while no item is done', () => {
    render(
      <Checklist
        collapsible
        items={items.map((item) => ({ ...item, done: false }))}
      />,
    )

    expect(screen.queryByTestId('checklist-toggle')).not.toBeInTheDocument()
  })

  it('folds a finished checklist down to its toggle', () => {
    render(
      <Checklist
        collapsible
        items={items.map((item) => ({ ...item, done: true }))}
      />,
    )

    expect(screen.queryByTestId('checklist-list')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show completed (5)' }),
    ).not.toHaveAttribute('aria-controls')
  })
})

// A DOM audit flagged a clipped span reading "x" inside the checklist. It is
// not the checklist's: Base UI's Progress renders a visually hidden
// `<span role="presentation">x</span>` inside every progressbar as a
// screen-reader workaround (MeterRoot does the same). It is hidden by an inline
// style rather than a `sr-only` class, which is why the audit took it for
// clipped copy. These pin that reading, so an upgrade that turned it into real
// text — or into the bar's name — would show up here.
describe('Checklist progress bar hidden text', () => {
  it('names the bar with the progress words, never with the placeholder', () => {
    render(<Checklist items={items} title="Set up your account" />)

    expect(screen.getByRole('progressbar')).toHaveAccessibleName(
      '2 of 5 complete',
    )
  })

  it('keeps the placeholder presentational and visually hidden', () => {
    render(<Checklist items={items} title="Set up your account" />)

    const placeholder = within(screen.getByRole('progressbar')).getByText('x')
    expect(placeholder).toHaveAttribute('role', 'presentation')
    expect(placeholder).toHaveStyle({
      height: '1px',
      overflow: 'hidden',
      position: 'fixed',
      width: '1px',
    })
  })

  it('renders no other stray text of its own', () => {
    render(<Checklist items={items} title="Set up your account" />)

    const checklist = screen.getByTestId('checklist')
    const leaves = [...checklist.querySelectorAll('*')].filter(
      (node) => node.children.length === 0 && node.textContent?.trim() === 'x',
    )
    expect(leaves).toHaveLength(1)
    expect(screen.getByRole('progressbar')).toContainElement(
      leaves[0] as HTMLElement,
    )
  })
})
