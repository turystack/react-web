import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DataTransferRecords } from './data-transfer.records'
import type {
  DataTransferJobProgress,
  DataTransferRecord,
  DataTransferRecordsProps,
} from './data-transfer.types'

type Booking = {
  code: string
  guest: string
  nights: number
}

const COLUMNS = [
  {
    key: 'code' as const,
    label: 'Code',
  },
  {
    key: 'guest' as const,
    label: 'Guest',
  },
  {
    key: 'nights' as const,
    label: 'Nights',
  },
]

const PAGINATION = {
  mode: 'offset',
  onPageChange: () => {},
  onRowsPerPageChange: () => {},
  page: 1,
  rowsPerPage: 10,
  total: 40,
} as const

function loaded(
  data: DataTransferRecord<Booking>[],
): DataTransferRecordsProps<Booking>['outcome'] {
  return {
    data,
    refreshing: false,
    retry: vi.fn(),
    status: 'success',
  }
}

function Records(
  props: Partial<DataTransferRecordsProps<Booking>> & {
    direction?: 'export' | 'import'
    records?: DataTransferRecord<Booking>[]
  },
) {
  return (
    <DataTransferRecords<Booking>
      columns={COLUMNS}
      direction={props.direction ?? 'import'}
      job={props.job}
      outcome={props.outcome ?? loaded(props.records ?? [])}
      pagination={props.pagination ?? PAGINATION}
      rowErrorLabel={props.rowErrorLabel}
    />
  )
}

function progress(
  overrides: Partial<DataTransferJobProgress> = {},
): DataTransferJobProgress {
  return {
    counts: {
      failed: 1,
      pending: 2,
      succeeded: 3,
      total: 6,
    },
    failure_code: null,
    status: 'running',
    ...overrides,
  }
}

/** The body row that holds the given file line. */
function line(row: number) {
  const found = screen
    .getAllByRole('row')
    .find(
      (candidate) =>
        within(candidate).queryAllByRole('cell')[0]?.textContent ===
        String(row),
    )

  if (!found) {
    throw new Error(`no row for line ${row}`)
  }

  return found
}

function badgeOf(row: number) {
  return within(line(row)).getByTestId('badge')
}

describe('DataTransferRecords', () => {
  it('heads the list with the line, each column, and the result', () => {
    render(<Records />)

    expect(
      screen.getAllByRole('columnheader').map((head) => head.textContent),
    ).toEqual(['Row', 'Code', 'Guest', 'Nights', 'Result'])
  })

  it('shows each row as the file had it, by the file’s own line', () => {
    render(
      <Records
        records={[
          {
            errors: [],
            row_number: 14,
            status: 'succeeded',
            row_values: {
              code: 'TRY-1041',
              guest: 'Ada',
              nights: 3,
            },
          },
        ]}
      />,
    )

    const cells = within(line(14)).getAllByRole('cell')

    expect(cells.map((cell) => cell.textContent).slice(0, 4)).toEqual([
      '14',
      'TRY-1041',
      'Ada',
      '3',
    ])
  })

  it('leaves a cell empty when the row held nothing for it', () => {
    render(
      <Records
        records={[
          {
            errors: [],
            row_number: 2,
            status: 'pending',
            row_values: {
              code: 'TRY-1042',
              guest: null,
            },
          },
        ]}
      />,
    )

    const cells = within(line(2)).getAllByRole('cell')

    // null and a missing key read the same: nothing, never "null".
    expect(cells[2]).toHaveTextContent(/^$/)
    expect(cells[3]).toHaveTextContent(/^$/)
  })

  it('says a row the API has not reached is pending, in words', () => {
    render(
      <Records
        records={[
          {
            errors: [],
            row_number: 1,
            status: 'pending',
            row_values: {},
          },
        ]}
      />,
    )

    expect(badgeOf(1)).toHaveTextContent('Pending')
    // Not a loading badge: that hides the word behind a spinner, and a column
    // of spinners reads as the list still loading.
    expect(badgeOf(1)).not.toHaveAttribute('aria-busy', 'true')
    expect(badgeOf(1).querySelector('svg')).not.toBeNull()
    expect(badgeOf(1)).toHaveClass('bg-secondary')
  })

  it('keeps a long value to its own column, whole on hover', () => {
    render(
      <Records
        records={[
          {
            errors: [],
            row_number: 1,
            status: 'succeeded',
            row_values: {
              guest: 'Katherine Johnson',
            },
          },
        ]}
      />,
    )

    const value = screen.getByTitle('Katherine Johnson')

    expect(value).toHaveClass('truncate')
    expect(value).toHaveTextContent('Katherine Johnson')
  })

  it('scrolls sideways below the sum of its column widths instead of crushing them', () => {
    render(<Records />)

    // The line column (64), each of the three values (120) and the result
    // (160): below 584px the list scrolls rather than squeezing a column.
    expect(screen.getByRole('table')).toHaveStyle({
      minWidth: '584px',
    })
  })

  it('keeps the line column narrow, exact and pinned while the values scroll', () => {
    render(<Records />)

    const [lineHead] = screen.getAllByRole('columnheader')
    const [lineColumn] = Array.from(document.querySelectorAll('col'))

    expect(lineColumn).toHaveStyle({
      width: '64px',
    })
    expect(lineHead).toHaveClass('sticky', 'left-0')
  })

  it('marks an imported row as a success', () => {
    render(
      <Records
        records={[
          {
            errors: [],
            row_number: 1,
            status: 'succeeded',
            row_values: {},
          },
        ]}
      />,
    )

    expect(badgeOf(1)).toHaveTextContent('Imported')
    expect(badgeOf(1)).not.toHaveAttribute('aria-busy', 'true')
    expect(badgeOf(1)).toHaveClass('text-success', 'bg-success/5')
  })

  it('marks a failed row and reads every code under it, by column label', () => {
    render(
      <Records
        records={[
          {
            errors: [
              {
                code: 'required',
                column: 'guest',
              },
              {
                code: 'column_count_mismatch',
                column: null,
              },
            ],
            row_number: 3,
            row_values: {},
            status: 'failed',
          },
        ]}
      />,
    )

    const reasons = line(3).querySelector(
      '.data-transfer-errors',
    ) as HTMLElement

    expect(badgeOf(3)).toHaveTextContent('Failed')
    expect(badgeOf(3)).toHaveClass('text-destructive', 'bg-destructive/5')
    // A code, never a message, crosses the API: the words are the labels'.
    expect(
      within(reasons)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Guest: Required', 'The row has the wrong number of columns'])
  })

  it('reads a code the labels do not know as a sentence, code included', () => {
    render(
      <Records
        records={[
          {
            errors: [
              {
                code: 'booking_code_taken',
                column: 'code',
              },
            ],
            row_number: 1,
            row_values: {},
            status: 'failed',
          },
        ]}
      />,
    )

    expect(
      screen.getByText('Code: Could not be processed (booking_code_taken)'),
    ).toBeInTheDocument()
  })

  it('lets the product name its own codes, and the labels the rest', () => {
    render(
      <Records
        records={[
          {
            errors: [
              {
                code: 'booking_code_taken',
                column: 'code',
              },
              {
                code: 'required',
                column: 'guest',
              },
            ],
            row_number: 1,
            row_values: {},
            status: 'failed',
          },
        ]}
        rowErrorLabel={(error) =>
          error.code === 'booking_code_taken'
            ? 'A booking with this code already exists'
            : undefined
        }
      />,
    )

    expect(
      screen.getByText('Code: A booking with this code already exists'),
    ).toBeInTheDocument()
    expect(screen.getByText('Guest: Required')).toBeInTheDocument()
  })

  it('names a column it was not given by its key', () => {
    render(
      <Records
        records={[
          {
            errors: [
              {
                code: 'required',
                column: 'room',
              },
            ],
            row_number: 1,
            row_values: {},
            status: 'failed',
          },
        ]}
      />,
    )

    expect(screen.getByText('room: Required')).toBeInTheDocument()
  })

  it('lists reasons only for a failed row', () => {
    render(
      <Records
        records={[
          {
            errors: [
              {
                code: 'left_over',
                column: null,
              },
            ],
            row_number: 1,
            row_values: {},
            status: 'succeeded',
          },
          {
            errors: [],
            row_number: 2,
            row_values: {},
            status: 'failed',
          },
        ]}
      />,
    )

    expect(document.querySelector('.data-transfer-errors')).toBeNull()
    expect(screen.queryByText(/left_over/)).not.toBeInTheDocument()
  })

  it('says an exported row was exported, not imported', () => {
    render(
      <Records
        direction="export"
        records={[
          {
            errors: [],
            row_number: 1,
            row_values: {},
            status: 'succeeded',
          },
        ]}
      />,
    )

    expect(badgeOf(1)).toHaveTextContent('Exported')
    expect(screen.getByTestId('data-transfer-export-records')).toHaveAttribute(
      'data-direction',
      'export',
    )
  })

  it('shows no job line when no job is given', () => {
    render(<Records />)

    expect(screen.queryByTestId('data-transfer-job')).not.toBeInTheDocument()
  })

  it('heads the list with where the job stands, counted from its records', () => {
    render(<Records job={progress()} />)

    const job = screen.getByTestId('data-transfer-job')

    expect(job).toHaveAttribute('data-status', 'running')
    expect(within(job).getByTestId('badge')).toHaveTextContent('Running')
    expect(within(job).getByRole('status')).toHaveTextContent(
      '4 of 6 rows processed · 1 failed',
    )
  })

  it('leaves the failed count out while nothing failed', () => {
    render(
      <Records
        job={progress({
          counts: {
            failed: 0,
            pending: 0,
            succeeded: 6,
            total: 6,
          },
          status: 'succeeded',
        })}
      />,
    )

    expect(
      within(screen.getByTestId('data-transfer-job')).getByRole('status'),
    ).toHaveTextContent(/^6 of 6 rows processed$/)
  })

  it.each([
    ['file_too_large', 'The file passed the size limit'],
    ['processing_error', 'Something went wrong while processing the file'],
  ] as const)('says why a job failed: %s', (code, said) => {
    render(
      <Records
        job={progress({
          failure_code: code,
          status: 'failed',
        })}
      />,
    )

    expect(screen.getByTestId('data-transfer-job-failure')).toHaveTextContent(
      said,
    )
  })

  it('says nothing of a failure while the job has not failed', () => {
    render(<Records job={progress()} />)

    expect(
      screen.queryByTestId('data-transfer-job-failure'),
    ).not.toBeInTheDocument()
  })

  it('is always paginated, by the pagination it is handed', async () => {
    const onPageChange = vi.fn()

    render(
      <Records
        pagination={{
          ...PAGINATION,
          onPageChange,
        }}
      />,
    )

    expect(
      screen.getByRole('navigation', {
        name: 'Pagination',
      }),
    ).toHaveTextContent('1-10 of 40')

    await userEvent.click(screen.getByTestId('pagination-next'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('keeps the header while the page of records is loading', () => {
    render(
      <Records
        outcome={{
          retry: vi.fn(),
          status: 'pending',
        }}
      />,
    )

    expect(screen.getAllByRole('columnheader')).toHaveLength(5)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
  })

  it('offers a retry when the page of records could not be read', async () => {
    const retry = vi.fn()

    render(
      <Records
        outcome={{
          error: new Error('boom'),
          retry,
          status: 'error',
        }}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(retry).toHaveBeenCalledOnce()
  })

  it('keeps a product column called status apart from its own', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <DataTransferRecords<{ status: string }>
        direction="import"
        columns={[
          {
            key: 'status',
            label: 'Booking status',
          },
        ]}
        outcome={{
          data: [
            {
              errors: [],
              row_number: 1,
              status: 'succeeded',
              row_values: {
                status: 'confirmed',
              },
            },
          ],
          refreshing: false,
          retry: vi.fn(),
          status: 'success',
        }}
        pagination={PAGINATION}
      />,
    )

    expect(
      screen.getAllByRole('columnheader').map((head) => head.textContent),
    ).toEqual(['Row', 'Booking status', 'Result'])
    expect(screen.getByText('confirmed')).toBeInTheDocument()
    // Two columns under one key are two React children under one key.
    expect(
      error.mock.calls.some((call) => String(call[0]).includes('same key')),
    ).toBe(false)

    error.mockRestore()
  })
})
