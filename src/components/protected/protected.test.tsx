import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/button'
import { ProtectedProvider } from '@/components/protected-provider'

import { Protected } from './protected'

function withPermissions(permissions: string[], children: React.ReactNode) {
  return (
    <ProtectedProvider permissions={permissions}>{children}</ProtectedProvider>
  )
}

describe('Protected', () => {
  it('renders a guarded node only when the permission is held', () => {
    render(
      withPermissions(
        ['user:read'],
        <>
          <Protected permissionIds={['user:read']}>
            <span>allowed</span>
          </Protected>
          <Protected permissionIds={['user:delete']}>
            <span>refused</span>
          </Protected>
        </>,
      ),
    )

    expect(screen.getByText('allowed')).toBeInTheDocument()
    expect(screen.queryByText('refused')).not.toBeInTheDocument()
  })

  it('puts the fallback in the refused node place', () => {
    render(
      withPermissions(
        [],
        <Protected
          fallback={<span>ask an admin</span>}
          permissionIds={['user:delete']}
        >
          <span>refused</span>
        </Protected>,
      ),
    )

    expect(screen.getByText('ask an admin')).toBeInTheDocument()
  })

  it('hands enabled to a renderer instead of hiding the control', () => {
    render(
      withPermissions(
        [],
        <Protected permissionIds={['booking:cancel']}>
          {({ enabled }) => <Button disabled={!enabled}>Cancel booking</Button>}
        </Protected>,
      ),
    )

    expect(
      screen.getByRole('button', { name: 'Cancel booking' }),
    ).toBeDisabled()
  })

  it('requires every id, or any of them when asked', () => {
    render(
      withPermissions(
        ['user:read'],
        <>
          <Protected mode="all" permissionIds={['user:read', 'user:delete']}>
            <span>all</span>
          </Protected>
          <Protected mode="any" permissionIds={['user:read', 'user:delete']}>
            <span>any</span>
          </Protected>
        </>,
      ),
    )

    expect(screen.queryByText('all')).not.toBeInTheDocument()
    expect(screen.getByText('any')).toBeInTheDocument()
  })

  it('renders what it guards when it is given nothing to check', () => {
    render(
      withPermissions(
        [],
        <Protected>
          <span>ungated</span>
        </Protected>,
      ),
    )

    expect(screen.getByText('ungated')).toBeInTheDocument()
  })

  /**
   * There is no `loading` to tell a renderer about any more. A profile that
   * has not arrived and one that arrived holding nothing are the same empty
   * list, and the renderer gets the same honest answer for both: not enabled.
   */
  it('tells a renderer the answer for an empty list', () => {
    render(
      <ProtectedProvider permissions={[]}>
        <Protected permissionIds={['user:read']}>
          {({ enabled }) => <span data-testid="state">{String(enabled)}</span>}
        </Protected>
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('state')).toHaveTextContent('false')
  })

  it('hands a reason to the renderer only when the permission is missing', () => {
    render(
      withPermissions(
        ['user:read'],
        <>
          <Protected permissionIds={['user:read']}>
            {({ reason }) => <Button disabledReason={reason}>Read</Button>}
          </Protected>
          <Protected permissionIds={['user:delete']}>
            {({ reason }) => <Button disabledReason={reason}>Delete</Button>}
          </Protected>
        </>,
      ),
    )

    const read = screen.getByRole('button', {
      name: 'Read',
    })
    const del = screen.getByRole('button', {
      name: 'Delete',
    })

    expect(read).not.toHaveAttribute('aria-disabled')
    expect(read).not.toHaveAttribute('aria-describedby')
    expect(del).toHaveAttribute('aria-disabled', 'true')
    expect(del).toHaveAccessibleDescription(
      'You do not have permission to do this',
    )
  })

  it('answers nothing as denied while the permissions load', () => {
    render(
      <ProtectedProvider loading permissions={[]}>
        <Protected
          fallback={<span>no access</span>}
          permissionIds={['user:delete']}
        >
          <span>guarded</span>
        </Protected>
        <Protected permissionIds={['user:delete']}>
          {({ loading, reason }) => (
            <Button disabledReason={reason} loading={loading}>
              Delete
            </Button>
          )}
        </Protected>
      </ProtectedProvider>,
    )

    expect(screen.queryByText('guarded')).not.toBeInTheDocument()
    expect(screen.queryByText('no access')).not.toBeInTheDocument()

    const button = screen.getByRole('button', {
      name: 'Delete',
    })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).not.toHaveAccessibleDescription(
      'You do not have permission to do this',
    )
  })

  it('denies with a reason once the permissions arrive', () => {
    const tree = (loading: boolean) => (
      <ProtectedProvider loading={loading} permissions={[]}>
        <Protected permissionIds={['user:delete']}>
          {({ loading: pending, reason }) => (
            <Button disabledReason={reason} loading={pending}>
              Delete
            </Button>
          )}
        </Protected>
      </ProtectedProvider>
    )
    const { rerender } = render(tree(true))

    rerender(tree(false))

    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      'You do not have permission to do this',
    )
  })

  it('renders a Protected that asks for nothing even while loading', () => {
    render(
      <ProtectedProvider loading permissions={[]}>
        <Protected>
          <span>always</span>
        </Protected>
      </ProtectedProvider>,
    )

    expect(screen.getByText('always')).toBeInTheDocument()
  })
})
