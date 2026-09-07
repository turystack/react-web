import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormatProvider } from '@/components/format-provider'

import { FileSizeText } from './file-size-text'

describe('FileSizeText', () => {
  it('reads bytes as bytes', () => {
    render(<FileSizeText value={512} />)

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('512 B')
  })

  it('climbs to the unit a person would have said', () => {
    render(<FileSizeText value={1_433_600} />)

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('1.4 MB')
  })

  it('counts in 1024s for the binary variant', () => {
    render(<FileSizeText value={1_433_600} variant="binary" />)

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('1.4 MiB')
  })

  it('takes the precision it was given', () => {
    render(<FileSizeText fractionDigits={3} value={1_433_600} />)

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('1.434 MB')
  })

  it('writes the number in the reader locale', () => {
    render(
      <FormatProvider
        format={{
          locale: 'pt-BR',
        }}
      >
        <FileSizeText value={1_433_600} />
      </FormatProvider>,
    )

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('1,4 MB')
  })

  it('renders an empty file as zero bytes', () => {
    render(<FileSizeText value={0} />)

    expect(screen.getByTestId('file-size-text')).toHaveTextContent('0 B')
  })

  it('falls back on an absent size', () => {
    render(
      <>
        <FileSizeText value={null} />
        <FileSizeText fallback="unknown" value={undefined} />
      </>,
    )

    const [empty, custom] = screen.getAllByTestId('file-size-text')

    expect(empty).toHaveTextContent('—')
    expect(custom).toHaveTextContent('unknown')
  })
})
