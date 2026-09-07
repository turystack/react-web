import { useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Badge } from '@/components/badge'
import { Loader } from '@/components/loader'
import { X } from '@/internal/icons'

import { DEFAULT_SECTION_WIDTH } from '../input/input.shared'
import type { TagsInputProps } from './tags-input.types'

const tagsInput = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    field:
      'tags-input-field min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
    root: [
      'tags-input-root flex w-full flex-wrap items-center gap-1.5',
      'rounded-lg border border-input px-2.5 py-1.5',
      'bg-transparent transition-colors',
      'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
      'has-disabled:pointer-events-none has-disabled:bg-input/50 has-disabled:opacity-50',
      'dark:bg-input/30 dark:has-disabled:bg-input/80',
    ],
    section:
      'tags-input-section flex shrink-0 items-center justify-center text-muted-foreground',
  },
  variants: {
    size: {
      lg: {
        root: 'min-h-11',
      },
      md: {
        root: 'min-h-10',
      },
      sm: {
        root: 'min-h-9',
      },
    },
    variant: {
      default: {},
      ghost: {
        root: 'border-transparent bg-transparent focus-within:border-transparent has-disabled:bg-transparent dark:bg-transparent dark:has-disabled:bg-transparent',
      },
    },
  },
})

function TagsInput({
  value: controlledValue,
  defaultValue = [],
  maxTags,
  allowDuplicates = false,
  onChange,
  onReject,
  placeholder,
  disabled,
  loading,
  leftSection,
  leftSectionWidth = DEFAULT_SECTION_WIDTH,
  rightSection,
  rightSectionWidth = DEFAULT_SECTION_WIDTH,
  rootClassName,
  className,
  size,
  variant,
  ...props
}: TagsInputProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
  const isControlled = controlledValue !== undefined
  const tags = isControlled ? controlledValue : internalValue
  const inputRef = useRef<HTMLInputElement>(null)
  const { root, field, section } = tagsInput({
    size,
    variant,
  })

  const effectiveRight = loading ? <Loader size="sm" /> : rightSection
  const hasLeft = Boolean(leftSection)
  const hasRight = Boolean(effectiveRight)

  const updateTags = (next: string[]) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag) {
      return true
    }
    if (!allowDuplicates && tags.includes(tag)) {
      onReject?.(tag, 'duplicate')
      return false
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      onReject?.(tag, 'max-tags')
      return false
    }
    updateTags([...tags, tag])
    return true
  }

  const removeTag = (index: number) => {
    updateTags(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // A refused entry keeps its text so the person typing sees that nothing
      // was taken, instead of watching the field empty itself for no reason.
      if (addTag(e.currentTarget.value)) {
        e.currentTarget.value = ''
      }
    } else if (
      e.key === 'Backspace' &&
      e.currentTarget.value === '' &&
      tags.length > 0
    ) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div
      className={root({
        className: rootClassName,
      })}
      data-testid="tags-input-root"
      onClick={() => {
        inputRef.current?.focus()
      }}
    >
      {hasLeft && (
        <span
          className={section()}
          data-testid="tags-input-section-left"
          style={{
            width: leftSectionWidth,
          }}
        >
          {leftSection}
        </span>
      )}
      {tags.map((tag, i) => (
        <Badge
          key={`${tag}-${i}`}
          onClick={(e) => {
            e.stopPropagation()
            removeTag(i)
          }}
          variant="secondary"
        >
          <span className="tags-input-tag flex items-center gap-1">
            {tag}
            <X size={12} />
          </span>
        </Badge>
      ))}
      <input
        {...props}
        aria-busy={loading || undefined}
        className={field({
          className,
        })}
        data-testid="tags-input-field"
        disabled={disabled || loading}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : undefined}
        ref={inputRef}
      />
      {hasRight && (
        <span
          className={section()}
          data-testid="tags-input-section-right"
          style={{
            width: rightSectionWidth,
          }}
        >
          {effectiveRight}
        </span>
      )}
    </div>
  )
}

export { TagsInput }
