import { describe, expect, it } from 'vitest'

import {
  documentDigits,
  documentKind,
  documentRaw,
  formatDocument,
  isCompleteDocument,
} from './document-text.utils'

const CPF = '12345678901'
const CNPJ = '12345678000199'

describe('documentDigits', () => {
  it('keeps only digits, from either shape', () => {
    expect(documentDigits('123.456.789-01')).toBe(CPF)
    expect(
      documentDigits({
        number: '123.456.789-01',
        type: 'cpf',
      }),
    ).toBe(CPF)
  })

  it('reads nothing out of nothing', () => {
    expect(documentDigits(null)).toBe('')
    expect(documentDigits(undefined)).toBe('')
    expect(documentDigits('')).toBe('')
  })
})

describe('documentKind', () => {
  it('obeys an explicit variant', () => {
    expect(documentKind(CPF, CPF, 'cnpj')).toBe('cnpj')
  })

  it('trusts the type the value carries', () => {
    expect(
      documentKind(
        CPF,
        {
          number: CPF,
          type: 'cnpj',
        },
        'any',
      ),
    ).toBe('cnpj')
  })

  it('tells one from the other by length', () => {
    expect(documentKind(CPF, CPF, 'any')).toBe('cpf')
    expect(documentKind(CNPJ, CNPJ, undefined)).toBe('cnpj')
  })

  it('refuses to guess at a length that is neither', () => {
    expect(documentKind('123', '123', 'any')).toBeNull()
  })
})

describe('formatDocument', () => {
  it('writes a CPF and a CNPJ under their masks', () => {
    expect(formatDocument(CPF, 'cpf')).toBe('123.456.789-01')
    expect(formatDocument(CNPJ, 'cnpj')).toBe('12.345.678/0001-99')
  })

  it('knows when it has all the digits it needs', () => {
    expect(isCompleteDocument(CPF, 'cpf')).toBe(true)
    expect(isCompleteDocument(CPF, 'cnpj')).toBe(false)
  })
})

describe('documentRaw', () => {
  it('hands back a redacted value untouched', () => {
    expect(documentRaw('***.456.789-**')).toBe('***.456.789-**')
    expect(
      documentRaw({
        number: '***.456.789-**',
        type: 'cpf',
      }),
    ).toBe('***.456.789-**')
  })

  it('reads an absent value as empty', () => {
    expect(documentRaw(null)).toBe('')
    expect(documentRaw(undefined)).toBe('')
  })
})
