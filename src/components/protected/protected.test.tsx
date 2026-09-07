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
})
