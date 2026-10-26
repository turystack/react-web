import type { ElementType, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { CopyButton } from '@/components/copy-button'
import { Tooltip } from '@/components/tooltip'
import { typographyStyles } from '@/components/typography'
import { axes, cn } from '@/support/utils'

import type { FormatterTextProps } from './formatter-text.types'

export const styles = tv({
  slots: {
    root: 'formatter-text',
    value: 'formatter-text-value',
  },
  variants: {
    /**
     * The root is always rendered, so the formatter's axes have one stable
     * home. Holding only the value it is `display: contents`: no box, so the
     * value stays the element a flex or grid parent lays out and truncates —
     * exactly as before the root existed.
     */
    wrapped: {
      false: {
        root: 'contents',
      },
      true: {
        root: 'inline-flex max-w-full items-center gap-1',
      },
    },
    /**
     * Typography has no `inherit` size, so the family adds it here: an
     * explicit `font-size: inherit` that tailwind-merge swaps for the base
     * size Typography would otherwise paint. The base size's line height goes
     * with it, so the line height is inherited as well.
     */
    inheritSize: {
      true: {
        value: 'text-[length:inherit]',
      },
    },
    /**
     * Sign colour is not a Typography variant, because Typography has no notion
     * of a positive number. It is one rule here so a credit reads the same
     * green in a table, a card and a total line — the theme's `success` token,
     * which holds AA as text on the background, card and muted surfaces.
     */
    tone: {
      negative: {
        value: 'text-destructive',
      },
      positive: {
        value: 'text-success',
      },
    },
  },
})

export const DEFAULT_FALLBACK = '—'

export const RANGE_SEPARATOR = ' – '

export type FormatterTone = 'positive' | 'negative'

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
  /** A formatter's own axes, such as its `variant`, as `data-*` for the root. */
  published?: Record<`data-${string}`, string>
  testId: string
  /** The formatted string: what a tooltip shows and what copying copies. */
  text: string
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
  inheritColor,
  muted,
  published,
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
  const colour = muted ? 'muted' : inheritColor ? 'inherit' : 'default'
  const inheritSize = size === 'inherit'
  const wrapped = Boolean(copyable || rightSection || tooltip)
  const { root, value } = styles({
    inheritSize,
    tone,
    wrapped,
  })
  // The formatter's axes — its size, sign tone and own choices such as a
  // money `variant` — live on the root in every branch. The value keeps only
  // Typography's: there `data-variant` is the colour, as on any Typography.
  const rootAxes = {
    ...axes(typographyStyles, {
      size,
    }),
    ...axes(styles, {
      tone,
    }),
    ...published,
  }
  const valueAxes = {
    // An inherited size is not a Typography size; publishing Typography's
    // default for it would name a size the value does not paint.
    ...(inheritSize
      ? {}
      : axes(typographyStyles, {
          size,
        })),
    ...axes(typographyStyles, {
      variant: colour,
    }),
  }
  const content = (
    <Component
      className={cn(
        typographyStyles({
          align,
          destructive,
          size: inheritSize ? undefined : size,
          truncate,
          variant: colour,
          weight,
        }),
        value(),
      )}
      {...valueAxes}
      data-testid={testId}
      {...(Component === 'time' ? { dateTime } : {})}
    >
      {children ?? text}
    </Component>
  )

  if (!wrapped) {
    return (
      <span className={root()} {...rootAxes}>
        {content}
      </span>
    )
  }

  return (
    <span className={root()} {...rootAxes}>
      {tooltip ? <Tooltip content={text}>{content}</Tooltip> : content}
      {rightSection}
      {copyable ? (
        <CopyButton data-testid="formatter-text-copy" size="xs" value={text} />
      ) : null}
    </span>
  )
}
