import { describe, expect, it } from 'vitest'

import { getPhoneInputValue, getPhoneValue } from './phone-input.utils'

describe('phone-input utils', () => {
  it('converts a PhoneValue national number to an E.164 input value', () => {
    expect(
      getPhoneInputValue({
        ddi: '55',
        iso: 'BR',
        number: '85999999999',
      }),
    ).toBe('+5585999999999')
  })

  it('keeps an existing E.164 input value unchanged', () => {
    expect(
      getPhoneInputValue({
        ddi: '55',
        iso: 'BR',
        number: '+5585999999999',
      }),
    ).toBe('+5585999999999')
  })

  it('has no input value for a missing phone', () => {
    expect(getPhoneInputValue(undefined)).toBeUndefined()
    expect(getPhoneInputValue(null)).toBeUndefined()
  })

  it('has no input value for a phone with no number', () => {
    expect(
      getPhoneInputValue({
        ddi: '55',
        iso: 'BR',
        number: '',
      }),
    ).toBeUndefined()
  })

  it('takes the dialing code from the country when none was given', () => {
    expect(
      getPhoneInputValue({
        iso: 'BR',
        number: '85999999999',
      }),
    ).toBe('+5585999999999')
  })

  it('leaves the number bare when no dialing code can be worked out', () => {
    expect(
      getPhoneInputValue({
        iso: '',
        number: '85999999999',
      }),
    ).toBe('85999999999')
  })

  it('converts an E.164 input value to a PhoneValue with national number', () => {
    expect(getPhoneValue('+5585999999999', 'BR')).toEqual({
      ddi: '55',
      iso: 'BR',
      number: '85999999999',
    })
  })

  it('falls back to the given country when the number cannot be parsed', () => {
    expect(getPhoneValue('+55123', 'BR')).toEqual({
      ddi: '55',
      iso: 'BR',
      number: '123',
    })
  })

  it('keeps the digits whole when they do not carry the dialing code', () => {
    expect(getPhoneValue('+999123', 'BR')).toEqual({
      ddi: '55',
      iso: 'BR',
      number: '999123',
    })
  })

  it('reports an empty country when there is none to fall back to', () => {
    expect(getPhoneValue('12345', undefined)).toEqual({
      ddi: undefined,
      iso: '',
      number: '12345',
    })
  })
})
