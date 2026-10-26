import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createPortal } from 'react-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProtectedProvider } from '@/components/protected-provider'

import { BulkActions } from './bulk-actions'
import type { BulkAction } from './bulk-actions.types'

type Row = {
  archived?: boolean
  id: string
  name: string
}

const ROWS: Row[] = [
  {
    id: 'a',
    name: 'Ada',
  },
  {
    archived: true,
    id: 'b',
    name: 'Grace',
  },
]

function action(
  overrides: Partial<BulkAction<string>> = {},
): BulkAction<string> {
  return {
    id: 'export',
    label: 'Export',
    onRun: vi.fn(),
    ...overrides,
  }
}

describe('BulkActions', () => {
  it('stays away while nothing is selected', () => {
    render(<BulkActions actions={[action()]} selection={[]} />)

    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('appears with the count once something is', () => {
    render(<BulkActions actions={[action()]} selection={['a', 'b']} />)

    expect(screen.getByTestId('bulk-actions-count')).toHaveTextContent(
      '2 selected',
    )
  })

  it('leaves the page usable, because it is not a modal', () => {
    render(<BulkActions actions={[action()]} selection={['a']} />)

    expect(screen.queryByTestId('sheet-backdrop')).not.toBeInTheDocument()
  })

  it('hands the selection to the action it runs', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            onRun,
          }),
        ]}
        selection={['a', 'b']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-export'))

    expect(onRun).toHaveBeenCalledWith(['a', 'b'], undefined)
  })

  it('takes rows as readily as keys', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions<Row>
        actions={[
          {
            id: 'archive',
            label: 'Archive',
            onRun,
          },
        ]}
        selection={ROWS}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-archive'))

    expect(onRun).toHaveBeenCalledWith(ROWS, undefined)
  })

  it('empties the selection once the action lands', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            onRun: () => Promise.resolve(),
          }),
        ]}
        onClear={onClear}
        selection={['a']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-export'))

    await waitFor(() => expect(onClear).toHaveBeenCalled())
  })

  it('leaves the selection alone when told to', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[action()]}
        clearOnRun={false}
        onClear={onClear}
        selection={['a']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-export'))

    expect(onClear).not.toHaveBeenCalled()
  })

  it('keeps bar and selection when the action fails', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            onRun: () => Promise.reject(new Error('nope')),
          }),
        ]}
        onClear={onClear}
        selection={['a']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-export'))

    await waitFor(() =>
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument(),
    )
    expect(onClear).not.toHaveBeenCalled()
  })

  it('blocks an action the selection does not suit', () => {
    render(
      <BulkActions<Row>
        actions={[
          {
            disabled: (rows) => rows.some((row) => row.archived),
            id: 'archive',
            label: 'Archive',
            onRun: vi.fn(),
          },
        ]}
        selection={ROWS}
      />,
    )

    expect(screen.getByTestId('bulk-actions-action-archive')).toBeDisabled()
  })

  it('drops an action that is hidden for this selection', () => {
    render(
      <BulkActions
        actions={[
          action(),
          action({
            hidden: true,
            id: 'delete',
            label: 'Delete',
          }),
        ]}
        selection={['a']}
      />,
    )

    expect(
      screen.queryByTestId('bulk-actions-action-delete'),
    ).not.toBeInTheDocument()
  })

  it('waits silently while the permissions load, then denies with a reason', () => {
    const bar = (loading: boolean) => (
      <ProtectedProvider loading={loading} permissions={[]}>
        <BulkActions
          actions={[
            action({
              id: 'delete',
              label: 'Delete',
              permissionIds: ['booking:delete'],
            }),
          ]}
          selection={['a']}
        />
      </ProtectedProvider>
    )
    const { rerender } = render(bar(true))
    const pending = screen.getByTestId('bulk-actions-action-delete')

    expect(pending).toBeDisabled()
    expect(pending).not.toHaveAccessibleDescription(
      'You do not have permission to do this',
    )

    rerender(bar(false))

    expect(
      screen.getByTestId('bulk-actions-action-delete'),
    ).toHaveAccessibleDescription('You do not have permission to do this')
  })

  it('blocks an action the user has no permission for', () => {
    render(
      <ProtectedProvider permissions={['booking:read']}>
        <BulkActions
          actions={[
            action({
              id: 'delete',
              label: 'Delete',
              permissionIds: ['booking:delete'],
            }),
            action({
              id: 'read',
              label: 'Read',
              permissionIds: ['booking:read'],
            }),
          ]}
          selection={['a']}
        />
      </ProtectedProvider>,
    )

    const denied = screen.getByTestId('bulk-actions-action-delete')

    expect(denied).toHaveAttribute('aria-disabled', 'true')
    expect(denied).toHaveAccessibleDescription(
      'You do not have permission to do this',
    )
    expect(screen.getByTestId('bulk-actions-action-read')).toBeEnabled()
  })

  it('blocks an action with a reason, keeps it reachable and says why', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions<Row>
        actions={[
          {
            disabledReason: (rows) =>
              rows.some((row) => row.archived)
                ? 'Some rows are already archived'
                : undefined,
            id: 'archive',
            label: 'Archive',
            onRun,
          },
        ]}
        selection={ROWS}
      />,
    )

    const button = screen.getByTestId('bulk-actions-action-archive')

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toHaveAttribute('disabled')
    expect(button).toHaveAccessibleDescription('Some rows are already archived')

    button.focus()
    expect(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.click(button, {
      pointerEventsCheck: 0,
    })
    expect(onRun).not.toHaveBeenCalled()
  })

  it('says nothing and runs as before when the reason comes back empty', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions<Row>
        actions={[
          {
            disabledReason: (rows) =>
              rows.some((row) => row.archived) ? 'Archived' : undefined,
            id: 'archive',
            label: 'Archive',
            onRun,
          },
        ]}
        selection={[ROWS[0] as Row]}
      />,
    )

    const button = screen.getByTestId('bulk-actions-action-archive')

    expect(button).not.toHaveAttribute('aria-disabled')
    expect(button).not.toHaveAttribute('aria-describedby')
    await userEvent.click(button)
    expect(onRun).toHaveBeenCalled()
  })

  it('prefers its own reason over the permission one', () => {
    render(
      <ProtectedProvider permissions={[]}>
        <BulkActions
          actions={[
            action({
              disabledReason: 'Only owners can delete bookings',
              id: 'delete',
              label: 'Delete',
              permissionIds: ['booking:delete'],
            }),
          ]}
          selection={['a']}
        />
      </ProtectedProvider>,
    )

    expect(
      screen.getByTestId('bulk-actions-action-delete'),
    ).toHaveAccessibleDescription('Only owners can delete bookings')
  })

  it('keeps a reasoned action reachable in the overflow menu', async () => {
    const onRun = vi.fn()

    render(
      <ProtectedProvider permissions={[]}>
        <BulkActions
          actions={[
            action({
              id: 'one',
              label: 'One',
            }),
            action({
              id: 'two',
              label: 'Two',
              onRun,
              permissionIds: ['booking:delete'],
            }),
            action({
              id: 'three',
              label: 'Three',
            }),
          ]}
          maxVisible={1}
          selection={['a']}
        />
      </ProtectedProvider>,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-more'))

    const item = await screen.findByTestId('bulk-actions-item-two')

    expect(item).toHaveAttribute('role', 'menuitem')
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(item).toHaveAccessibleDescription(
      'You do not have permission to do this',
    )
    expect(screen.getByTestId('bulk-actions-item-three')).not.toHaveAttribute(
      'aria-describedby',
    )

    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(item).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await userEvent.click(item, {
      pointerEventsCheck: 0,
    })
    expect(onRun).not.toHaveBeenCalled()
  })

  it('folds the actions that do not fit into a menu', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            id: 'one',
            label: 'One',
          }),
          action({
            id: 'two',
            label: 'Two',
          }),
          action({
            id: 'three',
            label: 'Three',
            onRun,
          }),
        ]}
        maxVisible={2}
        selection={['a']}
      />,
    )

    expect(
      screen.queryByTestId('bulk-actions-action-three'),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('bulk-actions-more'))
    await userEvent.click(await screen.findByText('Three'))

    expect(onRun).toHaveBeenCalledWith(['a'], undefined)
  })

  it('renders whatever else the bar was given to say', () => {
    render(
      <BulkActions
        actions={[action()]}
        extra={<span>R$ 12.480,00 in total</span>}
        selection={['a']}
      />,
    )

    expect(screen.getByTestId('bulk-actions-extra')).toHaveTextContent(
      'R$ 12.480,00 in total',
    )
  })

  it('hands the selection to an extra that counts it', () => {
    render(
      <BulkActions
        actions={[action()]}
        extra={(selection) => <span>{selection.length} of 340</span>}
        selection={['a', 'b']}
      />,
    )

    expect(screen.getByTestId('bulk-actions-extra')).toHaveTextContent(
      '2 of 340',
    )
  })

  it('leaves the slot out entirely when there is nothing to add', () => {
    render(<BulkActions actions={[action()]} selection={['a']} />)

    expect(screen.queryByTestId('bulk-actions-extra')).not.toBeInTheDocument()
  })

  it('clears from its own control', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions actions={[action()]} onClear={onClear} selection={['a']} />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-clear'))

    expect(onClear).toHaveBeenCalled()
  })

  it('clears on Escape, the one dismissal it answers to', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions actions={[action()]} onClear={onClear} selection={['a']} />,
    )

    await userEvent.keyboard('{Escape}')

    expect(onClear).toHaveBeenCalled()
  })
})

describe('BulkActions with a confirmation', () => {
  const confirmed = (
    onRun: BulkAction<string>['onRun'],
  ): BulkAction<string> => ({
    confirm: (ids) => ({
      description: 'This cannot be undone.',
      title: `Delete ${ids.length} bookings?`,
    }),
    id: 'delete',
    label: 'Delete',
    onRun,
    variant: 'destructive',
  })

  it('asks before it runs, and counts what it is about to touch', async () => {
    const onRun = vi.fn()

    render(<BulkActions actions={[confirmed(onRun)]} selection={['a', 'b']} />)

    await userEvent.click(screen.getByTestId('bulk-actions-action-delete'))

    expect(await screen.findByText('Delete 2 bookings?')).toBeInTheDocument()
    expect(onRun).not.toHaveBeenCalled()
  })

  it('runs once the dialog is confirmed', async () => {
    const onRun = vi.fn()
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[confirmed(onRun)]}
        onClear={onClear}
        selection={['a', 'b']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-delete'))
    await userEvent.click(screen.getByTestId('confirm-action'))

    await waitFor(() =>
      expect(onRun).toHaveBeenCalledWith(['a', 'b'], undefined),
    )
    await waitFor(() => expect(onClear).toHaveBeenCalled())
  })

  it('runs nothing when the dialog is cancelled', async () => {
    const onRun = vi.fn()

    render(<BulkActions actions={[confirmed(onRun)]} selection={['a']} />)

    await userEvent.click(screen.getByTestId('bulk-actions-action-delete'))
    await userEvent.click(screen.getByTestId('confirm-cancel'))

    expect(onRun).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('carries what the challenge collected into the action', async () => {
    const onRun = vi.fn()

    render(
      <BulkActions
        actions={[
          {
            confirm: {
              confirmationValue: 'DELETE',
              description: 'Type it to continue.',
              mode: 'typed',
              title: 'Delete everything?',
            },
            id: 'delete',
            label: 'Delete',
            onRun,
          },
        ]}
        selection={['a']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-delete'))
    await userEvent.type(
      await screen.findByTestId('confirm-typed-field'),
      'DELETE',
    )
    await userEvent.click(screen.getByTestId('confirm-action'))

    await waitFor(() => expect(onRun).toHaveBeenCalledWith(['a'], 'DELETE'))
  })

  it('keeps the dialog open with the reason when the action is refused', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[
          confirmed(() =>
            Promise.reject(new Error('Two are already archived')),
          ),
        ]}
        onClear={onClear}
        selection={['a', 'b']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-action-delete'))
    await userEvent.click(screen.getByTestId('confirm-action'))

    expect(
      await screen.findByText('Two are already archived'),
    ).toBeInTheDocument()
    expect(onClear).not.toHaveBeenCalled()
  })
})

describe('BulkActions placement', () => {
  it('floats in a Sheet by default, out of the flow it was declared in', () => {
    render(
      <div data-testid="toolbar-slot">
        <BulkActions actions={[action()]} selection={['a']} />
      </div>,
    )

    const bar = screen.getByTestId('bulk-actions')

    expect(bar).toHaveAttribute('data-placement', 'floating')
    expect(screen.getByTestId('toolbar-slot')).not.toContainElement(bar)
  })

  it('renders inline in place, as a group named by the count', () => {
    render(
      <div data-testid="toolbar-slot">
        <BulkActions
          actions={[action()]}
          placement="inline"
          selection={['a', 'b']}
        />
      </div>,
    )

    const bar = screen.getByRole('group', {
      name: '2 selected',
    })

    expect(bar).toHaveAttribute('data-placement', 'inline')
    expect(bar.tagName).toBe('FIELDSET')
    expect(bar).not.toHaveAttribute('role')
    expect(screen.getByTestId('toolbar-slot')).toContainElement(bar)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(bar).toHaveClass('border-border')
  })

  it('renders nothing inline while nothing is selected', () => {
    render(
      <BulkActions actions={[action()]} placement="inline" selection={[]} />,
    )

    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('runs an action inline and clears the selection after it', async () => {
    const onRun = vi.fn()
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            onRun,
          }),
        ]}
        onClear={onClear}
        placement="inline"
        selection={['a']}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Export',
      }),
    )

    expect(onRun).toHaveBeenCalledWith(['a'], undefined)
    await waitFor(() => expect(onClear).toHaveBeenCalled())
  })

  it('clears inline on Escape pressed inside the bar only', async () => {
    const onClear = vi.fn()

    render(
      <>
        <button type="button">Elsewhere</button>
        <BulkActions
          actions={[action()]}
          onClear={onClear}
          placement="inline"
          selection={['a']}
        />
      </>,
    )

    screen
      .getByRole('button', {
        name: 'Elsewhere',
      })
      .focus()
    await userEvent.keyboard('{Escape}')

    expect(onClear).not.toHaveBeenCalled()

    screen
      .getByRole('button', {
        name: 'Export',
      })
      .focus()
    await userEvent.keyboard('{Escape}')

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('lets Escape in the inline overflow menu close the menu, not the selection', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[
          action({
            id: 'a1',
            label: 'One',
          }),
          action({
            id: 'a2',
            label: 'Two',
          }),
        ]}
        maxVisible={1}
        onClear={onClear}
        placement="inline"
        selection={['a']}
      />,
    )

    await userEvent.click(screen.getByTestId('bulk-actions-more'))
    await screen.findByRole('menuitem', {
      name: 'Two',
    })
    await userEvent.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument(),
    )
    expect(onClear).not.toHaveBeenCalled()
  })

  it('ignores Escape from content portalled out of the inline bar', async () => {
    const onClear = vi.fn()

    render(
      <BulkActions
        actions={[action()]}
        extra={createPortal(
          <button type="button">Portalled</button>,
          document.body,
        )}
        onClear={onClear}
        placement="inline"
        selection={['a']}
      />,
    )

    screen
      .getByRole('button', {
        name: 'Portalled',
      })
      .focus()
    await userEvent.keyboard('{Escape}')

    expect(onClear).not.toHaveBeenCalled()
  })
})
