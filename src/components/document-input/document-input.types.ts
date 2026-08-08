/**
 * DocumentInput
 *
 * Masked input for Brazilian document numbers (CPF or CNPJ).
 * "any" variant shows a dropdown to switch between document types.
 *
 * Behavior:
 * - CPF mask: 000.000.000-00 (11 digits)
 * - CNPJ mask: 00.000.000/0000-00 (14 digits)
 * - "any" variant renders a dropdown selector to toggle CPF/CNPJ
 * - Value includes both the document type and formatted number
 * - Detects type from existing value length when in "any" mode
 *
 * Implementation:
 * - Compose with MaskInput component, passing the appropriate mask pattern
 * - Radix Dropdown for type selector in "any" mode
 * - <DocumentInput variant="cpf" value={docValue} onChange={setDocValue} />
 * - <DocumentInput variant="any" value={docValue} onChange={setDocValue} />
 *
 * Dependencies: MaskInput component, @radix-ui/react-dropdown-menu
 */

import type { MaskInputProps } from '@/components/mask-input/mask-input.types'

export type DocumentType = 'cpf' | 'cnpj' | 'any'

export type DocumentValue = {
  type: DocumentType // document type identifier
  number: string // formatted document number
}

export type DocumentInputProps = Omit<
  MaskInputProps,
  'mask' | 'value' | 'defaultValue' | 'onChange' | 'variant'
> & {
  variant: DocumentType // determines mask pattern and validation (required)
  value?: DocumentValue | null // controlled value
  defaultValue?: DocumentValue | null // uncontrolled initial value
  onChange?: (value: DocumentValue | null) => void // fires on value change
}
