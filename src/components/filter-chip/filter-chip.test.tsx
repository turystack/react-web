import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { FilterBar } from '@/components/filter-bar'
import { LabelsProvider } from '@/components/labels-provider'

import { FilterChip } from './filter-chip'

const picker = <p>Pick a status</p>

/**
 * The chip's body, found by role and name. The chip's own button is the
 * popover's trigger, so the name matches exactly one element — `getByRole`
 * throws if a wrapper ever announces the same name a second time.
 */
const body = (name: string | RegExp = /^Status/) =>
  screen.getByRole('button', { name })

describe('FilterChip suggested', () => {
  it('reads as the label alone with a "+", and marks itself suggested', () => {
    render(<FilterChip label="Status">{picker}</FilterChip>)

    expect(body()).toHaveAccessibleName('Status')
    expect(screen.getByTestId('filter-chip-add')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.getByTestId('filter-chip')).toHaveAttribute(
      'data-state',
      'suggested',
    )
  })

  it('offers no × even when onRemove is given', () => {
    render(
      <FilterChip label="Status" onRemove={() => {}}>
        {picker}
      </FilterChip>,
    )

    expect(
      screen.queryByRole('button', { name: 'Remove Status filter' }),
    ).not.toBeInTheDocument()
  })

  it('treats null as no value', () => {
    render(
      <FilterChip label="Status" value={null}>
        {picker}
      </FilterChip>,
    )

    expect(screen.getByTestId('filter-chip')).toHaveAttribute(
      'data-state',
      'suggested',
    )
  })
})

describe('FilterChip active', () => {
  it('reads "Label: value" without the "+", and marks itself active', () => {
    render(
      <FilterChip label="Status" value="Active">
        {picker}
      </FilterChip>,
    )

    expect(body()).toHaveAccessibleName('Status: Active')
    expect(screen.queryByTestId('filter-chip-add')).not.toBeInTheDocument()
    expect(screen.getByTestId('filter-chip')).toHaveAttribute(
      'data-state',
      'active',
    )
  })

  it('counts 0 as a value someone chose', () => {
    render(
      <FilterChip label="Amount" value={0}>
        {picker}
      </FilterChip>,
    )

    expect(body(/^Amount/)).toHaveAccessibleName('Amount: 0')
  })

  it('names the × after the label', () => {
    render(
      <FilterChip label="Status" onRemove={() => {}} value="Active">
        {picker}
      </FilterChip>,
    )

    expect(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    ).toBeInTheDocument()
  })

  it('offers no × without onRemove', () => {
    render(
      <FilterChip label="Status" value="Active">
        {picker}
      </FilterChip>,
    )

    expect(screen.queryByTestId('filter-chip-remove')).not.toBeInTheDocument()
  })

  it('takes the separator between name and value from the labels provider', () => {
    render(
      <LabelsProvider labels={{ filterChip: { separator: ' —' } }}>
        <FilterChip label="Status" value="Active">
          {picker}
        </FilterChip>
      </LabelsProvider>,
    )

    expect(body()).toHaveAccessibleName('Status — Active')
  })

  it('takes the × name from the labels provider', () => {
    render(
      <LabelsProvider
        labels={{ filterChip: { remove: (label) => `Remover ${label}` } }}
      >
        <FilterChip label="Status" onRemove={() => {}} value="Ativo">
          {picker}
        </FilterChip>
      </LabelsProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Remover Status' }),
    ).toBeInTheDocument()
  })

  it('removes on × without opening the picker, and hands focus to the body', async () => {
    const onRemove = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <FilterChip
        label="Status"
        onOpenChange={onOpenChange}
        onRemove={onRemove}
        value="Active"
      >
        {picker}
      </FilterChip>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body()).toHaveFocus()
  })

  it('makes the × and the body two separate tab stops', async () => {
    render(
      <FilterChip label="Status" onRemove={() => {}} value="Active">
        {picker}
      </FilterChip>,
    )

    await userEvent.tab()
    expect(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    ).toHaveFocus()

    await userEvent.tab()
    expect(body()).toHaveFocus()
  })

  it('goes back to suggested once the value is cleared', async () => {
    function Harness() {
      const [status, setStatus] = useState<string | undefined>('Active')

      return (
        <FilterChip
          label="Status"
          onRemove={() => setStatus(undefined)}
          value={status}
        >
          {picker}
        </FilterChip>
      )
    }
    render(<Harness />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    )

    expect(body()).toHaveAccessibleName('Status')
    expect(body()).toHaveFocus()
    expect(screen.queryByTestId('filter-chip-remove')).not.toBeInTheDocument()
  })
})

describe('FilterChip picker', () => {
  it('opens the picker on click and reports it as expanded', async () => {
    render(<FilterChip label="Status">{picker}</FilterChip>)

    expect(body()).toHaveAttribute('aria-expanded', 'false')
    expect(body()).toHaveAttribute('aria-haspopup', 'dialog')

    await userEvent.click(body())

    expect(await screen.findByRole('dialog')).toHaveTextContent('Pick a status')
    expect(body()).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on a second click', async () => {
    render(<FilterChip label="Status">{picker}</FilterChip>)

    await userEvent.click(body())
    await screen.findByRole('dialog')
    await userEvent.click(body())

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens with Enter, closes with Escape and returns focus to the chip', async () => {
    render(<FilterChip label="Status">{picker}</FilterChip>)

    await userEvent.tab()
    expect(body()).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body()).toHaveAttribute('aria-expanded', 'false')
    expect(body()).toHaveFocus()
  })

  it('opens with Space', async () => {
    render(<FilterChip label="Status">{picker}</FilterChip>)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('delivers the new state to onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(
      <FilterChip label="Status" onOpenChange={onOpenChange}>
        {picker}
      </FilterChip>,
    )

    await userEvent.click(body())
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('starts open with defaultOpen', async () => {
    render(
      <FilterChip defaultOpen label="Status">
        {picker}
      </FilterChip>,
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('stays open while open is held true from outside', async () => {
    render(
      <FilterChip label="Status" open>
        {picker}
      </FilterChip>,
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('stays closed while open is held false from outside', async () => {
    render(
      <FilterChip label="Status" open={false}>
        {picker}
      </FilterChip>,
    )

    await userEvent.click(body())

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lets a picker close itself through the controlled pair', async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      const [status, setStatus] = useState<string>()

      return (
        <FilterChip
          label="Status"
          onOpenChange={setOpen}
          open={open}
          value={status}
        >
          <button
            onClick={() => {
              setStatus('Active')
              setOpen(false)
            }}
            type="button"
          >
            Active
          </button>
        </FilterChip>
      )
    }
    render(<Harness />)

    await userEvent.click(body())
    await userEvent.click(await screen.findByRole('button', { name: 'Active' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body()).toHaveAccessibleName('Status: Active')
  })

  it('is announced as a single button carrying the trigger state', () => {
    render(
      <FilterChip label="Status" value="Active">
        {picker}
      </FilterChip>,
    )

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(body()).toBe(screen.getByTestId('filter-chip-trigger'))
    expect(body()).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders plain text, not a control, when there is no picker', () => {
    render(<FilterChip label="Status" onRemove={() => {}} value="Active" />)

    expect(screen.queryByTestId('filter-chip-trigger')).not.toBeInTheDocument()
    expect(screen.getByTestId('filter-chip-body')).toHaveTextContent(
      'Status: Active',
    )
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})

describe('FilterChip disabled', () => {
  it('blocks the picker and the ×', async () => {
    const onRemove = vi.fn()
    render(
      <FilterChip disabled label="Status" onRemove={onRemove} value="Active">
        {picker}
      </FilterChip>,
    )

    expect(body()).toBeDisabled()
    const remove = screen.getByRole('button', { name: 'Remove Status filter' })
    expect(remove).toBeDisabled()

    await userEvent.click(body())
    await userEvent.click(remove)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('keeps the picker shut even when open is held true', () => {
    render(
      <FilterChip disabled label="Status" open>
        {picker}
      </FilterChip>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(body()).toHaveAttribute('aria-expanded', 'false')
  })

  it('stays enabled by default', () => {
    render(
      <FilterChip label="Status" onRemove={() => {}} value="Active">
        {picker}
      </FilterChip>,
    )

    expect(body()).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Remove Status filter' }),
    ).toBeEnabled()
  })
})

describe('FilterChip disabledReason', () => {
  const reason = 'Set by your workspace'

  it('renders no wrapper and no description without a reason', () => {
    render(
      <FilterChip label="Status" onRemove={() => {}} value="Active">
        {picker}
      </FilterChip>,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('aria-describedby')
    }
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('blocks the picker and the ×, both still reachable', async () => {
    const onRemove = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <FilterChip
        disabledReason={reason}
        label="Status"
        onOpenChange={onOpenChange}
        onRemove={onRemove}
        value="Active"
      >
        {picker}
      </FilterChip>,
    )
    const remove = screen.getByRole('button', { name: 'Remove Status filter' })
    const trigger = body()

    for (const control of [remove, trigger]) {
      expect(control).toHaveAttribute('aria-disabled', 'true')
      expect(control).not.toHaveAttribute('disabled')
      expect(control).toHaveAccessibleDescription(reason)
    }

    await userEvent.tab()
    expect(remove).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.click(remove, { pointerEventsCheck: 0 })

    await userEvent.tab()
    expect(trigger).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(trigger, { pointerEventsCheck: 0 })

    expect(onRemove).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByText('Pick a status')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the reason on keyboard focus', async () => {
    render(
      <FilterChip disabledReason={reason} label="Status">
        {picker}
      </FilterChip>,
    )

    await userEvent.tab()
    expect(body()).toHaveFocus()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })
})

describe('FilterChip disabledReason, edge cases', () => {
  const reason = 'Set by your workspace policy'
  const clearLink = () =>
    screen.queryByRole('button', { name: 'Clear filters' })

  it('does not count a locked value as something Clear filters can wipe', () => {
    const { rerender } = render(
      <FilterBar onClear={() => {}}>
        <FilterChip
          disabledReason={reason}
          label="Region"
          onRemove={() => {}}
          value="EU"
        >
          {picker}
        </FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).not.toBeInTheDocument()

    rerender(
      <FilterBar onClear={() => {}}>
        <FilterChip
          disabledReason={reason}
          label="Region"
          onRemove={() => {}}
          value="EU"
        >
          {picker}
        </FilterChip>
        <FilterChip label="Status" value="Active">
          {picker}
        </FilterChip>
      </FilterBar>,
    )

    expect(clearLink()).toBeInTheDocument()
  })

  it('keeps focus when a reason arrives on the focused chip', async () => {
    const chip = (blocked: boolean) => (
      <FilterChip
        disabledReason={blocked ? reason : undefined}
        label="Status"
        value="Active"
      >
        {picker}
      </FilterChip>
    )
    const { rerender } = render(chip(false))
    await userEvent.tab()
    expect(body()).toHaveFocus()

    rerender(chip(true))

    expect(body()).toHaveFocus()
    expect(body()).toHaveAttribute('aria-disabled', 'true')
    expect(body()).toHaveAccessibleDescription(reason)

    rerender(chip(false))

    expect(body()).toHaveFocus()
  })
})
