import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DataOutcome } from '@turystack/react-hooks'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { List } from './list'

type Order = {
  id: string
  label: string
}

const orders: Order[] = [
  {
    id: 'o1',
    label: 'Order one',
  },
  {
    id: 'o2',
    label: 'Order two',
  },
]

function renderOrder(order: Order) {
  return <span>{order.label}</span>
}

describe('List', () => {
  it('renders one entry per item through renderItem', () => {
    render(<List itemKey="id" items={orders} renderItem={renderOrder} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Order one')).toBeInTheDocument()
    expect(screen.getByText('Order two')).toBeInTheDocument()
  })

  it('hands renderItem the item and its position', () => {
    render(
      <List
        itemKey="id"
        items={orders}
        renderItem={(order, index) => (
          <span>
            {order.label} at {index}
          </span>
        )}
      />,
    )

    expect(screen.getByText('Order one at 0')).toBeInTheDocument()
    expect(screen.getByText('Order two at 1')).toBeInTheDocument()
  })

  it('accepts a function itemKey and still renders every item', () => {
    render(
      <List
        itemKey={(order, index) => `${order.id}-${index}`}
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows the empty state when it has no items', () => {
    render(<List itemKey="id" items={[]} renderItem={renderOrder} />)

    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('shows the empty state when items is omitted', () => {
    render(<List itemKey="id" renderItem={renderOrder} />)

    expect(screen.getByText('No data found')).toBeInTheDocument()
  })

  it('replaces the empty state with emptySection', () => {
    render(
      <List
        emptySection={<span>No orders yet</span>}
        itemKey="id"
        items={[]}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('No orders yet')).toBeInTheDocument()
    expect(screen.queryByText('No data found')).not.toBeInTheDocument()
  })
})

describe('List loading', () => {
  it('shows placeholder rows instead of items while loading with no data', () => {
    render(<List itemKey="id" items={[]} loading renderItem={renderOrder} />)

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryByText('No data found')).not.toBeInTheDocument()
  })

  it('renders as many placeholder rows as loadingRows asks for', () => {
    render(
      <List
        itemKey="id"
        items={[]}
        loading
        loadingRows={5}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(5)
  })

  it('replaces the placeholder rows with loadingSection', () => {
    render(
      <List
        itemKey="id"
        items={[]}
        loading
        loadingSection={<span>Fetching orders</span>}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('Fetching orders')).toBeInTheDocument()
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
  })

  it('keeps the items on screen when loading arrives with data', () => {
    render(
      <List itemKey="id" items={orders} loading renderItem={renderOrder} />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
  })
})

describe('List error', () => {
  it('shows the error state when it fails with no data', () => {
    render(<List error itemKey="id" items={[]} renderItem={renderOrder} />)

    expect(screen.getByText('The data could not be loaded')).toBeInTheDocument()
    expect(screen.queryByText('No data found')).not.toBeInTheDocument()
  })

  it('replaces the error state with errorSection', () => {
    render(
      <List
        error
        errorSection={<span>Could not load orders</span>}
        itemKey="id"
        items={[]}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('Could not load orders')).toBeInTheDocument()
  })

  it('keeps the items on screen when the error arrives with data', () => {
    render(<List error itemKey="id" items={orders} renderItem={renderOrder} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(
      screen.queryByText('The data could not be loaded'),
    ).not.toBeInTheDocument()
  })

  it('prefers the loading state over the error state', () => {
    render(
      <List error itemKey="id" items={[]} loading renderItem={renderOrder} />,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
    expect(
      screen.queryByText('The data could not be loaded'),
    ).not.toBeInTheDocument()
  })
})

describe('List footer', () => {
  it('renders footerSection below the items', () => {
    render(
      <List
        footerSection={<span>2 orders</span>}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('2 orders')).toBeInTheDocument()
  })

  it('renders footerSection next to the empty state too', () => {
    render(
      <List
        footerSection={<span>0 orders</span>}
        itemKey="id"
        items={[]}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('0 orders')).toBeInTheDocument()
    expect(screen.getByText('No data found')).toBeInTheDocument()
  })
})

describe('List pagination mode', () => {
  it('renders the pagination control beside the items', () => {
    render(
      <List
        itemKey="id"
        items={orders}
        pagination={{
          hasNextPage: true,
          mode: 'cursor',
          rowsPerPage: 20,
        }}
        renderItem={renderOrder}
      />,
    )

    expect(
      screen.getByRole('navigation', {
        name: 'pagination',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('list-infinite')).not.toBeInTheDocument()
  })

  it('delivers the requested page through the pagination control', async () => {
    const onPageChange = vi.fn()
    render(
      <List
        itemKey="id"
        items={orders}
        pagination={{
          mode: 'offset',
          onPageChange,
          onRowsPerPageChange: vi.fn(),
          page: 1,
          rowsPerPage: 20,
          total: 40,
        }}
        renderItem={renderOrder}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: '2',
      }),
    )

    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})

describe('List infinite mode', () => {
  it('loads the next chunk from the manual fallback', async () => {
    const onLoadMore = vi.fn()
    render(
      <List
        infinite={{
          hasMore: true,
          onLoadMore,
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Load more',
      }),
    )

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('labels the manual fallback with loadMoreText', () => {
    render(
      <List
        infinite={{
          hasMore: true,
          loadMoreText: 'Show more orders',
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Show more orders',
      }),
    ).toBeInTheDocument()
  })

  it('shows the incremental indicator and withdraws the trigger while loading more', () => {
    render(
      <List
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more orders',
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('Loading more orders')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Load more',
      }),
    ).not.toBeInTheDocument()
  })

  it('withdraws the trigger when the infinite mode is disabled', () => {
    render(
      <List
        infinite={{
          disabled: true,
          hasMore: true,
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(
      screen.queryByRole('button', {
        name: 'Load more',
      }),
    ).not.toBeInTheDocument()
  })

  it('withdraws the trigger when no onLoadMore was given', () => {
    render(
      <List
        infinite={{
          hasMore: true,
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(
      screen.queryByRole('button', {
        name: 'Load more',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows endReachedSection once there is nothing left to load', () => {
    render(
      <List
        infinite={{
          endReachedSection: <span>All orders loaded</span>,
          hasMore: false,
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getByText('All orders loaded')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Load more',
      }),
    ).not.toBeInTheDocument()
  })

  it('keeps endReachedSection away while more can still be loaded', () => {
    render(
      <List
        infinite={{
          endReachedSection: <span>All orders loaded</span>,
          hasMore: true,
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.queryByText('All orders loaded')).not.toBeInTheDocument()
  })

  it('drops the infinite controls entirely when the list is empty', () => {
    render(
      <List
        infinite={{
          hasMore: true,
          onLoadMore: vi.fn(),
        }}
        itemKey="id"
        items={[]}
        renderItem={renderOrder}
      />,
    )

    expect(screen.queryByTestId('list-infinite')).not.toBeInTheDocument()
    expect(screen.getByText('No data found')).toBeInTheDocument()
  })

  it('accepts a custom rootMargin without disturbing the items', () => {
    render(
      <List
        infinite={{
          hasMore: true,
          onLoadMore: vi.fn(),
          rootMargin: '400px',
        }}
        itemKey="id"
        items={orders}
        renderItem={renderOrder}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe.each(['none', 'xs', 'sm', 'md', 'lg'] as const)(
  'List gap %s',
  (gap) => {
    it('keeps every item reachable', () => {
      render(
        <List gap={gap} itemKey="id" items={orders} renderItem={renderOrder} />,
      )

      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  },
)

describe('List layout booleans', () => {
  it('keeps every item reachable when divided', () => {
    render(
      <List divided itemKey="id" items={orders} renderItem={renderOrder} />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('keeps every item reachable when padded', () => {
    render(<List itemKey="id" items={orders} padded renderItem={renderOrder} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('List labels', () => {
  it('takes the empty message from the provider', () => {
    render(
      <TuryProvider
        labels={{
          list: {
            empty: 'Nenhum dado encontrado',
          },
        }}
      >
        <List itemKey="id" items={[]} renderItem={renderOrder} />
      </TuryProvider>,
    )

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument()
  })

  it('takes the error message from the provider', () => {
    render(
      <TuryProvider
        labels={{
          list: {
            error: 'Não foi possível carregar os dados',
          },
        }}
      >
        <List error itemKey="id" items={[]} renderItem={renderOrder} />
      </TuryProvider>,
    )

    expect(
      screen.getByText('Não foi possível carregar os dados'),
    ).toBeInTheDocument()
  })

  it('takes the load-more action from the provider', () => {
    render(
      <TuryProvider
        labels={{
          list: {
            loadMore: 'Carregar mais',
          },
        }}
      >
        <List
          infinite={{
            hasMore: true,
            onLoadMore: vi.fn(),
          }}
          itemKey="id"
          items={orders}
          renderItem={renderOrder}
        />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Carregar mais',
      }),
    ).toBeInTheDocument()
  })

  it('keeps emptySection ahead of the provider', () => {
    render(
      <TuryProvider
        labels={{
          list: {
            empty: 'Nenhum dado encontrado',
          },
        }}
      >
        <List
          emptySection="Nothing to show"
          itemKey="id"
          items={[]}
          renderItem={renderOrder}
        />
      </TuryProvider>,
    )

    expect(screen.getByText('Nothing to show')).toBeInTheDocument()
    expect(screen.queryByText('Nenhum dado encontrado')).not.toBeInTheDocument()
  })
})

describe('List infinite sentinel', () => {
  it('observes the sentinel that only appears once items arrive', () => {
    const observed: Element[] = []
    let fire: (() => void) | undefined

    class ObserverStub {
      readonly root = null
      readonly rootMargin = ''
      readonly thresholds: number[] = []

      constructor(callback: IntersectionObserverCallback) {
        fire = () =>
          callback(
            [
              {
                isIntersecting: true,
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          )
      }

      observe(node: Element) {
        observed.push(node)
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }

    const original = globalThis.IntersectionObserver
    vi.stubGlobal('IntersectionObserver', ObserverStub)

    try {
      const onLoadMore = vi.fn()
      const infinite = {
        hasMore: true,
        onLoadMore,
      }
      const { rerender } = render(
        <List
          infinite={infinite}
          itemKey="id"
          items={[]}
          renderItem={renderOrder}
        />,
      )

      rerender(
        <List
          infinite={infinite}
          itemKey="id"
          items={orders}
          renderItem={renderOrder}
        />,
      )

      expect(observed).toContain(screen.getByTestId('list-sentinel'))

      fire?.()

      expect(onLoadMore).toHaveBeenCalledTimes(1)
    } finally {
      vi.stubGlobal('IntersectionObserver', original)
    }
  })
})

describe('List outcome', () => {
  it('draws skeleton rows while the read is pending', () => {
    const outcome: DataOutcome<Order[]> = {
      retry: vi.fn(),
      status: 'pending',
    }

    render(
      <TuryProvider>
        <List<Order>
          itemKey="id"
          loadingRows={2}
          outcome={outcome}
          renderItem={renderOrder}
        />
      </TuryProvider>,
    )

    expect(screen.getAllByTestId('skeleton')).toHaveLength(2)
  })

  it('offers a retry on a failed read', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const outcome: DataOutcome<Order[]> = {
      error: new Error('boom'),
      retry,
      status: 'error',
    }

    render(
      <TuryProvider>
        <List<Order> itemKey="id" outcome={outcome} renderItem={renderOrder} />
      </TuryProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('states the reason on a denied read and offers no retry', () => {
    const outcome: DataOutcome<Order[]> = {
      reason: 'Ask an administrator for access',
      retry: vi.fn(),
      status: 'denied',
    }

    render(
      <TuryProvider>
        <List<Order> itemKey="id" outcome={outcome} renderItem={renderOrder} />
      </TuryProvider>,
    )

    expect(screen.getByTestId('list-denied')).toBeTruthy()
    expect(screen.getByText('Ask an administrator for access')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })

  it('tells an empty read apart from a failed one', () => {
    const outcome: DataOutcome<Order[]> = {
      data: [],
      refreshing: false,
      retry: vi.fn(),
      status: 'success',
    }

    render(
      <TuryProvider>
        <List<Order> itemKey="id" outcome={outcome} renderItem={renderOrder} />
      </TuryProvider>,
    )

    expect(screen.getByTestId('list-empty')).toBeTruthy()
    expect(screen.queryByTestId('list-error')).toBeNull()
  })

  it('keeps the rows when only the next page failed', () => {
    const outcome: DataOutcome<Order[]> = {
      data: orders,
      refreshing: false,
      retry: vi.fn(),
      status: 'success',
    }

    render(
      <TuryProvider>
        <List<Order>
          infinite={{
            error: true,
            errorSection: <span>Could not load more</span>,
            hasMore: true,
            onLoadMore: vi.fn(),
          }}
          itemKey="id"
          outcome={outcome}
          renderItem={renderOrder}
        />
      </TuryProvider>,
    )

    expect(screen.getByText('Order one')).toBeTruthy()
    expect(screen.getByTestId('list-load-more-error')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()
  })
})
