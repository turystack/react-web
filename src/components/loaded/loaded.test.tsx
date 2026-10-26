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

  it('draws each state as a card with an icon, and says what to do', () => {
    const states: DataOutcome<Contract>[] = [
      {
        retry: vi.fn(),
        status: 'empty',
      },
      {
        error: new Error('boom'),
        retry: vi.fn(),
        status: 'error',
      },
      {
        reason: 'Contracts start on the Business plan',
        retry: vi.fn(),
        status: 'denied',
      },
    ]
    const { rerender } = render(
      <TuryProvider>
        <Loaded outcome={states[0] as DataOutcome<Contract>}>
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
      'No data found',
    )
    expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
      'When there is something to show, it appears here.',
    )
    expect(document.querySelector('.empty-state-icon svg')).not.toBeNull()

    for (const outcome of states.slice(1)) {
      rerender(
        <TuryProvider>
          <Loaded outcome={outcome}>{renderContract}</Loaded>
        </TuryProvider>,
      )

      // An error is a card like the others, not a sentence on its own.
      expect(document.querySelector('.empty-state-icon svg')).not.toBeNull()
    }

    rerender(
      <TuryProvider>
        <Loaded outcome={states[1] as DataOutcome<Contract>}>
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
      'Check your connection and try again.',
    )
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

describe('Loaded axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(
      <TuryProvider>
        <Loaded
          outcome={{
            retry: vi.fn(),
            status: 'empty',
          }}
        >
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByTestId('loaded-empty')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given on every state', () => {
    const { rerender } = render(
      <TuryProvider>
        <Loaded
          outcome={{
            retry: vi.fn(),
            status: 'pending',
          }}
          size="sm"
        >
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByTestId('loaded-pending')).toHaveAttribute(
      'data-size',
      'sm',
    )

    rerender(
      <TuryProvider>
        <Loaded
          outcome={{
            data: contract,
            refreshing: false,
            retry: vi.fn(),
            status: 'success',
          }}
          size="sm"
        >
          {renderContract}
        </Loaded>
      </TuryProvider>,
    )

    expect(screen.getByTestId('loaded-content')).toHaveAttribute(
      'data-size',
      'sm',
    )
  })
})
