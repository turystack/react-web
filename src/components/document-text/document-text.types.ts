/**
 * DocumentText
 *
 * Renders a Brazilian document number — CPF or CNPJ — under its mask.
 *
 * Behavior:
 * - Takes the DocumentInput value shape or a bare string of digits, so a form
 *   and the page that reads it back speak the same type
 * - The "any" variant tells CPF from CNPJ by digit count
 * - `privacy` says the value arrived redacted and this component must not
 *   format it. Covering digits is the server's job: a browser that received the
 *   whole number and drew asterisks over it has already handed it to anyone who
 *   opens the network tab, so the masking that used to live here was privacy
 *   theatre. The prop exists so the formatter knows to render what it was given
 *   verbatim rather than force a mask over a value whose digit positions no
 *   longer mean what the pattern assumes
 * - Copying copies what is on screen, so a redacted number stays redacted
 * - Digits that fit no known document render as they are rather than being
 *   forced into a mask that would misread them
 *
 * Implementation:
 * - Pure formatting in document-text.utils.ts, so the rules are tested without
 *   a DOM
 * - <DocumentText value={{ number: '12345678901', type: 'cpf' }} />
 * - <DocumentText privacy value={customer.maskedDocument} />
 *
 * Dependencies: DocumentInput (DocumentValue type), LabelsProvider,
 * FormatterText
 */

import type { DocumentValue } from '@/components/document-input/document-input.types'
import type { FormatterTextProps } from '@/components/formatter-text/formatter-text.types'

export type DocumentTextVariant = 'cpf' | 'cnpj' | 'any'

export type DocumentTextProps = FormatterTextProps & {
  privacy?: boolean // the value arrived redacted; render it as given, format nothing
  showType?: boolean // writes CPF or CNPJ before the number
  value: DocumentValue | string | null | undefined // document to render
  variant?: DocumentTextVariant // forces a document type; default any
}
