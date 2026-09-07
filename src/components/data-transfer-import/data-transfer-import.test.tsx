import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DataTransferImport } from './data-transfer-import'
import type { StandardSchema } from './data-transfer-import.types'

type Booking = {
  code: string
  guest: string
}

const COLUMNS = [
  {
    example: 'TRY-1041',
    key: 'code' as const,
    label: 'Code',
    required: true,
  },
  {
    key: 'guest' as const,
    label: 'Guest',
  },
]

const CSV = 'Code,Guest\nTRY-1041,Ada\nTRY-1042,Grace'

function Bookings(
  props: Partial<Parameters<typeof DataTransferImport<Booking>>[0]> = {},
) {
  return (
    <DataTransferImport<Booking>
      columns={COLUMNS}
      defaultOpen
      entity={{
        plural: 'bookings',
      }}
      onImport={props.onImport ?? vi.fn().mockResolvedValue(undefined)}
      {...props}
    />
  )
}

async function pick(content = CSV, name = 'bookings.csv') {
  await userEvent.upload(
    screen.getByTestId('data-transfer-import-input'),
    new File([content], name, {
      type: 'text/csv',
    }),
  )
}

describe('DataTransferImport', () => {
  it('titles itself after the entity that is arriving', () => {
    render(<Bookings />)

    expect(screen.getByText('Import bookings')).toBeInTheDocument()
    expect(
      screen.getByText('Bring bookings in from a file.'),
    ).toBeInTheDocument()
  })

  it('opens in a modal when asked, and in a sheet by default', () => {
    const { rerender } = render(<Bookings />)

    expect(screen.getByTestId('sheet-popup')).toBeInTheDocument()

    rerender(<Bookings surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toBeInTheDocument()
  })

  it('starts at the file step, offering the template', () => {
    render(<Bookings />)

    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-template'),
    ).toBeInTheDocument()
  })

  it('reads the file in the browser and names it back', async () => {
    render(<Bookings />)

    await pick()

    expect(
      await screen.findByTestId('data-transfer-import-mapping'),
    ).toBeInTheDocument()
    expect(screen.getByText('bookings.csv selected')).toBeInTheDocument()
    expect(screen.getByText('2 rows found')).toBeInTheDocument()
  })

  it('shows what each mapped column actually pulled in', async () => {
    render(<Bookings />)

    await pick()

    const mapping = await screen.findByTestId('data-transfer-import-mapping')

    expect(mapping).toHaveTextContent('TRY-1041')
    expect(mapping).toHaveTextContent('Ada')
  })

  it('refuses a file with more rows than it was allowed', async () => {
    render(<Bookings maxRows={1} />)

    await pick()

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('That file holds more than 1 rows')
  })

  it('says which required column has no header', async () => {
    render(<Bookings />)

    await pick('Reference,Guest\nTRY-1041,Ada')

    expect(
      await screen.findByTestId('data-transfer-import-missing'),
    ).toHaveTextContent('Code needs a column')
    expect(screen.getByTestId('data-transfer-import-next')).toBeDisabled()
  })

  it('counts what is ready against what the file held', async () => {
    render(<Bookings />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    expect(
      await screen.findByTestId('data-transfer-import-review'),
    ).toHaveTextContent('2 of 2 rows ready')
  })

  it('validates row by row and names the line', async () => {
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) => {
          const row = value as Booking

          return row.guest === 'Grace'
            ? {
                issues: [
                  {
                    message: 'that guest is blocked',
                    path: ['guest'],
                  },
                ],
              }
            : {
                value: row,
              }
        },
      },
    }

    render(<Bookings schema={schema} />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    const issues = await screen.findByTestId('data-transfer-import-issues')

    expect(issues).toHaveTextContent('that guest is blocked')
    expect(issues).toHaveTextContent('#2')
  })

  it('hands the mapped rows to the app, never a file', async () => {
    const onImport = vi.fn().mockResolvedValue(undefined)

    render(<Bookings onImport={onImport} />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-confirm'),
    )

    await waitFor(() => expect(onImport).toHaveBeenCalled())

    const [rows, meta] = onImport.mock.calls[0] ?? []

    expect(rows).toEqual([
      {
        code: 'TRY-1041',
        guest: 'Ada',
      },
      {
        code: 'TRY-1042',
        guest: 'Grace',
      },
    ])
    expect(meta.mapping).toEqual({
      code: 'Code',
      guest: 'Guest',
    })
  })

  it('reports what the API did', async () => {
    render(
      <Bookings
        onImport={vi.fn().mockResolvedValue({
          created: 2,
        })}
      />,
    )

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-confirm'),
    )

    expect(
      await screen.findByTestId('data-transfer-import-result'),
    ).toHaveTextContent('2 imported')
  })

  it('offers the refused rows back', async () => {
    render(
      <Bookings
        onImport={vi.fn().mockResolvedValue({
          created: 1,
          issues: [
            {
              message: 'already exists',
              row: 2,
            },
          ],
        })}
      />,
    )

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-confirm'),
    )

    expect(
      await screen.findByTestId('data-transfer-import-download-errors'),
    ).toBeInTheDocument()
  })

  it('keeps the step open with the reason when the import is refused', async () => {
    render(
      <Bookings
        onImport={vi.fn().mockRejectedValue(new Error('The API said no'))}
      />,
    )

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-confirm'),
    )

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('The API said no')
    expect(
      screen.getByTestId('data-transfer-import-review'),
    ).toBeInTheDocument()
  })

  it('takes any format through parse', async () => {
    const parse = vi.fn().mockResolvedValue({
      headers: ['Code', 'Guest'],
      rows: [
        {
          Code: 'TRY-9001',
          Guest: 'Alan',
        },
      ],
    })

    render(<Bookings accept=".xlsx" parse={parse} />)

    await userEvent.upload(
      screen.getByTestId('data-transfer-import-input'),
      new File(['binary'], 'bookings.xlsx'),
    )

    expect(parse).toHaveBeenCalled()
    expect(await screen.findByText('1 rows found')).toBeInTheDocument()
  })
})
