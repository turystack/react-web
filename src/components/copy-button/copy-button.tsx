import { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { useCopyToClipboard } from 'usehooks-ts'
import type { ButtonSize } from '@/components/button'
import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'
import { Check, ClipboardList } from '@/internal/icons'

import type { CopyButtonProps, CopyButtonSize } from './copy-button.types'

export const styles = tv({
  variants: {
    block: {
      true: {
        root: 'flex w-full',
      },
    },
  },
  slots: {
    // `relative`: the visually-hidden status is absolutely positioned, and
    // without a positioned ancestor it escapes to the nearest one up the tree
    // — outside a scrolling pane, where it stretched the pane's scroll area and
    // threw scroll-to-anchor off. Here it stays inside the button's own box.
    root: 'copy-button relative inline-flex shrink-0 items-center',
    status: 'copy-button-status sr-only',
    trigger: 'copy-button-trigger',
  },
})

/** How long the check and the announcement stay after a copy. */
export const COPIED_FOR_MS = 2000

const ICON_SIZE: Record<CopyButtonSize, ButtonSize> = {
  lg: 'icon-lg',
  md: 'icon-md',
  sm: 'icon-sm',
  xs: 'icon-xs',
}

const TEXT_SIZE: Record<CopyButtonSize, ButtonSize> = {
  lg: 'lg',
  md: 'md',
  sm: 'sm',
  xs: 'sm',
}

export function CopyButton({
  ariaLabel,
  block = false,
  'data-testid': testId = 'copy-button',
  label,
  onCopy,
  size = 'sm',
  value,
  variant = 'ghost',
}: CopyButtonProps) {
  const labels = useLabels()
  const [copied, setCopied] = useState(false)
  const [, copy] = useCopyToClipboard()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { root, status, trigger } = styles({ block })
  const iconOnly = label === undefined || label === null || label === false

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleClick() {
    const written = await copy(value)

    if (!written) {
      return
    }

    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS)
    onCopy?.(value)
  }

  const icon = copied ? (
    <Check data-testid={`${testId}-copied-icon`} />
  ) : (
    <ClipboardList data-testid={`${testId}-icon`} />
  )

  return (
    <span
      className={root()}
      data-block={block || undefined}
      data-size={size}
      data-variant={variant}
    >
      <Button
        ariaLabel={iconOnly ? (ariaLabel ?? labels.common.copy) : ariaLabel}
        block={block}
        className={trigger()}
        data-testid={testId}
        leftSection={iconOnly ? undefined : icon}
        onClick={() => {
          void handleClick()
        }}
        size={iconOnly ? ICON_SIZE[size] : TEXT_SIZE[size]}
        variant={variant}
      >
        {iconOnly ? icon : label}
      </Button>
      <span
        aria-live="polite"
        className={status()}
        data-testid={`${testId}-status`}
        role="status"
      >
        {copied ? labels.common.copied : ''}
      </span>
    </span>
  )
}
