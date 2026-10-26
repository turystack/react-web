import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { CurrencyInput } from './currency-input'

// `Intl.NumberFormat` separates the currency symbol from the amount with a
// non-breaking space, which no test author types by hand.
function readTrigger() {
  return (
    screen.getByPlaceholderText('Filter by value') as HTMLInputElement
  ).value.replace(/ /g, ' ')
}

async function openRange() {
  await userEvent.click(screen.getByPlaceholderText('Filter by value'))

  return screen.findByRole('dialog')
}

describe('CurrencyInput', () => {
  it('delivers the typed amount to onChange as integer cents', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), '1234')

    expect(onChange).toHaveBeenLastCalledWith(123400)
  })

  it('delivers null once the field is emptied', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), '12')
    await userEvent.clear(screen.getByRole('textbox'))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('shows a controlled amount in the separators of its currency', () => {
    render(<CurrencyInput value={123456} />)

    expect(screen.getByRole('textbox')).toHaveValue('1.234,56')
  })

  it('follows the controlled value when it changes from outside', () => {
    const { rerender } = render(<CurrencyInput value={123456} />)

    rerender(<CurrencyInput value={999} />)

    expect(screen.getByRole('textbox')).toHaveValue('9,99')
  })

  it('shows an empty field when the controlled value is null', () => {
    render(<CurrencyInput value={null} />)

    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('starts from defaultValue and changes on its own', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput defaultValue={5000} onChange={onChange} />)

    const field = screen.getByRole('textbox')
    expect(field).toHaveValue('50,00')

    await userEvent.clear(field)
    await userEvent.type(field, '7')

    expect(field).toHaveValue('7')
    expect(onChange).toHaveBeenLastCalledWith(700)
  })

  it('blocks typing while disabled', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput disabled onChange={onChange} />)

    const field = screen.getByRole('textbox')
    expect(field).toBeDisabled()

    await userEvent.type(field, '1234')

    expect(onChange).not.toHaveBeenCalled()
    expect(field).toHaveValue('')
  })

  it('shows the placeholder it was given', () => {
    render(<CurrencyInput placeholder="Valor do passeio" />)

    expect(screen.getByPlaceholderText('Valor do passeio')).toBeInTheDocument()
  })

  it('stays quiet until someone changes the amount', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <CurrencyInput onChange={onChange} value={123456} />,
    )

    expect(onChange).not.toHaveBeenCalled()

    rerender(<CurrencyInput onChange={onChange} value={999} />)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('stays quiet on mount when it starts from a defaultValue', () => {
    const onChange = vi.fn()
    render(<CurrencyInput defaultValue={5000} onChange={onChange} />)

    expect(screen.getByRole('textbox')).toHaveValue('50,00')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders the section content on each side of the amount', () => {
    render(
      <CurrencyInput
        leftSection={<span>from</span>}
        rightSection={<span>net</span>}
      />,
    )

    expect(screen.getByTestId('currency-input-section-left')).toHaveTextContent(
      'from',
    )
    expect(
      screen.getByTestId('currency-input-section-right'),
    ).toHaveTextContent('net')
  })

  it('accepts a custom width for each section', () => {
    render(
      <CurrencyInput
        leftSection={<span>from</span>}
        leftSectionWidth={48}
        rightSection={<span>net</span>}
        rightSectionWidth={64}
      />,
    )

    expect(screen.getByTestId('currency-input-section-left')).toHaveStyle({
      width: '48px',
    })
    expect(screen.getByTestId('currency-input-section-right')).toHaveStyle({
      width: '64px',
    })
  })

  it('blocks typing while loading and takes over the right section', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput
        loading
        onChange={onChange}
        rightSection={<span>net</span>}
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('net')).not.toBeInTheDocument()
    expect(field).toBeDisabled()

    await userEvent.type(field, '1234')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('carries the native input attributes it is given', () => {
    render(<CurrencyInput aria-invalid ariaLabel="Price" name="price" />)

    const field = screen.getByRole('textbox', { name: 'Price' })
    expect(field).toHaveAttribute('name', 'price')
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  it('holds the amount back until the typing settles when debounced', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput debounce onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), '1')

    expect(onChange).not.toHaveBeenCalled()

    await userEvent.type(screen.getByRole('textbox'), '234')

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(123400)
    })
  })
})

describe.each([
  ['brl', 'R$', '1.234,56'],
  ['usd', '$', '1,234.56'],
  ['eur', '€', '1.234,56'],
] as const)('CurrencyInput in %s', (variant, symbol, formatted) => {
  it('shows its symbol and formats the amount for its locale', () => {
    render(<CurrencyInput value={123456} variant={variant} />)

    expect(screen.getByText(symbol)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(formatted)
  })
})

describe('CurrencyInput with a currency of the user"s choosing', () => {
  it('starts on the default currency', () => {
    render(<CurrencyInput variant="any" />)

    expect(screen.getByRole('button', { name: /BRL/ })).toBeInTheDocument()
  })

  it('reformats the amount when another currency is chosen', async () => {
    render(<CurrencyInput value={123456} variant="any" />)

    expect(screen.getByRole('textbox')).toHaveValue('1.234,56')

    await userEvent.click(screen.getByRole('button', { name: /BRL/ }))
    await screen.findByRole('menu')
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'USD' }))

    expect(screen.getByRole('button', { name: /USD/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('1,234.56')
  })

  it('marks the currency in use as the chosen one', async () => {
    render(<CurrencyInput variant="any" />)

    await userEvent.click(screen.getByRole('button', { name: /BRL/ }))
    await screen.findByRole('menu')

    expect(screen.getByRole('menuitemcheckbox', { name: 'BRL' })).toBeChecked()
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'EUR' }),
    ).not.toBeChecked()
  })

  it('blocks the currency choice while disabled', async () => {
    render(<CurrencyInput disabled variant="any" />)

    const trigger = screen.getByRole('button', { name: /BRL/ })
    expect(trigger).toBeDisabled()

    await userEvent.click(trigger)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('CurrencyInput size %s', (size) => {
  it('stays a typeable field', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput onChange={onChange} size={size} />)

    await userEvent.type(screen.getByRole('textbox'), '9')

    expect(onChange).toHaveBeenLastCalledWith(900)
  })

  it('stays a typeable field with a currency of the user"s choosing', () => {
    render(<CurrencyInput size={size} variant="any" />)

    expect(screen.getByRole('button', { name: /BRL/ })).toBeEnabled()
  })
})

describe('CurrencyInput in range mode', () => {
  it('shows both bounds when the range has both', () => {
    render(<CurrencyInput mode="range" value={{ from: 1000, to: 100000 }} />)

    expect(readTrigger()).toBe('R$ 10,00 ~ R$ 1.000,00')
  })

  it('reads as a floor when the range has only a lower bound', () => {
    render(<CurrencyInput mode="range" value={{ from: 1000 }} />)

    expect(readTrigger()).toBe('From R$ 10,00')
  })

  it('reads as a ceiling when the range has only an upper bound', () => {
    render(<CurrencyInput mode="range" value={{ to: 5000 }} />)

    expect(readTrigger()).toBe('Up to R$ 50,00')
  })

  it('shows nothing when the range is empty', () => {
    render(<CurrencyInput mode="range" value={null} />)

    expect(readTrigger()).toBe('')
  })

  it('shows nothing when both bounds of the range are empty', () => {
    render(<CurrencyInput mode="range" value={{ from: null, to: null }} />)

    expect(readTrigger()).toBe('')
  })

  it('opens a field for each bound', async () => {
    render(<CurrencyInput mode="range" />)

    await openRange()

    expect(screen.getByPlaceholderText('Minimum value')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Maximum value')).toBeInTheDocument()
  })

  it('opens the fields under the placeholders it was given', async () => {
    render(
      <CurrencyInput fromPlaceholder="De" mode="range" toPlaceholder="Até" />,
    )

    await openRange()

    expect(screen.getByPlaceholderText('De')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Até')).toBeInTheDocument()
  })

  it('delivers the range in integer cents when it is applied', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput mode="range" onChange={onChange} />)

    await openRange()
    await userEvent.type(screen.getByPlaceholderText('Minimum value'), '25')
    await userEvent.type(screen.getByPlaceholderText('Maximum value'), '80')
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onChange).toHaveBeenCalledWith({
      from: 2500,
      to: 8000,
    })
  })

  it('delivers null when an empty range is applied', async () => {
    const onChange = vi.fn()
    render(<CurrencyInput mode="range" onChange={onChange} />)

    await openRange()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('adopts the applied range when nothing controls it', async () => {
    render(<CurrencyInput mode="range" />)

    await openRange()
    await userEvent.type(screen.getByPlaceholderText('Minimum value'), '25')
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(readTrigger()).toBe('From R$ 25,00')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('never changes the range it shows when value is held from outside', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput mode="range" onChange={onChange} value={{ from: 1000 }} />,
    )

    await openRange()
    await userEvent.type(screen.getByPlaceholderText('Maximum value'), '80')
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onChange).toHaveBeenCalledWith({
      from: 1000,
      to: 8000,
    })
    expect(readTrigger()).toBe('From R$ 10,00')
  })

  it('discards the draft when the change is cancelled', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput
        defaultValue={{ from: 1000 }}
        mode="range"
        onChange={onChange}
      />,
    )

    await openRange()
    await userEvent.type(screen.getByPlaceholderText('Maximum value'), '99')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(readTrigger()).toBe('From R$ 10,00')
  })

  it('reopens on the range it committed, not on the draft it dropped', async () => {
    render(<CurrencyInput defaultValue={{ from: 1000 }} mode="range" />)

    await openRange()
    await userEvent.type(screen.getByPlaceholderText('Maximum value'), '99')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await openRange()

    expect(screen.getByPlaceholderText('Minimum value')).toHaveValue('10,00')
    expect(screen.getByPlaceholderText('Maximum value')).toHaveValue('')
  })

  it('delivers null when the range is cleared', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput
        defaultValue={{ from: 1000 }}
        mode="range"
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(readTrigger()).toBe('')
  })

  it('keeps the clear control off the tab order while there is nothing to clear', () => {
    render(<CurrencyInput mode="range" />)

    expect(screen.getByRole('button', { name: 'Clear' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })

  it('blocks opening and clearing while disabled', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput
        defaultValue={{ from: 1000 }}
        disabled
        mode="range"
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Filter by value'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const clear = screen.getByRole('button', { name: 'Clear' })
    expect(clear).toBeDisabled()
    expect(clear).toHaveAttribute('tabindex', '-1')

    await userEvent.click(clear)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the bounds in the currency it was given', () => {
    render(<CurrencyInput mode="range" value={{ from: 1000 }} variant="usd" />)

    expect(readTrigger()).toBe('From $10.00')
  })
})

describe('CurrencyInput labels', () => {
  it('takes the whole range popover copy from the provider', async () => {
    render(
      <TuryProvider
        labels={{
          common: {
            apply: 'Aplicar',
            cancel: 'Cancelar',
            clear: 'Limpar',
          },
          currencyInput: {
            maximum: 'Valor máximo',
            minimum: 'Valor mínimo',
            rangePlaceholder: 'Filtre por valor',
          },
        }}
      >
        <CurrencyInput mode="range" />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByPlaceholderText('Filtre por valor'))
    await screen.findByRole('dialog')

    expect(screen.getByPlaceholderText('Valor mínimo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Valor máximo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Aplicar',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Cancelar',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Limpar',
      }),
    ).toBeInTheDocument()
  })

  it('reads a range with no lower bound back through the provider', () => {
    render(
      <TuryProvider
        labels={{
          common: {
            upTo: (value) => `Até ${value}`,
          },
        }}
      >
        <CurrencyInput
          mode="range"
          value={{
            to: 5000,
          }}
        />
      </TuryProvider>,
    )

    expect(readTrigger()).toBe('Até R$ 50,00')
  })

  it('reads a range with no upper bound back through the provider', () => {
    render(
      <TuryProvider
        labels={{
          common: {
            from: (value) => `A partir de ${value}`,
          },
        }}
      >
        <CurrencyInput
          mode="range"
          value={{
            from: 1000,
          }}
        />
      </TuryProvider>,
    )

    expect(readTrigger()).toBe('A partir de R$ 10,00')
  })

  it('keeps the placeholder props ahead of the provider', async () => {
    render(
      <TuryProvider
        labels={{
          currencyInput: {
            maximum: 'Valor máximo',
            minimum: 'Valor mínimo',
          },
        }}
      >
        <CurrencyInput fromPlaceholder="De" mode="range" toPlaceholder="Até" />
      </TuryProvider>,
    )

    await openRange()

    expect(screen.getByPlaceholderText('De')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Até')).toBeInTheDocument()
  })
})

describe('CurrencyInput data-testid', () => {
  it('uses the testing handle the consumer gave the single field', () => {
    render(<CurrencyInput ariaLabel="Price" data-testid="price-field" />)

    expect(screen.getByTestId('price-field')).toBe(
      screen.getByRole('textbox', { name: 'Price' }),
    )
    expect(screen.queryByTestId('currency-input-field')).not.toBeInTheDocument()
  })

  it('keeps its own handle when none is given', () => {
    render(<CurrencyInput ariaLabel="Price" />)

    expect(screen.getByTestId('currency-input-field')).toBe(
      screen.getByRole('textbox', { name: 'Price' }),
    )
  })
})

const INTERACTIVE =
  'button, input, select, textarea, a[href], [role="button"], [tabindex]'

describe('CurrencyInput range structure', () => {
  it('nests no interactive element inside another', () => {
    const { container } = render(
      <CurrencyInput defaultValue={{ from: 1000 }} mode="range" />,
    )

    const controls = [...container.querySelectorAll(INTERACTIVE)]
    expect(controls.length).toBeGreaterThanOrEqual(3)
    for (const control of controls) {
      expect(control.parentElement?.closest(INTERACTIVE)).toBeNull()
    }
  })

  it('has no role="button" wrapper around the field', () => {
    render(<CurrencyInput mode="range" />)

    expect(
      screen.getByPlaceholderText('Filter by value').closest('[role="button"]'),
    ).toBeNull()
  })

  it('makes the currency symbol the button that opens the bounds', async () => {
    render(<CurrencyInput mode="range" variant="usd" />)

    const openButton = screen.getByRole('button', { name: 'Set value range' })
    const clear = screen.getByRole('button', { name: 'Clear' })
    const field = screen.getByPlaceholderText('Filter by value')

    expect(openButton.tagName).toBe('BUTTON')
    expect(openButton).toHaveAttribute('type', 'button')
    expect(openButton).toHaveTextContent('$')
    expect(openButton.contains(field)).toBe(false)
    expect(clear.contains(field)).toBe(false)
    expect(openButton).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(openButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(openButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('disables the open button with the field', () => {
    render(<CurrencyInput disabled mode="range" />)

    expect(
      screen.getByRole('button', { name: 'Set value range' }),
    ).toBeDisabled()
  })

  it('rings the field while the bounds are on screen', async () => {
    render(<CurrencyInput mode="range" />)

    const field = screen.getByPlaceholderText('Filter by value')
    expect(field).not.toHaveClass('ring-3')

    await openRange()

    expect(field).toHaveClass('ring-3')
  })

  it('calls the click handler it was handed and still opens', async () => {
    const onClick = vi.fn()
    render(<CurrencyInput mode="range" onClick={onClick} />)

    await openRange()

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('takes the open button name from the labels the app provides', () => {
    render(
      <TuryProvider
        labels={{ currencyInput: { open: 'Definir faixa de valores' } }}
      >
        <CurrencyInput mode="range" />
      </TuryProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Definir faixa de valores' }),
    ).toBeInTheDocument()
  })
})

describe('CurrencyInput range keyboard', () => {
  it('reaches the open button, the field and the clear button in order', async () => {
    render(<CurrencyInput defaultValue={{ from: 1000 }} mode="range" />)

    await userEvent.tab()
    expect(
      screen.getByRole('button', { name: 'Set value range' }),
    ).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByPlaceholderText('Filter by value')).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus()
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('opens the bounds with %s on the open button', async (_key, keys) => {
    render(<CurrencyInput mode="range" />)

    await userEvent.tab()
    await userEvent.keyboard(keys)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('clears with Enter on the clear button without opening the bounds', async () => {
    const onChange = vi.fn()
    render(
      <CurrencyInput
        defaultValue={{ from: 1000 }}
        mode="range"
        onChange={onChange}
      />,
    )

    screen.getByRole('button', { name: 'Clear' }).focus()
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('CurrencyInput range sections', () => {
  it('refuses a consumer section in range mode: both sides are its own buttons', () => {
    render(
      <CurrencyInput
        // @ts-expect-error the left side is the symbol that opens the bounds
        leftSection={<span>left</span>}
        mode="range"
        rightSection={<span>right</span>}
      />,
    )

    // Even forced past the type, the field keeps its own two buttons.
    expect(
      screen.getByRole('button', { name: 'Set value range' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(screen.queryByText('left')).not.toBeInTheDocument()
    expect(screen.queryByText('right')).not.toBeInTheDocument()
  })

  it('refuses a right section alone in range mode', () => {
    render(
      // @ts-expect-error no rightSection in the range contract
      <CurrencyInput mode="range" rightSection={<span>right</span>} />,
    )

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(screen.queryByText('right')).not.toBeInTheDocument()
  })

  it('still lets the two button slots be sized in range mode', () => {
    render(
      <CurrencyInput
        leftSectionWidth={56}
        mode="range"
        rightSectionWidth={64}
      />,
    )

    expect(screen.getByRole('textbox')).toHaveStyle({
      paddingLeft: '56px',
      paddingRight: '64px',
    })
  })
})

describe('CurrencyInput axes', () => {
  it('publishes its default variant and size for a theme to select', () => {
    render(<CurrencyInput />)

    const root = screen.getByTestId('currency-input-root')
    expect(root).toHaveAttribute('data-variant', 'brl')
    expect(root).toHaveAttribute('data-size', 'md')
  })

  it('publishes the variant and size it was given', () => {
    render(<CurrencyInput size="lg" variant="usd" />)

    const root = screen.getByTestId('currency-input-root')
    expect(root).toHaveAttribute('data-variant', 'usd')
    expect(root).toHaveAttribute('data-size', 'lg')
  })
})
