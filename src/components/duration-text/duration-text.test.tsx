import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DurationText } from './duration-text'

describe('DurationText', () => {
  it('writes a span in short units', () => {
    render(<DurationText value={8100} />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('2h 15min')
  })

  it('reads the unit it was given', () => {
    render(<DurationText unit="minutes" value={135} />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('2h 15min')
  })

  it('writes the words out in the long variant', () => {
    render(<DurationText unit="minutes" value={61} variant="long" />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent(
      '1 hour 1 minute',
    )
  })

  it('reads a clock as a clock', () => {
    render(<DurationText value={8100} variant="clock" />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('02:15:00')
  })

  it('keeps only the detail that was asked for', () => {
    render(
      <>
        <DurationText value={93784} />
        <DurationText maxParts={4} value={93784} />
        <DurationText maxParts={1} value={93784} />
      </>,
    )

    const [two, four, one] = screen.getAllByTestId('duration-text')

    expect(two).toHaveTextContent('1d 2h')
    expect(four).toHaveTextContent('1d 2h 3min 4s')
    expect(one).toHaveTextContent('1d')
  })

  it('starts at the first unit that has anything in it', () => {
    render(<DurationText value={125} />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('2min 5s')
  })

  it('keeps the sign of a delay', () => {
    render(<DurationText value={-900} />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('-15min')
  })

  it('renders an empty span as zero, not as nothing', () => {
    render(<DurationText value={0} />)

    expect(screen.getByTestId('duration-text')).toHaveTextContent('0s')
  })

  it('falls back on an absent span', () => {
    render(
      <>
        <DurationText value={null} />
        <DurationText fallback="unknown" value={undefined} />
      </>,
    )

    const [empty, custom] = screen.getAllByTestId('duration-text')

    expect(empty).toHaveTextContent('—')
    expect(custom).toHaveTextContent('unknown')
  })
})
