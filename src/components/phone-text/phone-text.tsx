import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
} from 'react-phone-number-input'

import { Button } from '@/components/button'
import {
  DEFAULT_FALLBACK,
  FormatterText,
} from '@/components/formatter-text/formatter-text'
import { useLabels } from '@/components/labels-provider'
import { getPhoneInputValue } from '@/components/phone-input/phone-input.utils'
import { WhatsApp } from '@/internal/icons'

import type { PhoneTextProps, PhoneTextVariant } from './phone-text.types'

function toE164(value: PhoneTextProps['value']): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  return getPhoneInputValue(value) ?? ''
}

/** The value exactly as it arrived, mask and all. */
function raw(value: PhoneTextProps['value']): string {
  if (value === null || value === undefined) {
    return ''
  }

  return typeof value === 'string' ? value.trim() : (value.number ?? '')
}

function shape(e164: string, variant: PhoneTextVariant): string {
  if (variant === 'e164') {
    return e164
  }

  const formatted =
    variant === 'international'
      ? formatPhoneNumberIntl(e164)
      : formatPhoneNumber(e164)

  return formatted || e164
}

export function PhoneText(props: PhoneTextProps) {
  const labels = useLabels()
  const e164 = toE164(props.value)

  /**
   * A redacted number is passed through untouched: the parser would reject it,
   * and there is nothing to shape when most of the digits are gone.
   */
  const readable = props.privacy
    ? raw(props.value)
    : shape(e164, props.variant ?? 'national')

  /** A link would have to carry digits a redacted value no longer has. */
  const linkable = !props.privacy && Boolean(e164)
  const digits = e164.replace(/\D/g, '')

  if (!readable) {
    return (
      <FormatterText
        {...props}
        testId="phone-text"
        text={props.fallback ?? DEFAULT_FALLBACK}
      />
    )
  }

  return (
    <FormatterText
      {...props}
      rightSection={
        props.whatsapp && linkable ? (
          <Button
            ariaLabel={labels.phoneText.whatsapp}
            asChild
            data-testid="phone-text-whatsapp"
            size="icon-xs"
            variant="ghost"
          >
            <a
              href={`https://wa.me/${digits}`}
              rel="noreferrer"
              target="_blank"
            >
              <WhatsApp />
            </a>
          </Button>
        ) : undefined
      }
      testId="phone-text"
      text={readable}
    >
      {props.callable && linkable ? (
        <a
          aria-label={labels.phoneText.call}
          className="phone-text-call-link underline underline-offset-2"
          href={`tel:${e164}`}
        >
          {readable}
        </a>
      ) : undefined}
    </FormatterText>
  )
}
