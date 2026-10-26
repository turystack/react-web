import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { FilterChip } from '@/components/filter-chip'
import { LabelsProvider } from '@/components/labels-provider'

import { FilterBar } from './filter-bar'

const clearLink = () => screen.queryByRole('button', { name: 'Clear filters' })

describe('FilterBar', () => {
  it('is a group named by the labels contract', () => {
    render(
      <FilterBar>
        <FilterChip label="Status">picker</FilterChip>
      </FilterBar>,
    )

    expect(screen.getByRole('group', { name: 'Filters' })).toContainElement(
      screen.getByTestId('filter-chip'),
    )
  })

  it('takes its group name from ariaLabel', () => {
    render(
      <FilterBar ariaLabel="Payment filters">
        <FilterChip label="Status">picker</FilterChip>
      </FilterBar>,
    )

    expect(
      screen.getByRole('group', { name: 'Payment filters' }),
    ).toBeInTheDocument()
  })

  it('hides Clear filters while no chip is active', () => {
    render(
      <FilterBar onClear={() => {}}>
        <FilterChip label="Status">picker</FilterChip>
        <FilterChip label="Amount">picker</FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).not.toBeInTheDocument()
  })

  it('shows Clear filters once a chip is active', () => {
    render(
      <FilterBar onClear={() => {}}>
        <FilterChip label="Status" value="Active">
          picker
        </FilterChip>
        <FilterChip label="Amount">picker</FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).toBeInTheDocument()
  })

  it('hides Clear filters without onClear, even with a chip active', () => {
    render(
      <FilterBar>
        <FilterChip label="Status" value="Active">
          picker
        </FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).not.toBeInTheDocument()
  })

  it('takes the Clear filters words from the labels provider', () => {
    render(
      <LabelsProvider labels={{ filterBar: { clear: 'Limpar filtros' } }}>
        <FilterBar onClear={() => {}}>
          <FilterChip label="Status" value="Ativo">
            picker
          </FilterChip>
        </FilterBar>
      </LabelsProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Limpar filtros' }),
    ).toBeInTheDocument()
  })

  it('clears through onClear, drops the link and focuses the first chip', async () => {
    function Harness() {
      const [status, setStatus] = useState<string | undefined>('Active')
      const [amount, setAmount] = useState<string | undefined>('> 10')

      return (
        <FilterBar
          onClear={() => {
            setStatus(undefined)
            setAmount(undefined)
          }}
        >
          <FilterChip label="Status" value={status}>
            picker
          </FilterChip>
          <FilterChip label="Amount" value={amount}>
            picker
          </FilterChip>
        </FilterBar>
      )
    }
    render(<Harness />)

    const link = clearLink()
    expect(link).toBeInTheDocument()

    await userEvent.click(link as HTMLElement)

    expect(clearLink()).not.toBeInTheDocument()
    const [first] = screen.getAllByTestId('filter-chip-trigger')
    expect(first).toHaveAccessibleName('Status')
    expect(first).toHaveFocus()
  })

  it('fires onClear once per click', async () => {
    const onClear = vi.fn()
    render(
      <FilterBar onClear={onClear}>
        <FilterChip label="Status" value="Active">
          picker
        </FilterChip>
      </FilterBar>,
    )

    await userEvent.click(clearLink() as HTMLElement)

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('follows a single chip being cleared by its own ×', async () => {
    function Harness() {
      const [status, setStatus] = useState<string | undefined>('Active')

      return (
        <FilterBar onClear={() => setStatus(undefined)}>
          <FilterChip
            label="Status"
            onRemove={() => setStatus(undefined)}
            value={status}
          >
            picker
          </FilterChip>
          <FilterChip label="Amount">picker</FilterChip>
        </FilterBar>
      )
    }
    render(<Harness />)

    expect(clearLink()).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    )

    expect(clearLink()).not.toBeInTheDocument()
  })

  it('stops counting a chip that leaves the row', () => {
    const { rerender } = render(
      <FilterBar onClear={() => {}}>
        <FilterChip key="status" label="Status" value="Active">
          picker
        </FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).toBeInTheDocument()

    // A different key, so React unmounts the active chip rather than reusing
    // it for the new one — the case where only the unmount can un-count it.
    rerender(
      <FilterBar onClear={() => {}}>
        <FilterChip key="amount" label="Amount">
          picker
        </FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).not.toBeInTheDocument()
  })

  it('hears a chip wrapped in a component of the consumer', () => {
    function StatusFilter({ children }: { children: ReactNode }) {
      return (
        <div>
          <FilterChip label="Status" value="Active">
            {children}
          </FilterChip>
        </div>
      )
    }
    render(
      <FilterBar onClear={() => {}}>
        <StatusFilter>picker</StatusFilter>
      </FilterBar>,
    )

    expect(clearLink()).toBeInTheDocument()
  })

  it('keeps trailing content at the end of the row, after Clear filters', () => {
    render(
      <FilterBar
        onClear={() => {}}
        trailing={<button type="button">Edit columns</button>}
      >
        <FilterChip label="Status" value="Active">
          picker
        </FilterChip>
      </FilterBar>,
    )

    const group = screen.getByRole('group', { name: 'Filters' })
    const trailing = screen.getByTestId('filter-bar-trailing')

    expect(trailing).toHaveTextContent('Edit columns')
    expect(group.lastElementChild).toBe(trailing)
  })

  it('renders no trailing slot when none is given', () => {
    render(
      <FilterBar>
        <FilterChip label="Status">picker</FilterChip>
      </FilterBar>,
    )

    expect(screen.queryByTestId('filter-bar-trailing')).not.toBeInTheDocument()
  })
})
