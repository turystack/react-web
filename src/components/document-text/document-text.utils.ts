import type { DocumentValue } from '@/components/document-input/document-input.types'

import type { DocumentTextVariant } from './document-text.types'

export type DocumentKind = 'cpf' | 'cnpj'

const PATTERNS: Record<DocumentKind, string> = {
  cnpj: '00.000.000/0000-00',
  cpf: '000.000.000-00',
}

const LENGTHS: Record<DocumentKind, number> = {
  cnpj: 14,
  cpf: 11,
}

export function documentDigits(
  value: DocumentValue | string | null | undefined,
): string {
  if (value === null || value === undefined) {
    return ''
  }

  const raw = typeof value === 'string' ? value : value.number

  return (raw ?? '').replace(/\D/g, '')
}

/**
 * The value exactly as it arrived, mask and all.
 *
 * A redacted number is not digits: `***.456.789-**` survives no round trip
 * through `documentDigits`, and forcing what is left into a pattern would move
 * the surviving digits into slots they never belonged to.
 */
export function documentRaw(
  value: DocumentValue | string | null | undefined,
): string {
  if (value === null || value === undefined) {
    return ''
  }

  return (typeof value === 'string' ? value : value.number) ?? ''
}

export function documentKind(
  digits: string,
  value: DocumentValue | string | null | undefined,
  variant: DocumentTextVariant | undefined,
): DocumentKind | null {
  if (variant === 'cpf' || variant === 'cnpj') {
    return variant
  }

  const declared =
    typeof value === 'object' && value !== null ? value.type : undefined

  if (declared === 'cpf' || declared === 'cnpj') {
    return declared
  }

  if (digits.length === LENGTHS.cpf) {
    return 'cpf'
  }

  if (digits.length === LENGTHS.cnpj) {
    return 'cnpj'
  }

  return null
}

export function isCompleteDocument(digits: string, kind: DocumentKind) {
  return digits.length === LENGTHS[kind]
}

/** Writes the digits under the mask their document type wears. */
export function formatDocument(digits: string, kind: DocumentKind): string {
  let index = 0

  return [...PATTERNS[kind]]
    .map((slot) => {
      if (slot !== '0') {
        return slot
      }

      const digit = digits[index] ?? ''
      index += 1

      return digit
    })
    .join('')
}
