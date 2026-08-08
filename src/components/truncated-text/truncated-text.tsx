import { tv } from 'tailwind-variants'

import { Tooltip } from '@/components/tooltip'

import type {
  TruncatedTextPosition,
  TruncatedTextProps,
} from './truncated-text.types'

const styles = tv({
  base: 'max-w-full overflow-hidden',
  defaultVariants: {
    lines: 1,
  },
  variants: {
    lines: {
      1: 'inline-block truncate whitespace-nowrap align-bottom',
      2: 'line-clamp-2 block whitespace-normal break-words',
      3: 'line-clamp-3 block whitespace-normal break-words',
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

  return (
    <Tooltip content={text}>
      <Component
        className={styles({
          lines,
        })}
      >
        {displayText}
      </Component>
    </Tooltip>
  )
}
