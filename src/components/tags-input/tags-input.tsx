import { useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Badge } from '@/components/badge'
import { X } from '@/internal/icons'

import type { TagsInputProps } from './tags-input.types'

const tagsInput = tv({
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  slots: {
    field:
      'tags-input-field min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
    removeBtn:
      'tags-input-remove ml-0.5 cursor-pointer rounded-full opacity-60 hover:opacity-100',
    root: [
      'tags-input-root flex w-full flex-wrap items-center gap-1.5',
      'rounded-lg border border-input px-2.5 py-1.5',
      'bg-transparent transition-colors',
      'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
      'has-disabled:pointer-events-none has-disabled:bg-input/50 has-disabled:opacity-50',
      'dark:bg-input/30 dark:has-disabled:bg-input/80',
    ],
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
  placeholder,
  disabled,
  size,
  variant,
  ...props
}: TagsInputProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
  const isControlled = controlledValue !== undefined
  const tags = isControlled ? controlledValue : internalValue
  const inputRef = useRef<HTMLInputElement>(null)
  const { root, field } = tagsInput({
    size,
    variant,
  })

  const updateTags = (next: string[]) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag) {
      return
    }
    if (!allowDuplicates && tags.includes(tag)) {
      return
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      return
    }
    updateTags([...tags, tag])
  }

  const removeTag = (index: number) => {
    updateTags(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(e.currentTarget.value)
      e.currentTarget.value = ''
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
      className={root()}
      data-testid="tags-input-root"
      onClick={() => {
        inputRef.current?.focus()
      }}
    >
      {tags.map((tag, i) => (
        <Badge
          key={`${tag}-${i}`}
          onClick={(e) => {
            e.stopPropagation()
            removeTag(i)
          }}
          variant="secondary"
        >
          <span className="flex items-center gap-1">
            {tag}
            <X size={12} />
          </span>
        </Badge>
      ))}
      <input
        {...props}
        className={field()}
        data-testid="tags-input-field"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : undefined}
        ref={inputRef}
      />
    </div>
  )
}

export { TagsInput }
