import type { Meta, StoryObj } from '@storybook/react-vite'

import { DocumentInput } from './document-input'

const meta = {
  args: {
    size: 'sm',
  },
  component: DocumentInput,
  title: 'Form/DocumentInput',
} satisfies Meta<typeof DocumentInput>

export default meta
type Story = StoryObj<typeof meta>

export const CPF: Story = {
  args: {
    variant: 'cpf',
  },
}

export const CNPJ: Story = {
  args: {
    variant: 'cnpj',
  },
}

export const Any: Story = {
  args: {
    variant: 'any',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: 'cpf',
  },
}
