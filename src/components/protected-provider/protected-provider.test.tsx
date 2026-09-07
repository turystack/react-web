import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Protected } from '@/components/protected'
import { useProtected } from '@/components/protected/use-protected'

import { ProtectedProvider } from './protected-provider'
import { usePermissions } from './use-permissions'

function Probe({ ids }: { ids: string[] }) {
  const { enabled } = useProtected(ids)

  return <span data-testid="probe">{String(enabled)}</span>
}

function Held() {
  const { permissions } = usePermissions()

  return <span data-testid="held">{permissions.join(',')}</span>
}

describe('ProtectedProvider', () => {
  it('answers from the ids it holds', () => {
    render(
      <ProtectedProvider permissions={['user:read']}>
        <Probe ids={['user:read']} />
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('true')
  })

  it('refuses an id it was never given', () => {
    render(
      <ProtectedProvider permissions={['user:read']}>
        <Probe ids={['user:delete']} />
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('false')
  })

  it('reads a manage grant as covering its whole subject', () => {
    render(
      <ProtectedProvider permissions={['user:manage']}>
        <Probe ids={['user:delete']} />
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('true')
  })

  /**
   * The provider used to take a `loading` flag and refuse everything while it
   * was set. It was removed: an app cannot tell a profile that has not arrived
   * from one that arrived holding nothing, and the two look identical here
   * anyway — an empty list refuses.
   */
  it('holds nothing when the list is empty', () => {
    render(
      <ProtectedProvider permissions={[]}>
        <Probe ids={['user:read']} />
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('false')
  })

  it('hands the held ids to anything that asks', () => {
    render(
      <ProtectedProvider permissions={['user:read', 'user:create']}>
        <Held />
      </ProtectedProvider>,
    )

    expect(screen.getByTestId('held')).toHaveTextContent(
      'user:read,user:create',
    )
  })

  it('fails closed with no provider above it', () => {
    render(
      <>
        <Protected permissionIds={['user:read']}>
          <span>guarded</span>
        </Protected>
        <Protected>
          <span>ungated</span>
        </Protected>
      </>,
    )

    expect(screen.queryByText('guarded')).not.toBeInTheDocument()
    expect(screen.getByText('ungated')).toBeInTheDocument()
  })
})
