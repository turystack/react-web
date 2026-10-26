import { useId, useLayoutEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { CopyButton } from '@/components/copy-button'
import { useLabels } from '@/components/labels-provider'

import type { CodeBlockProps } from './code-block.types'
import {
  type JsonTokenKind,
  printCodeValue,
  tokenizeJsonLine,
} from './code-block.utils'

export const styles = tv({
  defaultVariants: {
    copyable: true,
    gutter: 'sm',
    header: false,
    maxHeight: 'none',
    wrap: false,
  },
  slots: {
    actions: 'code-block-actions absolute top-1.5 right-1.5',
    code: 'code-block-code m-0 block p-3 font-mono text-foreground text-xs leading-relaxed',
    header:
      'code-block-header flex min-h-9 items-center justify-between gap-2 border-border border-b px-3 py-1',
    line: 'code-block-line flex min-h-lh',
    lineContent: 'code-block-line-content min-w-0 flex-1',
    lineNumber:
      'code-block-line-number shrink-0 select-none pr-4 text-right text-muted-foreground tabular-nums',
    root: 'code-block-root relative flex flex-col overflow-hidden rounded-md border border-border bg-muted text-sm',
    title:
      'code-block-title min-w-0 truncate font-medium text-muted-foreground text-xs',
    viewport:
      'code-block-viewport overflow-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
  },
  variants: {
    /** Gutter width follows the digit count of the last line number. */
    gutter: {
      lg: { lineNumber: 'w-14' },
      md: { lineNumber: 'w-10' },
      sm: { lineNumber: 'w-8' },
    },
    copyable: {
      false: {},
      true: {},
    },
    /** Without a header the copy control floats, so the text makes room. */
    header: {
      false: {},
      true: {},
    },
    maxHeight: {
      lg: { viewport: 'max-h-128' },
      md: { viewport: 'max-h-80' },
      none: {},
      sm: { viewport: 'max-h-40' },
    },
    wrap: {
      false: { code: 'min-w-max whitespace-pre' },
      true: { code: 'whitespace-pre-wrap break-all' },
    },
  },
  compoundVariants: [
    {
      class: { code: 'pr-12' },
      copyable: true,
      header: false,
    },
  ],
})

/**
 * JSON colours come from theme tokens, so a dark scheme or a brand theme
 * recolours them with everything else. The chart tokens are the palette the
 * library already publishes for "several distinct hues"; punctuation steps
 * back so the data reads first.
 */
const tokenStyles = tv({
  base: 'code-block-token',
  variants: {
    kind: {
      key: 'code-block-token-key text-chart-2',
      literal: 'code-block-token-literal font-semibold text-primary',
      number: 'code-block-token-number text-chart-1',
      plain: 'code-block-token-plain',
      punctuation: 'code-block-token-punctuation text-muted-foreground',
      string: 'code-block-token-string text-chart-3',
    } satisfies Record<JsonTokenKind, string>,
  },
})

function gutterFor(lineCount: number) {
  if (lineCount >= 1000) {
    return 'lg'
  }

  return lineCount >= 100 ? 'md' : 'sm'
}

/**
 * Whether the viewport currently overflows. Only then is it a scroll
 * container a keyboard user must be able to reach; a block that fits stays
 * out of the tab order instead of adding a stop that does nothing.
 */
function useOverflows(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    const measure = () =>
      setOverflows(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      )

    measure()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(measure)

    observer.observe(element)

    return () => observer.disconnect()
  }, deps)

  return [ref, overflows] as const
}

export function CodeBlock({
  ariaLabel,
  copyable = true,
  language,
  lineNumbers = false,
  maxHeight = 'none',
  title,
  value,
  wrap = false,
}: CodeBlockProps) {
  const labels = useLabels()
  const titleId = useId()
  const text = printCodeValue(value)
  const resolvedLanguage =
    language ?? (typeof value === 'string' ? 'text' : 'json')
  const lines = text.split('\n')
  const hasHeader = title !== undefined && title !== null
  const [viewportRef, overflows] = useOverflows([
    text,
    maxHeight,
    wrap,
    lineNumbers,
  ])
  const slots = styles({
    copyable,
    gutter: gutterFor(lines.length),
    header: hasHeader,
    maxHeight,
    wrap,
  })

  const regionName = ariaLabel
    ? { 'aria-label': ariaLabel }
    : hasHeader
      ? { 'aria-labelledby': titleId }
      : { 'aria-label': labels.codeBlock.label }

  return (
    <div
      className={slots.root()}
      data-language={resolvedLanguage}
      data-testid="code-block"
    >
      {hasHeader ? (
        <div className={slots.header()}>
          <span className={slots.title()} id={titleId}>
            {title}
          </span>
          {copyable ? (
            <CopyButton data-testid="code-block-copy" size="xs" value={text} />
          ) : null}
        </div>
      ) : null}
      <div
        className={slots.viewport()}
        data-testid="code-block-viewport"
        ref={viewportRef}
        {...(overflows ? { role: 'region', tabIndex: 0, ...regionName } : {})}
      >
        <pre className={slots.code()}>
          <code>
            {lines.map((line, index) => (
              <span className={slots.line()} key={index}>
                {lineNumbers ? (
                  <span aria-hidden className={slots.lineNumber()}>
                    {index + 1}
                  </span>
                ) : null}
                <span className={slots.lineContent()}>
                  {resolvedLanguage === 'json'
                    ? tokenizeJsonLine(line).map((token, position) => (
                        <span
                          className={tokenStyles({ kind: token.kind })}
                          key={position}
                        >
                          {token.text}
                        </span>
                      ))
                    : line}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
      {copyable && !hasHeader ? (
        <div className={slots.actions()}>
          <CopyButton data-testid="code-block-copy" size="xs" value={text} />
        </div>
      ) : null}
    </div>
  )
}
