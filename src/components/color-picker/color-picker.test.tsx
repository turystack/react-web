import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { ColorPicker, DEFAULT_COLORS } from './color-picker'

const TRIGGER = {
  name: 'Select colour',
}

async function openPicker() {
  await userEvent.click(screen.getByRole('button', TRIGGER))

  return screen.findByRole('dialog')
}

describe('ColorPicker', () => {
  it('shows the placeholder while nothing is selected', () => {
    render(<ColorPicker />)

    expect(screen.getByRole('button', TRIGGER)).toBeInTheDocument()
  })

  it('takes a custom placeholder', () => {
    render(<ColorPicker placeholder="Escolha" />)

    expect(screen.getByRole('button', { name: 'Escolha' })).toBeInTheDocument()
  })

  it('keeps the grid out of the document until it is opened', () => {
    render(<ColorPicker />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a swatch for every default color', async () => {
    render(<ColorPicker />)

    await openPicker()

    expect(screen.getByRole('button', { name: '#EF4444' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(
      DEFAULT_COLORS.length,
    )
  })

  it('delivers the selected hex to onChange', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('adopts the selected color and closes when nothing controls it', async () => {
    render(<ColorPicker />)

    await openPicker()
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '#EF4444' })).toBeInTheDocument()
  })

  it('starts from defaultValue and still changes on its own', async () => {
    render(<ColorPicker defaultValue="#22c55e" />)

    expect(screen.getByRole('button', { name: '#22C55E' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '#22C55E' }))
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(screen.getByRole('button', { name: '#EF4444' })).toBeInTheDocument()
  })

  it('never changes the value it shows when value is held from outside', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} value="#22c55e" />)

    await userEvent.click(screen.getByRole('button', { name: '#22C55E' }))
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(onChange).toHaveBeenCalledWith('#ef4444')
    expect(screen.getByRole('button', { name: '#22C55E' })).toBeInTheDocument()
  })

  it('marks the selected swatch as pressed', async () => {
    render(<ColorPicker value="#3b82f6" />)

    await userEvent.click(screen.getByRole('button', { name: '#3B82F6' }))

    const swatches = await screen.findAllByRole('button', {
      name: '#3B82F6',
    })
    expect(swatches.some((swatch) => swatch.ariaPressed === 'true')).toBe(true)
  })

  it('marks the white swatch as pressed when white is the value', async () => {
    render(<ColorPicker value="#ffffff" />)

    await userEvent.click(screen.getByRole('button', { name: '#FFFFFF' }))

    const swatches = await screen.findAllByRole('button', {
      name: '#FFFFFF',
    })
    expect(swatches.some((swatch) => swatch.ariaPressed === 'true')).toBe(true)
  })

  it('renders only the colors it was given', async () => {
    render(<ColorPicker colors={['#111111', '#222222']} />)

    await openPicker()

    expect(screen.getByRole('button', { name: '#111111' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '#EF4444' }),
    ).not.toBeInTheDocument()
  })

  it('offers a transparent swatch and delivers it as a value', async () => {
    const onChange = vi.fn()
    render(<ColorPicker allowTransparent onChange={onChange} />)

    await openPicker()
    await userEvent.click(screen.getByRole('button', { name: 'Transparent' }))

    expect(onChange).toHaveBeenCalledWith('transparent')
    expect(
      screen.getByRole('button', { name: 'Transparent' }),
    ).toBeInTheDocument()
  })

  it('offers no transparent swatch by default', async () => {
    render(<ColorPicker />)

    await openPicker()

    expect(
      screen.queryByRole('button', { name: 'Transparent' }),
    ).not.toBeInTheDocument()
  })
})

describe('ColorPicker hex input', () => {
  it('commits a six digit hex on Enter', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), '#A1B2C3{Enter}')

    expect(onChange).toHaveBeenCalledWith('#a1b2c3')
  })

  it('expands a three digit hex into its six digit form', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), '#abc{Enter}')

    expect(onChange).toHaveBeenCalledWith('#aabbcc')
  })

  it('accepts a hex written without its hash', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), 'A1B2C3{Enter}')

    expect(onChange).toHaveBeenCalledWith('#a1b2c3')
  })

  it('replaces an uncommitted draft with the swatch that was chosen', async () => {
    render(<ColorPicker />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), '#A1B2C3')
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(await screen.findByRole('textbox')).toHaveValue('#ef4444')
  })

  it('commits what was typed when the input loses focus', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), '#A1B2C3')
    await userEvent.tab()

    expect(onChange).toHaveBeenCalledWith('#a1b2c3')
  })

  it('rejects an unparseable hex and restores the current value', async () => {
    const onChange = vi.fn()
    render(<ColorPicker defaultValue="#22c55e" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '#22C55E' }))
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'nope{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('#22c55e')
  })

  it('clears the draft back to empty when there is no value to restore', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), 'nope{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('commits nothing while a key other than Enter is pressed', async () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    await openPicker()
    await userEvent.type(screen.getByRole('textbox'), '#A1B2C3')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('#A1B2C3')
  })

  it('drops the draft it never committed when the popup is reopened', async () => {
    render(<ColorPicker defaultValue="#22c55e" />)

    await userEvent.click(screen.getByRole('button', { name: '#22C55E' }))
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '#ff')
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: '#22C55E' }))

    expect(await screen.findByRole('textbox')).toHaveValue('#22c55e')
  })

  it('offers no hex input when custom colors are turned off', async () => {
    render(<ColorPicker allowCustom={false} />)

    await openPicker()

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('ColorPicker open state', () => {
  it('delivers true to onOpenChange when the trigger opens it', async () => {
    const onOpenChange = vi.fn()
    render(<ColorPicker onOpenChange={onOpenChange} />)

    await openPicker()

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('delivers false to onOpenChange when a swatch closes it', async () => {
    const onOpenChange = vi.fn()
    render(<ColorPicker onOpenChange={onOpenChange} />)

    await openPicker()
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('opens at mount when defaultOpen asks for it', async () => {
    render(<ColorPicker defaultOpen />)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('stays open when open is held true from outside', async () => {
    render(<ColorPicker open />)

    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: '#EF4444' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('stays closed when open is held false from outside', async () => {
    render(<ColorPicker open={false} />)

    await userEvent.click(screen.getByRole('button', TRIGGER))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('ColorPicker trigger', () => {
  it('blocks opening while disabled', async () => {
    const onOpenChange = vi.fn()
    render(<ColorPicker disabled onOpenChange={onOpenChange} />)

    const trigger = screen.getByRole('button', TRIGGER)
    expect(trigger).toBeDisabled()

    await userEvent.click(trigger)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('reports itself as invalid when it is', () => {
    render(<ColorPicker invalid />)

    expect(screen.getByRole('button', TRIGGER)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('reports nothing about validity when it is valid', () => {
    render(<ColorPicker />)

    expect(screen.getByRole('button', TRIGGER)).not.toHaveAttribute(
      'aria-invalid',
    )
  })

  it('takes its accessible name from aria-label when one is given', () => {
    render(<ColorPicker aria-label="Cor da marca" />)

    expect(
      screen.getByRole('button', { name: 'Cor da marca' }),
    ).toBeInTheDocument()
  })

  it('carries the name and id it was given for a form', () => {
    render(<ColorPicker id="brand" name="brandColor" />)

    const trigger = screen.getByRole('button', TRIGGER)
    expect(trigger).toHaveAttribute('id', 'brand')
    expect(trigger).toHaveAttribute('name', 'brandColor')
  })

  it('hands the current value and open state to a custom trigger', async () => {
    render(
      <ColorPicker
        defaultValue="#22c55e"
        renderTrigger={({ open, value }) => (
          <span>{`${value} ${open ? 'aberto' : 'fechado'}`}</span>
        )}
      />,
    )

    expect(screen.getByText('#22c55e fechado')).toBeInTheDocument()

    await userEvent.click(screen.getByText('#22c55e fechado'))

    expect(await screen.findByText('#22c55e aberto')).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('ColorPicker size %s', (size) => {
  it('stays a reachable trigger', () => {
    render(<ColorPicker size={size} />)

    expect(screen.getByRole('button', TRIGGER)).toBeEnabled()
  })
})

describe.each(['top', 'right', 'bottom', 'left'] as const)(
  'ColorPicker on side %s',
  (side) => {
    it('reports the side it settled on', async () => {
      render(<ColorPicker defaultOpen side={side} sideOffset={8} />)

      expect(await screen.findByRole('dialog')).toHaveAttribute(
        'data-side',
        side,
      )
    })
  },
)

describe.each(['start', 'center', 'end'] as const)(
  'ColorPicker aligned to %s',
  (align) => {
    it('reports the alignment it settled on', async () => {
      render(<ColorPicker align={align} defaultOpen />)

      expect(await screen.findByRole('dialog')).toHaveAttribute(
        'data-align',
        align,
      )
    })
  },
)

describe('ColorPicker inside a provider that names a portal container', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    cleanup()
    container.remove()
  })

  it('mounts the swatch grid inside the named container', async () => {
    render(
      <TuryProvider portalContainer={container}>
        <ColorPicker />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('color-picker-trigger'))

    expect(container).toContainElement(await screen.findByRole('dialog'))
  })

  it('leaves the swatch grid on the body when no container is named', async () => {
    render(
      <TuryProvider>
        <ColorPicker />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByTestId('color-picker-trigger'))

    expect(container).not.toContainElement(await screen.findByRole('dialog'))
  })
})

describe('ColorPicker labels', () => {
  it('names the trigger with the placeholder the provider carries', () => {
    render(
      <TuryProvider
        labels={{
          colorPicker: {
            selectColor: 'Escolher cor',
          },
        }}
      >
        <ColorPicker />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Escolher cor',
      }),
    ).toBeInTheDocument()
  })

  it('keeps the placeholder prop ahead of the provider', () => {
    render(
      <TuryProvider
        labels={{
          colorPicker: {
            selectColor: 'Escolher cor',
          },
        }}
      >
        <ColorPicker placeholder="Brand colour" />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', {
        name: 'Brand colour',
      }),
    ).toBeInTheDocument()
  })

  it('names the transparent swatch from the provider', async () => {
    render(
      <TuryProvider
        labels={{
          colorPicker: {
            transparent: 'Transparente',
          },
        }}
      >
        <ColorPicker allowTransparent />
      </TuryProvider>,
    )

    await openPicker()

    expect(
      screen.getByRole('button', {
        name: 'Transparente',
      }),
    ).toBeInTheDocument()
  })
})
