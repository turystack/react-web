import type { Meta } from '@storybook/react-vite'
import { useCallback, useEffect, useState } from 'react'
import { Search, User } from '@/internal/icons'

import { SelectSheet } from './select-sheet'

const meta = {
  title: 'Mobile/SelectSheet',
} satisfies Meta

export default meta

type FrameworkOption = {
  id: string
  label: string
  group: string
}

type UserOption = {
  id: string
  name: string
  email: string
  role: string
}

type GitHubUserOption = {
  id: number
  login: string
  avatarUrl: string
  url: string
  type: string
}

type GitHubSearchResponse = {
  total_count: number
  items: Array<{
    avatar_url: string
    html_url: string
    id: number
    login: string
    type: string
  }>
}

const GITHUB_PAGE_SIZE = 10

const FRAMEWORKS: FrameworkOption[] = [
  {
    group: 'Frontend',
    id: 'react',
    label: 'React',
  },
  {
    group: 'Frontend',
    id: 'vue',
    label: 'Vue',
  },
  {
    group: 'Frontend',
    id: 'angular',
    label: 'Angular',
  },
  {
    group: 'Backend',
    id: 'node',
    label: 'Node.js',
  },
  {
    group: 'Backend',
    id: 'rails',
    label: 'Ruby on Rails',
  },
  {
    group: 'Backend',
    id: 'django',
    label: 'Django',
  },
]

const USERS: UserOption[] = [
  {
    email: 'ana@oabus.com',
    id: 'ana',
    name: 'Ana Souza',
    role: 'Designer',
  },
  {
    email: 'bruno@oabus.com',
    id: 'bruno',
    name: 'Bruno Lima',
    role: 'Engineer',
  },
  {
    email: 'carla@oabus.com',
    id: 'carla',
    name: 'Carla Dias',
    role: 'Product',
  },
  {
    email: 'diego@oabus.com',
    id: 'diego',
    name: 'Diego Matos',
    role: 'Engineer',
  },
]

export const SingleSearchable = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)

    return (
      <div className="max-w-sm">
        <SelectSheet<FrameworkOption>
          leftSection={<Search className="size-4" />}
          mode="single"
          onChange={setValue}
          optionGroup="group"
          optionLabel="label"
          options={FRAMEWORKS}
          optionValue="id"
          placeholder="Select framework"
          searchable
          title="Framework"
          value={value}
        />
      </div>
    )
  },
}

export const WithDefaultValue = {
  render: () => (
    <div className="max-w-sm">
      <SelectSheet<FrameworkOption>
        defaultValue="vue"
        mode="single"
        optionGroup="group"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Select framework"
        title="Framework"
      />
    </div>
  ),
}

export const Ghost = {
  render: () => (
    <div className="max-w-sm">
      <SelectSheet<FrameworkOption>
        mode="single"
        optionGroup="group"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Borderless select"
        title="Framework"
        variant="ghost"
      />
    </div>
  ),
}

export const ControlledSearch = {
  render: () => {
    const [search, setSearch] = useState('')
    const [value, setValue] = useState<string | null>(null)
    const filtered = search
      ? FRAMEWORKS.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase()),
        )
      : FRAMEWORKS

    return (
      <div className="flex max-w-sm flex-col gap-2">
        <SelectSheet<FrameworkOption>
          debounce
          mode="single"
          onChange={setValue}
          onSearchChange={setSearch}
          optionGroup="group"
          optionLabel="label"
          options={filtered}
          optionValue="id"
          placeholder="Search framework"
          searchable
          searchValue={search}
          title="Framework"
          value={value}
        />
        <span className="text-muted-foreground text-xs">
          Search: {search || 'empty'}
        </span>
      </div>
    )
  },
}

export const MultipleUsers = {
  render: () => {
    const [value, setValue] = useState<string[]>(['ana'])

    return (
      <div className="max-w-sm">
        <SelectSheet<UserOption, string, string>
          mode="multiple"
          onChange={setValue}
          optionLabel="name"
          options={USERS}
          optionValue="id"
          placeholder="Select assignees"
          renderOption={(user) => (
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">
                {user.email} · {user.role}
              </span>
            </div>
          )}
          renderValue={(user) => user.name}
          searchable
          searchPlaceholder="Search users..."
          title="Assignees"
          value={value}
        />
      </div>
    )
  },
}

export const CustomRender = {
  render: () => {
    const [value, setValue] = useState<string | null>('bruno')

    return (
      <div className="max-w-sm">
        <SelectSheet<UserOption>
          leftSection={<User className="size-4" />}
          mode="single"
          onChange={setValue}
          optionLabel="name"
          options={USERS}
          optionValue="id"
          placeholder="Select user"
          renderOption={(user) => (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs">
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </span>
            </div>
          )}
          renderValue={(user) => user.name}
          searchable
          title="User"
          value={value}
        />
      </div>
    )
  },
}

export const LoadingAndDisabled = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <SelectSheet<FrameworkOption>
        loading
        mode="single"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Loading frameworks"
      />
      <SelectSheet<FrameworkOption>
        disabled
        mode="single"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Disabled select"
      />
    </div>
  ),
}

export const SideSheet = {
  render: () => (
    <div className="max-w-sm">
      <SelectSheet<FrameworkOption>
        mode="single"
        optionGroup="group"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Open right sheet"
        searchable
        sheetSize="sm"
        side="right"
        title="Right side select"
      />
    </div>
  ),
}

export const InfiniteLoading = {
  render: () => (
    <div className="max-w-sm">
      <SelectSheet<FrameworkOption>
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more frameworks...',
        }}
        mode="single"
        optionGroup="group"
        optionLabel="label"
        options={FRAMEWORKS}
        optionValue="id"
        placeholder="Select framework"
        searchable
        title="Infinite list"
      />
    </div>
  ),
}

export const EmptyOptionsOpen = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <div className="max-w-sm">
        <SelectSheet<UserOption>
          emptySection="No users available."
          leftSection={<User className="size-4" />}
          mode="single"
          onOpenChange={setOpen}
          open={open}
          optionLabel="name"
          options={[]}
          optionValue="id"
          placeholder="Select user"
          searchable
          title="Users"
        />
      </div>
    )
  },
}

export const NoSearchResultsOpen = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [search, setSearch] = useState('svelte')
    const filtered = FRAMEWORKS.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    )

    return (
      <div className="max-w-sm">
        <SelectSheet<FrameworkOption>
          mode="single"
          onOpenChange={setOpen}
          onSearchChange={setSearch}
          open={open}
          optionGroup="group"
          optionLabel="label"
          options={filtered}
          optionValue="id"
          placeholder="Search framework"
          searchable
          searchValue={search}
          title="No results"
        />
      </div>
    )
  },
}

export const LoadingEmptyOpen = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <div className="max-w-sm">
        <SelectSheet<UserOption>
          loading
          mode="single"
          onOpenChange={setOpen}
          open={open}
          optionLabel="name"
          options={[]}
          optionValue="id"
          placeholder="Loading users"
          searchable
          title="Loading"
        />
      </div>
    )
  },
}

export const GitHubAsyncSearch = {
  render: () => {
    const [search, setSearch] = useState('openai')
    const [value, setValue] = useState<number | null>(null)
    const [options, setOptions] = useState<GitHubUserOption[]>([])
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const cappedTotal = Math.min(totalCount, 1000)
    const hasMore = options.length < cappedTotal

    useEffect(() => {
      const query = search.trim()
      if (!query) {
        setOptions([])
        setPage(1)
        setTotalCount(0)
        setError(null)
        return
      }

      const controller = new AbortController()
      setLoading(true)
      setError(null)
      setPage(1)

      fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&page=1&per_page=${GITHUB_PAGE_SIZE}`,
        {
          signal: controller.signal,
        },
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`)
          }
          return response.json() as Promise<GitHubSearchResponse>
        })
        .then((data) => {
          setTotalCount(data.total_count)
          setOptions(
            data.items.map((item) => ({
              avatarUrl: item.avatar_url,
              id: item.id,
              login: item.login,
              type: item.type,
              url: item.html_url,
            })),
          )
        })
        .catch((requestError: Error) => {
          if (requestError.name !== 'AbortError') {
            setError(requestError.message)
            setOptions([])
            setTotalCount(0)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })

      return () => controller.abort()
    }, [search])

    const handleLoadMore = useCallback(() => {
      const query = search.trim()
      if (!query || loading || loadingMore || !hasMore) {
        return
      }

      const nextPage = page + 1
      setLoadingMore(true)
      setError(null)

      fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&page=${nextPage}&per_page=${GITHUB_PAGE_SIZE}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`)
          }
          return response.json() as Promise<GitHubSearchResponse>
        })
        .then((data) => {
          setPage(nextPage)
          setTotalCount(data.total_count)
          setOptions((currentOptions) => [
            ...currentOptions,
            ...data.items.map((item) => ({
              avatarUrl: item.avatar_url,
              id: item.id,
              login: item.login,
              type: item.type,
              url: item.html_url,
            })),
          ])
        })
        .catch((requestError: Error) => {
          setError(requestError.message)
        })
        .finally(() => {
          setLoadingMore(false)
        })
    }, [hasMore, loading, loadingMore, page, search])

    return (
      <div className="flex max-w-sm flex-col gap-2">
        <SelectSheet<GitHubUserOption, number, number>
          debounce
          emptySection={error ?? 'No GitHub users found.'}
          infinite={{
            hasMore,
            loadingMore,
            loadingMoreText: 'Loading more GitHub users...',
            onLoadMore: handleLoadMore,
          }}
          loading={loading}
          mode="single"
          onChange={setValue}
          onSearchChange={setSearch}
          optionLabel="login"
          options={options}
          optionValue="id"
          placeholder="Search GitHub users"
          renderOption={(user) => (
            <div className="flex min-w-0 items-center gap-3">
              <img
                alt=""
                className="size-8 shrink-0 rounded-full"
                src={user.avatarUrl}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{user.login}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.type} · {user.url}
                </span>
              </span>
            </div>
          )}
          renderValue={(user) => user.login}
          searchable
          searchPlaceholder="Type a GitHub username..."
          searchValue={search}
          title="GitHub users"
          value={value}
        />
        <span className="text-muted-foreground text-xs">
          Selected GitHub user id: {value ?? 'none'} · Loaded {options.length}
          {totalCount ? ` of ${cappedTotal}` : ''}
        </span>
      </div>
    )
  },
}

export const EmptyState = {
  render: () => (
    <div className="max-w-sm">
      <SelectSheet<UserOption>
        emptySection="No users available."
        leftSection={<User className="size-4" />}
        mode="single"
        optionLabel="name"
        options={[]}
        optionValue="id"
        placeholder="Select user"
        searchable
        title="Users"
      />
    </div>
  ),
}
