import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { CodeBlock } from './code-block'

function lineTexts() {
  return Array.from(
    screen
      .getByTestId('code-block')
      .querySelectorAll('.code-block-line-content'),
  ).map((line) => line.textContent)
}

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  return writeText
}

/** jsdom has no layout: every box measures 0, so overflow is staged. */
function stageOverflow() {
  const scrollHeight = vi
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(500)
  const clientHeight = vi
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockReturnValue(100)

  return () => {
    scrollHeight.mockRestore()
    clientHeight.mockRestore()
  }
}

describe('CodeBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pretty-prints an object as JSON with two spaces', () => {
    render(<CodeBlock value={{ id: 'evt_1', data: { amount: 10 } }} />)

    expect(lineTexts()).toEqual([
      '{',
      '  "id": "evt_1",',
      '  "data": {',
      '    "amount": 10',
      '  }',
      '}',
    ])
    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      'json',
    )
  })

  it('shows a string exactly as given, as plain text by default', () => {
    render(<CodeBlock value={'Error: boom\n    at handler (api.ts:12)'} />)

    expect(lineTexts()).toEqual(['Error: boom', '    at handler (api.ts:12)'])
    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      'text',
    )
    expect(document.querySelector('.code-block-token')).toBeNull()
  })

  it('colours a JSON string when asked to, without reformatting it', () => {
    render(<CodeBlock language="json" value='{"a":1}' />)

    expect(lineTexts()).toEqual(['{"a":1}'])
    expect(document.querySelector('.code-block-token-key')).toHaveTextContent(
      '"a"',
    )
  })

  it('leaves an object uncoloured when the language is text', () => {
    render(<CodeBlock language="text" value={{ a: 1 }} />)

    expect(document.querySelector('.code-block-token')).toBeNull()
    expect(lineTexts()).toContain('  "a": 1')
  })

  it('gives every JSON token kind its own class', () => {
    render(
      <CodeBlock
        value={{ count: 3, flag: true, gone: null, name: 'Tury', off: false }}
      />,
    )

    const texts = (kind: string) =>
      Array.from(document.querySelectorAll(`.code-block-token-${kind}`)).map(
        (node) => node.textContent,
      )

    expect(texts('key')).toEqual([
      '"count"',
      '"flag"',
      '"gone"',
      '"name"',
      '"off"',
    ])
    expect(texts('string')).toEqual(['"Tury"'])
    expect(texts('number')).toEqual(['3'])
    expect(texts('literal')).toEqual(['true', 'null', 'false'])
    expect(texts('punctuation')).toEqual(
      expect.arrayContaining(['{', '}', ':', ',']),
    )
    expect(
      document.querySelector('.code-block-token-key')?.className,
    ).toContain('text-chart-2')
    expect(
      document.querySelector('.code-block-token-punctuation')?.className,
    ).toContain('text-muted-foreground')
  })

  it('renders markup in the value as text, never as elements', () => {
    render(
      <>
        <CodeBlock value={'<script>window.pwned = 1</script><b>bold</b>'} />
        <CodeBlock value={{ html: '<img src=x onerror=alert(1)>' }} />
      </>,
    )

    const blocks = screen.getAllByTestId('code-block')

    expect(document.querySelector('script')).toBeNull()
    expect(document.querySelector('img')).toBeNull()
    expect(blocks[0].querySelector('b')).toBeNull()
    expect(blocks[0]).toHaveTextContent('<script>window.pwned = 1</script>')
    expect(blocks[1]).toHaveTextContent('"<img src=x onerror=alert(1)>"')
  })

  it('copies the printed text, not the raw value and not the line numbers', async () => {
    const writeText = mockClipboard()

    render(<CodeBlock lineNumbers value={{ a: 1 }} />)

    await userEvent.click(screen.getByTestId('code-block-copy'))

    expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}')
  })

  it('names the copy control and says when it has copied', async () => {
    mockClipboard()

    render(<CodeBlock value="x" />)

    const copy = screen.getByRole('button', { name: 'Copy' })

    await userEvent.click(copy)

    expect(await screen.findByRole('status')).toHaveTextContent('Copied')
  })

  it('has no copy control when copyable is off', () => {
    render(<CodeBlock copyable={false} title="Response" value="x" />)

    expect(screen.queryByTestId('code-block-copy')).toBeNull()
  })

  it('puts the title and the copy control in a header row', () => {
    render(<CodeBlock title="Response" value="x" />)

    const header = document.querySelector('.code-block-header')

    expect(header).toHaveTextContent('Response')
    expect(header).toContainElement(screen.getByTestId('code-block-copy'))
    expect(document.querySelector('.code-block-actions')).toBeNull()
  })

  it('floats the copy control and has no header when there is no title', () => {
    render(<CodeBlock value="x" />)

    expect(document.querySelector('.code-block-header')).toBeNull()
    expect(document.querySelector('.code-block-actions')).toContainElement(
      screen.getByTestId('code-block-copy'),
    )
  })

  it('caps the height at each step of the scale, and not at all by default', () => {
    const { rerender } = render(<CodeBlock value="x" />)
    const viewport = () => screen.getByTestId('code-block-viewport')

    expect(viewport().className).not.toMatch(/max-h-/)

    rerender(<CodeBlock maxHeight="sm" value="x" />)
    expect(viewport().className).toContain('max-h-40')

    rerender(<CodeBlock maxHeight="md" value="x" />)
    expect(viewport().className).toContain('max-h-80')

    rerender(<CodeBlock maxHeight="lg" value="x" />)
    expect(viewport().className).toContain('max-h-128')

    rerender(<CodeBlock maxHeight="none" value="x" />)
    expect(viewport().className).not.toMatch(/max-h-/)
  })

  it('scrolls long lines sideways by default and soft-wraps them when asked', () => {
    const { rerender } = render(<CodeBlock value="x" />)
    const code = () => document.querySelector('.code-block-code')

    expect(code()?.className).toContain('whitespace-pre')
    expect(code()?.className).not.toContain('whitespace-pre-wrap')

    rerender(<CodeBlock value="x" wrap />)
    expect(code()?.className).toContain('whitespace-pre-wrap')
  })

  it('numbers the lines only when asked, hidden from assistive technology', () => {
    const { rerender } = render(<CodeBlock value={'a\nb\nc'} />)

    expect(document.querySelector('.code-block-line-number')).toBeNull()

    rerender(<CodeBlock lineNumbers value={'a\nb\nc'} />)

    const numbers = Array.from(
      document.querySelectorAll('.code-block-line-number'),
    )

    expect(numbers.map((node) => node.textContent)).toEqual(['1', '2', '3'])
    expect(numbers[0]).toHaveAttribute('aria-hidden', 'true')
    expect(numbers[0].className).toContain('select-none')
  })

  it('widens the gutter once there are three-digit line numbers', () => {
    render(<CodeBlock lineNumbers value={'x\n'.repeat(120)} />)

    expect(
      document.querySelector('.code-block-line-number')?.className,
    ).toContain('w-10')
  })

  it('keeps a blank line as a line', () => {
    render(<CodeBlock value={'a\n\nb'} />)

    expect(lineTexts()).toEqual(['a', '', 'b'])
    expect(document.querySelector('.code-block-line')?.className).toContain(
      'min-h-lh',
    )
  })

  it('stays out of the tab order while the content fits', () => {
    render(<CodeBlock maxHeight="sm" value="x" />)

    const viewport = screen.getByTestId('code-block-viewport')

    expect(viewport).not.toHaveAttribute('tabindex')
    expect(viewport).not.toHaveAttribute('role')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('becomes a named, keyboard-reachable region while it overflows', async () => {
    const restore = stageOverflow()

    render(
      <CodeBlock copyable={false} maxHeight="sm" value={'x\n'.repeat(50)} />,
    )

    const region = screen.getByRole('region', { name: 'Code' })

    expect(region).toHaveAttribute('tabindex', '0')

    await userEvent.tab()

    expect(region).toHaveFocus()
    expect(region.className).toContain('focus-visible:ring-3')

    restore()
  })

  it('names the region after the title, and after ariaLabel above both', () => {
    const restore = stageOverflow()

    const { rerender } = render(<CodeBlock title="Response body" value="x" />)

    expect(
      screen.getByRole('region', { name: 'Response body' }),
    ).toBeInTheDocument()

    rerender(
      <CodeBlock ariaLabel="Webhook payload" title="Response" value="x" />,
    )

    expect(
      screen.getByRole('region', { name: 'Webhook payload' }),
    ).toBeInTheDocument()

    restore()
  })

  it('takes its default region name from the labels', () => {
    const restore = stageOverflow()

    render(
      <LabelsProvider labels={{ codeBlock: { label: 'Código' } }}>
        <CodeBlock value="x" />
      </LabelsProvider>,
    )

    expect(screen.getByRole('region', { name: 'Código' })).toBeInTheDocument()

    restore()
  })
})
