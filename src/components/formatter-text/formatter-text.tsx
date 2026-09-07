import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Tooltip } from '@/components/tooltip'
import { typographyStyles } from '@/components/typography'
import { Check, ClipboardList } from '@/internal/icons'
import { cn } from '@/support/utils'

import type { FormatterTextProps } from './formatter-text.types'

export const styles = tv({
  slots: {
    root: 'formatter-text inline-flex max-w-full items-center gap-1',
    value: 'formatter-text-value',
  },
  variants: {
    /**
     * Sign colour is not a Typography variant, because Typography has no notion
     * of a positive number. It is one rule here so a credit reads the same
     * green in a table, a card and a total line.
     */
    tone: {
      negative: {
        value: 'text-destructive',
      },
      positive: {
        value: 'text-green-600 dark:text-green-500',
      },
    },
  },
})

export const DEFAULT_FALLBACK = '—'

export const RANGE_SEPARATOR = ' – '

export type FormatterTone = 'positive' | 'negative'

const COPIED_FOR_MS = 2000

type FormatterTextRenderProps = FormatterTextProps & {
  /** Replaces the plain text as rendered content — a link, a masked run. */
  children?: ReactNode
  /** Machine-readable timestamp, written only onto a <time> element. */
  dateTime?: string
  /** Controls that belong to the value itself, such as a reveal toggle. */
  rightSection?: ReactNode
  /** Element to render when the caller has not chosen one. */
  tag?: ElementType
  /** Sign colour, when the formatter was asked to colour by sign. */
  tone?: FormatterTone
  testId: string
  /** The formatted string: what a tooltip shows and what copying copies. */
  text: string
}

function CopyButton({ text }: { text: string }) {
  const labels = useLabels()
  const [copied, setCopied] = useState(false)
  const [, copy] = useCopyToClipboard()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Button
      ariaLabel={copied ? labels.common.copied : labels.common.copy}
      data-testid="formatter-text-copy"
      onClick={() => {
        void copy(text)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS)
      }}
      size="icon-xs"
      variant="ghost"
    >
      {copied ? <Check /> : <ClipboardList />}
    </Button>
  )
}

/**
 * The one place the family renders. A formatter works out the string; this
 * decides how it looks, whether it can be copied and what a hover reveals —
 * so eight components cannot drift into eight answers to the same question.
 */
export function FormatterText({
  align,
  children,
  component,
  copyable,
  dateTime,
  destructive,
  muted,
  rightSection,
  size,
  tag,
  testId,
  text,
  tone,
  tooltip,
  truncate,
  weight,
}: FormatterTextRenderProps) {
  const Component = (component ?? tag ?? 'span') as ElementType
  const colour = muted ? 'muted' : 'default'
  const { root, value } = styles({
    tone,
  })
  const content = (
    <Component
      className={cn(
        typographyStyles({
          align,
          destructive,
          size,
          truncate,
          variant: colour,
          weight,
        }),
        value(),
      )}
      data-testid={testId}
      {...(Component === 'time' ? { dateTime } : {})}
    >
      {children ?? text}
    </Component>
  )

  if (!copyable && !rightSection && !tooltip) {
    return content
  }

  return (
    <span className={root()}>
      {tooltip ? <Tooltip content={text}>{content}</Tooltip> : content}
      {rightSection}
      {copyable ? <CopyButton text={text} /> : null}
    </span>
  )
}
