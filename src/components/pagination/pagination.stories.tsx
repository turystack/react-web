import type { Meta } from '@storybook/react-vite'
import { useState } from 'react'

import { Pagination } from './pagination'

const meta = {
  component: Pagination,
  title: 'Components/Pagination',
} satisfies Meta<typeof Pagination>

export default meta

export const Offset = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    return (
      <Pagination
        mode="offset"
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        total={95}
      />
    )
  },
}

export const Cursor = {
  render: () => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(20)
    return (
      <Pagination
        hasNextPage={page < 4}
        hasPreviousPage={page > 0}
        mode="cursor"
        onNextPage={() => setPage((p) => p + 1)}
        onPreviousPage={() => setPage((p) => p - 1)}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPage={rowsPerPage}
      />
    )
  },
}

export const CursorWithoutRowsPerPage = {
  render: () => {
    const [page, setPage] = useState(0)
    return (
      <Pagination
        hasNextPage={page < 4}
        hasPreviousPage={page > 0}
        mode="cursor"
        onNextPage={() => setPage((p) => p + 1)}
        onPreviousPage={() => setPage((p) => p - 1)}
        rowsPerPage={10}
      />
    )
  },
}
