import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'

import { CopyButton } from '@/components/copy-button'
import { DEFAULT_FALLBACK } from '@/components/formatter-text/formatter-text'
import { useLabels } from '@/components/labels-provider'

import type {
  DescriptionListItem,
  DescriptionListProps,
} from './description-list.types'

export const styles = tv({
  compoundVariants: [
    {
      class: {
        item: 'first:border-t-0 first:pt-0',
      },
      dividers: true,
    },
    {
      class: {
        item: 'sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0',
      },
      columns: [2, 3],
      dividers: true,
    },
    {
      class: {
        item: 'lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(3)]:pt-0',
      },
      columns: 3,
      dividers: true,
    },
  ],
  defaultVariants: {
    columns: 1,
    dividers: false,
    layout: 'stacked',
  },
  slots: {
    content: 'description-list-content min-w-0 break-words',
    empty: 'description-list-empty text-muted-foreground',
    item: 'description-list-item min-w-0',
    label: 'description-list-label min-w-0 text-muted-foreground',
    root: 'description-list grid gap-x-6 gap-y-3 text-sm',
    value:
      'description-list-value m-0 flex min-w-0 items-center gap-1 text-foreground',
  },
  variants: {
    columns: {
      1: {
        root: 'grid-cols-1',
      },
      2: {
        root: 'grid-cols-1 sm:grid-cols-2',
      },
      3: {
        root: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      },
    },
    dividers: {
      false: {},
      true: {
        item: 'border-border border-t pt-3',
      },
    },
    layout: {
      inline: {
        item: 'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-x-4',
      },
      stacked: {
        item: 'flex flex-col gap-1',
      },
    },
  },
})

function isEmpty(value: ReactNode) {
  return (
    value === null || value === undefined || value === false || value === ''
  )
}

/** What the copy control writes, or nothing when the item has no copy. */
function copyText({ copyable, value }: DescriptionListItem) {
  if (isEmpty(value)) {
    return undefined
  }

  if (typeof copyable === 'string') {
    return copyable === '' ? undefined : copyable
  }

  if (copyable && (typeof value === 'string' || typeof value === 'number')) {
    return String(value)
  }

  return undefined
}

export function DescriptionList({
  columns = 1,
  dividers = false,
  items,
  layout = 'stacked',
}: DescriptionListProps) {
  const labels = useLabels()
  const {
    content,
    empty,
    item: itemSlot,
    label: labelSlot,
    root,
    value: valueSlot,
  } = styles({
    columns,
    dividers,
    layout,
  })

  return (
    <dl
      className={root()}
      data-columns={columns}
      data-layout={layout}
      data-testid="description-list"
    >
      {items.map((item, index) => {
        const text = copyText(item)

        return (
          <div
            className={itemSlot()}
            data-testid="description-list-item"
            key={item.key ?? index}
          >
            <dt className={labelSlot()} data-testid="description-list-label">
              {item.label}
            </dt>
            <dd className={valueSlot()} data-testid="description-list-value">
              {isEmpty(item.value) ? (
                <span className={empty()} data-testid="description-list-empty">
                  {DEFAULT_FALLBACK}
                </span>
              ) : (
                <span className={content()}>{item.value}</span>
              )}
              {text === undefined ? null : (
                <CopyButton
                  // Several copy buttons in one list: each says what it
                  // copies. A node label has no text to borrow, so it keeps
                  // CopyButton's own `common.copy`.
                  ariaLabel={
                    typeof item.label === 'string' && item.label !== ''
                      ? labels.common.copyValue(item.label)
                      : undefined
                  }
                  data-testid="description-list-copy"
                  size="xs"
                  value={text}
                />
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
