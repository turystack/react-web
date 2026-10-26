import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { DataTransferJobAccepted } from '@/components/data-transfer/data-transfer.types'

import { DataTransferImport } from './data-transfer-import'
import type {
  DataTransferImportUpload,
  StandardSchema,
} from './data-transfer-import.types'

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
  } satisfies DataTransferJobAccepted)
}

function stored(key = 'tmp/bookings-1') {
  return vi.fn().mockResolvedValue({
    storage_key: key,
  } satisfies DataTransferImportUpload)
}

function link(job: DataTransferJobAccepted) {
  return (
    <a href={`/imports/${job.data_transfer_job_id}`}>
      Open import {job.data_transfer_job_id}
    </a>
  )
}

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
      onImport={props.onImport ?? accepted()}
      onUpload={props.onUpload ?? stored()}
      resultLink={props.resultLink ?? link}
      {...props}
    />
  )
}

async function pick(
  content = CSV,
  name = 'bookings.csv',
  user = userEvent.setup(),
) {
  await user.upload(
    screen.getByTestId('data-transfer-import-input'),
    new File([content], name, {
      type: name.endsWith('.csv') ? 'text/csv' : '',
    }),
  )
}

/** From an open surface to the preview step, with the default file. */
async function toPreview(content = CSV) {
  await pick(content)
  await userEvent.click(await screen.findByTestId('data-transfer-import-next'))
  await screen.findByTestId('data-transfer-import-preview')
}

async function confirm() {
  const button = await screen.findByTestId('data-transfer-import-confirm')

  await waitFor(() => expect(button).toBeEnabled())
  await userEvent.click(button)
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

  it('opens at the medium width, and at the width it is given', () => {
    const { rerender } = render(<Bookings surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-lg')

    rerender(<Bookings size="lg" surface="modal" />)

    expect(screen.getByTestId('modal-popup')).toHaveClass('max-w-2xl')
    expect(screen.getByTestId('modal-popup')).not.toHaveClass('max-w-lg')
  })

  it('starts at the file step, taking the three formats and offering the template', () => {
    render(<Bookings />)

    expect(screen.getByTestId('data-transfer-import-input')).toHaveAttribute(
      'accept',
      '.csv,.json,.jsonl,.ndjson',
    )
    expect(
      screen.getByTestId('data-transfer-import-template'),
    ).toBeInTheDocument()
  })

  it('offers the CSV template only while CSV is offered', () => {
    render(<Bookings formats={['jsonl']} />)

    expect(screen.getByTestId('data-transfer-import-input')).toHaveAttribute(
      'accept',
      '.jsonl,.ndjson',
    )
    expect(
      screen.queryByTestId('data-transfer-import-template'),
    ).not.toBeInTheDocument()
  })

  it('uploads the file it was given, and previews it in the browser', async () => {
    const onUpload = stored()

    render(<Bookings onUpload={onUpload} />)

    await pick()

    const mapping = await screen.findByTestId('data-transfer-import-mapping')

    expect(onUpload).toHaveBeenCalledWith(expect.any(File))
    expect(onUpload.mock.calls[0]?.[0]).toHaveProperty('name', 'bookings.csv')
    expect(mapping).toHaveTextContent('bookings.csv selected')
    expect(screen.getByTestId('data-transfer-import-file')).toHaveTextContent(
      'UTF-8 · separated by ,',
    )
  })

  it('names the delimiter and the encoding it detected', async () => {
    render(<Bookings />)

    await pick('Code;Guest\nTRY-1041;Ada')

    expect(
      await screen.findByTestId('data-transfer-import-file'),
    ).toHaveTextContent('separated by ;')
    expect(
      screen.getByTestId('data-transfer-import-mapping'),
    ).toHaveTextContent('Ada')
  })

  it('shows what each mapped column actually pulled in', async () => {
    render(<Bookings />)

    await pick()

    const mapping = await screen.findByTestId('data-transfer-import-mapping')

    expect(mapping).toHaveTextContent('TRY-1041')
    expect(mapping).toHaveTextContent('Ada')
  })

  it('reads a JSONL file too, with no delimiter to name', async () => {
    render(<Bookings />)

    await pick(
      '{"Code":"TRY-7","Guest":"Hedy"}\n{"Code":"TRY-8","Guest":"Radia"}',
      'bookings.jsonl',
    )

    const mapping = await screen.findByTestId('data-transfer-import-mapping')

    expect(mapping).toHaveTextContent('TRY-7')
    expect(
      screen.getByTestId('data-transfer-import-file'),
    ).not.toHaveTextContent('separated')
  })

  it('refuses a file above the size limit before anything is uploaded', async () => {
    const onUpload = stored()

    render(<Bookings maxFileSize={10} onUpload={onUpload} />)

    await pick()

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('That file is larger than 10 B')
    expect(onUpload).not.toHaveBeenCalled()
    expect(
      screen.queryByTestId('data-transfer-import-mapping'),
    ).not.toBeInTheDocument()
  })

  it('refuses a format it was not offered before anything is uploaded', async () => {
    const onUpload = stored()

    render(<Bookings formats={['csv']} onUpload={onUpload} />)

    // The native picker filters by `accept`; a drop does not.
    await pick(
      '{"Code":"TRY-7"}',
      'bookings.jsonl',
      userEvent.setup({
        applyAccept: false,
      }),
    )

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('Choose a CSV file')
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('says a file it cannot preview cannot be read, and stays on the file', async () => {
    render(<Bookings />)

    await pick('Code,Guest\n')

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('That file could not be read')
    expect(
      screen.queryByTestId('data-transfer-import-mapping'),
    ).not.toBeInTheDocument()
  })

  it('says which header the file names twice, as the worker would fail it', async () => {
    const onImport = accepted()

    render(<Bookings onImport={onImport} />)

    await pick('Code,Guest,Code\nTRY-1041,Ada,TRY-9')

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('The file names the column “Code” twice')
    expect(
      screen.queryByTestId('data-transfer-import-mapping'),
    ).not.toBeInTheDocument()
  })

  it('says a JSON file must hold a list of rows', async () => {
    render(<Bookings />)

    await pick('{"Code":"TRY-1"}', 'bookings.json')

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('A JSON file must hold a list of rows')
  })

  it('numbers preview rows and warnings as the worker will number its records', async () => {
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) =>
          (value as Booking).guest === 'Grace'
            ? {
                issues: [
                  {
                    message: 'Grace is not a guest',
                    path: ['guest'],
                  },
                ],
              }
            : {
                value: value as Booking,
              },
      },
    }

    render(<Bookings schema={schema} />)

    // Element 1 is not an object: the worker records it as row 1, failed.
    await pick(
      '[1, {"Code":"TRY-1","Guest":"Ada"}, {"Code":"TRY-2","Guest":"Grace"}]',
      'bookings.json',
    )
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    const preview = await screen.findByTestId('data-transfer-import-preview')

    expect(
      screen.getByTestId('data-transfer-import-warnings'),
    ).toHaveTextContent('#3')
    expect(
      within(preview)
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0]?.textContent),
    ).toEqual(['2', '3'])
  })

  it('holds Back while the schema runs, so its answer cannot land on the file step', async () => {
    const pending = deferred<void>()
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) =>
          pending.promise.then(() => ({
            value: value as Booking,
          })),
      },
    }

    render(<Bookings schema={schema} />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    expect(screen.getByTestId('data-transfer-import-back')).toBeDisabled()

    await act(async () => {
      pending.resolve()
      await new Promise((settle) => setTimeout(settle, 0))
    })

    expect(
      await screen.findByTestId('data-transfer-import-preview'),
    ).toBeInTheDocument()
  })

  it('says which required column has no header', async () => {
    render(<Bookings />)

    await pick('Reference,Guest\nTRY-1041,Ada')

    expect(
      await screen.findByTestId('data-transfer-import-missing'),
    ).toHaveTextContent('Code needs a column')
    expect(screen.getByTestId('data-transfer-import-next')).toBeDisabled()
  })

  it('previews the head of the file as mapped, and says the worker checks every row', async () => {
    render(<Bookings />)

    await toPreview()

    const preview = screen.getByTestId('data-transfer-import-preview')

    expect(preview).toHaveTextContent('First 2 rows')
    expect(preview).toHaveTextContent('TRY-1042')
    expect(preview).toHaveTextContent('Every row is checked during the import')
  })

  it('numbers the preview rows, and keeps a code repeated in the file apart', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<Bookings />)

    await toPreview('Code,Guest\nTRY-1042,Grace\nTRY-1042,Barbara')

    const preview = screen.getByTestId('data-transfer-import-preview')

    expect(
      within(preview)
        .getAllByRole('columnheader')
        .map((head) => head.textContent),
    ).toEqual(['Row', 'Code', 'Guest'])
    expect(within(preview).getByText('Barbara')).toBeInTheDocument()
    // Two rows under one code are two React children under one key.
    expect(
      error.mock.calls.some((call) => String(call[0]).includes('same key')),
    ).toBe(false)

    error.mockRestore()
  })

  it('warns about the preview rows the schema refuses, and still imports', async () => {
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) => {
          const row = value as Booking

          return row.guest === 'Grace'
            ? {
                issues: [
                  {
                    message: 'Grace is not a guest',
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

    await toPreview()

    const warnings = screen.getByTestId('data-transfer-import-warnings')

    expect(warnings).toHaveTextContent('#2')
    expect(warnings).toHaveTextContent('Guest — Grace is not a guest')
    expect(
      screen.getByTestId('data-transfer-import-preview'),
    ).toHaveTextContent('1 with a warning')
    await waitFor(() =>
      expect(screen.getByTestId('data-transfer-import-confirm')).toBeEnabled(),
    )
  })

  it('hands the app the storage key, the mapping and the format — never the rows', async () => {
    const onImport = accepted()

    render(<Bookings onImport={onImport} onUpload={stored('tmp/abc')} />)

    await toPreview('Code,Other\nTRY-1041,Zed')
    await confirm()

    await screen.findByTestId('data-transfer-import-result')

    // Guest found no header: a column left out is not in the mapping.
    expect(onImport).toHaveBeenCalledWith({
      format: 'csv',
      mapping: {
        code: 'Code',
      },
      storage_key: 'tmp/abc',
    })
  })

  it('maps while the file goes up, and waits for it only at Import', async () => {
    const upload = deferred<DataTransferImportUpload>()
    const onImport = accepted()

    render(<Bookings onImport={onImport} onUpload={() => upload.promise} />)

    await toPreview()

    expect(
      screen.getByTestId('data-transfer-import-uploading'),
    ).toHaveTextContent('Uploading the file…')
    expect(screen.getByTestId('data-transfer-import-confirm')).toBeDisabled()

    await act(async () => {
      upload.resolve({
        storage_key: 'tmp/late',
      })
      await upload.promise
    })

    expect(
      screen.queryByTestId('data-transfer-import-uploading'),
    ).not.toBeInTheDocument()

    await confirm()

    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_key: 'tmp/late',
      }),
    )
  })

  it('returns to the file with the reason when the upload is refused', async () => {
    const upload = deferred<DataTransferImportUpload>()

    render(<Bookings onUpload={() => upload.promise} />)

    await pick()
    await screen.findByTestId('data-transfer-import-mapping')

    await act(async () => {
      upload.reject(new Error('Storage said no'))
      await upload.promise.catch(() => undefined)
    })

    expect(screen.getByTestId('data-transfer-import-error')).toHaveTextContent(
      'Storage said no',
    )
    expect(
      screen.queryByTestId('data-transfer-import-next'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
  })

  it('imports the file picked last, not the one an earlier upload answers for', async () => {
    const earlier = deferred<DataTransferImportUpload>()
    const onImport = accepted()
    const onUpload = vi
      .fn()
      .mockReturnValueOnce(earlier.promise)
      .mockResolvedValueOnce({
        storage_key: 'tmp/second',
      })

    render(<Bookings onImport={onImport} onUpload={onUpload} />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-back'),
    )
    await toPreview('Code,Guest\nTRY-2001,Alan')

    await act(async () => {
      earlier.resolve({
        storage_key: 'tmp/first',
      })
      await earlier.promise
    })

    await confirm()

    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_key: 'tmp/second',
      }),
    )
  })

  it('shows the request being sent while the API has not answered', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onImport={() => request.promise} />)

    await toPreview()
    await confirm()

    const sending = await screen.findByTestId('data-transfer-import-sending')

    expect(sending).toHaveAttribute('role', 'status')
    expect(sending).toHaveTextContent('Sending the request…')
    expect(
      screen.queryByTestId('data-transfer-import-result'),
    ).not.toBeInTheDocument()
  })

  it('leaves a single Close in the footer, disabled while sending', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onImport={() => request.promise} />)

    await toPreview()
    await confirm()

    expect(
      await screen.findByTestId('data-transfer-import-close'),
    ).toBeDisabled()
    expect(
      screen.queryByTestId('data-transfer-import-confirm'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-import-back'),
    ).not.toBeInTheDocument()

    await act(async () => {
      request.resolve({
        data_transfer_job_id: 'job-1',
        status: 'queued',
      })
      await request.promise
    })

    expect(screen.getByTestId('data-transfer-import-close')).toBeEnabled()
  })

  it('says where the import can be found once the API accepts it', async () => {
    const request = deferred<DataTransferJobAccepted>()

    render(<Bookings onImport={() => request.promise} />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-sending')
    await act(async () => {
      request.resolve({
        data_transfer_job_id: 'job-4',
        status: 'queued',
      })
      await request.promise
    })

    const notice = screen.getByTestId('data-transfer-import-notice')

    expect(
      screen.queryByTestId('data-transfer-import-sending'),
    ).not.toBeInTheDocument()
    expect(notice).toHaveTextContent('This keeps running after you close it.')
    expect(
      within(notice).getByRole('link', { name: 'Open import job-4' }),
    ).toHaveAttribute('href', '/imports/job-4')
  })

  it('lists the records the product reports for the job under the notice', async () => {
    const result = vi.fn(() => (
      <DataTransferImport.Records<Booking>
        columns={COLUMNS}
        job={{
          counts: {
            failed: 1,
            pending: 0,
            succeeded: 1,
            total: 2,
          },
          failure_code: null,
          status: 'succeeded',
        }}
        outcome={{
          data: [
            {
              errors: [],
              row_number: 1,
              row_values: {
                code: 'TRY-1041',
                guest: 'Ada',
              },
              status: 'succeeded',
            },
            {
              errors: [
                {
                  code: 'required',
                  column: 'guest',
                },
              ],
              row_number: 2,
              row_values: {
                code: 'TRY-1042',
                guest: '',
              },
              status: 'failed',
            },
          ],
          refreshing: false,
          retry: vi.fn(),
          status: 'success',
        }}
        pagination={{
          mode: 'offset',
          onPageChange: vi.fn(),
          onRowsPerPageChange: vi.fn(),
          page: 1,
          rowsPerPage: 10,
          total: 2,
        }}
      />
    ))

    render(<Bookings onImport={accepted('job-5')} result={result} />)

    await toPreview()
    await confirm()

    const records = await screen.findByTestId('data-transfer-import-records')
    const shown = screen.getByTestId('data-transfer-import-result')

    expect(result).toHaveBeenCalledWith({
      data_transfer_job_id: 'job-5',
      status: 'queued',
    })
    // The notice leads: it is the one thing true whatever the rows are doing.
    expect(shown.firstElementChild).toBe(
      screen.getByTestId('data-transfer-import-notice'),
    )
    expect(shown.lastElementChild).toBe(records)
    expect(records).toHaveTextContent('Guest: Required')
    expect(records).toHaveTextContent('2 of 2 rows processed · 1 failed')
  })

  it('renders nothing of the product while the job is not known yet', async () => {
    const request = deferred<DataTransferJobAccepted>()
    const result = vi.fn(() => <p>rows</p>)

    render(<Bookings onImport={() => request.promise} result={result} />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-sending')

    expect(result).not.toHaveBeenCalled()
  })

  it('closes from the result step', async () => {
    const onOpenChange = vi.fn()

    render(<Bookings onOpenChange={onOpenChange} />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-result')
    await userEvent.click(screen.getByTestId('data-transfer-import-close'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() =>
      expect(
        screen.queryByTestId('data-transfer-import'),
      ).not.toBeInTheDocument(),
    )
  })

  it('returns to the preview with the reason when the import is refused', async () => {
    render(
      <Bookings
        onImport={vi.fn().mockRejectedValue(new Error('The API said no'))}
      />,
    )

    await toPreview()
    await confirm()

    expect(
      await screen.findByTestId('data-transfer-import-error'),
    ).toHaveTextContent('The API said no')
    expect(
      screen.getByTestId('data-transfer-import-preview'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('data-transfer-import-confirm')).toBeEnabled()
    expect(
      screen.queryByTestId('data-transfer-import-close'),
    ).not.toBeInTheDocument()
  })

  it('clears the reason when the reader tries again', async () => {
    const onImport = vi
      .fn()
      .mockRejectedValueOnce(new Error('The API said no'))
      .mockResolvedValueOnce({
        data_transfer_job_id: 'job-2',
        status: 'queued',
      })

    render(<Bookings onImport={onImport} />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-error')
    await confirm()

    expect(
      await screen.findByTestId('data-transfer-import-result'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-import-error'),
    ).not.toBeInTheDocument()
  })

  it('starts over from the file when it opens again', async () => {
    const { rerender } = render(<Bookings open />)

    await pick()
    await screen.findByTestId('data-transfer-import-mapping')

    rerender(<Bookings open={false} />)
    rerender(<Bookings open />)

    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-import-mapping'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('bookings.csv selected')).not.toBeInTheDocument()
  })

  it('starts over after a finished import, too', async () => {
    const { rerender } = render(<Bookings open />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-result')

    rerender(<Bookings open={false} />)
    rerender(<Bookings open />)

    expect(
      screen.queryByTestId('data-transfer-import-result'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
  })

  it('ignores an upload that lands after the surface was opened again', async () => {
    const earlier = deferred<DataTransferImportUpload>()
    const onImport = accepted()
    const onUpload = vi
      .fn()
      .mockReturnValueOnce(earlier.promise)
      .mockResolvedValueOnce({
        storage_key: 'tmp/new',
      })
    const { rerender } = render(
      <Bookings onImport={onImport} onUpload={onUpload} open />,
    )

    await pick()
    await screen.findByTestId('data-transfer-import-mapping')

    rerender(<Bookings onImport={onImport} onUpload={onUpload} open={false} />)
    rerender(<Bookings onImport={onImport} onUpload={onUpload} open />)

    await act(async () => {
      earlier.reject(new Error('Storage said no'))
      await earlier.promise.catch(() => undefined)
    })

    // The old upload's refusal is not this opening's.
    expect(
      screen.queryByTestId('data-transfer-import-error'),
    ).not.toBeInTheDocument()

    await toPreview()
    await confirm()

    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_key: 'tmp/new',
      }),
    )
  })

  it('ignores an answer that lands after the surface was opened again', async () => {
    const earlier = deferred<DataTransferJobAccepted>()
    const later = deferred<DataTransferJobAccepted>()
    const onImport = vi
      .fn()
      .mockReturnValueOnce(earlier.promise)
      .mockReturnValueOnce(later.promise)
    const { rerender } = render(<Bookings onImport={onImport} open />)

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-sending')

    rerender(<Bookings onImport={onImport} open={false} />)
    rerender(<Bookings onImport={onImport} open />)

    await act(async () => {
      earlier.resolve({
        data_transfer_job_id: 'old',
        status: 'queued',
      })
      await earlier.promise
    })

    // The new opening is still on its own first step, not on the old job.
    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('data-transfer-import-result'),
    ).not.toBeInTheDocument()

    await toPreview()
    await confirm()

    // The new request waits for its own answer; the old job never shows.
    expect(
      await screen.findByTestId('data-transfer-import-sending'),
    ).toBeInTheDocument()

    await act(async () => {
      later.resolve({
        data_transfer_job_id: 'new',
        status: 'queued',
      })
      await later.promise
    })

    expect(
      screen.getByRole('link', { name: 'Open import new' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Open import old' }),
    ).not.toBeInTheDocument()
  })

  it('ignores a refusal that lands after the surface was opened again', async () => {
    const earlier = deferred<DataTransferJobAccepted>()
    const { rerender } = render(
      <Bookings onImport={() => earlier.promise} open />,
    )

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-sending')

    rerender(<Bookings onImport={() => earlier.promise} open={false} />)
    rerender(<Bookings onImport={() => earlier.promise} open />)

    await act(async () => {
      earlier.reject(new Error('The API said no'))
      await earlier.promise.catch(() => undefined)
    })

    expect(
      screen.queryByTestId('data-transfer-import-error'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
  })

  it('drops a check whose schema ends after the surface was opened again', async () => {
    const pending = deferred<void>()
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) =>
          pending.promise.then(() => ({
            value: value as Booking,
          })),
      },
    }
    const { rerender } = render(<Bookings open schema={schema} />)

    await pick()
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    rerender(<Bookings open={false} schema={schema} />)
    rerender(<Bookings open schema={schema} />)

    // A macrotask, so every row's validation and whatever follows it has run.
    await act(async () => {
      pending.resolve()
      await new Promise((settle) => setTimeout(settle, 0))
    })

    expect(
      screen.queryByTestId('data-transfer-import-preview'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-dropzone'),
    ).toBeInTheDocument()
  })

  it('drops a check whose mapping changed while it ran', async () => {
    const pending = deferred<void>()
    const schema: StandardSchema<Booking> = {
      '~standard': {
        validate: (value) =>
          pending.promise.then(() => ({
            value: value as Booking,
          })),
      },
    }

    render(<Bookings schema={schema} />)

    await pick('Code,Guest,Other\nTRY-1041,Ada,Zed')
    await userEvent.click(
      await screen.findByTestId('data-transfer-import-next'),
    )

    // Next spins while the schema runs, so it cannot be pressed twice.
    expect(screen.getByTestId('data-transfer-import-next')).toHaveAttribute(
      'aria-busy',
      'true',
    )

    // The reader remaps Guest to Other before the schema answers.
    const guest = screen
      .getAllByTestId('select-trigger')
      .find((trigger) => trigger.textContent?.includes('Guest')) as HTMLElement

    await userEvent.click(guest)
    await userEvent.click(
      await screen.findByRole('option', {
        name: 'Other',
      }),
    )

    await act(async () => {
      pending.resolve()
      await new Promise((settle) => setTimeout(settle, 0))
    })

    expect(
      screen.queryByTestId('data-transfer-import-preview'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('data-transfer-import-mapping'),
    ).toBeInTheDocument()
  })

  it('sends on the first confirm, with nothing left to wait for', async () => {
    const onImport = accepted()

    render(<Bookings onImport={onImport} />)

    await toPreview()
    await waitFor(() =>
      expect(screen.getByTestId('data-transfer-import-confirm')).toBeEnabled(),
    )
    await userEvent.dblClick(screen.getByTestId('data-transfer-import-confirm'))

    await screen.findByTestId('data-transfer-import-result')

    expect(onImport).toHaveBeenCalledTimes(1)
  })

  it('keeps Close waiting for the request, and still lets the surface go', async () => {
    const request = deferred<DataTransferJobAccepted>()
    const onOpenChange = vi.fn()

    render(
      <Bookings onImport={() => request.promise} onOpenChange={onOpenChange} />,
    )

    await toPreview()
    await confirm()
    await screen.findByTestId('data-transfer-import-sending')

    // The footer waits for the answer, so the notice and its link are seen.
    expect(screen.getByTestId('data-transfer-import-close')).toBeDisabled()

    // Escape does not: a request that never settles must not trap the reader.
    await userEvent.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('DataTransferImport axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Bookings />)

    expect(document.querySelector('.data-transfer-import')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<Bookings size="lg" />)

    expect(document.querySelector('.data-transfer-import')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })
})
