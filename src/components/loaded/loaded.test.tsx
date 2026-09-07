import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DataOutcome } from '@turystack/react-hooks'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState } from '@/components/empty-state'
import { TuryProvider } from '@/components/tury-provider'

import { Loaded } from './loaded'

type Contract = {
  id: string
  title: string
}

const contract: Contract = {
  id: 'c1',
  title: 'Business',
}

function renderContract(value: Contract) {
  return <span>{value.title}</span>
}

describe('Loaded', () => {
  it('draws skeletons while the read is pending', () => {
    const outcome: DataOutcome<Contract> = {
      retry: vi.fn(),
      status: 'pending',
    }

    render(
      <TuryProvider>
        <Loaded loadingRows={2} outcome={outcome}>
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(2)
    expect(screen.queryByText('Business')).toBeNull()
  })

  it('states the reason on a denied read and offers no retry', () => {
    const outcome: DataOutcome<Contract> = {
      reason: 'Usage reports start on the Business contract',
      retry: vi.fn(),
      status: 'denied',
    }

    render(
      <TuryProvider>
        <Loaded outcome={outcome}>{renderContract}</Loaded>
      </TuryProvider>,
    )

    expect(
      screen.getByText('Usage reports start on the Business contract'),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', {
        name: 'Try again',
      }),
    ).toBeNull()
  })

  it('offers a retry on a failed read', async () => {
    const retry = vi.fn()
    const outcome: DataOutcome<Contract> = {
      error: new Error('boom'),
      retry,
      status: 'error',
    }

    render(
      <TuryProvider>
        <Loaded outcome={outcome}>{renderContract}</Loaded>
      </TuryProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Try again',
      }),
    )

    expect(retry).toHaveBeenCalledOnce()
  })

  it('takes an empty section of its own', () => {
    const outcome: DataOutcome<Contract> = {
      retry: vi.fn(),
      status: 'empty',
    }

    render(
      <TuryProvider>
        <Loaded
          emptySection={<EmptyState title="No contract on this account" />}
          outcome={outcome}
        >
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByText('No contract on this account')).toBeTruthy()
  })

  it('renders the children on success and marks a refresh as busy', () => {
    const outcome: DataOutcome<Contract> = {
      data: contract,
      refreshing: true,
      retry: vi.fn(),
      status: 'success',
    }

    render(
      <TuryProvider>
        <Loaded outcome={outcome}>{renderContract}</Loaded>
      </TuryProvider>,
    )

    const content = screen.getByTestId('loaded-content')
    expect(screen.getByText('Business')).toBeTruthy()
    expect(content.getAttribute('aria-busy')).toBe('true')
  })
})
