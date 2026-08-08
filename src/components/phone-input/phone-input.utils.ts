import * as RPNInput from 'react-phone-number-input'

import type { PhoneValue } from './phone-input.types'

const getDialingCode = (country: RPNInput.Country | undefined) =>
  country ? RPNInput.getCountryCallingCode(country) : undefined

export const getPhoneInputValue = (phone: PhoneValue | null | undefined) => {
  if (!phone?.number) {
    return undefined
  }

  if (phone.number.startsWith('+')) {
    return phone.number
  }

  const country = phone.iso as RPNInput.Country | undefined
  const ddi = phone.ddi || getDialingCode(country)

  return ddi ? `+${ddi}${phone.number}` : phone.number
}

const getNationalNumber = (phoneNumber: string, ddi: string | undefined) => {
  if (!ddi || !phoneNumber.startsWith('+')) {
    return phoneNumber
  }

  const digits = phoneNumber.replace(/\D/g, '')

  return digits.startsWith(ddi) ? digits.slice(ddi.length) : digits
}

export const getPhoneValue = (
  phoneNumber: string,
  fallbackCountry: RPNInput.Country | undefined,
): PhoneValue => {
  const parsedPhoneNumber = RPNInput.parsePhoneNumber(phoneNumber)
  const isoCountry = parsedPhoneNumber?.country ?? fallbackCountry
  const iso = isoCountry ?? ''
  const ddi =
    parsedPhoneNumber?.countryCallingCode ?? getDialingCode(isoCountry)

  return {
    ddi,
    iso,
    number:
      parsedPhoneNumber?.nationalNumber ?? getNationalNumber(phoneNumber, ddi),
  }
}
