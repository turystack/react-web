import { useRef } from 'react'
import { tv } from 'tailwind-variants'

import { Badge } from '@/components/badge'
import { useLabels } from '@/components/labels-provider'
import { DisabledReason } from '@/components/tooltip/tooltip.composed'
import { X } from '@/internal/icons'

import type { TagProps } from './tag.types'

const styles = tv({
  defaultVariants: {
    disabled: false,
    size: 'md',
  },
  slots: {
    icon: 'tag-icon inline-flex shrink-0 [&_svg]:pointer-events-none',
    label: 'tag-label truncate',
    remove: [
      'tag-remove -mr-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full',
      'opacity-70 outline-none transition-opacity',
      'hover:bg-current/15 hover:opacity-100',
      'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-inset',
      'disabled:cursor-not-allowed disabled:hover:bg-transparent',
      'aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent',
      '[&_svg]:pointer-events-none',
    ],
    root: 'tag-root inline-flex max-w-full align-middle',
  },
  variants: {
    disabled: {
      true: {
        root: 'opacity-50',
      },
    },
    size: {
      md: {
        icon: '[&_svg]:size-3.5',
        remove: 'size-5 [&_svg]:size-3.5',
      },
      sm: {
        icon: '[&_svg]:size-3',
        remove: 'size-4 [&_svg]:size-3',
      },
    },
  },
})

/** The Tag beside `root`, in `direction`, whose × can still take focus. */
function siblingRemove(
  root: HTMLElement | null,
  direction: 'next' | 'previous',
): HTMLButtonElement | null {
  let sibling =
    direction === 'next'
      ? root?.nextElementSibling
      : root?.previousElementSibling

  while (sibling) {
    const remove = sibling.matches('[data-tag]')
      ? sibling.querySelector<HTMLButtonElement>('[data-tag-remove]')
      : null

    if (remove && !remove.disabled) {
      return remove
    }

    sibling =
      direction === 'next'
        ? sibling.nextElementSibling
        : sibling.previousElementSibling
  }

  return null
}

function Tag({
  children,
  disabled = false,
  disabledReason,
  icon,
  label,
  onRemove,
  size = 'md',
  variant = 'secondary',
}: TagProps) {
  const labels = useLabels()
  // A reason blocks the × like `disabled` but keeps it focusable, so it can
  // say why; with both set, the reason wins, as on Button.
  const blocked = Boolean(disabledReason)
  const inert = disabled || blocked
  const rootRef = useRef<HTMLSpanElement>(null)
  const name =
    label ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : '')

  const {
    icon: iconSlot,
    label: labelSlot,
    remove,
    root,
  } = styles({
    disabled: inert,
    size,
  })

  function handleRemove() {
    const next =
      siblingRemove(rootRef.current, 'next') ??
      siblingRemove(rootRef.current, 'previous')
    next?.focus()
    onRemove?.()
  }

  return (
    <span
      className={root()}
      data-disabled={inert || undefined}
      data-size={size}
      data-tag=""
      data-testid="tag"
      data-variant={variant}
      ref={rootRef}
    >
      <Badge size={size === 'sm' ? 'md' : 'lg'} variant={variant}>
        {icon ? (
          <span aria-hidden="true" className={iconSlot()}>
            {icon}
          </span>
        ) : null}
        <span className={labelSlot()}>{children}</span>
        {onRemove ? (
          <DisabledReason reason={disabledReason}>
            {(a11y) => (
              <button
                aria-disabled={blocked || undefined}
                aria-label={labels.tag.remove(name)}
                className={remove()}
                data-tag-remove=""
                data-testid="tag-remove"
                disabled={disabled && !blocked}
                onClick={blocked ? undefined : handleRemove}
                type="button"
                {...a11y}
              >
                <X />
              </button>
            )}
          </DisabledReason>
        ) : null}
      </Badge>
    </span>
  )
}

export { Tag }
