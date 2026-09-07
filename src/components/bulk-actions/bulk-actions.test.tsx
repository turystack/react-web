import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    expect(screen.getByTestId('bulk-actions-action-delete')).toBeDisabled()
    expect(screen.getByTestId('bulk-actions-action-read')).toBeEnabled()
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
