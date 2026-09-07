import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TableColumns } from '@/components/table/table.types'

import { DataTransferShell } from './data-transfer'
import { columnsFromTable } from './data-transfer.types'

type Booking = {
  code: string
  guest: string
}

describe('columnsFromTable', () => {
  it('reads the columns a table already declares, in order', () => {
    const columns: TableColumns<Booking> = [
      {
        key: 'guest',
        label: 'Guest',
      },
      {
        key: 'code',
        label: 'Code',
      },
    ]

    expect(columnsFromTable(columns)).toEqual([
      {
        key: 'guest',
        label: 'Guest',
      },
      {
        key: 'code',
        label: 'Code',
      },
    ])
  })

  it('drops a column with no label, which nobody can choose to export', () => {
    const columns: TableColumns<Booking> = [
      {
        key: 'code',
        label: 'Code',
      },
      {
        key: 'actions',
        selector: () => null,
      },
    ]

    expect(columnsFromTable(columns)).toHaveLength(1)
  })
})

describe('DataTransferShell', () => {
  function Shell(surface: 'modal' | 'sheet') {
    return (
      <DataTransferShell
        description="what it is about"
        footer={<button type="button">Go</button>}
        onOpenChange={vi.fn()}
        open
        surface={surface}
        testId="shell"
        title="Export bookings"
      >
        the body
      </DataTransferShell>
    )
  }

  it('shows the same title and body in a sheet', () => {
    render(Shell('sheet'))

    expect(screen.getByTestId('sheet-popup')).toBeInTheDocument()
    expect(screen.getByText('Export bookings')).toBeInTheDocument()
    expect(screen.getByTestId('shell')).toHaveTextContent('the body')
  })

  it('and in a modal', () => {
    render(Shell('modal'))

    expect(screen.getByTestId('modal-popup')).toBeInTheDocument()
    expect(screen.getByText('Export bookings')).toBeInTheDocument()
    expect(screen.getByTestId('shell')).toHaveTextContent('the body')
  })
})
