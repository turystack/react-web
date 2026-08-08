import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DateRangeInput } from './date-range-input'
import type { DateRange } from './date-range-input.types'

const meta = {
  component: DateRangeInput,
  title: 'Form/DateRangeInput',
} satisfies Meta<typeof DateRangeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | null>({
      from: new Date(2025, 0, 10),
      to: new Date(2025, 0, 20),
    })
    return <DateRangeInput onChange={setRange} value={range} />
  },
}

export const WithCustomPresets: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | null>(null)

    return (
      <DateRangeInput
        onChange={setRange}
        presets={[
          {
            getValue: () => {
              const today = new Date()
              return {
                from: today,
                to: today,
              }
            },
            key: 'today',
            label: 'Hoje',
          },
          {
            getValue: () => {
              const today = new Date()
              const from = new Date(today)
              from.setDate(today.getDate() - 13)
              return {
                from,
                to: today,
              }
            },
            key: 'last14Days',
            label: 'Últimos 14 dias',
          },
          {
            key: 'custom',
            label: 'Personalizado',
          },
        ]}
        value={range}
      />
    )
  },
}

export const WithoutPresets: Story = {
  args: {
    showPresets: false,
  },
}

export const CustomLabels: Story = {
  args: {
    applyLabel: 'Filtrar',
    cancelLabel: 'Fechar',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: {
      from: new Date(2025, 5, 1),
      to: new Date(2025, 5, 15),
    },
  },
}
