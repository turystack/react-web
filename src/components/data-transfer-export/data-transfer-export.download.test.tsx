import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DataTransferExport } from './data-transfer-export'

function root() {
  return screen.getByTestId('data-transfer-export-download')
}

function button() {
  return screen.getByTestId('data-transfer-export-download-button')
}

describe('DataTransferExport.Download', () => {
  it('says the file is being prepared, with a loader in its icon', () => {
    render(<DataTransferExport.Download status="running" />)

    expect(root()).toHaveAttribute('data-status', 'running')
    expect(screen.getByRole('status')).toHaveTextContent('Preparing the file…')
    expect(
      within(
        root().querySelector(
          '.data-transfer-export-download-icon',
        ) as HTMLElement,
      ).getByTestId('loader'),
    ).toBeInTheDocument()
  })

  it('keeps Download on screen but disabled until the file exists', () => {
    render(<DataTransferExport.Download href="/files/a.csv" status="running" />)

    // Present from the first moment, so nothing under it moves when it is
    // ready; a link would already be followable, so it is not one yet.
    expect(button()).toHaveTextContent('Download')
    expect(button()).toBeDisabled()
    expect(button().tagName).toBe('BUTTON')
  })

  it('names the file only once it is ready', () => {
    const { rerender } = render(
      <DataTransferExport.Download fileName="bookings.csv" status="running" />,
    )

    expect(root()).not.toHaveTextContent('bookings.csv')

    rerender(
      <DataTransferExport.Download
        fileName="bookings.csv"
        href="/files/bookings.csv"
        status="succeeded"
      />,
    )

    expect(root()).toHaveTextContent('bookings.csv')
  })

  it('hands a ready file to the browser as a download link', () => {
    render(
      <DataTransferExport.Download
        fileName="bookings.csv"
        href="/files/bookings.csv"
        status="succeeded"
      />,
    )

    expect(root()).toHaveAttribute('data-status', 'succeeded')
    expect(screen.getByRole('status')).toHaveTextContent('The file is ready')
    expect(button().tagName).toBe('A')
    expect(button()).toHaveAttribute('href', '/files/bookings.csv')
    expect(button()).toHaveAttribute('download', 'bookings.csv')
    expect(button()).toHaveTextContent('Download')
  })

  it('opens a file from another origin in a new tab, never over the app', () => {
    render(
      <DataTransferExport.Download
        href="https://files.example.com/signed/bookings.json"
        status="succeeded"
      />,
    )

    // `download` is dropped for another origin, and a signed URL is one: served
    // inline, the file would otherwise replace the tab the reader works in.
    expect(button()).toHaveAttribute('target', '_blank')
    expect(button()).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps Download disabled when a ready file has no way to be taken', () => {
    render(<DataTransferExport.Download status="succeeded" />)

    expect(button()).toBeDisabled()
  })

  it('lets the browser name the file when no name is given', () => {
    render(
      <DataTransferExport.Download href="/files/export" status="succeeded" />,
    )

    expect(button()).toHaveAttribute('download')
  })

  it('takes the file through onDownload when there is no href', async () => {
    const onDownload = vi.fn()

    render(
      <DataTransferExport.Download
        onDownload={onDownload}
        status="succeeded"
      />,
    )

    expect(button().tagName).toBe('BUTTON')
    expect(button()).toBeEnabled()

    await userEvent.click(button())

    expect(onDownload).toHaveBeenCalledOnce()
  })

  it('says the file is being prepared while the job is still queued', () => {
    render(<DataTransferExport.Download status="queued" />)

    expect(screen.getByRole('status')).toHaveTextContent('Preparing the file…')
    expect(button()).toBeDisabled()
  })

  it.each([
    ['file_too_large', 'The file passed the size limit'],
    ['processing_error', 'Something went wrong while processing the file'],
  ] as const)(
    'says why no file came out (%s), and offers nothing to take',
    (code, said) => {
      render(
        <DataTransferExport.Download
          failureCode={code}
          href="/files/a.csv"
          status="failed"
        />,
      )

      expect(root()).toHaveAttribute('data-status', 'failed')
      expect(screen.getByRole('status')).toHaveTextContent(said)
      expect(
        screen.queryByTestId('data-transfer-export-download-button'),
      ).not.toBeInTheDocument()
    },
  )

  it('falls back to a general reason when the failure carries no code', () => {
    render(<DataTransferExport.Download failureCode={null} status="failed" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'The file could not be generated',
    )
  })
})
