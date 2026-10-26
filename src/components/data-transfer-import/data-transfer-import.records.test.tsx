import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTransferImport } from './data-transfer-import'

describe('DataTransferImport.Records', () => {
  it('lists the rows of an import, a succeeded one as imported', () => {
    render(
      <DataTransferImport.Records<{ code: string }>
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

    expect(screen.getByTestId('data-transfer-import-records')).toHaveAttribute(
      'data-direction',
      'import',
    )
    expect(screen.getByTestId('badge')).toHaveTextContent('Imported')
    expect(screen.getByText('TRY-1041')).toBeInTheDocument()
  })
})
