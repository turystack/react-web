import {
  DEFAULT_FALLBACK,
  FormatterText,
} from '@/components/formatter-text/formatter-text'
import { useLabels } from '@/components/labels-provider'

import type { DocumentTextProps } from './document-text.types'
import {
  documentDigits,
  documentKind,
  documentRaw,
  formatDocument,
  isCompleteDocument,
} from './document-text.utils'

export function DocumentText(props: DocumentTextProps) {
  const labels = useLabels()
  const digits = documentDigits(props.value)
  const kind = documentKind(digits, props.value, props.variant)

  /**
   * A redacted value is passed through untouched. Its digit positions no longer
   * line up with the pattern, so formatting it would move the digits the server
   * chose to leave visible into slots they were never in.
   */
  const number = props.privacy
    ? documentRaw(props.value)
    : kind && isCompleteDocument(digits, kind)
      ? formatDocument(digits, kind)
      : digits

  const prefix = props.showType && kind ? `${labels.documentText[kind]} ` : ''

  return (
    <FormatterText
      {...props}
      testId="document-text"
      text={
        number ? `${prefix}${number}` : (props.fallback ?? DEFAULT_FALLBACK)
      }
    />
  )
}
