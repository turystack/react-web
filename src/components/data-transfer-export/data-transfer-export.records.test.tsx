import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTransferExport } from './data-transfer-export'

describe('DataTransferExport.Records', () => {
  it('lists the rows of an export, a succeeded one as exported', () => {
    render(
      <DataTransferExport.Records<{ code: string }>
        columns={[
          {
            key: 'code',
            label: 'Code',
          },
        ]}
        outcome={{
          data: [
            {
              errors: [],
              row_number: 1,
              row_values: {
                code: 'TRY-1041',
              },
              status: 'succeeded',
            },
          ],
          refreshing: false,
          retry: vi.fn(),
          status: 'success',
        }}
        pagination={{
          mode: 'offset',
          onPageChange: () => {},
          onRowsPerPageChange: () => {},
          page: 1,
          rowsPerPage: 10,
          total: 1,
        }}
      />,
    )

    expect(screen.getByTestId('data-transfer-export-records')).toHaveAttribute(
      'data-direction',
      'export',
    )
    expect(screen.getByTestId('badge')).toHaveTextContent('Exported')
    expect(screen.getByText('TRY-1041')).toBeInTheDocument()
  })
})
