import { render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'

import { FormatProvider } from '@/components/format-provider'

import { DateText } from './date-text'

const INSTANT = '2026-08-24T15:30:00.000Z'

function Brazil({ children }: PropsWithChildren) {
  return (
    <FormatProvider
      format={{
        locale: 'pt-BR',
        timeZone: 'UTC',
      }}
    >
      {children}
    </FormatProvider>
  )
}

describe('DateText', () => {
  it('writes the date the way the locale writes dates', () => {
    render(
      <FormatProvider
        format={{
          locale: 'en-US',
          timeZone: 'UTC',
        }}
      >
        <DateText value={INSTANT} />
      </FormatProvider>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('08/24/2026')
  })

  it('follows the provider into another locale', () => {
    render(
      <Brazil>
        <DateText value={INSTANT} />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('24/08/2026')
  })

  it('lets one instance override the locale', () => {
    render(
      <Brazil>
        <DateText locale="en-US" value={INSTANT} />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('08/24/2026')
  })

  it('renders the time alone', () => {
    render(
      <Brazil>
        <DateText value={INSTANT} variant="time" />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('15:30')
  })

  it('renders date and time together', () => {
    render(
      <Brazil>
        <DateText value={INSTANT} variant="dateTime" />
      </Brazil>,
    )

    const rendered = screen.getByTestId('date-text')

    expect(rendered).toHaveTextContent('24/08/2026')
    expect(rendered).toHaveTextContent('15:30')
  })

  it('renders the machine-readable day for the iso variant', () => {
    render(
      <Brazil>
        <DateText value={INSTANT} variant="iso" />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('2026-08-24')
  })

  it('names the month and the weekday in the reader language', () => {
    render(
      <Brazil>
        <DateText value={INSTANT} variant="month" />
        <DateText value={INSTANT} variant="weekday" />
      </Brazil>,
    )

    const [month, weekday] = screen.getAllByTestId('date-text')

    expect(month).toHaveTextContent('agosto de 2026')
    expect(weekday).toHaveTextContent('segunda-feira')
  })

  it('reads a past instant as a distance from now', () => {
    render(
      <DateText value={Date.now() - 2 * 60 * 60 * 1000} variant="relative" />,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('2 hours ago')
  })

  it('reads a future instant in the same words', () => {
    render(
      <DateText
        value={Date.now() + 3 * 24 * 60 * 60 * 1000}
        variant="relative"
      />,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('in 3 days')
  })

  it('names today and yesterday instead of dating them', () => {
    render(
      <>
        <DateText value={new Date()} variant="calendar" />
        <DateText value={Date.now() - 24 * 60 * 60 * 1000} variant="calendar" />
      </>,
    )

    const [today, yesterday] = screen.getAllByTestId('date-text')

    expect(today).toHaveTextContent('Today')
    expect(yesterday).toHaveTextContent('Yesterday')
  })

  it('dates a day the calendar variant has no word for', () => {
    render(
      <Brazil>
        <DateText value="2020-03-05T15:30:00.000Z" variant="calendar" />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('05/03/2020')
  })

  it('takes an explicit pattern over the variant', () => {
    render(
      <Brazil>
        <DateText format="yyyy" value={INSTANT} variant="month" />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('2026')
  })

  it('carries the instant in a time element', () => {
    render(<DateText value={INSTANT} />)

    expect(screen.getByTestId('date-text').tagName).toBe('TIME')
    expect(screen.getByTestId('date-text')).toHaveAttribute('datetime', INSTANT)
  })

  it('renders the fallback rather than an invalid date', () => {
    render(
      <>
        <DateText value={null} />
        <DateText value="not a date" />
        <DateText fallback="never" value={undefined} />
      </>,
    )

    const [empty, invalid, custom] = screen.getAllByTestId('date-text')

    expect(empty).toHaveTextContent('—')
    expect(invalid).toHaveTextContent('—')
    expect(custom).toHaveTextContent('never')
  })

  it('offers to copy what it rendered', async () => {
    render(
      <Brazil>
        <DateText copyable value={INSTANT} />
      </Brazil>,
    )

    expect(screen.getByTestId('formatter-text-copy')).toBeInTheDocument()
  })
})

describe('DateText range', () => {
  it('joins both bounds', () => {
    render(
      <Brazil>
        <DateText
          mode="range"
          value={{
            from: INSTANT,
            to: '2026-08-30T00:00:00.000Z',
          }}
        />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent(
      '24/08/2026 – 30/08/2026',
    )
  })

  it('reads a range with no end as an open start', () => {
    render(
      <Brazil>
        <DateText
          mode="range"
          value={{
            from: INSTANT,
          }}
        />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent('From 24/08/2026')
  })

  it('reads a range with no start as a ceiling', () => {
    render(
      <Brazil>
        <DateText
          mode="range"
          value={{
            to: INSTANT,
          }}
        />
      </Brazil>,
    )

    expect(screen.getByTestId('date-text')).toHaveTextContent(
      'Up to 24/08/2026',
    )
  })

  it('falls back when the range holds nothing', () => {
    render(<DateText mode="range" value={null} />)

    expect(screen.getByTestId('date-text')).toHaveTextContent('—')
  })
})
