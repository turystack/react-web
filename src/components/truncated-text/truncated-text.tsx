import { tv } from 'tailwind-variants'

import { CopyButton } from '@/components/copy-button'
import { Tooltip } from '@/components/tooltip'

import type {
  TruncatedTextPosition,
  TruncatedTextProps,
} from './truncated-text.types'

export const styles = tv({
  defaultVariants: {
    lines: 1,
  },
  slots: {
    root: 'truncated-text-root inline-flex min-w-0 max-w-full items-center gap-1 align-bottom',
    text: 'truncated-text-text truncated-text min-w-0 max-w-full overflow-hidden',
  },
  variants: {
    lines: {
      1: {
        text: 'inline-block truncate whitespace-nowrap align-bottom',
      },
      2: {
        text: 'line-clamp-2 block whitespace-normal break-words',
      },
      3: {
        text: 'line-clamp-3 block whitespace-normal break-words',
      },
    },
  },
})

function truncateText(
  text: string,
  position: TruncatedTextPosition,
  start: number,
  end: number,
) {
  const visibleLength =
    position === 'middle' ? start + end : position === 'end' ? start : end

  if (visibleLength === 0 || text.length <= visibleLength + 3) {
    return text
  }

  if (position === 'end') {
    const prefix = start > 0 ? text.slice(0, start) : ''

    return `${prefix}...`
  }

  if (position === 'start') {
    const suffix = end > 0 ? text.slice(-end) : ''

    return `...${suffix}`
  }

  const prefix = start > 0 ? text.slice(0, start) : ''
  const suffix = end > 0 ? text.slice(-end) : ''

  return `${prefix}...${suffix}`
}

export function TruncatedText({
  component: Component = 'span',
  copyable = false,
  end,
  lines = 1,
  position,
  start,
  value,
}: TruncatedTextProps) {
  const text = String(value)
  const shouldTruncateByCharacters =
    end !== undefined || position !== undefined || start !== undefined
  const safeEnd = Math.max(end ?? 6, 0)
  const safePosition = position ?? 'middle'
  const safeStart = Math.max(start ?? 8, 0)
  const displayText = shouldTruncateByCharacters
    ? truncateText(text, safePosition, safeStart, safeEnd)
    : text

  const { root, text: textSlot } = styles({
    lines,
  })
  const content = (
    <Tooltip content={text}>
      <Component className={textSlot()} data-testid="truncated-text">
        {displayText}
      </Component>
    </Tooltip>
  )

  if (!copyable) {
    return content
  }

  return (
    <span className={root()} data-testid="truncated-text-root">
      {content}
      <CopyButton data-testid="truncated-text-copy" size="xs" value={text} />
    </span>
  )
}
