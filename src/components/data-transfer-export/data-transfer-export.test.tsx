import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import type { DataTransferJobAccepted } from '@/components/data-transfer/data-transfer.types'

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

/** A request the test answers when it chooses to, so the wait can be seen. */
function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  let reject: (reason: unknown) => void = () => {}
  const promise = new Promise<T>((settle, refuse) => {
    resolve = settle
    reject = refuse
  })

  return {
    promise,
    reject,
    resolve,
  }
}

function accepted(id = 'job-1') {
  return vi.fn().mockResolvedValue({
    data_transfer_job_id: id,
    status: 'queued',
  })
}

function link(job: DataTransferJobAccepted) {
  return (
    <a href={`/exports/${job.data_transfer_job_id}`}>
      Open export {job.data_transfer_job_id}
    </a>
  )
}

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
      onExport={props.onExport ?? accepted()}
      resultLink={props.resultLink ?? link}
      {...props}
    />
  )
}

function confirm() {
  return userEvent.click(screen.getByTestId('data-transfer-export-confirm'))
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

  it('opens at the medium width, and at the width it is given', () => {
    const { rerender } = render(<Bookings surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-lg')

    rerender(<Bookings size="lg" surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-2xl')
    expect(screen.getByTestId('modal-popup')).not.toHaveClass('max-w-lg')
  })

  it('hands the width to a sheet as well', () => {
    render(<Bookings size="xl" />)

    expect(screen.getByTestId('sheet-popup')).toHaveClass('sm:max-w-4xl')
  })

  it('walks two steps: the data, then the result', () => {
    render(<Bookings />)

    const steps = screen.getByRole('list', {
      name: 'Stepper',
    })

    expect(steps).toHaveTextContent('Data')
    expect(steps).toHaveTextContent('Result')
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

  it('lays the filters out as a Search grid, one labelled cell per filter', () => {
    render(<Bookings filters={FILTERS} />)

    const section = screen.getByTestId('data-transfer-export-filters')
    const grid = within(section).getByTestId('search-root')

    expect(grid).toHaveAttribute('data-variant', 'grid')
    expect(within(grid).getByTestId('search-cell-guest')).toHaveTextContent(
      'Guest',
    )
    expect(within(grid).getByTestId('search-cell-status')).toHaveTextContent(
      'Status',
    )
  })

  it('shows no filter section when no filter is declared', () => {
    render(<Bookings />)

    expect(
      screen.queryByTestId('data-transfer-export-filters'),
    ).not.toBeInTheDocument()
  })

  it('opens showing what the page was already filtered by', async () => {
    const onExport = accepted()

    render(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
      />,
    )

    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Ada',
        },
      }),
    )
  })

  it('opens on the filters the page shows now, not the ones it had at mount', async () => {
    const onExport = accepted()
    const { rerender } = render(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
        open={false}
      />,
    )

    // The list was filtered again while the export sat closed beside it.
    rerender(
      <Bookings
        defaultValues={{
          guest: 'Grace',
        }}
        filters={FILTERS}
        onExport={onExport}
        open
      />,
    )

    expect(screen.getByDisplayValue('Grace')).toBeInTheDocument()

    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Grace',
        },
      }),
    )
  })

  it('keeps what the reader typed while the page re-renders around it', async () => {
    const onExport = accepted()
    const page = (
      <Bookings
        // A fresh object on every render, the way an inline literal arrives.
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
        open
      />
    )
    const { rerender } = render(page)
    const guest = screen.getByDisplayValue('Ada')

    await userEvent.clear(guest)
    await userEvent.type(guest, 'Katherine')
    rerender(
      <Bookings
        defaultValues={{
          guest: 'Ada',
        }}
        filters={FILTERS}
        onExport={onExport}
        open
      />,
    )

    await confirm()

    // What leaves, not what the field shows: an input keeps its own text, so
    // only the export's config can tell a reset from a kept value.
    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Katherine',
        },
      }),
    )
  })

  it('hands several values over when the filter takes several', async () => {
    const onExport = accepted()

    render(
      <Bookings
        defaultValues={{
          statuses: ['confirmed', 'pending'],
        }}
        filters={[
          {
            key: 'statuses',
            label: 'Statuses',
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
            type: 'multiSelect' as const,
          },
        ]}
        onExport={onExport}
      />,
    )

    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()

    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          statuses: ['confirmed', 'pending'],
        },
      }),
    )
  })

  it('lets the reader change a filter before exporting', async () => {
    const onExport = accepted()

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
    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          guest: 'Grace',
        },
      }),
    )
  })

  it('empties every filter at once', async () => {
    const onExport = accepted()

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
    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {},
      }),
    )
  })

  it('keeps Clear filters disabled while no filter holds a value', () => {
    render(<Bookings filters={FILTERS} />)

    expect(
      screen.getByTestId('data-transfer-export-clear-filters'),
    ).toBeDisabled()
  })

  it('offers Clear filters once a filter holds a value, and not after it ran', async () => {
    render(<Bookings filters={FILTERS} />)

    const clear = screen.getByTestId('data-transfer-export-clear-filters')
    const section = screen.getByTestId('data-transfer-export-filters')

    await userEvent.type(
      section.querySelector('input[type="text"]') as HTMLElement,
      'Ada',
    )

    expect(clear).toBeEnabled()

    await userEvent.click(clear)

    expect(clear).toBeDisabled()
  })

  it('offers the three formats and hands back the chosen one', async () => {
    const onExport = accepted()

    render(<Bookings onExport={onExport} />)

    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('JSONL')).toBeInTheDocument()
    expect(screen.queryByText('XLSX')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('JSON'))
    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'json',
      }),
    )
  })

  it('lets every column be left out, a required one too', async () => {
    const onExport = accepted()

    render(<Bookings onExport={onExport} />)

    const id = screen.getByRole('checkbox', { name: /Id/ })

    // `required` belongs to the import's mapping; an export is the reader's
    // choice of what leaves.
    expect(id).not.toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(id)

    expect(id).not.toBeChecked()

    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: ['code', 'guest', 'price'],
      }),
    )
  })

  it('explains a column by its hint', async () => {
    render(<Bookings />)

    await userEvent.hover(screen.getByRole('checkbox', { name: /Id/ }))

    expect(
      await screen.findByText('The reference every other system joins on'),
    ).toBeInTheDocument()
  })

  it('wraps only the columns that have a hint in a tooltip', () => {
    render(<Bookings />)

    const triggers = within(
      screen.getByTestId('data-transfer-export-columns'),
    ).getAllByTestId('tooltip-trigger')

    expect(triggers).toHaveLength(1)
    expect(triggers[0]).toHaveTextContent('Id')
  })

  it('counts the chosen columns against the total', async () => {
    render(<Bookings />)

    const count = document.querySelector('.data-transfer-export-columns-count')

    expect(count).toHaveTextContent('4 of 4')

    await userEvent.click(screen.getByRole('checkbox', { name: /Price/ }))

    expect(count).toHaveTextContent('3 of 4')
  })

  it('keeps the declared order, not the order they were ticked', async () => {
    const onExport = accepted()

    render(<Bookings onExport={onExport} />)

    await userEvent.click(screen.getByRole('checkbox', { name: /Guest/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Code/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Code/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Guest/ }))
    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: ['id', 'code', 'guest', 'price'],
      }),
    )
  })

  it('clears every column at once, the required one included', async () => {
    render(<Bookings />)

    await userEvent.click(screen.getByRole('checkbox', { name: /All columns/ }))

    for (const column of COLUMNS) {
      expect(
        screen.getByRole('checkbox', { name: new RegExp(column.label) }),
      ).not.toBeChecked()
    }
  })

  it('refuses to export nothing, and says why', async () => {
    const onExport = accepted()

    render(<Bookings onExport={onExport} />)

    expect(
      screen.queryByTestId('data-transfer-export-columns-none'),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: /All columns/ }))

    expect(screen.getByTestId('data-transfer-export-confirm')).toBeDisabled()
    expect(
      screen.getByTestId('data-transfer-export-columns-none'),
    ).toHaveTextContent('Choose at least one column')

    await confirm()

    expect(onExport).not.toHaveBeenCalled()
  })

  it('takes a single column as enough to export', async () => {
    render(<Bookings />)

    await userEvent.click(screen.getByRole('checkbox', { name: /All columns/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Code/ }))

    expect(screen.getByTestId('data-transfer-export-confirm')).toBeEnabled()
    expect(
      screen.queryByTestId('data-transfer-export-columns-none'),
    ).not.toBeInTheDocument()
  })

  it('shows the request being sent while the API has not answered', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onExport={() => request.promise} />)

    await confirm()

    const sending = screen.getByTestId('data-transfer-export-sending')

    expect(sending).toHaveAttribute('role', 'status')
    expect(sending).toHaveTextContent('Sending the request…')
    expect(
      screen.queryByTestId('data-transfer-export-result'),
    ).not.toBeInTheDocument()
  })

  it('leaves a single Close in the footer, disabled while sending', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onExport={() => request.promise} />)

    await confirm()

    expect(screen.getByTestId('data-transfer-export-close')).toBeDisabled()
    expect(
      screen.queryByTestId('data-transfer-export-confirm'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-export-cancel'),
    ).not.toBeInTheDocument()

    await act(async () => {
      request.resolve({
        data_transfer_job_id: 'job-1',
        status: 'queued',
      })
      await request.promise
    })

    expect(screen.getByTestId('data-transfer-export-close')).toBeEnabled()
  })

  it('says where the export can be found once the API accepts it', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onExport={() => request.promise} />)

    await confirm()
    await act(async () => {
      request.resolve({
        data_transfer_job_id: 'job-7',
        status: 'queued',
      })
      await request.promise
    })

    const notice = screen.getByTestId('data-transfer-export-notice')

    expect(
      screen.queryByTestId('data-transfer-export-sending'),
    ).not.toBeInTheDocument()
    expect(notice).toHaveTextContent('This keeps running after you close it.')
    expect(
      within(notice).getByRole('link', { name: 'Open export job-7' }),
    ).toHaveAttribute('href', '/exports/job-7')
  })

  it('shows what the product renders for the job under the notice', async () => {
    const result = vi.fn((job: DataTransferJobAccepted) => (
      <p data-testid="export-file">file of {job.data_transfer_job_id}</p>
    ))

    render(<Bookings onExport={accepted('job-9')} result={result} />)

    await confirm()

    const file = await screen.findByTestId('export-file')
    const shown = screen.getByTestId('data-transfer-export-result')

    expect(file).toHaveTextContent('file of job-9')
    expect(result).toHaveBeenCalledWith({
      data_transfer_job_id: 'job-9',
      status: 'queued',
    })
    // The notice leads: it is the one thing true whatever the file is doing.
    expect(shown.firstElementChild).toBe(
      screen.getByTestId('data-transfer-export-notice'),
    )
  })

  it('renders nothing of the product while the job is not known yet', async () => {
    const request = deferred<DataTransferJobAccepted>()
    const result = vi.fn(() => <p>file</p>)

    render(<Bookings onExport={() => request.promise} result={result} />)

    await confirm()

    expect(result).not.toHaveBeenCalled()
  })

  it('closes from the result step', async () => {
    const onOpenChange = vi.fn()

    render(<Bookings onOpenChange={onOpenChange} />)

    await confirm()
    await userEvent.click(
      await screen.findByTestId('data-transfer-export-close'),
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() =>
      expect(
        screen.queryByTestId('data-transfer-export'),
      ).not.toBeInTheDocument(),
    )
  })

  it('returns to the first step with the reason when the export is refused', async () => {
    render(
      <Bookings
        onExport={() => Promise.reject(new Error('Too many rows for now'))}
      />,
    )

    await confirm()

    expect(
      await screen.findByTestId('data-transfer-export-error'),
    ).toHaveTextContent('Too many rows for now')
    expect(screen.getByTestId('data-transfer-export-confirm')).toBeEnabled()
    expect(
      screen.getByTestId('data-transfer-export-columns'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-export-close'),
    ).not.toBeInTheDocument()
  })

  it('falls back to a general reason when the refusal carries none', async () => {
    render(<Bookings onExport={() => Promise.reject(new Error(''))} />)

    await confirm()

    expect(
      await screen.findByTestId('data-transfer-export-error'),
    ).toHaveTextContent('That did not work. Try again.')
  })

  it('starts over at the first step when it opens again, keeping what was chosen', async () => {
    const onExport = accepted()
    const { rerender } = render(<Bookings onExport={onExport} open />)

    await userEvent.click(screen.getByRole('checkbox', { name: /Price/ }))
    await userEvent.click(screen.getByText('JSON'))
    await confirm()

    expect(
      await screen.findByTestId('data-transfer-export-result'),
    ).toBeInTheDocument()

    rerender(<Bookings onExport={onExport} open={false} />)
    rerender(<Bookings onExport={onExport} open />)

    expect(
      screen.queryByTestId('data-transfer-export-result'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Price/ })).not.toBeChecked()

    await confirm()

    expect(onExport).toHaveBeenLastCalledWith({
      columns: ['id', 'code', 'guest'],
      filters: {},
      format: 'json',
    })
  })

  it('starts over when the trigger opens it again', async () => {
    render(
      <DataTransferExport<Booking>
        columns={COLUMNS}
        onExport={accepted()}
        resultLink={link}
        trigger={<Button>Open the export</Button>}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Open the export' }),
    )
    await confirm()
    await userEvent.click(
      await screen.findByTestId('data-transfer-export-close'),
    )
    await waitFor(() =>
      expect(
        screen.queryByTestId('data-transfer-export'),
      ).not.toBeInTheDocument(),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Open the export' }),
    )

    expect(
      await screen.findByTestId('data-transfer-export-confirm'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-export-result'),
    ).not.toBeInTheDocument()
  })

  it('ignores an answer that lands after the surface was opened again', async () => {
    const earlier = deferred<DataTransferJobAccepted>()
    const later = deferred<DataTransferJobAccepted>()
    const onExport = vi
      .fn()
      .mockReturnValueOnce(earlier.promise)
      .mockReturnValueOnce(later.promise)
    const { rerender } = render(<Bookings onExport={onExport} open />)

    await confirm()

    rerender(<Bookings onExport={onExport} open={false} />)
    rerender(<Bookings onExport={onExport} open />)

    await act(async () => {
      earlier.resolve({
        data_transfer_job_id: 'old',
        status: 'queued',
      })
      await earlier.promise
    })

    // The new opening is still on its own first step, not on the old job.
    expect(screen.getByTestId('data-transfer-export-confirm')).toBeEnabled()
    expect(
      screen.queryByTestId('data-transfer-export-result'),
    ).not.toBeInTheDocument()

    await confirm()

    // The new request waits for its own answer; the old job never shows.
    expect(
      screen.getByTestId('data-transfer-export-sending'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Open export old' }),
    ).not.toBeInTheDocument()

    await act(async () => {
      later.resolve({
        data_transfer_job_id: 'new',
        status: 'queued',
      })
      await later.promise
    })

    expect(
      screen.getByRole('link', { name: 'Open export new' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Open export old' }),
    ).not.toBeInTheDocument()
  })

  it('ignores a refusal that lands after the surface was opened again', async () => {
    const earlier = deferred<DataTransferJobAccepted>()
    const { rerender } = render(
      <Bookings onExport={() => earlier.promise} open />,
    )

    await confirm()

    rerender(<Bookings onExport={() => earlier.promise} open={false} />)
    rerender(<Bookings onExport={() => earlier.promise} open />)

    await act(async () => {
      earlier.reject(new Error('Too many rows for now'))
      await earlier.promise.catch(() => undefined)
    })

    expect(
      screen.queryByTestId('data-transfer-export-error'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('data-transfer-export-confirm')).toBeEnabled()
  })

  it('opens from the trigger, without eating its own onClick', async () => {
    const onClick = vi.fn()

    render(
      <DataTransferExport<Booking>
        columns={COLUMNS}
        onExport={accepted()}
        resultLink={link}
        trigger={<Button onClick={onClick}>Export</Button>}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onClick).toHaveBeenCalled()
    expect(
      await screen.findByTestId('data-transfer-export'),
    ).toBeInTheDocument()
  })

  it('counts only declared columns, so a stray default cannot pass for one', () => {
    render(<Bookings defaultColumns={['nope' as never]} />)

    expect(screen.getByTestId('data-transfer-export-confirm')).toBeDisabled()
    expect(
      screen.getByTestId('data-transfer-export-columns-none'),
    ).toBeInTheDocument()
  })

  it('keeps Close waiting for the request, and still lets the surface go', async () => {
    const request = deferred<DataTransferJobAccepted>()
    const onOpenChange = vi.fn()

    render(
      <Bookings onExport={() => request.promise} onOpenChange={onOpenChange} />,
    )

    await confirm()
    await screen.findByTestId('data-transfer-export-sending')

    expect(screen.getByTestId('data-transfer-export-close')).toBeDisabled()

    // A request that never settles must not trap the reader.
    await userEvent.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('ticks columns that arrive after mount, until the reader picks', async () => {
    const onExport = accepted()
    const { rerender } = render(
      <Bookings columns={COLUMNS.slice(0, 2)} onExport={onExport} />,
    )

    // The table's columns loaded late.
    rerender(<Bookings columns={COLUMNS} onExport={onExport} />)

    expect(screen.getByText('4 of 4')).toBeInTheDocument()

    await confirm()

    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: ['id', 'code', 'guest', 'price'],
      }),
    )
  })
})

describe('DataTransferExport axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Bookings />)

    expect(document.querySelector('.data-transfer-export')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<Bookings size="lg" />)

    expect(document.querySelector('.data-transfer-export')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })
})
