import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollArea } from './scroll-area'

describe('ScrollArea', () => {
  it('keeps the content inside a viewport that scrolls', () => {
    render(<ScrollArea>the content</ScrollArea>)

    expect(screen.getByTestId('scroll-area-viewport')).toHaveTextContent(
      'the content',
    )
  })

  it('shows one scrollbar for one direction', () => {
    render(<ScrollArea>content</ScrollArea>)

    const scrollbars = screen.getAllByTestId('scroll-area-scrollbar')

    expect(scrollbars).toHaveLength(1)
    expect(scrollbars[0]).toHaveAttribute('data-orientation', 'vertical')
  })

  it('shows the horizontal one alone when that is the direction', () => {
    render(<ScrollArea orientation="horizontal">content</ScrollArea>)

    const scrollbars = screen.getAllByTestId('scroll-area-scrollbar')

    expect(scrollbars).toHaveLength(1)
    expect(scrollbars[0]).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('shows both when the content can run either way', () => {
    render(<ScrollArea orientation="both">content</ScrollArea>)

    expect(screen.getAllByTestId('scroll-area-scrollbar')).toHaveLength(2)
  })

  it('leaves the viewport reachable from the keyboard', () => {
    render(<ScrollArea>content</ScrollArea>)

    expect(screen.getByTestId('scroll-area-viewport').className).toContain(
      'focus-visible:ring-3',
    )
  })
})
