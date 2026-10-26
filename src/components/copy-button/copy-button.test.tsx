import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { COPIED_FOR_MS, CopyButton } from './copy-button'

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText,
    },
  })

  return writeText
}

describe('CopyButton', () => {
  beforeEach(() => {
    mockClipboard()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('writes the value to the clipboard and reports it', async () => {
    const writeText = mockClipboard()
    const onCopy = vi.fn()

    render(<CopyButton onCopy={onCopy} value="pi_3N8x" />)

    await userEvent.click(screen.getByRole('button'))

    expect(writeText).toHaveBeenCalledWith('pi_3N8x')
    expect(onCopy).toHaveBeenCalledWith('pi_3N8x')
  })

  it('is named by the copy label when it has no text of its own', () => {
    render(<CopyButton value="x" />)

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('takes its name from the labels the app provides', () => {
    render(
      <LabelsProvider labels={{ common: { copy: 'Copiar' } }}>
        <CopyButton value="x" />
      </LabelsProvider>,
    )

    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument()
  })

  it('prefers the name the caller gives', () => {
    render(<CopyButton ariaLabel="Copy payment id" value="x" />)

    expect(
      screen.getByRole('button', { name: 'Copy payment id' }),
    ).toBeInTheDocument()
  })

  it('is named by its visible label when it has one', () => {
    render(<CopyButton label="Copy link" value="https://x.test" />)

    const button = screen.getByRole('button', { name: 'Copy link' })

    expect(button).not.toHaveAttribute('aria-label')
    expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument()
  })

  it('announces the copy and swaps to a check, then settles back', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(<CopyButton value="x" />)

    const status = screen.getByRole('status')

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toBeEmptyDOMElement()
    expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    expect(status).toHaveTextContent('Copied')
    expect(screen.getByTestId('copy-button-copied-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(COPIED_FOR_MS)
    })

    expect(status).toBeEmptyDOMElement()
    expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument()
  })

  it('announces nothing when the clipboard refuses the write', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    const onCopy = vi.fn()

    render(<CopyButton onCopy={onCopy} value="x" />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByTestId('copy-button-icon')).toBeInTheDocument()
    expect(onCopy).not.toHaveBeenCalled()
  })

  it('copies from the keyboard', async () => {
    const writeText = mockClipboard()

    render(<CopyButton value="kbd" />)

    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(writeText).toHaveBeenCalledWith('kbd')

    await userEvent.keyboard(' ')
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('is a ghost button by default and takes any Button variant', () => {
    render(
      <>
        <CopyButton data-testid="ghost" value="x" />
        <CopyButton data-testid="outline" value="x" variant="outline" />
      </>,
    )

    expect(screen.getByTestId('ghost').className).toContain('hover:bg-muted')
    expect(screen.getByTestId('ghost').className).not.toContain('border-border')
    expect(screen.getByTestId('outline').className).toContain('border-border')
  })

  it.each([
    ['xs', 'size-6', 'h-9'],
    ['sm', 'size-9', 'h-9'],
    ['md', 'size-10', 'h-10'],
    ['lg', 'size-11', 'h-11'],
  ] as const)(
    'maps size %s onto the Button scale',
    (size, iconClass, textClass) => {
      render(
        <>
          <CopyButton data-testid="icon" size={size} value="x" />
          <CopyButton data-testid="text" label="Copy" size={size} value="x" />
        </>,
      )

      expect(screen.getByTestId('icon').className).toContain(iconClass)
      expect(screen.getByTestId('text').className).toContain(textClass)
    },
  )

  it('carries its slot classes', () => {
    render(<CopyButton value="x" />)

    expect(screen.getByTestId('copy-button').className).toContain(
      'copy-button-trigger',
    )
    expect(screen.getByRole('status').className).toContain('copy-button-status')
  })
})

describe('CopyButton block', () => {
  beforeEach(() => {
    mockClipboard()
  })

  it('stretches the button and its wrapper to the full width', () => {
    render(<CopyButton block label="Copy line" value="123" />)

    const button = screen.getByRole('button', { name: 'Copy line' })
    expect(button).toHaveClass('w-full')
    expect(button.parentElement).toHaveClass('copy-button', 'w-full')
  })

  it('keeps its natural width without block', () => {
    render(<CopyButton label="Copy line" value="123" />)

    const button = screen.getByRole('button', { name: 'Copy line' })
    expect(button).not.toHaveClass('w-full')
    expect(button.parentElement).not.toHaveClass('w-full')
  })

  it('still copies when full width', async () => {
    const writeText = mockClipboard()
    const onCopy = vi.fn()
    render(<CopyButton block label="Copy line" onCopy={onCopy} value="123" />)

    await userEvent.click(screen.getByRole('button', { name: 'Copy line' }))

    expect(writeText).toHaveBeenCalledWith('123')
    expect(onCopy).toHaveBeenCalledWith('123')
  })
})

describe('CopyButton containing block', () => {
  it.each([false, true])(
    'keeps its hidden status inside a positioned root (block %s)',
    (block) => {
      render(<CopyButton block={block} value="123" />)

      const root = screen.getByRole('button').parentElement as HTMLElement
      const status = screen.getByTestId('copy-button-status')

      expect(root).toHaveClass('copy-button', 'relative')
      expect(root).toContainElement(status)
      expect(status).toHaveClass('sr-only')
    },
  )
})

describe('CopyButton axes', () => {
  it('publishes its default size and variant for a theme to select', () => {
    const { container } = render(<CopyButton value="pi_3N8x" />)

    const root = container.querySelector('.copy-button')
    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveAttribute('data-variant', 'ghost')
  })

  it('publishes the size and variant it was given', () => {
    const { container } = render(
      <CopyButton size="lg" value="pi_3N8x" variant="outline" />,
    )

    const root = container.querySelector('.copy-button')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-variant', 'outline')
  })
})
