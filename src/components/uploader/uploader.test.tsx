import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Uploader } from './uploader'
import type { UploaderHandlerResponse } from './uploader.types'

type ProgressLike = {
  lengthComputable: boolean
  loaded: number
  total: number
}

class MockXhr {
  onerror: (() => void) | null = null
  onload: (() => void) | null = null
  status = 200
  upload: {
    onprogress: ((event: ProgressLike) => void) | null
  } = {
    onprogress: null,
  }
  url = ''

  open(_method: string, url: string) {
    this.url = url
  }

  send() {
    sent.push(this)
  }
}

let sent: MockXhr[] = []

function signedResponse(fileName: string): UploaderHandlerResponse {
  return {
    cdnUrl: `https://cdn.test/${fileName}`,
    expiresIn: 3600,
    key: `uploads/${fileName}`,
    upload: {
      fields: {
        key: `uploads/${fileName}`,
      },
      url: 'https://upload.test/bucket',
    },
  }
}

function makeHandler() {
  return vi.fn(async (fileName: string) => signedResponse(fileName))
}

function makeFile(name: string, size = 8) {
  return new File(['x'.repeat(size)], name, {
    type: 'image/png',
  })
}

async function nextRequest() {
  await waitFor(() => {
    expect(sent.length).toBeGreaterThan(0)
  })
  return sent.shift() as MockXhr
}

async function reportProgress(xhr: MockXhr, event: ProgressLike) {
  await act(async () => {
    xhr.upload.onprogress?.(event)
  })
}

async function respond(xhr: MockXhr, status: number) {
  await act(async () => {
    xhr.status = status
    xhr.onload?.()
  })
}

async function breakConnection(xhr: MockXhr) {
  await act(async () => {
    xhr.onerror?.()
  })
}

function fileEntry(name: string) {
  const entry = screen
    .getAllByTestId('uploader-file-item')
    .find((item) => within(item).queryByText(name) !== null)

  expect(entry).toBeDefined()

  return entry as HTMLElement
}

function queryFileEntry(name: string) {
  return (
    screen
      .queryAllByTestId('uploader-file-item')
      .find((item) => within(item).queryByText(name) !== null) ?? null
  )
}

beforeEach(() => {
  sent = []
  // The component uploads through XMLHttpRequest to read progress events, and
  // jsdom ships no network, so the request object is the seam the test drives.
  vi.stubGlobal('XMLHttpRequest', MockXhr)
})

describe('Uploader', () => {
  it('invites the user to drop or pick a file', () => {
    render(<Uploader handler={makeHandler()} />)

    expect(
      screen.getByText('Drag & drop files here, or click to select'),
    ).toBeInTheDocument()
  })

  it('states the types it accepts when it filters them', () => {
    render(<Uploader accept="image/*" handler={makeHandler()} />)

    expect(screen.getByText('Accepted: image/*')).toBeInTheDocument()
    expect(screen.getByTestId('uploader-input')).toHaveAttribute(
      'accept',
      'image/*',
    )
  })

  it('states no accepted types when it accepts everything', () => {
    render(<Uploader handler={makeHandler()} />)

    expect(screen.queryByText(/Accepted:/)).not.toBeInTheDocument()
  })

  it('takes many files unless it is limited to one', () => {
    const { rerender } = render(<Uploader handler={makeHandler()} />)
    expect(screen.getByTestId('uploader-input')).toHaveAttribute('multiple')

    rerender(<Uploader handler={makeHandler()} maxFiles={1} />)
    expect(screen.getByTestId('uploader-input')).not.toHaveAttribute('multiple')
  })

  it('opens the picker when the dropzone is clicked', async () => {
    render(<Uploader handler={makeHandler()} />)

    const input = screen.getByTestId('uploader-input')
    const opened = vi.fn()
    input.addEventListener('click', opened)

    await userEvent.click(screen.getByTestId('uploader-dropzone'))

    expect(opened).toHaveBeenCalledTimes(1)
  })

  it('asks the handler for a destination named after the picked file', async () => {
    const handler = makeHandler()
    render(<Uploader handler={handler} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )

    expect(handler).toHaveBeenCalledWith('photo.png')
    expect((await nextRequest()).url).toBe('https://upload.test/bucket')
  })

  it('delivers the signed response and the file position to onUpload', async () => {
    const onUpload = vi.fn()
    render(<Uploader handler={makeHandler()} onUpload={onUpload} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 204)

    expect(onUpload).toHaveBeenCalledWith(signedResponse('photo.png'), 0)
    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'done')
  })

  it('finishes the upload even with no onUpload listener', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 200)

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'done')
  })

  it('shows how far the upload has got while it runs', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    const request = await nextRequest()

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'uploading')

    await reportProgress(request, {
      lengthComputable: true,
      loaded: 40,
      total: 100,
    })

    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('reaches each status icon by the handle the uploader gives it', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    const request = await nextRequest()

    expect(screen.getByTestId('uploader-icon-uploading')).toBeInTheDocument()

    await respond(request, 200)

    expect(screen.getByTestId('uploader-icon-done')).toBeInTheDocument()
  })

  it('reaches the failure icon by the handle the uploader gives it', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 500)

    expect(screen.getByTestId('uploader-icon-error')).toBeInTheDocument()
  })

  it('holds the reported progress when the size is unknown', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    const request = await nextRequest()

    await reportProgress(request, {
      lengthComputable: false,
      loaded: 40,
      total: 0,
    })

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('tracks each file of a batch on its own', async () => {
    const onUpload = vi.fn()
    render(<Uploader handler={makeHandler()} onUpload={onUpload} />)

    await userEvent.upload(screen.getByTestId('uploader-input'), [
      makeFile('first.png'),
      makeFile('second.png'),
    ])

    const first = await nextRequest()
    const second = await nextRequest()

    await reportProgress(second, {
      lengthComputable: true,
      loaded: 50,
      total: 100,
    })
    await respond(second, 204)

    expect(fileEntry('second.png')).toHaveAttribute('data-status', 'done')
    expect(fileEntry('first.png')).toHaveAttribute('data-status', 'uploading')
    expect(onUpload).toHaveBeenCalledWith(signedResponse('second.png'), 1)

    await breakConnection(first)

    expect(fileEntry('first.png')).toHaveAttribute('data-status', 'error')
  })

  it('marks the file failed when the server refuses it', async () => {
    const onUpload = vi.fn()
    render(<Uploader handler={makeHandler()} onUpload={onUpload} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 500)

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'error')
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('marks the file failed when the connection breaks', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await breakConnection(await nextRequest())

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'error')
  })

  it('marks the file failed when the handler cannot sign it', async () => {
    const handler = vi.fn(async () => {
      throw new Error('no credentials')
    })
    render(<Uploader handler={handler} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )

    await waitFor(() => {
      expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'error')
    })
  })

  it('takes no more files than maxFiles allows', async () => {
    const handler = makeHandler()
    render(<Uploader handler={handler} maxFiles={1} />)

    await userEvent.upload(screen.getByTestId('uploader-input'), [
      makeFile('first.png'),
      makeFile('second.png'),
    ])

    expect(fileEntry('first.png')).toBeInTheDocument()
    expect(queryFileEntry('second.png')).toBeNull()
  })

  it('turns away a file over maxFileSize', async () => {
    const handler = makeHandler()
    render(<Uploader handler={handler} maxFileSize={4} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('huge.png', 64),
    )

    expect(handler).not.toHaveBeenCalled()
    expect(screen.queryByTestId('uploader-file-list')).not.toBeInTheDocument()
  })

  it('keeps a file that fits under maxFileSize', async () => {
    const handler = makeHandler()
    render(<Uploader handler={handler} maxFileSize={64} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('small.png', 4),
    )

    expect(fileEntry('small.png')).toBeInTheDocument()
  })

  it('drops the file from the list when it is removed', async () => {
    render(<Uploader handler={makeHandler()} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 204)

    await userEvent.click(within(fileEntry('photo.png')).getByRole('button'))

    expect(queryFileEntry('photo.png')).toBeNull()
  })

  it('picks up nothing while disabled', async () => {
    const handler = makeHandler()
    render(<Uploader disabled handler={handler} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )

    expect(handler).not.toHaveBeenCalled()
    expect(screen.queryByTestId('uploader-file-list')).not.toBeInTheDocument()
  })

  it('opens no picker while disabled', async () => {
    render(<Uploader disabled handler={makeHandler()} />)

    const input = screen.getByTestId('uploader-input')
    const opened = vi.fn()
    input.addEventListener('click', opened)

    await userEvent.click(screen.getByTestId('uploader-dropzone'), {
      pointerEventsCheck: 0,
    })

    expect(opened).not.toHaveBeenCalled()
  })

  it('blocks removal while disabled', async () => {
    const handler = makeHandler()
    const { rerender } = render(<Uploader handler={handler} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )
    await respond(await nextRequest(), 204)

    rerender(<Uploader disabled handler={handler} />)

    const remove = within(fileEntry('photo.png')).getByRole('button')
    expect(remove).toBeDisabled()

    await userEvent.click(remove)

    expect(fileEntry('photo.png')).toBeInTheDocument()
  })
})

describe('Uploader when a row is removed mid-flight', () => {
  it('never writes a removed file result onto its neighbour', async () => {
    const onUpload = vi.fn()
    render(<Uploader handler={makeHandler()} onUpload={onUpload} />)

    await userEvent.upload(screen.getByTestId('uploader-input'), [
      makeFile('first.png'),
      makeFile('second.png'),
    ])

    const first = await nextRequest()
    await nextRequest()

    await userEvent.click(within(fileEntry('first.png')).getByRole('button'))
    await respond(first, 204)

    expect(fileEntry('second.png')).toHaveAttribute('data-status', 'uploading')
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('finishes the surviving file at the position it now holds', async () => {
    const onUpload = vi.fn()
    render(<Uploader handler={makeHandler()} onUpload={onUpload} />)

    await userEvent.upload(screen.getByTestId('uploader-input'), [
      makeFile('first.png'),
      makeFile('second.png'),
    ])

    await nextRequest()
    const second = await nextRequest()

    await userEvent.click(within(fileEntry('first.png')).getByRole('button'))
    await respond(second, 204)

    expect(fileEntry('second.png')).toHaveAttribute('data-status', 'done')
    expect(onUpload).toHaveBeenCalledWith(signedResponse('second.png'), 0)
  })
})

describe('Uploader pending state', () => {
  it('shows the file as pending until its destination is signed', async () => {
    let release: (response: UploaderHandlerResponse) => void = () => {}
    const handler = vi.fn(
      () =>
        new Promise<UploaderHandlerResponse>((resolve) => {
          release = resolve
        }),
    )
    render(<Uploader handler={handler} />)

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('photo.png'),
    )

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'pending')
    expect(screen.getByTestId('uploader-icon-pending')).toBeInTheDocument()

    await act(async () => {
      release(signedResponse('photo.png'))
    })

    expect(fileEntry('photo.png')).toHaveAttribute('data-status', 'uploading')
  })
})

describe('Uploader rejections', () => {
  it('reports the file a size limit turned away', async () => {
    const onReject = vi.fn()
    render(
      <Uploader handler={makeHandler()} maxFileSize={4} onReject={onReject} />,
    )

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('huge.png', 64),
    )

    const [rejections] = onReject.mock.calls[0]
    expect(rejections).toHaveLength(1)
    expect(rejections[0].file.name).toBe('huge.png')
    expect(rejections[0].reason).toBe('maxFileSize')
  })

  it('reports the file a count limit turned away', async () => {
    const onReject = vi.fn()
    render(
      <Uploader handler={makeHandler()} maxFiles={2} onReject={onReject} />,
    )

    await userEvent.upload(screen.getByTestId('uploader-input'), [
      makeFile('first.png'),
      makeFile('second.png'),
      makeFile('third.png'),
    ])

    const [rejections] = onReject.mock.calls[0]
    expect(rejections).toHaveLength(1)
    expect(rejections[0].file.name).toBe('third.png')
    expect(rejections[0].reason).toBe('maxFiles')
  })

  it('reports nothing while every file fits', async () => {
    const onReject = vi.fn()
    render(
      <Uploader handler={makeHandler()} maxFileSize={64} onReject={onReject} />,
    )

    await userEvent.upload(
      screen.getByTestId('uploader-input'),
      makeFile('small.png', 4),
    )

    expect(onReject).not.toHaveBeenCalled()
  })
})
