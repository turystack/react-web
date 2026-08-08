import type { Meta } from '@storybook/react-vite'
import { useState } from 'react'

import { Select } from './select'

// Select is a generic component — component field is omitted from meta
// to avoid TypeScript inference issues with generic function types.
const meta = {
  title: 'Form/Select',
} satisfies Meta

export default meta

type Option = {
  id: string
  label: string
  group?: string
}

type UserOption = {
  id: string
  name: string
  email: string
  avatar: string
  role: string
}

type StatusOption = {
  value: string
  label: string
  color: string
  description: string
}

const OPTIONS: Option[] = [
  {
    group: 'Frontend',
    id: '1',
    label: 'React',
  },
  {
    group: 'Frontend',
    id: '2',
    label: 'Vue',
  },
  {
    group: 'Frontend',
    id: '3',
    label: 'Angular',
  },
  {
    group: 'Backend',
    id: '4',
    label: 'Node.js',
  },
  {
    group: 'Backend',
    id: '5',
    label: 'Django',
  },
  {
    group: 'Backend',
    id: '6',
    label: 'Rails',
  },
  {
    group: 'Backend',
    id: '7',
    label: 'Express',
  },
  {
    group: 'Backend',
    id: '8',
    label: 'FastAPI',
  },
  {
    group: 'Backend',
    id: '9',
    label: 'Flask',
  },
  {
    group: 'Backend',
    id: '10',
    label: 'Spring Boot',
  },
  {
    group: 'Backend',
    id: '11',
    label: 'Laravel',
  },
  {
    group: 'Backend',
    id: '12',
    label: 'NestJS',
  },
  {
    group: 'Backend',
    id: '13',
    label: 'Phoenix',
  },
  {
    group: 'Backend',
    id: '14',
    label: 'Ruby on Rails',
  },
  {
    group: 'Backend',
    id: '15',
    label: 'Symfony',
  },
]

const USER_OPTIONS: UserOption[] = [
  {
    avatar: 'AS',
    email: 'ana@oabus.com',
    id: '1',
    name: 'Ana Souza',
    role: 'Designer',
  },
  {
    avatar: 'BL',
    email: 'bruno@oabus.com',
    id: '2',
    name: 'Bruno Lima',
    role: 'Engineer',
  },
  {
    avatar: 'CD',
    email: 'carla@oabus.com',
    id: '3',
    name: 'Carla Dias',
    role: 'Product',
  },
  {
    avatar: 'DM',
    email: 'diego@oabus.com',
    id: '4',
    name: 'Diego Matos',
    role: 'Engineer',
  },
]

const STATUS_OPTIONS: StatusOption[] = [
  {
    color: 'bg-green-500',
    description: 'Currently operational',
    label: 'Active',
    value: 'active',
  },
  {
    color: 'bg-yellow-500',
    description: 'Awaiting approval',
    label: 'Pending',
    value: 'pending',
  },
  {
    color: 'bg-orange-500',
    description: 'Temporarily stopped',
    label: 'Paused',
    value: 'paused',
  },
  {
    color: 'bg-red-500',
    description: 'Not operational',
    label: 'Inactive',
    value: 'inactive',
  },
]

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Single = {
  render: () => (
    <Select<Option>
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select a framework..."
    />
  ),
}

export const SingleWithDefaultValue = {
  render: () => (
    <Select<Option>
      defaultValue="2"
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select a framework..."
    />
  ),
}

export const SingleControlled = {
  render: () => {
    const [value, setValue] = useState<string | null>('3')
    return (
      <div className="flex flex-col gap-3">
        <Select<Option>
          mode="single"
          onChange={setValue}
          optionLabel="label"
          options={OPTIONS}
          optionValue="id"
          placeholder="Select a framework..."
          value={value}
        />
        <p className="text-muted-foreground text-sm">
          Selected: <strong>{value ?? 'none'}</strong>
        </p>
      </div>
    )
  },
}

export const SingleSearchable = {
  render: () => (
    <Select<Option>
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Search frameworks..."
      searchable
    />
  ),
}

export const Ghost = {
  render: () => (
    <Select<Option>
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Borderless select..."
      variant="ghost"
    />
  ),
}

export const SingleDebouncedSearch = {
  render: () => {
    const [search, setSearch] = useState('')
    const filteredOptions = search
      ? OPTIONS.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase()),
        )
      : OPTIONS

    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Select<Option>
          debounce
          mode="single"
          onSearchChange={setSearch}
          optionLabel="label"
          options={filteredOptions}
          optionValue="id"
          placeholder="Search frameworks..."
          searchable
        />
        <span className="text-muted-foreground text-xs">
          Debounced search: {search || 'empty'}
        </span>
      </div>
    )
  },
}

export const SingleControlledSearch = {
  render: () => {
    const [search, setSearch] = useState('re')
    const filteredOptions = search
      ? OPTIONS.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase()),
        )
      : OPTIONS

    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Select<Option>
          mode="single"
          onSearchChange={setSearch}
          optionLabel="label"
          options={filteredOptions}
          optionValue="id"
          placeholder="Search frameworks..."
          searchable
          searchValue={search}
        />
        <span className="text-muted-foreground text-xs">
          Controlled search: {search || 'empty'}
        </span>
      </div>
    )
  },
}

export const SingleGrouped = {
  render: () => (
    <Select<Option>
      mode="single"
      optionGroup="group"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select a framework..."
    />
  ),
}

// ─── renderOption ─────────────────────────────────────────────────────────────

export const WithRenderOption = {
  render: () => (
    <Select<StatusOption>
      mode="single"
      optionLabel="label"
      options={STATUS_OPTIONS}
      optionValue="value"
      placeholder="Select a status..."
      renderOption={(option) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${option.color}`} />
            <span>{option.label}</span>
          </div>
          <span className="pl-4 text-muted-foreground text-xs">
            {option.description}
          </span>
        </div>
      )}
    />
  ),
}

export const WithRenderOptionUsers = {
  render: () => (
    <Select<UserOption>
      mode="single"
      optionLabel="name"
      options={USER_OPTIONS}
      optionValue="id"
      placeholder="Assign to..."
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground">
            {option.avatar}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{option.name}</span>
            <span className="text-muted-foreground text-xs">{option.role}</span>
          </div>
        </div>
      )}
    />
  ),
}

// ─── renderValue ──────────────────────────────────────────────────────────────

export const WithRenderValue = {
  render: () => (
    <Select<StatusOption>
      defaultValue="active"
      mode="single"
      optionLabel="label"
      options={STATUS_OPTIONS}
      optionValue="value"
      placeholder="Select a status..."
      renderValue={(option) => (
        <div className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${option.color}`} />
          <span>{option.label}</span>
        </div>
      )}
    />
  ),
}

// ─── renderOption + renderValue ───────────────────────────────────────────────

export const WithBothRenderers = {
  render: () => {
    const [value, setValue] = useState<string | null>(null)
    const selected = STATUS_OPTIONS.find((o) => o.value === value) ?? null
    return (
      <div className="flex flex-col gap-3">
        <Select<StatusOption>
          mode="single"
          onChange={setValue}
          optionLabel="label"
          options={STATUS_OPTIONS}
          optionValue="value"
          placeholder="Select a status..."
          renderOption={(option) => (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${option.color}`} />
                <span>{option.label}</span>
              </div>
              <span className="pl-4 text-muted-foreground text-xs">
                {option.description}
              </span>
            </div>
          )}
          renderValue={(option) => (
            <div className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${option.color}`} />
              <span>{option.label}</span>
            </div>
          )}
          value={value}
        />
        {selected && (
          <p className="text-muted-foreground text-sm">
            {selected.label}: {selected.description}
          </p>
        )}
      </div>
    )
  },
}

export const WithUserRenderBoth = {
  render: () => (
    <Select<UserOption>
      defaultValue="2"
      mode="single"
      optionLabel="name"
      options={USER_OPTIONS}
      optionValue="id"
      placeholder="Assign to..."
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground">
            {option.avatar}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{option.name}</span>
            <span className="text-muted-foreground text-xs">
              {option.email}
            </span>
          </div>
        </div>
      )}
      renderValue={(option) => (
        <div className="flex items-center gap-1.5">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-[9px] text-primary-foreground">
            {option.avatar}
          </span>
          <span className="text-sm">{option.name}</span>
        </div>
      )}
    />
  ),
}

// ─── Multiple ─────────────────────────────────────────────────────────────────

export const Multiple = {
  render: () => (
    <Select<Option>
      mode="multiple"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select frameworks..."
    />
  ),
}

export const MultipleWithDefaultValue = {
  render: () => (
    <Select<Option>
      defaultValue={['1', '4']}
      mode="multiple"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select frameworks..."
    />
  ),
}

export const MultipleSearchable = {
  render: () => (
    <Select<Option>
      mode="multiple"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select frameworks..."
      searchable
    />
  ),
}

export const MultipleDebouncedSearch = {
  render: () => {
    const [search, setSearch] = useState('')
    const filteredOptions = search
      ? OPTIONS.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase()),
        )
      : OPTIONS

    return (
      <div className="flex w-full max-w-md flex-col gap-2">
        <Select<Option>
          debounce
          mode="multiple"
          onSearchChange={setSearch}
          optionLabel="label"
          options={filteredOptions}
          optionValue="id"
          placeholder="Select frameworks..."
          searchable
        />
        <span className="text-muted-foreground text-xs">
          Debounced search: {search || 'empty'}
        </span>
      </div>
    )
  },
}

export const MultipleGrouped = {
  render: () => (
    <Select<Option>
      defaultValue={['1', '5']}
      mode="multiple"
      optionGroup="group"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Select frameworks..."
    />
  ),
}

export const MultipleWithRenderOption = {
  render: () => (
    <Select<UserOption>
      mode="multiple"
      optionLabel="name"
      options={USER_OPTIONS}
      optionValue="id"
      placeholder="Select team members..."
      renderOption={(option) => (
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground">
            {option.avatar}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{option.name}</span>
            <span className="text-muted-foreground text-xs">{option.role}</span>
          </div>
        </div>
      )}
      renderValue={(option) => option.name.split(' ')[0]}
    />
  ),
}

// ─── States ───────────────────────────────────────────────────────────────────

export const Loading = {
  render: () => (
    <Select<Option>
      loading
      mode="single"
      optionLabel="label"
      options={[]}
      optionValue="id"
      placeholder="Loading..."
    />
  ),
}

export const Disabled = {
  render: () => (
    <Select<Option>
      disabled
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Disabled"
    />
  ),
}

export const DisabledWithValue = {
  render: () => (
    <Select<Option>
      defaultValue="1"
      disabled
      mode="single"
      optionLabel="label"
      options={OPTIONS}
      optionValue="id"
      placeholder="Disabled"
    />
  ),
}

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Select<Option>
        mode="single"
        optionLabel="label"
        options={OPTIONS}
        optionValue="id"
        placeholder="Small (sm)"
        size="sm"
      />
      <Select<Option>
        mode="single"
        optionLabel="label"
        options={OPTIONS}
        optionValue="id"
        placeholder="Medium (md)"
        size="md"
      />
      <Select<Option>
        mode="single"
        optionLabel="label"
        options={OPTIONS}
        optionValue="id"
        placeholder="Large (lg)"
        size="lg"
      />
    </div>
  ),
}
