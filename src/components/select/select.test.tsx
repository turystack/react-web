import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DataOutcome } from '@turystack/react-hooks'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Select } from './select'

type Fruit = {
  family: string
  id: string
  name: string
}

const fruits: Fruit[] = [
  {
    family: 'Rosaceae',
    id: 'a1',
    name: 'Apple',
  },
  {
    family: 'Musaceae',
    id: 'b2',
    name: 'Banana',
  },
  {
    family: 'Rosaceae',
    id: 'c3',
    name: 'Cherry',
  },
]

const date: Fruit = {
  family: 'Arecaceae',
  id: 'd4',
  name: 'Date',
}

describe('Select mode single', () => {
  it('delivers the value of the option that was picked', async () => {
    const onChange = vi.fn()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'Apple' }))

    expect(onChange).toHaveBeenCalledWith('a1')
  })

  it('keeps a controlled value fixed and still reports the change', async () => {
    const onChange = vi.fn()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        value="a1"
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Apple')

    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith('b2')
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple')
  })

  it('changes on its own when uncontrolled', async () => {
    render(
      <Select
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Apple')

    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('option', { name: 'Cherry' }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Cherry')
  })

  it('exposes the picked option as selected', async () => {
    render(
      <Select
        defaultValue="b2"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Banana', selected: true }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Apple', selected: false }),
    ).toBeInTheDocument()
  })

  it('shows the placeholder while nothing is picked', () => {
    const { rerender } = render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Select...')

    rerender(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        placeholder="Pick a fruit"
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit')
  })

  it('clears the selection and reports null', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select...')
  })

  it('clears the selection from the keyboard', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus()

    await userEvent.keyboard('z')
    expect(onChange).not.toHaveBeenCalled()

    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('clears a controlled selection without dropping it on its own', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        value="a1"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple')

    rerender(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        value={null}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Select...')
  })

  it('offers no clear control when clearable is false', () => {
    render(
      <Select
        clearable={false}
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument()
  })

  it('shows an indicator and blocks opening while loading', async () => {
    render(
      <Select
        loading
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-busy', 'true')
    expect(trigger).toBeDisabled()
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('blocks opening when disabled', async () => {
    render(
      <Select
        defaultValue="a1"
        disabled
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('groups the options under the label of the grouping key', async () => {
    render(
      <Select
        mode="single"
        optionGroup="family"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Rosaceae')).toBeInTheDocument()
    expect(screen.getByText('Musaceae')).toBeInTheDocument()
  })

  it('groups the options with a function extractor', async () => {
    render(
      <Select
        mode="single"
        optionGroup={(fruit) => fruit.name[0]}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders the custom option and value nodes', async () => {
    render(
      <Select
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        renderOption={(fruit) => <span>Option {fruit.name}</span>}
        renderValue={(fruit) => <span>Picked {fruit.name}</span>}
      />,
    )

    expect(screen.getByText('Picked Apple')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Option Banana' }),
    ).toBeInTheDocument()
  })

  it('states that there is nothing to pick', async () => {
    render(
      <Select mode="single" optionLabel="name" optionValue="id" options={[]} />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('No options found.')).toBeInTheDocument()
  })

  it('shows the empty section given for an empty list', async () => {
    render(
      <Select
        emptySection={<span>Nothing in season</span>}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[]}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Nothing in season')).toBeInTheDocument()
  })

  it('lists the options that arrive while more are loading', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByTestId('icon-loading')).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
      />,
    )

    expect(screen.getByRole('option', { name: 'Date' })).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: false,
          loadingMore: false,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
      />,
    )

    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument()
  })

  it('renders both sections in the trigger', () => {
    render(
      <Select
        leftSection={<span>left</span>}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        rightSection={<span>right</span>}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('leftSelect...right')
  })

  it('delivers the number the extractor built', async () => {
    const onChange = vi.fn()
    render(
      <Select<Fruit, number>
        mode="single"
        onChange={onChange}
        optionLabel={(fruit) => fruit.name}
        optionValue={(fruit) => fruits.indexOf(fruit)}
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith(1)
  })
})

describe('Select mode single searchable', () => {
  it('filters the list down to what was typed', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByRole('textbox'), 'an')

    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Apple' }),
    ).not.toBeInTheDocument()
  })

  it('delivers the value and closes the popup', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Cherry' }))

    expect(onChange).toHaveBeenCalledWith('c3')
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
  })

  it('leaves the filtering to onSearchChange when it is given', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onSearchChange={onSearchChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByRole('textbox'), 'zz')

    expect(onSearchChange).toHaveBeenLastCalledWith('zz')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('waits for the typing to settle before reporting the query', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        debounce
        mode="single"
        onSearchChange={onSearchChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByRole('textbox'), 'ban')

    expect(onSearchChange).not.toHaveBeenCalled()

    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith('ban'))
    expect(onSearchChange).toHaveBeenCalledTimes(1)
  })

  it('keeps a controlled search value fixed', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onSearchChange={onSearchChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        searchValue="apple"
      />,
    )

    await user.click(screen.getByRole('combobox'))
    const search = await screen.findByRole('textbox')
    await user.type(search, 'x')

    expect(search).toHaveValue('apple')
    expect(onSearchChange).toHaveBeenLastCalledWith('applex')
  })

  it('drops the query when the popup closes', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByRole('textbox'), 'an')
    await user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByRole('textbox')).toHaveValue('')
  })

  it('shows the empty section when nothing matches', async () => {
    const user = userEvent.setup()
    render(
      <Select
        emptySection={<span>No fruit like that</span>}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        searchPlaceholder="Find a fruit"
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByPlaceholderText('Find a fruit'), 'kiwi')

    expect(screen.getByText('No fruit like that')).toBeInTheDocument()
  })

  it('states that there is nothing to pick', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[]}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('No options found.')).toBeInTheDocument()
  })

  it('keeps a controlled value fixed and still reports the change', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        value="a1"
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Apple')

    await user.click(trigger)
    await user.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith('b2')
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple')
  })

  it('changes on its own when uncontrolled', async () => {
    const user = userEvent.setup()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    expect(
      await screen.findByRole('option', { name: 'Apple', selected: true }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Banana')
  })

  it('clears the selection and reports null', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select...')
  })

  it('clears the selection from the keyboard', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus()

    await userEvent.keyboard('a')
    expect(onChange).not.toHaveBeenCalled()

    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('clears a controlled selection without dropping it on its own', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        value="a1"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple')

    rerender(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        value={null}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Select...')
  })

  it('offers no clear control when clearable is false', () => {
    render(
      <Select
        clearable={false}
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument()
  })

  it('shows an indicator and blocks opening while loading', async () => {
    render(
      <Select
        loading
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-busy', 'true')
    expect(trigger).toBeDisabled()
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('blocks opening when disabled', async () => {
    render(
      <Select
        disabled
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()

    await userEvent.click(trigger)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('groups the options under the label of the grouping key', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionGroup="family"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Rosaceae')).toBeInTheDocument()
    expect(screen.getByText('Musaceae')).toBeInTheDocument()
  })

  it('renders the custom option and value nodes', async () => {
    const user = userEvent.setup()
    render(
      <Select
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        renderOption={(fruit) => <span>Option {fruit.name}</span>}
        renderValue={(fruit) => <span>Picked {fruit.name}</span>}
        searchable
      />,
    )

    expect(screen.getByText('Picked Apple')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Option Banana' }),
    ).toBeInTheDocument()
  })

  it('lists the options that arrive while more are loading', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByTestId('icon-loading')).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
        searchable
      />,
    )

    expect(screen.getByRole('option', { name: 'Date' })).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: false,
          loadingMore: false,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
        searchable
      />,
    )

    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument()
  })

  it('renders both sections in the trigger', () => {
    render(
      <Select
        leftSection={<span>left</span>}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        rightSection={<span>right</span>}
        searchable
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('leftSelect...right')
  })
})

describe('Select mode multiple', () => {
  it('delivers every picked value as an array', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Apple' }))

    expect(onChange).toHaveBeenLastCalledWith(['a1'])

    await user.click(screen.getByRole('option', { name: 'Cherry' }))

    expect(onChange).toHaveBeenLastCalledWith(['a1', 'c3'])
  })

  it('drops a value that is picked again', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        defaultValue={['a1', 'b2']}
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Apple' }))

    expect(onChange).toHaveBeenCalledWith(['b2'])
  })

  it('keeps a controlled value fixed and still reports the change', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        value={['a1']}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith(['a1', 'b2'])
    expect(
      screen.getByRole('option', { name: 'Banana', selected: false }),
    ).toBeInTheDocument()
  })

  it('changes on its own when uncontrolled', async () => {
    const user = userEvent.setup()
    render(
      <Select
        defaultValue={['a1']}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(
      screen.getByRole('option', { name: 'Banana', selected: true }),
    ).toBeInTheDocument()
  })

  it('toggles an option from the keyboard', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    expect(await screen.findByRole('option', { name: 'Apple' })).toHaveFocus()

    await user.keyboard('x')
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(['a1'])

    await user.keyboard(' ')
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('shows two badges and counts the rest', async () => {
    render(
      <Select
        defaultValue={['a1', 'b2', 'c3']}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toHaveTextContent('Apple')
    expect(trigger).toHaveTextContent('Banana')
    expect(trigger).not.toHaveTextContent('Cherry')
    expect(trigger).toHaveTextContent('+1')
  })

  it('removes a single value from its badge', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue={['a1', 'b2']}
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove Apple' }))

    expect(onChange).toHaveBeenCalledWith(['b2'])
  })

  it('clears every value at once', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue={['a1', 'b2']}
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith([])
    expect(screen.getByTestId('select-trigger')).toHaveTextContent('Select...')
  })

  it('clears every value from the keyboard', async () => {
    const onChange = vi.fn()
    render(
      <Select
        defaultValue={['a1']}
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus()

    await userEvent.keyboard('x')
    expect(onChange).not.toHaveBeenCalled()

    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('clears a controlled selection without dropping it on its own', async () => {
    const onChange = vi.fn()
    render(
      <Select
        mode="multiple"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        value={['a1']}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith([])
    expect(screen.getByTestId('select-trigger')).toHaveTextContent('Apple')
  })

  it('offers no clear control when clearable is false', () => {
    render(
      <Select
        clearable={false}
        defaultValue={['a1']}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument()
  })

  it('shows an indicator and blocks opening while loading', async () => {
    render(
      <Select
        loading
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toHaveAttribute('aria-busy', 'true')
    expect(trigger).toBeDisabled()
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('blocks opening when disabled', async () => {
    render(
      <Select
        defaultValue={['a1']}
        disabled
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeDisabled()

    await userEvent.click(trigger)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('filters the list down to what was typed', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.type(await screen.findByRole('textbox'), 'ap')

    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Banana' }),
    ).not.toBeInTheDocument()
  })

  it('keeps a controlled search value fixed', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        onSearchChange={onSearchChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
        searchPlaceholder="Find a fruit"
        searchValue="cher"
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    const search = await screen.findByPlaceholderText('Find a fruit')
    await user.type(search, 'r')

    expect(search).toHaveValue('cher')
    expect(onSearchChange).toHaveBeenLastCalledWith('cherr')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('waits for the typing to settle before reporting the query', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        debounce
        mode="multiple"
        onSearchChange={onSearchChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.type(await screen.findByRole('textbox'), 'ba')

    expect(onSearchChange).not.toHaveBeenCalled()

    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith('ba'))
    expect(onSearchChange).toHaveBeenCalledTimes(1)
  })

  it('groups the options under the label of the grouping key', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        optionGroup={(fruit) => fruit.family}
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))

    expect(await screen.findByText('Rosaceae')).toBeInTheDocument()
    expect(screen.getByText('Musaceae')).toBeInTheDocument()
  })

  it('renders the custom option and value nodes', async () => {
    const user = userEvent.setup()
    render(
      <Select
        defaultValue={['a1']}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        renderOption={(fruit) => <span>Option {fruit.name}</span>}
        renderValue={(fruit) => <span>Picked {fruit.name}</span>}
      />,
    )

    expect(screen.getByText('Picked Apple')).toBeInTheDocument()

    await user.click(screen.getByTestId('select-trigger'))

    expect(
      await screen.findByRole('option', { name: 'Option Banana' }),
    ).toBeInTheDocument()
  })

  it('states that there is nothing to pick', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={[]}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))

    expect(await screen.findByText('No options found.')).toBeInTheDocument()
  })

  it('lists the options that arrive while more are loading', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))

    expect(await screen.findByTestId('icon-loading')).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          onLoadMore,
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
      />,
    )

    expect(screen.getByRole('option', { name: 'Date' })).toBeInTheDocument()

    rerender(
      <Select
        infinite={{
          hasMore: false,
          loadingMore: false,
          onLoadMore,
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={[...fruits, date]}
      />,
    )

    expect(screen.queryByTestId('icon-loading')).not.toBeInTheDocument()
  })

  it('renders both sections in the trigger', () => {
    render(
      <Select
        leftSection={<span>left</span>}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        rightSection={<span>right</span>}
      />,
    )

    expect(screen.getByTestId('select-trigger')).toHaveTextContent(
      'leftSelect...right',
    )
  })

  it('delivers the value the extractor built, null included', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select<Fruit, string | null>
        mode="multiple"
        onChange={onChange}
        optionLabel={(fruit) => fruit.name}
        optionValue={(fruit) => (fruit.id === 'a1' ? null : fruit.id)}
        options={fruits}
      />,
    )

    await user.click(screen.getByTestId('select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Apple' }))

    expect(onChange).toHaveBeenCalledWith([null])
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Select size %s', (size) => {
  it('stays a reachable combobox', () => {
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        size={size}
      />,
    )

    expect(screen.getByRole('combobox')).toBeEnabled()
  })
})

describe.each(['default', 'ghost'] as const)('Select variant %s', (variant) => {
  it('stays a reachable combobox', () => {
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        variant={variant}
      />,
    )

    expect(screen.getByRole('combobox')).toBeEnabled()
  })
})

describe('Select inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the plain list inside the named container', async () => {
    render(
      <TuryProvider portalContainer={container}>
        <Select
          mode="single"
          optionLabel="name"
          optionValue="id"
          options={fruits}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('select-trigger'))

    expect(container).toContainElement(
      await screen.findByTestId('select-popup'),
    )
  })

  it('mounts the searchable list inside the named container', async () => {
    render(
      <TuryProvider portalContainer={container}>
        <Select
          mode="single"
          optionLabel="name"
          optionValue="id"
          options={fruits}
          searchable
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('select-trigger'))

    expect(container).toContainElement(
      await screen.findByTestId('select-popup'),
    )
  })

  it('mounts the multiple list inside the named container', async () => {
    render(
      <TuryProvider portalContainer={container}>
        <Select
          mode="multiple"
          optionLabel="name"
          optionValue="id"
          options={fruits}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('select-trigger'))

    expect(container).toContainElement(
      await screen.findByTestId('select-popup'),
    )
  })

  it('leaves the list on the body when no container is named', async () => {
    render(
      <TuryProvider>
        <Select
          mode="single"
          optionLabel="name"
          optionValue="id"
          options={fruits}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('select-trigger'))

    expect(container).not.toContainElement(
      await screen.findByTestId('select-popup'),
    )
  })
})

describe('Select keyboard navigation in the searchable popup', () => {
  it('walks the options with the arrow keys', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')

    expect(await screen.findByRole('option', { name: 'Apple' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')

    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus()
  })

  it('picks the focused option with Enter', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('b2')
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
  })

  it('picks the focused option with Space', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith('a1')
  })

  it('closes the popup with Escape while an option is focused', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
  })

  it('walks only the options left by the query', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByRole('textbox'), 'an')
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus()
  })
})

describe('Select trigger role', () => {
  it('announces the searchable trigger as a combobox that expands', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('announces the multiple trigger as a combobox that expands', async () => {
    const user = userEvent.setup()
    render(
      <Select
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Select infinite loadingMoreText', () => {
  it('names what is loading in single mode', async () => {
    const user = userEvent.setup()
    render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more fruit',
          onLoadMore: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Loading more fruit')).toBeInTheDocument()
  })

  it('names what is loading in searchable single mode', async () => {
    const user = userEvent.setup()
    render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more fruit',
          onLoadMore: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Loading more fruit')).toBeInTheDocument()
  })

  it('names what is loading in multiple mode', async () => {
    const user = userEvent.setup()
    render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more fruit',
          onLoadMore: vi.fn(),
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Loading more fruit')).toBeInTheDocument()
  })
})

describe('Select right section precedence', () => {
  it('lets the right section outrank the clear control', () => {
    render(
      <Select
        defaultValue="a1"
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        rightSection={<span>right</span>}
      />,
    )

    expect(screen.getByText('right')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument()
  })
})

describe('Select creatable', () => {
  it('offers the query as a new option once nothing matches it', async () => {
    const onCreate = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          onCreate,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryByTestId('select-create')).not.toBeInTheDocument()

    await user.type(await screen.findByTestId('select-search-input'), 'Durian')

    expect(await screen.findByTestId('select-create')).toHaveTextContent(
      'Create "Durian"',
    )

    await user.click(screen.getByTestId('select-create'))

    expect(onCreate).toHaveBeenCalledWith('Durian')
  })

  it('withholds the offer while an option already carries that label', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByTestId('select-search-input'), 'apple')

    expect(screen.queryByTestId('select-create')).not.toBeInTheDocument()
  })

  it('offers a duplicate when the caller says duplicates are real', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          allowDuplicates: true,
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByTestId('select-search-input'), 'Apple')

    expect(await screen.findByTestId('select-create')).toBeInTheDocument()
  })

  it('holds the offer back until the query is long enough', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          minLength: 3,
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    const search = await screen.findByTestId('select-search-input')

    await user.type(search, 'Du')
    expect(screen.queryByTestId('select-create')).not.toBeInTheDocument()

    await user.type(search, 'r')
    expect(await screen.findByTestId('select-create')).toBeInTheDocument()
  })

  it('takes wording the caller supplies for the row', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          label: (query) => `Add ${query} to the list`,
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByTestId('select-search-input'), 'Durian')

    expect(await screen.findByTestId('select-create')).toHaveTextContent(
      'Add Durian to the list',
    )
  })

  it('clears the search once the creation settles', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    const search = await screen.findByTestId('select-search-input')

    await user.type(search, 'Durian')
    await user.click(await screen.findByTestId('select-create'))

    await waitFor(() => expect(search).toHaveValue(''))
  })

  it('offers the row in a multiple select too', async () => {
    const onCreate = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          onCreate,
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByTestId('select-search-input'), 'Durian')
    await user.click(await screen.findByTestId('select-create'))

    expect(onCreate).toHaveBeenCalledWith('Durian')
  })

  it('replaces the empty state rather than stacking under it', async () => {
    const user = userEvent.setup()

    render(
      <Select
        creatable
        creatableOptions={{
          onCreate: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(await screen.findByTestId('select-search-input'), 'Durian')

    expect(await screen.findByTestId('select-create')).toBeInTheDocument()
    expect(screen.queryByTestId('select-empty')).not.toBeInTheDocument()
  })
})

describe('Select creatable, wired the way a page wires it', () => {
  /** The showcase's own example: controlled value, options that grow. */
  function TagPicker() {
    const [tags, setTags] = useState([
      {
        id: 'lua-de-mel',
        name: 'Lua de mel',
      },
    ])
    const [tagId, setTagId] = useState<string | null>(null)

    return (
      <Select<{ id: string; name: string }, string>
        creatable
        creatableOptions={{
          onCreate: (name) => {
            const tag = {
              id: name.toLowerCase(),
              name,
            }
            setTags((current) => [...current, tag])
            setTagId(tag.id)
          },
        }}
        mode="single"
        onChange={setTagId}
        optionLabel="name"
        options={tags}
        optionValue="id"
        placeholder="Escolha ou crie uma tag"
        value={tagId}
      />
    )
  }

  it('opens a field that actually takes the keystrokes', async () => {
    const user = userEvent.setup()

    render(<TagPicker />)

    await user.click(screen.getByRole('combobox'))

    const search = await screen.findByTestId('select-search-input')

    expect(search).toHaveFocus()

    await user.type(search, 'Pet friendly')

    expect(search).toHaveValue('Pet friendly')
  })

  it('creates from the typed value and selects what it made', async () => {
    const user = userEvent.setup()

    render(<TagPicker />)

    await user.click(screen.getByRole('combobox'))
    await user.type(
      await screen.findByTestId('select-search-input'),
      'Pet friendly',
    )
    await user.click(await screen.findByTestId('select-create'))

    await waitFor(() =>
      expect(screen.getByTestId('select-value')).toHaveTextContent(
        'Pet friendly',
      ),
    )
  })
})

describe('Select infinite scroll', () => {
  const observed: Element[] = []
  let fire: (() => void) | undefined

  beforeEach(() => {
    observed.length = 0
    fire = undefined

    vi.stubGlobal(
      'IntersectionObserver',
      class {
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
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /**
   * The regression this exists for: the non-searchable Select keeps its open
   * state inside Base UI, so opening the popup re-renders nothing here. An
   * effect reading a ref object ran once, on mount, with the sentinel not yet
   * in the DOM — and never again.
   */
  it('watches the sentinel of a plain select once the popup opens', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        infinite={{
          hasMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    expect(observed).toHaveLength(0)

    await user.click(screen.getByRole('combobox'))
    await screen.findByTestId('select-sentinel')

    expect(observed).toHaveLength(1)

    fire?.()

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('watches it in a searchable select too', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        infinite={{
          hasMore: true,
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
        searchable
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await screen.findByTestId('select-sentinel')

    fire?.()

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('watches it in a multiple select too', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        infinite={{
          hasMore: true,
          onLoadMore,
        }}
        mode="multiple"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await screen.findByTestId('select-sentinel')

    fire?.()

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('holds off while a page is already in flight', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()

    render(
      <Select
        infinite={{
          hasMore: true,
          loadingMore: true,
          loadingMoreText: 'Loading more…',
          onLoadMore,
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await screen.findByTestId('select-sentinel')

    fire?.()

    expect(onLoadMore).not.toHaveBeenCalled()
    expect(screen.getByTestId('select-loading-more')).toHaveTextContent(
      'Loading more…',
    )
  })

  it('leaves the sentinel out once there is nothing more to load', async () => {
    const user = userEvent.setup()

    render(
      <Select
        infinite={{
          hasMore: false,
          onLoadMore: vi.fn(),
        }}
        mode="single"
        optionLabel="name"
        optionValue="id"
        options={fruits}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await screen.findByTestId('select-popup')

    expect(screen.queryByTestId('select-sentinel')).not.toBeInTheDocument()
  })
})

describe('Select outcome', () => {
  it('reports pending on the trigger and offers nothing to pick', () => {
    const outcome: DataOutcome<Fruit[]> = {
      retry: vi.fn(),
      status: 'pending',
    }

    render(
      <TuryProvider>
        <Select<Fruit>
          mode="single"
          optionLabel="name"
          optionValue="id"
          outcome={outcome}
        />
      </TuryProvider>,
    )

    expect(screen.getByRole('combobox').getAttribute('aria-busy')).toBe('true')
  })

  it('keeps the trigger usable on a failed read and retries from the popup', async () => {
    const retry = vi.fn()
    const outcome: DataOutcome<Fruit[]> = {
      error: new Error('boom'),
      retry,
      status: 'error',
    }

    render(
      <TuryProvider>
        <Select<Fruit>
          mode="single"
          optionLabel="name"
          optionValue="id"
          outcome={outcome}
        />
      </TuryProvider>,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger.hasAttribute('disabled')).toBe(false)

    await userEvent.click(trigger)
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Try again',
      }),
    )

    expect(retry).toHaveBeenCalledOnce()
  })

  it('states the reason on a denied read and offers no retry', async () => {
    const outcome: DataOutcome<Fruit[]> = {
      reason: 'Ask an administrator for access',
      retry: vi.fn(),
      status: 'denied',
    }

    render(
      <TuryProvider>
        <Select<Fruit>
          mode="single"
          optionLabel="name"
          optionValue="id"
          outcome={outcome}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(
      await screen.findByText('Ask an administrator for access'),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', {
        name: 'Try again',
      }),
    ).toBeNull()
  })

  it('renders the options a successful read carries', async () => {
    const outcome: DataOutcome<Fruit[]> = {
      data: fruits,
      refreshing: false,
      retry: vi.fn(),
      status: 'success',
    }

    render(
      <TuryProvider>
        <Select<Fruit>
          mode="single"
          optionLabel="name"
          optionValue="id"
          outcome={outcome}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Apple')).toBeTruthy()
  })

  it('keeps the options when only the next page failed', async () => {
    const outcome: DataOutcome<Fruit[]> = {
      data: fruits,
      refreshing: false,
      retry: vi.fn(),
      status: 'success',
    }

    render(
      <TuryProvider>
        <Select<Fruit>
          infinite={{
            error: true,
            errorSection: <span>Could not load more</span>,
            hasMore: true,
            onLoadMore: vi.fn(),
          }}
          mode="single"
          optionLabel="name"
          optionValue="id"
          outcome={outcome}
        />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(await screen.findByText('Apple')).toBeTruthy()
    expect(screen.getByTestId('select-load-more-error')).toBeTruthy()
  })
})
