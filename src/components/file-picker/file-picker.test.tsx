import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FilePicker } from './file-picker'
import type { FileRejection } from './file-picker.types'

function file(name: string, size = 10) {
  const made = new File(['x'], name, { type: 'text/csv' })

  Object.defineProperty(made, 'size', { value: size })

  return made
}

function drop(target: Element, files: File[]) {
  const event = new Event('drop', { bubbles: true, cancelable: true })

  Object.defineProperty(event, 'dataTransfer', { value: { files } })
  target.dispatchEvent(event)
}

describe('FilePicker', () => {
  it('hands over what was chosen', async () => {
    const onSelect = vi.fn()

    render(<FilePicker onSelect={onSelect} />)

    await userEvent.upload(
      screen.getByTestId('file-picker-input'),
      file('rows.csv'),
    )

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0][0][0].name).toBe('rows.csv')
  })

  it('takes a dropped file the same way', () => {
    const onSelect = vi.fn()

    render(<FilePicker onSelect={onSelect} />)
    drop(screen.getByTestId('file-picker-dropzone'), [file('dropped.csv')])

    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('refuses a file over the size limit and says which', () => {
    const onSelect = vi.fn()
    const onReject = vi.fn()

    render(
      <FilePicker maxFileSize={5} onReject={onReject} onSelect={onSelect} />,
    )
    drop(screen.getByTestId('file-picker-dropzone'), [file('big.csv', 99)])

    expect(onSelect).not.toHaveBeenCalled()

    const [rejections] = onReject.mock.calls[0] as [FileRejection[]]

    expect(rejections).toHaveLength(1)
    expect(rejections[0].reason).toBe('maxFileSize')
  })

  /**
   * The picker holds nothing, so `count` is how the owner tells it what is
   * already there. Without it the limit would only ever count one drop.
   */
  it('counts what the owner already holds against maxFiles', () => {
    const onSelect = vi.fn()
    const onReject = vi.fn()

    render(
      <FilePicker
        count={2}
        maxFiles={3}
        onReject={onReject}
        onSelect={onSelect}
      />,
    )
    drop(screen.getByTestId('file-picker-dropzone'), [
      file('a.csv'),
      file('b.csv'),
    ])

    expect(onSelect.mock.calls[0][0]).toHaveLength(1)

    const [rejections] = onReject.mock.calls[0] as [FileRejection[]]

    expect(rejections[0].reason).toBe('maxFiles')
  })

  it('never fires onSelect with nothing in it', () => {
    const onSelect = vi.fn()

    render(<FilePicker maxFiles={1} onSelect={onSelect} />)
    drop(screen.getByTestId('file-picker-dropzone'), [])

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('takes nothing while disabled', () => {
    const onSelect = vi.fn()

    render(<FilePicker disabled onSelect={onSelect} />)
    drop(screen.getByTestId('file-picker-dropzone'), [file('a.csv')])

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('names its parts so a theme can reach them', () => {
    render(<FilePicker accept=".csv" onSelect={vi.fn()} />)

    const zone = screen.getByTestId('file-picker-dropzone')

    expect(zone.className).toContain('file-picker-root')
    expect(zone.querySelector('.file-picker-hint')).toBeInTheDocument()
    expect(zone.querySelector('.file-picker-accepted')).toBeInTheDocument()
  })

  it('lets the owner name it for its own test ids', () => {
    render(<FilePicker onSelect={vi.fn()} testId="uploader" />)

    expect(screen.getByTestId('uploader-dropzone')).toBeInTheDocument()
  })
})
