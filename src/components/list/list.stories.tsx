import type { Meta, StoryObj } from '@storybook/react-vite'
import { useCallback, useEffect, useState } from 'react'

import { Alert } from '@/components/alert'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { Skeleton } from '@/components/skeleton'

import { List } from './list'

type Order = {
  id: string
  customer: string
  route: string
  status: 'paid' | 'pending' | 'failed'
  total: string
}

type GithubRepository = {
  description: string | null
  full_name: string
  html_url: string
  id: number
  language: string | null
  stargazers_count: number
}

type GithubSearchResponse = {
  incomplete_results: boolean
  items: GithubRepository[]
  total_count: number
}

const orders: Order[] = [
  {
    customer: 'Alice Johnson',
    id: 'ORD-1001',
    route: 'Centro -> Aldeota',
    status: 'paid',
    total: 'R$ 42,90',
  },
  {
    customer: 'Bruno Lima',
    id: 'ORD-1002',
    route: 'Meireles -> Cambeba',
    status: 'pending',
    total: 'R$ 31,50',
  },
  {
    customer: 'Carla Mendes',
    id: 'ORD-1003',
    route: 'Papicu -> Parangaba',
    status: 'failed',
    total: 'R$ 28,00',
  },
  {
    customer: 'Diego Costa',
    id: 'ORD-1004',
    route: 'Benfica -> Messejana',
    status: 'paid',
    total: 'R$ 36,20',
  },
  {
    customer: 'Erika Souza',
    id: 'ORD-1005',
    route: 'Cocó -> Centro',
    status: 'pending',
    total: 'R$ 24,80',
  },
  {
    customer: 'Felipe Rocha',
    id: 'ORD-1006',
    route: 'Montese -> Varjota',
    status: 'paid',
    total: 'R$ 33,40',
  },
]

const statusLabel: Record<Order['status'], string> = {
  failed: 'Falhou',
  paid: 'Pago',
  pending: 'Pendente',
}

const statusVariant: Record<
  Order['status'],
  'destructive' | 'success' | 'warning'
> = {
  failed: 'destructive',
  paid: 'success',
  pending: 'warning',
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <Card.Header>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Card.Title>{order.customer}</Card.Title>
            <Card.Description>{order.route}</Card.Description>
          </div>
          <Badge variant={statusVariant[order.status]}>
            {statusLabel[order.status]}
          </Badge>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{order.id}</span>
          <span className="font-medium">{order.total}</span>
        </div>
      </Card.Content>
    </Card>
  )
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex min-h-16 min-w-0 items-center justify-between gap-3 px-1 py-2">
      <div className="min-w-0">
        <div className="truncate font-medium text-sm">{order.customer}</div>
        <div className="truncate text-muted-foreground text-xs">
          {order.route}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-medium text-sm">{order.total}</span>
        <Badge variant={statusVariant[order.status]}>
          {statusLabel[order.status]}
        </Badge>
      </div>
    </div>
  )
}

function GithubRepositoryCard({
  repository,
}: {
  repository: GithubRepository
}) {
  return (
    <Card>
      <Card.Header>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Card.Title>{repository.full_name}</Card.Title>
            <Card.Description>
              {repository.description ?? 'Sem descrição'}
            </Card.Description>
          </div>
          <Badge variant="solid">{repository.stargazers_count}</Badge>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-muted-foreground">
            {repository.language ?? 'Unknown'}
          </span>
          <a
            className="shrink-0 font-medium text-primary text-sm hover:underline"
            href={repository.html_url}
            rel="noreferrer"
            target="_blank"
          >
            Abrir no GitHub
          </a>
        </div>
      </Card.Content>
    </Card>
  )
}

const meta = {
  component: List<Order>,
  title: 'Data Display/List',
} satisfies Meta<typeof List<Order>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    itemKey: 'id',
    items: orders.slice(0, 3),
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const Empty: Story = {
  args: {
    emptySection: 'Nenhum pedido encontrado',
    itemKey: 'id',
    items: [],
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const Loading: Story = {
  args: {
    itemKey: 'id',
    items: [],
    loading: true,
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const ErrorState: Story = {
  args: {
    error: true,
    errorSection: 'Não foi possível carregar os pedidos',
    itemKey: 'id',
    items: [],
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const DividedCompact: Story = {
  args: {
    divided: true,
    gap: 'none',
    itemKey: 'id',
    items: orders,
    renderItem: (order) => <OrderRow order={order} />,
  },
}

export const PaddedWithFooter: Story = {
  args: {
    footerSection: (
      <div className="rounded-lg bg-muted p-3 text-muted-foreground text-sm">
        {orders.length} pedidos carregados localmente.
      </div>
    ),
    itemKey: 'id',
    items: orders.slice(0, 3),
    padded: true,
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const FunctionKey: Story = {
  args: {
    itemKey: (order) => `${order.id}-${order.status}`,
    items: orders.slice(0, 4),
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const CustomLoadingSection: Story = {
  args: {
    itemKey: 'id',
    items: [],
    loading: true,
    loadingSection: (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    ),
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const Paginated = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(2)
    const offset = (page - 1) * rowsPerPage

    return (
      <List<Order>
        itemKey="id"
        items={orders.slice(offset, offset + rowsPerPage)}
        pagination={{
          mode: 'offset',
          onPageChange: setPage,
          onRowsPerPageChange: (nextRowsPerPage) => {
            setRowsPerPage(nextRowsPerPage)
            setPage(1)
          },
          page,
          rowsPerPage,
          total: orders.length,
        }}
        renderItem={(order) => <OrderCard order={order} />}
      />
    )
  },
}

export const InfiniteLoadingMore: Story = {
  args: {
    infinite: {
      hasMore: true,
      loadingMore: true,
      loadingMoreText: 'Carregando pedidos...',
    },
    itemKey: 'id',
    items: orders.slice(0, 3),
    renderItem: (order) => <OrderCard order={order} />,
  },
}

export const Infinite = {
  render: () => {
    const [visibleCount, setVisibleCount] = useState(3)
    const visibleOrders = orders.slice(0, visibleCount)
    const hasMore = visibleCount < orders.length

    return (
      <List<Order>
        infinite={{
          endReachedSection: 'Todos os pedidos foram carregados',
          hasMore,
          loadingMoreText: 'Carregando pedidos...',
          loadMoreText: 'Ver mais pedidos',
          onLoadMore: () => {
            setVisibleCount((count) => Math.min(count + 1, orders.length))
          },
        }}
        itemKey="id"
        items={visibleOrders}
        renderItem={(order) => <OrderCard order={order} />}
      />
    )
  },
}

export const GithubApiInfinite = {
  render: () => {
    const [repositories, setRepositories] = useState<GithubRepository[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(false)

    const loadPage = useCallback(async (nextPage: number) => {
      if (nextPage === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      setError(false)

      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=topic:typescript&sort=stars&order=desc&per_page=8&page=${nextPage}`,
        )

        if (!response.ok) {
          throw new Error('GitHub request failed')
        }

        const data = (await response.json()) as GithubSearchResponse
        setRepositories((current) =>
          nextPage === 1 ? data.items : [...current, ...data.items],
        )
        setPage(nextPage)
        setHasMore(data.items.length > 0 && nextPage * 8 < data.total_count)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }, [])

    useEffect(() => {
      void loadPage(1)
    }, [loadPage])

    return (
      <List<GithubRepository>
        emptySection="Nenhum repositório encontrado"
        error={error}
        errorSection={
          <Alert variant="destructive">
            <Alert.Title>GitHub API indisponível</Alert.Title>
            <Alert.Description>
              A API pública pode bloquear chamadas por limite de taxa.
            </Alert.Description>
            <Alert.Action>
              <Button
                onClick={() => void loadPage(1)}
                size="sm"
                variant="outline"
              >
                Tentar novamente
              </Button>
            </Alert.Action>
          </Alert>
        }
        infinite={{
          disabled: loadingMore,
          endReachedSection:
            'Todos os repositórios disponíveis foram carregados',
          hasMore,
          loadingMore,
          loadingMoreText: 'Buscando no GitHub...',
          loadMoreText: 'Buscar mais repositórios',
          onLoadMore: () => void loadPage(page + 1),
        }}
        itemKey="id"
        items={repositories}
        loading={loading}
        loadingRows={4}
        renderItem={(repository) => (
          <GithubRepositoryCard repository={repository} />
        )}
      />
    )
  },
}
