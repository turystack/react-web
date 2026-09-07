import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Pagination } from './pagination'

function expectPages(shown: string[], hidden: string[]) {
  for (const page of shown) {
    expect(screen.getByRole('button', { name: page })).toBeInTheDocument()
  }
  for (const page of hidden) {
    expect(screen.queryByRole('button', { name: page })).not.toBeInTheDocument()
  }
}

describe('Pagination offset', () => {
  it('reports the range covered by the current page', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={2}
        rowsPerPage={20}
        total={100}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toHaveTextContent('21-40 of 100')
  })

  it('caps the range at the total on the last page', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={3}
        rowsPerPage={20}
        total={45}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toHaveTextContent('41-45 of 45')
  })

  it('marks the current page for assistive technology', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={3}
        rowsPerPage={10}
        total={50}
      />,
    )

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('delivers the next page number', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={2}
        rowsPerPage={20}
        total={100}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('delivers the previous page number', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={2}
        rowsPerPage={20}
        total={100}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('delivers the page number the user picked directly', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={1}
        rowsPerPage={10}
        total={50}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '4' }))

    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('blocks the previous button on the first page', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={1}
        rowsPerPage={20}
        total={100}
      />,
    )

    const previous = screen.getByRole('button', { name: 'Previous page' })
    expect(previous).toBeDisabled()

    await userEvent.click(previous)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('blocks the next button on the last page', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={5}
        rowsPerPage={20}
        total={100}
      />,
    )

    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next).toBeDisabled()

    await userEvent.click(next)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('delivers the rows per page as a number', async () => {
    const onRowsPerPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={onRowsPerPageChange}
        page={1}
        rowsPerPage={20}
        total={100}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: '50' }))

    expect(onRowsPerPageChange).toHaveBeenCalledWith(50)
  })

  it('reports an empty range when there is nothing to page through', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={1}
        rowsPerPage={20}
        total={0}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toHaveTextContent('0-0 of 0')
    expectPages(['1'], ['2'])
  })

  it('returns to the first page when the page size changes', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
        page={4}
        rowsPerPage={20}
        total={200}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: '50' }))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('offers the page sizes it was given instead of the defaults', async () => {
    const onRowsPerPageChange = vi.fn()
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={onRowsPerPageChange}
        page={1}
        rowsPerPage={25}
        rowsPerPageOptions={[25, 75]}
        total={100}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: '75' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '10' })).not.toBeInTheDocument()

    await userEvent.click(await screen.findByRole('option', { name: '75' }))

    expect(onRowsPerPageChange).toHaveBeenCalledWith(75)
  })

  it('lists every page while they fit', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={1}
        rowsPerPage={10}
        total={70}
      />,
    )

    expectPages(['1', '2', '3', '4', '5', '6', '7'], ['8'])
  })

  it('trims the tail of a long list near the first page', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={1}
        rowsPerPage={10}
        total={200}
      />,
    )

    expectPages(['1', '2', '20'], ['3', '19'])
  })

  it('trims both ends of a long list in the middle', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={10}
        rowsPerPage={10}
        total={200}
      />,
    )

    expectPages(['1', '9', '10', '11', '20'], ['2', '8', '12', '19'])
  })

  it('trims the head of a long list near the last page', () => {
    render(
      <Pagination
        mode="offset"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        page={20}
        rowsPerPage={10}
        total={200}
      />,
    )

    expectPages(['1', '19', '20'], ['2', '18'])
  })
})

describe('Pagination cursor', () => {
  it('delivers the next-page request when there is a next page', async () => {
    const onNextPage = vi.fn()
    render(
      <Pagination
        hasNextPage
        mode="cursor"
        onNextPage={onNextPage}
        rowsPerPage={20}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onNextPage).toHaveBeenCalledTimes(1)
  })

  it('delivers the previous-page request when there is a previous page', async () => {
    const onPreviousPage = vi.fn()
    render(
      <Pagination
        hasPreviousPage
        mode="cursor"
        onPreviousPage={onPreviousPage}
        rowsPerPage={20}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))

    expect(onPreviousPage).toHaveBeenCalledTimes(1)
  })

  it('blocks both directions when neither page exists', async () => {
    const onNextPage = vi.fn()
    const onPreviousPage = vi.fn()
    render(
      <Pagination
        mode="cursor"
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        rowsPerPage={20}
      />,
    )

    const previous = screen.getByRole('button', { name: 'Previous page' })
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(previous).toBeDisabled()
    expect(next).toBeDisabled()

    await userEvent.click(previous)
    await userEvent.click(next)

    expect(onPreviousPage).not.toHaveBeenCalled()
    expect(onNextPage).not.toHaveBeenCalled()
  })

  it('survives a click when no navigation handler was given', async () => {
    render(
      <Pagination hasNextPage hasPreviousPage mode="cursor" rowsPerPage={20} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))

    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('offers no rows-per-page control without a handler for it', () => {
    render(<Pagination hasNextPage mode="cursor" rowsPerPage={20} />)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('delivers the rows per page as a number', async () => {
    const onRowsPerPageChange = vi.fn()
    render(
      <Pagination
        mode="cursor"
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPage={20}
      />,
    )

    const control = screen.getByRole('combobox')
    expect(within(control).getByText('20')).toBeInTheDocument()

    await userEvent.click(control)
    await userEvent.click(await screen.findByRole('option', { name: '100' }))

    expect(onRowsPerPageChange).toHaveBeenCalledWith(100)
  })
  it('offers the page sizes it was given instead of the defaults', async () => {
    render(
      <Pagination
        mode="cursor"
        onRowsPerPageChange={vi.fn()}
        rowsPerPage={25}
        rowsPerPageOptions={[25, 75]}
      />,
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: '75' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '10' })).not.toBeInTheDocument()
  })
})

describe('Pagination labels', () => {
  it('takes the rows-per-page label from the provider in offset mode', () => {
    render(
      <TuryProvider
        labels={{
          pagination: {
            rowsPerPage: 'Linhas por página',
          },
        }}
      >
        <Pagination
          mode="offset"
          onPageChange={vi.fn()}
          onRowsPerPageChange={vi.fn()}
          page={1}
          rowsPerPage={20}
          total={100}
        />
      </TuryProvider>,
    )

    expect(screen.getByText('Linhas por página')).toBeInTheDocument()
  })

  it('takes the same label from the provider in cursor mode', () => {
    render(
      <TuryProvider
        labels={{
          pagination: {
            rowsPerPage: 'Linhas por página',
          },
        }}
      >
        <Pagination
          mode="cursor"
          onRowsPerPageChange={vi.fn()}
          rowsPerPage={20}
        />
      </TuryProvider>,
    )

    expect(screen.getByText('Linhas por página')).toBeInTheDocument()
  })

  it('takes the range summary from the provider', () => {
    render(
      <TuryProvider
        labels={{
          pagination: {
            range: (from, to, total) => `${from}-${to} de ${total}`,
          },
        }}
      >
        <Pagination
          mode="offset"
          onPageChange={vi.fn()}
          onRowsPerPageChange={vi.fn()}
          page={2}
          rowsPerPage={20}
          total={100}
        />
      </TuryProvider>,
    )

    expect(screen.getByTestId('pagination-root')).toHaveTextContent(
      '21-40 de 100',
    )
  })
})
