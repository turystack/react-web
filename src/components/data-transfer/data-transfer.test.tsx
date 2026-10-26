import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TableColumns } from '@/components/table/table.types'

import { DataTransferResult, DataTransferShell } from './data-transfer'
import {
  columnsFromTable,
  type DataTransferJobAccepted,
  type DataTransferSize,
} from './data-transfer.types'

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
  function Shell(surface: 'modal' | 'sheet', size: DataTransferSize = 'md') {
    return (
      <DataTransferShell
        description="what it is about"
        footer={<button type="button">Go</button>}
        onOpenChange={vi.fn()}
        open
        size={size}
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

  it('hands its width to the modal, in the modal’s own scale', () => {
    const { rerender } = render(Shell('modal', 'md'))

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-lg')

    rerender(Shell('modal', 'lg'))

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-2xl')
  })

  it('and to the sheet, in the sheet’s', () => {
    const { rerender } = render(Shell('sheet', 'sm'))

    expect(screen.getByTestId('sheet-popup')).toHaveClass('sm:max-w-md')

    rerender(Shell('sheet', 'xl'))

    expect(screen.getByTestId('sheet-popup')).toHaveClass('sm:max-w-4xl')
  })
})

describe('DataTransferResult', () => {
  function link(job: DataTransferJobAccepted) {
    return (
      <a href={`/jobs/${job.data_transfer_job_id}`}>
        Open job {job.data_transfer_job_id}
      </a>
    )
  }

  it('says the request is on its way while there is no job yet', () => {
    const shown = vi.fn(link)

    render(
      <DataTransferResult job={null} link={shown} testId="transfer">
        <p>the file</p>
      </DataTransferResult>,
    )

    const sending = screen.getByTestId('transfer-sending')

    expect(sending).toHaveAttribute('role', 'status')
    expect(sending).toHaveTextContent('Sending the request…')
    expect(within(sending).getByTestId('loader')).toBeInTheDocument()
    expect(screen.queryByTestId('transfer-result')).not.toBeInTheDocument()
    expect(screen.queryByText('the file')).not.toBeInTheDocument()
    expect(shown).not.toHaveBeenCalled()
  })

  it('says where the result lives once the job exists', () => {
    render(
      <DataTransferResult
        job={{
          data_transfer_job_id: 'job-3',
          status: 'queued',
        }}
        link={link}
        testId="transfer"
      />,
    )

    const notice = screen.getByTestId('transfer-notice')

    expect(screen.queryByTestId('transfer-sending')).not.toBeInTheDocument()
    expect(notice).toHaveTextContent(
      'This keeps running after you close it. Follow the result on its page:',
    )
    expect(
      within(notice).getByRole('link', { name: 'Open job job-3' }),
    ).toHaveAttribute('href', '/jobs/job-3')
  })

  it('puts what it is given under the notice, never above it', () => {
    render(
      <DataTransferResult
        job={{
          data_transfer_job_id: 'job-3',
          status: 'queued',
        }}
        link={link}
        testId="transfer"
      >
        <p data-testid="the-file">the file</p>
      </DataTransferResult>,
    )

    const result = screen.getByTestId('transfer-result')

    expect(result.children).toHaveLength(2)
    expect(result.firstElementChild).toBe(screen.getByTestId('transfer-notice'))
    expect(result.lastElementChild).toBe(screen.getByTestId('the-file'))
  })
})
