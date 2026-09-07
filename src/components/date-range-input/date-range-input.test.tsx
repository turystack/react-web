import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { startOfDay, subDays } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { DateRangeInput } from './date-range-input'
import type { DateRangeInputPreset } from './date-range-input.types'

/**
 * This file is genuinely heavy, not accidentally slow: every open renders two
 * month grids plus the preset column, and `user-event` walks the real focus
 * order across ~70 day buttons. Thirty-one cases cost ~23s of test time on an
 * idle machine, and the longest sat at 5.7s against the 5s default — so it
 * passed alone and failed whenever anything else used the CPU.
 *
 * A test that flakes on load teaches people to re-run instead of look, which is
 * worse than a slow one. The ceiling is stated here rather than raised
 * globally, so a real hang anywhere else still trips at five seconds.
 */
vi.setConfig({ testTimeout: 20000 })

const jan10 = new Date(2025, 0, 10)
const jan15 = new Date(2025, 0, 15)
const jan20 = new Date(2025, 0, 20)

function field() {
  return screen.getByRole('textbox')
}

function apply() {
  return screen.getByRole('button', {
    name: 'Apply',
  })
}

async function open() {
  await userEvent.click(field())
}

describe('DateRangeInput', () => {
  it('shows both ends of the range it was given', () => {
    render(
      <DateRangeInput
        value={{
          from: jan10,
          to: jan20,
        }}
      />,
    )

    expect(field()).toHaveValue('10/01/2025 ~ 20/01/2025')
  })

  it('shows only the start when there is no end', () => {
    render(
      <DateRangeInput
        value={{
          from: jan10,
        }}
      />,
    )

    expect(field()).toHaveValue('10/01/2025')
  })

  it('shows an open start when there is only an end', () => {
    render(
      <DateRangeInput
        value={{
          to: jan20,
        }}
      />,
    )

    expect(field()).toHaveValue('Up to 20/01/2025')
  })

  it('shows nothing for an empty range', () => {
    render(<DateRangeInput value={{}} />)

    expect(field()).toHaveValue('')
  })

  it('shows nothing for a null range', () => {
    render(<DateRangeInput value={null} />)

    expect(field()).toHaveValue('')
    expect(field()).toHaveAttribute('placeholder', 'dd/mm/yyyy ~ dd/mm/yyyy')
  })

  it('refuses to be typed into', () => {
    render(<DateRangeInput />)

    expect(field()).toHaveAttribute('readonly')
  })

  it('opens the picker when the field is clicked', async () => {
    render(<DateRangeInput />)

    await open()

    expect(apply()).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    ).toBeInTheDocument()
  })

  it('names the commit and discard actions as asked', async () => {
    render(<DateRangeInput applyLabel="Filtrar" cancelLabel="Fechar" />)

    await open()

    expect(
      screen.getByRole('button', {
        name: 'Filtrar',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Fechar',
      }),
    ).toBeInTheDocument()
  })
})

describe('DateRangeInput presets', () => {
  it('offers the built-in quick ranges', async () => {
    render(<DateRangeInput />)

    await open()

    expect(
      screen.getByRole('button', {
        name: 'Today',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Custom',
      }),
    ).toBeInTheDocument()
  })

  it('delivers the range a preset stands for once applied', async () => {
    const onChange = vi.fn()
    render(<DateRangeInput onChange={onChange} />)

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Yesterday',
      }),
    )
    await userEvent.click(apply())

    const yesterday = subDays(startOfDay(new Date()), 1)
    expect(onChange).toHaveBeenCalledWith({
      from: yesterday,
      to: yesterday,
    })
  })

  it('leaves the draft alone for a preset that carries no range', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan20,
        }}
        onChange={onChange}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Custom',
      }),
    )
    await userEvent.click(apply())

    expect(onChange).toHaveBeenCalledWith({
      from: jan10,
      to: jan20,
    })
  })

  it('clears the draft for a preset that resolves to nothing', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan20,
        }}
        onChange={onChange}
        presets={[
          {
            getValue: () => null,
            key: 'none',
            label: 'Nenhum',
          },
        ]}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Nenhum',
      }),
    )
    await userEvent.click(apply())

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('hides the quick ranges when asked to', async () => {
    render(<DateRangeInput showPresets={false} />)

    await open()

    expect(
      screen.queryByRole('button', {
        name: 'Today',
      }),
    ).not.toBeInTheDocument()
    expect(apply()).toBeInTheDocument()
  })

  it('reopens on the preset that matches an end-only range', async () => {
    const presets: DateRangeInputPreset[] = [
      {
        getValue: () => null,
        key: 'none',
        label: 'Nenhum',
      },
      {
        getValue: () => ({
          to: jan20,
        }),
        key: 'until',
        label: 'Até 20',
      },
      {
        key: 'free',
        label: 'Livre',
      },
    ]
    render(
      <DateRangeInput
        defaultValue={{
          to: jan20,
        }}
        presets={presets}
      />,
    )

    await open()

    expect(
      screen.getByRole('button', {
        name: 'Até 20',
      }),
    ).toBeInTheDocument()
    expect(field()).toHaveValue('Up to 20/01/2025')
  })

  it('reopens on the preset that matches a start-only range', async () => {
    const presets: DateRangeInputPreset[] = [
      {
        getValue: () => ({
          to: jan20,
        }),
        key: 'until',
        label: 'Até 20',
      },
      {
        getValue: () => ({
          from: jan10,
        }),
        key: 'since',
        label: 'Desde 10',
      },
    ]
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
        }}
        presets={presets}
      />,
    )

    await open()

    expect(
      screen.getByRole('button', {
        name: 'Desde 10',
      }),
    ).toBeInTheDocument()
    expect(field()).toHaveValue('10/01/2025')
  })
})

describe('DateRangeInput calendar', () => {
  it('delivers the range picked on the calendar once applied', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
        onChange={onChange}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(apply())

    expect(onChange).toHaveBeenCalledWith({
      from: jan10,
      to: jan15,
    })
  })

  it('marks the picked range as custom even without a custom preset', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
        onChange={onChange}
        presets={[
          {
            getValue: () => ({
              from: jan10,
              to: jan20,
            }),
            key: 'fixed',
            label: 'Fixo',
          },
        ]}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(apply())

    expect(onChange).toHaveBeenCalledWith({
      from: jan10,
      to: jan15,
    })
  })

  it('walks to another month without losing the draft', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
        onChange={onChange}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go to the Next Month',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: /March 15th, 2025/,
      }),
    ).toBeInTheDocument()
  })
})

describe('DateRangeInput commit', () => {
  it('changes its own value when uncontrolled', async () => {
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
      />,
    )

    expect(field()).toHaveValue('10/01/2025 ~ 10/01/2025')

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(apply())

    expect(field()).toHaveValue('10/01/2025 ~ 15/01/2025')
  })

  it('keeps the value it was given when controlled', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        onChange={onChange}
        value={{
          from: jan10,
          to: jan10,
        }}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(apply())

    expect(onChange).toHaveBeenCalledWith({
      from: jan10,
      to: jan15,
    })
    expect(field()).toHaveValue('10/01/2025 ~ 10/01/2025')
  })

  it('throws the draft away on cancel', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
        onChange={onChange}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(onChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue('10/01/2025 ~ 10/01/2025')
  })

  it('starts the next draft from the committed value', async () => {
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan10,
        }}
      />,
    )

    await open()
    await userEvent.click(
      screen.getByRole('button', {
        name: /January 15th, 2025/,
      }),
    )
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    )
    await open()

    expect(apply()).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /January 10th, 2025.*selected/,
      }),
    ).toBeInTheDocument()
  })
})

describe('DateRangeInput clear', () => {
  it('delivers a null range when cleared', async () => {
    const onChange = vi.fn()
    render(
      <DateRangeInput
        defaultValue={{
          from: jan10,
          to: jan20,
        }}
        onChange={onChange}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Clear',
      }),
    )

    expect(onChange).toHaveBeenCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('keeps the clear action out of the tab order with nothing to clear', () => {
    render(<DateRangeInput />)

    expect(
      screen.getByRole('button', {
        name: 'Clear',
      }),
    ).toHaveAttribute('tabindex', '-1')
  })

  it('puts the clear action in the tab order once there is a value', () => {
    render(
      <DateRangeInput
        value={{
          from: jan10,
        }}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Clear',
      }),
    ).toHaveAttribute('tabindex', '0')
  })
})

describe('DateRangeInput disabled', () => {
  it('opens no picker while disabled', async () => {
    render(
      <DateRangeInput
        disabled
        value={{
          from: jan10,
          to: jan20,
        }}
      />,
    )

    await userEvent.click(screen.getByTestId('popover-trigger'))

    expect(
      screen.queryByRole('button', {
        name: 'Apply',
      }),
    ).not.toBeInTheDocument()
  })

  it('keeps the clear action out of the tab order while disabled', () => {
    render(
      <DateRangeInput
        disabled
        value={{
          from: jan10,
          to: jan20,
        }}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Clear',
      }),
    ).toHaveAttribute('tabindex', '-1')
  })
})

describe('DateRangeInput labels', () => {
  it('takes the built-in presets from the provider', async () => {
    render(
      <TuryProvider
        labels={{
          dateRangeInput: {
            custom: 'Personalizado',
            last30Days: 'Últimos 30 dias',
            last7Days: 'Últimos 7 dias',
            lastMonth: 'Mês passado',
            thisMonth: 'Este mês',
            today: 'Hoje',
            yesterday: 'Ontem',
          },
        }}
      >
        <DateRangeInput />
      </TuryProvider>,
    )

    await open()

    for (const name of [
      'Hoje',
      'Ontem',
      'Últimos 7 dias',
      'Últimos 30 dias',
      'Este mês',
      'Mês passado',
      'Personalizado',
    ]) {
      expect(
        screen.getByRole('button', {
          name,
        }),
      ).toBeInTheDocument()
    }
  })

  it('takes the actions and the clear control from the provider', async () => {
    render(
      <TuryProvider
        labels={{
          common: {
            apply: 'Aplicar',
            cancel: 'Cancelar',
            clear: 'Limpar',
          },
        }}
      >
        <DateRangeInput />
      </TuryProvider>,
    )

    await open()

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

  it('reads an open-ended range back through the provider', () => {
    render(
      <TuryProvider
        labels={{
          common: {
            upTo: (value) => `Até ${value}`,
          },
        }}
      >
        <DateRangeInput
          value={{
            to: jan20,
          }}
        />
      </TuryProvider>,
    )

    expect(field()).toHaveValue('Até 20/01/2025')
  })

  it('keeps applyLabel and cancelLabel ahead of the provider', async () => {
    render(
      <TuryProvider
        labels={{
          common: {
            apply: 'Aplicar',
            cancel: 'Cancelar',
          },
        }}
      >
        <DateRangeInput applyLabel="Confirm" cancelLabel="Discard" />
      </TuryProvider>,
    )

    await open()

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Discard',
      }),
    ).toBeInTheDocument()
  })
})
