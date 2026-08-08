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

  it('converts an E.164 input value to a PhoneValue with national number', () => {
    expect(getPhoneValue('+5585999999999', 'BR')).toEqual({
      ddi: '55',
      iso: 'BR',
      number: '85999999999',
    })
  })
})
