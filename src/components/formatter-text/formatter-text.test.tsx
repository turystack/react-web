import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormatterText } from './formatter-text'

describe('FormatterText', () => {
  it('renders the formatted text with no wrapper it does not need', () => {
    render(<FormatterText testId="probe" text="24/08/2026" />)

    const rendered = screen.getByTestId('probe')

    expect(rendered).toHaveTextContent('24/08/2026')
    expect(rendered.tagName).toBe('SPAN')
  })

  it('renders the element the caller asked for over its own default', () => {
    render(<FormatterText component="p" tag="time" testId="probe" text="x" />)

    expect(screen.getByTestId('probe').tagName).toBe('P')
  })

  it('writes the machine-readable instant only onto a time element', () => {
    render(
      <>
        <FormatterText
          dateTime="2026-08-24T00:00:00.000Z"
          tag="time"
          testId="as-time"
          text="24/08/2026"
        />
        <FormatterText
          dateTime="2026-08-24T00:00:00.000Z"
          testId="as-span"
          text="24/08/2026"
        />
      </>,
    )

    expect(screen.getByTestId('as-time')).toHaveAttribute('datetime')
    expect(screen.getByTestId('as-span')).not.toHaveAttribute('datetime')
  })

  it('takes its colours from the props the family shares', () => {
    render(
      <>
        <FormatterText muted testId="muted" text="x" />
        <FormatterText destructive testId="destructive" text="x" />
        <FormatterText testId="tone" text="x" tone="positive" />
        <FormatterText testId="negative" text="x" tone="negative" />
        <FormatterText testId="plain" text="x" />
      </>,
    )

    expect(screen.getByTestId('muted').className).toContain(
      'text-muted-foreground',
    )
    expect(screen.getByTestId('destructive').className).toContain(
      'text-destructive',
    )
    expect(screen.getByTestId('tone')).toHaveClass('text-success')
    expect(screen.getByTestId('tone').className).not.toMatch(/\bgreen-\d/)
    expect(screen.getByTestId('negative')).toHaveClass('text-destructive')
    expect(screen.getByTestId('negative')).not.toHaveClass('text-success')
    expect(screen.getByTestId('plain')).not.toHaveClass('text-success')
  })

  it('paints its own base size and foreground colour by default', () => {
    render(<FormatterText testId="probe" text="x" />)

    const rendered = screen.getByTestId('probe')
    expect(rendered).toHaveClass('text-base', 'text-foreground', 'font-normal')
    expect(rendered).not.toHaveClass('text-[length:inherit]')
  })

  it('takes the surrounding size when asked to inherit it', () => {
    render(<FormatterText size="inherit" testId="probe" text="x" />)

    const rendered = screen.getByTestId('probe')
    expect(rendered).toHaveClass('text-[length:inherit]')
    // Typography's default base size would override the parent's.
    expect(rendered).not.toHaveClass('text-base')
  })

  it('keeps a preset size over the inherited one', () => {
    render(<FormatterText size="lg" testId="probe" text="x" />)

    expect(screen.getByTestId('probe')).toHaveClass('text-lg')
    expect(screen.getByTestId('probe')).not.toHaveClass('text-[length:inherit]')
  })

  it('takes the surrounding colour and weight when asked to inherit them', () => {
    render(
      <FormatterText inheritColor testId="probe" text="x" weight="inherit" />,
    )

    const rendered = screen.getByTestId('probe')
    expect(rendered.className).not.toMatch(
      /\btext-(foreground|muted-foreground)\b/,
    )
    expect(rendered.className).not.toMatch(/\bfont-/)
  })

  it('lets muted, destructive and the sign colour win over an inherited colour', () => {
    render(
      <>
        <FormatterText inheritColor muted testId="muted" text="x" />
        <FormatterText destructive inheritColor testId="destructive" text="x" />
        <FormatterText inheritColor testId="tone" text="x" tone="positive" />
      </>,
    )

    expect(screen.getByTestId('muted')).toHaveClass('text-muted-foreground')
    expect(screen.getByTestId('destructive')).toHaveClass('text-destructive')
    expect(screen.getByTestId('tone')).toHaveClass('text-success')
  })

  it('copies what the reader sees, not what the caller holds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })

    render(<FormatterText copyable testId="probe" text="***.456.789-**" />)

    await userEvent.click(screen.getByTestId('formatter-text-copy'))

    expect(writeText).toHaveBeenCalledWith('***.456.789-**')
  })

  it('reveals the text on hover when asked for a tooltip', async () => {
    render(<FormatterText testId="probe" text="24/08/2026" tooltip />)

    await userEvent.hover(screen.getByTestId('probe'))

    expect(await screen.findAllByText('24/08/2026')).not.toHaveLength(0)
  })

  it('renders content of its own over the plain text', () => {
    render(
      <FormatterText testId="probe" text="+55 11 98765-4321">
        <a href="tel:+5511987654321">call</a>
      </FormatterText>,
    )

    expect(screen.getByRole('link')).toBeInTheDocument()
  })
})

describe('FormatterText axes', () => {
  function rootOf(testId: string) {
    return screen.getByTestId(testId).closest('.formatter-text')
  }

  it('publishes its default size for a theme to select', () => {
    render(<FormatterText testId="probe" text="x" />)

    const root = rootOf('probe')
    expect(root).toHaveAttribute('data-size', 'base')
    expect(root).not.toHaveAttribute('data-tone')
  })

  it('publishes the size and tone it was given', () => {
    render(
      <FormatterText
        published={{
          'data-variant': 'short',
        }}
        size="inherit"
        testId="probe"
        text="x"
        tone="positive"
      />,
    )

    const root = rootOf('probe')
    expect(root).toHaveAttribute('data-size', 'inherit')
    expect(root).toHaveAttribute('data-tone', 'positive')
    expect(root).toHaveAttribute('data-variant', 'short')
  })

  it.each([
    ['bare', {}],
    ['copyable', { copyable: true }],
    ['with a tooltip', { tooltip: true }],
    ['with a right section', { rightSection: <i>r</i> }],
  ])('keeps them on the same root when %s', (_, extra) => {
    const { container } = render(
      <FormatterText
        published={{
          'data-variant': 'standard',
        }}
        size="lg"
        testId="probe"
        text="x"
        {...extra}
      />,
    )

    const roots = container.querySelectorAll('.formatter-text')
    expect(roots).toHaveLength(1)
    expect(container.firstElementChild).toBe(roots[0])
    expect(roots[0]).toHaveAttribute('data-size', 'lg')
    expect(roots[0]).toHaveAttribute('data-variant', 'standard')
  })

  it('leaves the value only its Typography axes', () => {
    render(
      <FormatterText
        muted
        published={{
          'data-variant': 'standard',
        }}
        size="lg"
        testId="probe"
        text="x"
        tone="negative"
      />,
    )

    const value = screen.getByTestId('probe')
    expect(value).toHaveClass('formatter-text-value')
    expect(value).toHaveAttribute('data-variant', 'muted')
    expect(value).toHaveAttribute('data-size', 'lg')
    expect(value).not.toHaveAttribute('data-tone')
  })

  it('names no Typography size on a value that inherits its size', () => {
    render(<FormatterText size="inherit" testId="probe" text="x" />)

    expect(screen.getByTestId('probe')).not.toHaveAttribute('data-size')
  })

  it('gives the bare root no box of its own', () => {
    render(<FormatterText testId="probe" text="x" />)

    const root = rootOf('probe')
    expect(root?.tagName).toBe('SPAN')
    expect(root).toHaveClass('contents')
  })
})
