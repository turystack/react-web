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
      </>,
    )

    expect(screen.getByTestId('muted').className).toContain(
      'text-muted-foreground',
    )
    expect(screen.getByTestId('destructive').className).toContain(
      'text-destructive',
    )
    expect(screen.getByTestId('tone').className).toContain('text-green-600')
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
