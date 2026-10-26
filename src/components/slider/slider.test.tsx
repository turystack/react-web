import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Form } from '@/components/form'

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

// The thumb is visibility-hidden in jsdom (see above), and the accessible-name
// matchers return '' for hidden elements, so names are resolved by hand from
// the aria attributes the thumb carries.
function textOf(element: HTMLElement, attribute: string) {
  return (element.getAttribute(attribute) ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
}

function nameOf(element: HTMLElement) {
  return (
    element.getAttribute('aria-label') ?? textOf(element, 'aria-labelledby')
  )
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

  it('takes its accessible name from ariaLabel', () => {
    render(
      <Slider
        ariaLabel="Volume"
        defaultValue={30}
        mode="single"
        orientation="horizontal"
      />,
    )

    expect(thumb()).toHaveAttribute('aria-label', 'Volume')
  })

  it('invents no name when ariaLabel is missing', () => {
    render(<Slider defaultValue={30} mode="single" orientation="horizontal" />)

    expect(thumb()).not.toHaveAttribute('aria-label')
  })

  it('reads the value through formatValue', async () => {
    render(
      <Slider
        defaultValue={30}
        formatValue={(value) => `${value}%`}
        mode="single"
        orientation="horizontal"
      />,
    )

    expect(thumb()).toHaveAttribute('aria-valuetext', '30%')

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(thumb()).toHaveAttribute('aria-valuetext', '31%')
  })

  it('honours custom min, max and step', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={10}
        max={20}
        min={-20}
        mode="single"
        onValueChange={onValueChange}
        orientation="horizontal"
        step={5}
      />,
    )

    expect(thumb()).toHaveAttribute('min', '-20')
    expect(thumb()).toHaveAttribute('max', '20')

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(15)

    await userEvent.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(20)
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
    expect(thumbs()[0]).toHaveAttribute('aria-label', 'Minimum value')
    expect(thumbs()[1]).toHaveAttribute('aria-label', 'Maximum value')
    expect(thumbs()[0]).toHaveAttribute('aria-valuetext', '10')
    expect(thumbs()[1]).toHaveAttribute('aria-valuetext', '40')
  })

  it('names the group with ariaLabel and keeps each end named', () => {
    render(
      <Slider
        ariaLabel="Price"
        defaultValue={[10, 40]}
        mode="range"
        orientation="horizontal"
      />,
    )

    expect(screen.getByRole('group', { name: 'Price' })).toBeInTheDocument()
    expect(thumbs()[0]).toHaveAttribute('aria-label', 'Minimum value')
    expect(thumbs()[1]).toHaveAttribute('aria-label', 'Maximum value')
  })

  it('reads each end through formatValue', () => {
    render(
      <Slider
        defaultValue={[10, 40]}
        formatValue={(value) => `R$ ${value}`}
        mode="range"
        orientation="horizontal"
      />,
    )

    expect(thumbs()[0]).toHaveAttribute('aria-valuetext', 'R$ 10')
    expect(thumbs()[1]).toHaveAttribute('aria-valuetext', 'R$ 40')
  })

  it('bounds both thumbs by min, max and step', async () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        defaultValue={[200, 400]}
        max={500}
        min={100}
        mode="range"
        onValueChange={onValueChange}
        orientation="horizontal"
        step={50}
      />,
    )

    expect(thumbs()[0]).toHaveAttribute('min', '100')
    expect(thumbs()[1]).toHaveAttribute('max', '500')

    thumbs()[1].focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith([200, 450])
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

describe('Slider showValue', () => {
  it('prints no value by default', () => {
    render(<Slider defaultValue={30} mode="single" orientation="horizontal" />)

    expect(screen.queryByTestId('slider-value')).not.toBeInTheDocument()
    expect(screen.queryByText('30')).not.toBeInTheDocument()
  })

  it('prints no value when showValue is false', () => {
    render(
      <Slider
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        showValue={false}
      />,
    )

    expect(screen.queryByTestId('slider-value')).not.toBeInTheDocument()
  })

  it('prints the single value right-aligned above the track', () => {
    render(
      <Slider
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        showValue
      />,
    )

    const value = screen.getByTestId('slider-value')
    expect(value).toHaveTextContent(/^30$/)
    expect(screen.getByTestId('slider-value-row')).toHaveClass(
      'slider-value-row',
      'justify-end',
    )
    expect(
      screen
        .getByTestId('slider-value-row')
        .compareDocumentPosition(screen.getByTestId('slider-control')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('keeps the printed value out of the accessibility tree', () => {
    render(
      <Slider
        ariaLabel="Volume"
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        showValue
      />,
    )

    expect(screen.getByTestId('slider-value')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('follows the thumb as it moves', async () => {
    render(
      <Slider
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        showValue
      />,
    )

    thumb().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(screen.getByTestId('slider-value')).toHaveTextContent(/^31$/)
  })

  it('prints the single value through formatValue', () => {
    render(
      <Slider
        defaultValue={40}
        formatValue={(value) => `R$ ${value}`}
        mode="single"
        orientation="horizontal"
        showValue
      />,
    )

    expect(screen.getByTestId('slider-value')).toHaveTextContent(/^R\$ 40$/)
  })

  it('prints both ends of a range as min – max', () => {
    render(
      <Slider
        defaultValue={[20, 80]}
        mode="range"
        orientation="horizontal"
        showValue
      />,
    )

    expect(screen.getByTestId('slider-value')).toHaveTextContent(/^20 – 80$/)
  })

  it('prints both ends of a range through formatValue', () => {
    render(
      <Slider
        defaultValue={[20, 80]}
        formatValue={(value) => `${value}%`}
        mode="range"
        orientation="horizontal"
        showValue
      />,
    )

    expect(screen.getByTestId('slider-value')).toHaveTextContent(/^20% – 80%$/)
  })

  it('stacks the value above a vertical track', () => {
    render(
      <Slider
        defaultValue={30}
        mode="single"
        orientation="vertical"
        showValue
      />,
    )

    expect(screen.getByTestId('slider-root')).toHaveClass('flex', 'flex-col')
    expect(screen.getByTestId('slider-value')).toHaveTextContent(/^30$/)
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

describe('Slider group role', () => {
  it('draws no group around a single thumb, named or not', () => {
    render(
      <Slider
        ariaLabel="Volume"
        defaultValue={30}
        mode="single"
        orientation="horizontal"
      />,
    )

    expect(screen.getByTestId('slider-root')).not.toHaveAttribute('role')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('draws no group around an unnamed single thumb', () => {
    render(<Slider defaultValue={30} mode="single" orientation="horizontal" />)

    expect(screen.getByTestId('slider-root')).not.toHaveAttribute('role')
  })

  it('draws no group around a range nothing names', () => {
    render(
      <Slider defaultValue={[10, 40]} mode="range" orientation="horizontal" />,
    )

    const root = screen.getByTestId('slider-root')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-labelledby')
    expect(root).not.toHaveAttribute('aria-label')
  })

  it('makes a range named by ariaLabel a group', () => {
    render(
      <Slider
        ariaLabel="Price"
        defaultValue={[10, 40]}
        mode="range"
        orientation="horizontal"
      />,
    )

    expect(screen.getByTestId('slider-root')).toHaveAttribute('role', 'group')
  })
})

describe('Slider in a Form.Field', () => {
  it('names and describes the single thumb with the field, not a group', () => {
    render(
      <Form.Field description="0 to 100" label="Volume">
        <Slider defaultValue={30} mode="single" orientation="horizontal" />
      </Form.Field>,
    )

    expect(nameOf(thumb())).toBe('Volume')
    expect(textOf(thumb(), 'aria-describedby')).toBe('0 to 100')
    expect(screen.getByTestId('slider-root')).not.toHaveAttribute('role')
    expect(screen.getByTestId('slider-root')).not.toHaveAttribute(
      'aria-labelledby',
    )
    expect(screen.getByTestId('slider-root')).not.toHaveAttribute(
      'aria-describedby',
    )
  })

  it('lets ariaLabel win over the field label on the single thumb', () => {
    render(
      <Form.Field label="Volume">
        <Slider
          ariaLabel="Master volume"
          defaultValue={30}
          mode="single"
          orientation="horizontal"
        />
      </Form.Field>,
    )

    expect(nameOf(thumb())).toBe('Master volume')
    expect(thumb()).not.toHaveAttribute('aria-labelledby')
  })

  it('names and describes a range group with the field', () => {
    render(
      <Form.Field error="Too wide" label="Price range">
        <Slider defaultValue={[10, 40]} mode="range" orientation="horizontal" />
      </Form.Field>,
    )

    const group = screen.getByRole('group', { name: 'Price range' })
    expect(group).toBe(screen.getByTestId('slider-root'))
    expect(group).toHaveAccessibleDescription('Too wide')
    expect(nameOf(thumbs()[0])).toBe('Minimum value')
    expect(nameOf(thumbs()[1])).toBe('Maximum value')
  })

  it('names a range group with ariaLabel over the field label', () => {
    render(
      <Form.Field label="Price range">
        <Slider
          ariaLabel="Nightly price"
          defaultValue={[10, 40]}
          mode="range"
          orientation="horizontal"
        />
      </Form.Field>,
    )

    const group = screen.getByRole('group', { name: 'Nightly price' })
    expect(group).not.toHaveAttribute('aria-labelledby')
  })
})

describe('Slider axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(
      <Slider
        ariaLabel="Volume"
        defaultValue={30}
        mode="single"
        orientation="horizontal"
      />,
    )

    expect(screen.getByTestId('slider-root')).toHaveAttribute('data-size', 'md')
  })

  it('publishes the size it was given', () => {
    render(
      <Slider
        ariaLabel="Volume"
        defaultValue={30}
        mode="single"
        orientation="horizontal"
        size="sm"
      />,
    )

    expect(screen.getByTestId('slider-root')).toHaveAttribute('data-size', 'sm')
  })
})
