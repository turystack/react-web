import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Slider } from './slider'
import type { SliderSize } from './slider.types'

// jsdom has no layout engine, so Base UI cannot measure the track and leaves
// every thumb at `visibility: hidden`; the range input it wraps is therefore
// outside the accessibility tree and only `hidden: true` reaches it.
function thumbs() {
  return screen.getAllByRole('slider', {
    hidden: true,
  })
}

function thumb() {
  return thumbs()[0]
}

describe('Slider single', () => {
  it('moves and reports the number it landed on when uncontrolled', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={30}
        mode="single"
        onValueChange={onValueChange}
        orientation="horizontal"
      />,
    )

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith(31)
    expect(thumb()).toHaveAttribute('aria-valuenow', '31')
  })

  it('reports the next number but holds its position when controlled', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        mode="single"
        onValueChange={onValueChange}
        orientation="horizontal"
        value={30}
      />,
    )

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith(31)
    expect(thumb()).toHaveAttribute('aria-valuenow', '30')
  })

  it('exposes a single thumb bounded by its own scale', () => {
    render(<Slider defaultValue={30} mode="single" orientation="horizontal" />)

    expect(thumbs()).toHaveLength(1)
    expect(thumb()).toHaveAttribute('min', '0')
    expect(thumb()).toHaveAttribute('max', '100')
  })

  it('blocks keyboard changes while disabled', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={30}
        disabled
        mode="single"
        onValueChange={onValueChange}
        orientation="horizontal"
      />,
    )

    expect(thumb()).toBeDisabled()

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).not.toHaveBeenCalled()
    expect(thumb()).toHaveAttribute('aria-valuenow', '30')
  })

  it('runs on the vertical axis when asked to', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={30}
        mode="single"
        onValueChange={onValueChange}
        orientation="vertical"
      />,
    )

    expect(thumb()).toHaveAttribute('aria-orientation', 'vertical')

    thumb().focus()
    await userEvent.keyboard('{ArrowUp}')

    expect(onValueChange).toHaveBeenCalledWith(31)
  })

  it('still moves when no handler is listening', async () => {
    render(<Slider defaultValue={30} mode="single" orientation="horizontal" />)

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(thumb()).toHaveAttribute('aria-valuenow', '31')
  })
})

describe('Slider range', () => {
  it('delivers a tuple when the upper thumb moves', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={[10, 40]}
        mode="range"
        onValueChange={onValueChange}
        orientation="horizontal"
      />,
    )

    thumbs()[1].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith([10, 41])
  })

  it('delivers a tuple when the lower thumb moves', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={[10, 40]}
        mode="range"
        onValueChange={onValueChange}
        orientation="horizontal"
      />,
    )

    thumbs()[0].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith([11, 40])
  })

  it('reports the next tuple but holds its position when controlled', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        mode="range"
        onValueChange={onValueChange}
        orientation="horizontal"
        value={[10, 40]}
      />,
    )

    thumbs()[0].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith([11, 40])
    expect(thumbs()[0]).toHaveAttribute('aria-valuenow', '10')
  })

  it('names each end of the range for assistive technology', () => {
    render(
      <Slider defaultValue={[10, 40]} mode="range" orientation="horizontal" />,
    )

    expect(thumbs()).toHaveLength(2)
    expect(thumbs()[0]).toHaveAttribute('aria-valuetext', '10 start range')
    expect(thumbs()[1]).toHaveAttribute('aria-valuetext', '40 end range')
  })

  it('still moves when no handler is listening', async () => {
    render(
      <Slider defaultValue={[10, 40]} mode="range" orientation="horizontal" />,
    )

    thumbs()[0].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(thumbs()[0]).toHaveAttribute('aria-valuenow', '11')
  })

  it('blocks keyboard changes on both thumbs while disabled', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={[10, 40]}
        disabled
        mode="range"
        onValueChange={onValueChange}
        orientation="horizontal"
      />,
    )

    expect(thumbs()[0]).toBeDisabled()
    expect(thumbs()[1]).toBeDisabled()

    thumbs()[1].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('runs on the vertical axis when asked to', () => {
    render(
      <Slider defaultValue={[10, 40]} mode="range" orientation="vertical" />,
    )

    expect(thumbs()[0]).toHaveAttribute('aria-orientation', 'vertical')
  })
})

describe.each(['sm', 'md', 'lg'] as SliderSize[])('Slider size %s', (size) => {
  it('keeps a usable thumb in single mode', () => {
    render(
      <Slider
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        size={size}
      />,
    )

    expect(thumb()).toHaveAttribute('aria-valuenow', '30')
  })

  it('keeps two usable thumbs in range mode', () => {
    render(
      <Slider
        defaultValue={[10, 40]}
        mode="range"
        orientation="horizontal"
        size={size}
      />,
    )

    expect(thumbs()).toHaveLength(2)
  })
})
