import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TruncatedText } from './truncated-text'

const LONG = 'abcdefghijklmnopqrstuvwxyz0123456789'

describe('TruncatedText', () => {
  it('shows the value untouched when nothing asks for character truncation', () => {
    render(<TruncatedText value={LONG} />)

    expect(screen.getByText(LONG)).toBeInTheDocument()
  })

  it('renders a number value as text', () => {
    render(<TruncatedText value={1234} />)

    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('keeps both ends and elides the middle by default', () => {
    render(<TruncatedText position="middle" value={LONG} />)

    expect(screen.getByText('abcdefgh...456789')).toBeInTheDocument()
  })

  it('keeps only the start when the end is elided', () => {
    render(<TruncatedText position="end" start={5} value={LONG} />)

    expect(screen.getByText('abcde...')).toBeInTheDocument()
  })

  it('keeps only the end when the start is elided', () => {
    render(<TruncatedText end={4} position="start" value={LONG} />)

    expect(screen.getByText('...6789')).toBeInTheDocument()
  })

  it('drops the prefix when the middle keeps no leading characters', () => {
    render(<TruncatedText position="middle" start={0} value={LONG} />)

    expect(screen.getByText('...456789')).toBeInTheDocument()
  })

  it('drops the suffix when the middle keeps no trailing characters', () => {
    render(<TruncatedText end={0} position="middle" value={LONG} />)

    expect(screen.getByText('abcdefgh...')).toBeInTheDocument()
  })

  it('leaves the text alone when nothing would be kept', () => {
    render(<TruncatedText position="end" start={0} value={LONG} />)

    expect(screen.getByText(LONG)).toBeInTheDocument()
  })

  it('leaves the text alone when it is shorter than the kept window', () => {
    render(<TruncatedText position="middle" value="short" />)

    expect(screen.getByText('short')).toBeInTheDocument()
  })

  it('treats a negative window as keeping nothing on that side', () => {
    render(<TruncatedText end={-4} position="middle" start={5} value={LONG} />)

    expect(screen.getByText('abcde...')).toBeInTheDocument()
  })

  it('reveals the untruncated value in a tooltip', async () => {
    render(<TruncatedText position="middle" value={LONG} />)

    await userEvent.hover(screen.getByText('abcdefgh...456789'))

    expect(await screen.findByText(LONG)).toBeInTheDocument()
  })

  it('copies the full value, not the shortened text on screen', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    render(<TruncatedText copyable position="middle" value={LONG} />)

    expect(screen.getByText('abcdefgh...456789')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith(LONG)
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
  })

  it('copies a number value as its text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    render(<TruncatedText copyable value={1234} />)

    await userEvent.click(screen.getByTestId('truncated-text-copy'))

    expect(writeText).toHaveBeenCalledWith('1234')
  })

  it('renders no copy control and no wrapper unless asked', () => {
    render(<TruncatedText value={LONG} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('truncated-text-root')).not.toBeInTheDocument()
    expect(screen.getByTestId('truncated-text').className).toContain(
      'truncated-text-text',
    )
  })

  it('renders as code when asked for code', () => {
    render(<TruncatedText component="code" value="npm i" />)

    expect(screen.getByRole('code')).toHaveTextContent('npm i')
  })
})

describe.each([1, 2, 3] as const)('TruncatedText over %s lines', (lines) => {
  it('still shows the value', () => {
    render(<TruncatedText lines={lines} value="Hello" />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
