import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'

import { DataTransferExport } from './data-transfer-export'

type Booking = {
  code: string
  guest: string
  id: string
  price: number
}

const COLUMNS = [
  {
    hint: 'The reference every other system joins on',
    key: 'id' as const,
    label: 'Id',
    required: true,
  },
  {
    key: 'code' as const,
    label: 'Code',
  },
  {
    key: 'guest' as const,
    label: 'Guest',
  },
  {
    key: 'price' as const,
    label: 'Price',
  },
]

const FILTERS = [
  {
    key: 'guest',
    label: 'Guest',
    type: 'text' as const,
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      {
        label: 'Confirmed',
        value: 'confirmed',
      },
      {
        label: 'Pending',
        value: 'pending',
      },
    ],
    type: 'select' as const,
  },
]

function Bookings(
  props: Partial<Parameters<typeof DataTransferExport<Booking>>[0]> = {},
) {
  return (
    <DataTransferExport<Booking>
      columns={COLUMNS}
      defaultOpen
      entity={{
        plural: 'bookings',
      }}
      onExport={props.onExport ?? vi.fn()}
      {...props}
    />
  )
}

describe('DataTransferExport', () => {
  it('titles itself after the entity that is leaving', () => {
    render(<Bookings />)

    expect(screen.getByText('Export bookings')).toBeInTheDocument()
    expect(
      screen.getByText('Choose which bookings leave, and in which shape.'),
    ).toBeInTheDocument()
  })

  it('opens in a modal when asked, and in a sheet by default', () => {
    const { rerender } = render(<Bookings />)

    expect(screen.getByTestId('sheet-popup')).toBeInTheDocument()

    rerender(<Bookings surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toBeInTheDocument()
  })

  it('draws an input per declared filter, without being told which component', () => {
    render(<Bookings filters={FILTERS} />)

    const section = screen.getByTestId('data-transfer-export-filters')

    // a text filter becomes a text field, a select filter becomes a listbox —
    // and the caller named neither component
    expect(section.querySelector('input[type="text"]')).toBeInTheDocument()
    expect(section.querySelector('[role="combobox"]')).toBeInTheDocument()
    expect(section).toHaveTextContent('Status')
  })

  it('opens showing what the page was already filtered by', async () => {
    const onExport = vi.fn()

    render(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
      />,
    )

    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Ada',
        },
      }),
    )
  })

  it('lets the reader change a filter before exporting', async () => {
    const onExport = vi.fn()

    render(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
      />,
    )

    const field = screen.getByDisplayValue('Ada')

    await userEvent.clear(field)
    await userEvent.type(field, 'Grace')
    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Grace',
        },
      }),
    )
  })

  it('empties every filter at once', async () => {
    const onExport = vi.fn()

    render(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
      />,
    )

    await userEvent.click(
      screen.getByTestId('data-transfer-export-clear-filters'),
    )
    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {},
      }),
    )
  })

  it('offers the three formats and hands back the chosen one', async () => {
    const onExport = vi.fn()

    render(<Bookings onExport={onExport} />)

    expect(screen.getByText('XLSX')).toBeInTheDocument()

    await userEvent.click(screen.getByText('JSON'))
    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'json',
      }),
    )
  })

  it('shows a required column ticked and disabled rather than hiding it', () => {
    render(<Bookings />)

    expect(screen.getByRole('checkbox', { name: /Id/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('explains why it cannot be turned off', async () => {
    render(<Bookings />)

    await userEvent.hover(screen.getByRole('checkbox', { name: /Id/ }))

    expect(
      await screen.findByText('The reference every other system joins on'),
    ).toBeInTheDocument()
  })

  it('keeps the declared order, not the order they were ticked', async () => {
    const onExport = vi.fn()

    render(<Bookings onExport={onExport} />)

    await userEvent.click(screen.getByRole('checkbox', { name: /Guest/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Code/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Code/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Guest/ }))
    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: ['id', 'code', 'guest', 'price'],
      }),
    )
  })

  it('clears every column but the required ones', async () => {
    const onExport = vi.fn()

    render(<Bookings onExport={onExport} />)

    await userEvent.click(screen.getByRole('checkbox', { name: /All columns/ }))
    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: ['id'],
      }),
    )
  })

  it('stays open with the reason when the export is refused', async () => {
    render(
      <Bookings
        onExport={() => Promise.reject(new Error('Too many rows for now'))}
      />,
    )

    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    expect(
      await screen.findByTestId('data-transfer-export-error'),
    ).toHaveTextContent('Too many rows for now')
  })

  it('closes once the export lands', async () => {
    render(<Bookings onExport={() => Promise.resolve()} />)

    await userEvent.click(screen.getByTestId('data-transfer-export-confirm'))

    await waitFor(() =>
      expect(
        screen.queryByTestId('data-transfer-export'),
      ).not.toBeInTheDocument(),
    )
  })

  it('opens from the trigger, without eating its own onClick', async () => {
    const onClick = vi.fn()

    render(
      <DataTransferExport<Booking>
        columns={COLUMNS}
        onExport={vi.fn()}
        trigger={<Button onClick={onClick}>Export</Button>}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onClick).toHaveBeenCalled()
    expect(
      await screen.findByTestId('data-transfer-export'),
    ).toBeInTheDocument()
  })
})
