import type { Meta, StoryObj } from '@storybook/react-vite'

import { MaskInput } from './mask-input'

const meta = {
  component: MaskInput,
  title: 'Form/MaskInput',
} satisfies Meta<typeof MaskInput>

export default meta
type Story = StoryObj<typeof meta>

export const CPF: Story = {
  args: {
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
  },
}

export const CNPJ: Story = {
  args: {
    mask: '00.000.000/0000-00',
    placeholder: '00.000.000/0000-00',
  },
}

export const Phone: Story = {
  args: {
    mask: ['(00) 0000-0000', '(00) 00000-0000'],
    placeholder: '(00) 00000-0000',
  },
}

export const CEP: Story = {
  args: {
    mask: '00000-000',
    placeholder: '00000-000',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
  },
}
