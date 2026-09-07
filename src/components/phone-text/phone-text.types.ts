/**
 * PhoneText
 *
 * Renders a phone number the way its own country writes it.
 *
 * Behavior:
 * - Takes the PhoneInput value shape or an E.164 string
 * - Variants: national ((11) 98765-4321), international (+55 11 98765-4321)
 *   and e164 (+5511987654321)
 * - `privacy` says the value arrived redacted and this component must not
 *   format it. Covering digits is the server's job: a browser that received the
 *   whole number and drew asterisks over it has already handed it to anyone who
 *   opens the network tab. The prop exists so the formatter renders what it was
 *   given verbatim rather than run a redacted string through a parser that
 *   would reject it
 * - `callable` turns the number into a tel: link, and `whatsapp` adds a link to
 *   the conversation — neither appears on a redacted number, because a link
 *   would have to carry digits the value no longer contains
 * - A number the parser cannot read renders its digits rather than nothing
 *
 * Implementation:
 * - react-phone-number-input's own formatters, the same library PhoneInput
 *   writes with
 * - <PhoneText value={{ ddi: '55', iso: 'BR', number: '11987654321' }} />
 * - <PhoneText privacy value={contact.maskedPhone} />
 *
 * Dependencies: PhoneInput (PhoneValue type), LabelsProvider, FormatterText,
 * react-phone-number-input
 */

import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'
import type { PhoneValue } from '@/components/phone-input/phone-input.types'

export type PhoneTextVariant = 'national' | 'international' | 'e164'

export type PhoneTextProps = FormatterTextProps & {
  callable?: boolean // renders the number as a tel: link
  privacy?: boolean // the value arrived redacted; render it as given, format nothing
  value: PhoneValue | string | null | undefined // phone to render
  variant?: PhoneTextVariant // number shape; default national
  whatsapp?: boolean // adds a link to the WhatsApp conversation
}
